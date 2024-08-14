import { textEmailBodyPatterns } from './textEmailBodyPatterns';
import {} from './Types';
export class TextEmailBodyParser {
    QUOTE = '>';
    patterns;
    /**
     * Constructor to initialize the regex patterns.
     *
     * @param {TextEmailBodyPatterns} patterns - The regex patterns to use for parsing.
     */
    constructor(patterns = textEmailBodyPatterns) {
        this.patterns = patterns;
    }
    /**
     * Parses an email message into a list of fragments.
     *
     * @param {string} emailText - The email body text to process.
     * @returns {TypeTextEmailBodyFragment[]} - A list of parsed fragments.
     */
    parse(emailText) {
        const normalizedText = this.normalizeText(emailText);
        const fragmentsByHeaderText = this.splitTextToFragmentsByHeaderText(normalizedText);
        if (fragmentsByHeaderText.length === 0) {
            return [];
        }
        return this.splitsFragmentsByDepthAndSignature(fragmentsByHeaderText);
    }
    /**
     * Splits fragments by depth and signature.
     *
     * @param {TypeTextEmailBodyFragment[]} fragmentsByHeaderText
     * @returns {TypeTextEmailBodyFragment[]}
     */
    splitsFragmentsByDepthAndSignature(fragmentsByHeaderText) {
        return fragmentsByHeaderText.flatMap(fragmentWithHeaderText => {
            const fragments = [];
            this.splitTextToFragmentsByDepthAndSignature(fragmentWithHeaderText, fragments);
            return fragments;
        });
    }
    /**
     * Splits the email text into fragments by the header text.
     *
     * @param {string} emailText
     * @returns {TypeTextEmailBodyFragment[]}
     */
    splitTextToFragmentsByHeaderText(emailText) {
        const fragmentsByHeaderText = [];
        let nextHeaderText = '';
        while (emailText.length > 0) {
            let fragmentByHeaderText;
            [emailText, nextHeaderText, fragmentByHeaderText] = this.getNextFragmentByHeaderText(emailText, nextHeaderText);
            fragmentsByHeaderText.push(fragmentByHeaderText);
        }
        return fragmentsByHeaderText;
    }
    /**
     * Gets the next fragment by the header text.
     *
     * @param {string} emailText
     * @param {string} nextHeaderText
     * @returns {[string, string, TypeTextEmailBodyFragment]}
     */
    getNextFragmentByHeaderText(emailText, nextHeaderText) {
        let match = this.matchHeader(emailText);
        const text = match ? emailText.substring(0, match.index).trim() : emailText;
        const fragmentByHeaderText = {
            text: text,
            depth: -1,
            signature: false,
            headerText: nextHeaderText
        };
        if (match) {
            // remove processed part of the email text
            emailText = emailText.substring(match.index + match[0].length).trim();
            nextHeaderText = this.removeQuotesFromLine(match[0]).trim();
        }
        else {
            emailText = '';
        }
        return [emailText, nextHeaderText, fragmentByHeaderText];
    }
    /**
     * Matches the header of the email.
     *
     * @param {string} emailText
     * @returns {RegExpExecArray|undefined}
     */
    matchHeader(emailText) {
        let match = undefined;
        // Find the closest header position
        this.patterns.HEADER_REGEX.forEach((regex) => {
            // the reason we create new instance of RegExp is to avoid it caching last matches position especially if 'g' flag is used
            let newMatch = (new RegExp(regex)).exec(emailText);
            if (newMatch && (!match || newMatch.index < match.index)) {
                match = newMatch;
            }
        });
        return match;
    }
    /**
     * Splits pre-processed fragment into smaller fragments by depth and signature.
     *
     * @param {TypeTextEmailBodyFragment} fragmentWithHeaderText
     * @param {TypeTextEmailBodyFragment[]} fragmentsByDepthAndSignature
     * @returns {void}
     */
    splitTextToFragmentsByDepthAndSignature(fragmentWithHeaderText, fragmentsByDepthAndSignature) {
        let currentFragment = {
            ...fragmentWithHeaderText,
            text: ''
        };
        // we want to handle every line separately
        const lines = fragmentWithHeaderText.text.split('\n');
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            currentFragment = this.processLine(currentFragment, lines[lineNum], lineNum, fragmentsByDepthAndSignature);
        }
        fragmentsByDepthAndSignature.push(currentFragment);
    }
    /**
     * Processes a single line of the email and updates the current fragment.
     *
     * @param {TypeTextEmailBodyFragment} currentFragment - The current fragment being built.
     * @param {string} line - Current line of text from the email.
     * @param {number} lineNum - The line number of the current line.
     * @param {TypeTextEmailBodyFragment[]} fragments - The list of fragments to append to.
     * @returns {TypeTextEmailBodyFragment} - The updated current fragment.
     */
    processLine(currentFragment, line, lineNum, fragments) {
        // Get the quote depth of the line
        const depth = this.getDepth(line);
        // Remove quotes from the beginning
        line = this.removeQuotesFromLine(line);
        // Check if the line is a signature
        const isSignature = this.isSignature(line);
        // Start a new fragment if necessary
        if (this.shouldStartNewFragment(currentFragment, depth, isSignature)) {
            currentFragment.text = currentFragment.text.trim();
            fragments.push(currentFragment);
            currentFragment = {
                text: '',
                depth: depth,
                signature: isSignature
            };
        }
        // If it a second or later line, add a newline for separation
        if (lineNum > 0) {
            currentFragment.text += '\n';
        }
        currentFragment.text += line;
        currentFragment.depth = depth;
        return currentFragment;
    }
    /**
     * Normalizes the email text by replacing line endings.
     *
     * @param {string} text - The email body text.
     * @returns {string} - The normalized text.
     */
    normalizeText(text) {
        return text.replace(/\r\n/g, '\n').trim();
    }
    /**
     * Removes the quotes from the beginning of the line.
     *
     * @param {string} line
     * @returns {string}
     */
    removeQuotesFromLine(line) {
        return line.replace(new RegExp(`^${this.QUOTE}+\\s?`), '');
    }
    /**
     * Calculates the depth of the fragment.
     *
     * @param {string} line - The line of text from the email.
     * @returns {number} - The fragment's depth.
     */
    getDepth(line) {
        let depth = 0;
        // Count the number of '>' characters at the beginning of the line
        while (line.charAt(depth) === this.QUOTE) {
            depth++;
        }
        return depth;
    }
    /**
     * Checks if the line is a signature.
     *
     * @param {string} line - The current line.
     * @returns {boolean} - True if it's a signature, otherwise false.
     */
    isSignature(line) {
        // the reason we create new instance of RegExp is to avoid it caching last matches position especially if 'g' flag is used
        return this.patterns.SIGNATURE_REGEX.some((regex) => (new RegExp(regex)).test(line));
    }
    /**
     * Determines if a new fragment should be started.
     *
     * @param {TypeTextEmailBodyFragment} currentFragment - The current fragment.
     * @param {number} depth - The quote depth of the current line.
     * @param {boolean} signature - Whether the current line is a signature.
     * @returns {boolean} - True if a new fragment should be started, otherwise false.
     */
    shouldStartNewFragment(currentFragment, depth, signature) {
        const hasTextOrHeader = currentFragment.text.length > 0 || (currentFragment.headerText && currentFragment.headerText.length > 0);
        const isDifferentDepth = currentFragment.depth > -1 && currentFragment.depth !== depth;
        const isDifferentSignature = !currentFragment.signature && signature;
        return hasTextOrHeader && (isDifferentDepth || isDifferentSignature);
    }
}
