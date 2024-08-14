import { type TypeTextEmailBodyFragment, type TextEmailBodyPatterns } from './Types';
export declare class TextEmailBodyParser {
    private readonly QUOTE;
    private patterns;
    /**
     * Constructor to initialize the regex patterns.
     *
     * @param {TextEmailBodyPatterns} patterns - The regex patterns to use for parsing.
     */
    constructor(patterns?: TextEmailBodyPatterns);
    /**
     * Parses an email message into a list of fragments.
     *
     * @param {string} emailText - The email body text to process.
     * @returns {TypeTextEmailBodyFragment[]} - A list of parsed fragments.
     */
    parse(emailText: string): TypeTextEmailBodyFragment[];
    /**
     * Splits fragments by depth and signature.
     *
     * @param {TypeTextEmailBodyFragment[]} fragmentsByHeaderText
     * @returns {TypeTextEmailBodyFragment[]}
     */
    private splitsFragmentsByDepthAndSignature;
    /**
     * Splits the email text into fragments by the header text.
     *
     * @param {string} emailText
     * @returns {TypeTextEmailBodyFragment[]}
     */
    private splitTextToFragmentsByHeaderText;
    /**
     * Gets the next fragment by the header text.
     *
     * @param {string} emailText
     * @param {string} nextHeaderText
     * @returns {[string, string, TypeTextEmailBodyFragment]}
     */
    private getNextFragmentByHeaderText;
    /**
     * Matches the header of the email.
     *
     * @param {string} emailText
     * @returns {RegExpExecArray|undefined}
     */
    private matchHeader;
    /**
     * Splits pre-processed fragment into smaller fragments by depth and signature.
     *
     * @param {TypeTextEmailBodyFragment} fragmentWithHeaderText
     * @param {TypeTextEmailBodyFragment[]} fragmentsByDepthAndSignature
     * @returns {void}
     */
    private splitTextToFragmentsByDepthAndSignature;
    /**
     * Processes a single line of the email and updates the current fragment.
     *
     * @param {TypeTextEmailBodyFragment} currentFragment - The current fragment being built.
     * @param {string} line - Current line of text from the email.
     * @param {number} lineNum - The line number of the current line.
     * @param {TypeTextEmailBodyFragment[]} fragments - The list of fragments to append to.
     * @returns {TypeTextEmailBodyFragment} - The updated current fragment.
     */
    private processLine;
    /**
     * Normalizes the email text by replacing line endings.
     *
     * @param {string} text - The email body text.
     * @returns {string} - The normalized text.
     */
    private normalizeText;
    /**
     * Removes the quotes from the beginning of the line.
     *
     * @param {string} line
     * @returns {string}
     */
    private removeQuotesFromLine;
    /**
     * Calculates the depth of the fragment.
     *
     * @param {string} line - The line of text from the email.
     * @returns {number} - The fragment's depth.
     */
    private getDepth;
    /**
     * Checks if the line is a signature.
     *
     * @param {string} line - The current line.
     * @returns {boolean} - True if it's a signature, otherwise false.
     */
    private isSignature;
    /**
     * Determines if a new fragment should be started.
     *
     * @param {TypeTextEmailBodyFragment} currentFragment - The current fragment.
     * @param {number} depth - The quote depth of the current line.
     * @param {boolean} signature - Whether the current line is a signature.
     * @returns {boolean} - True if a new fragment should be started, otherwise false.
     */
    private shouldStartNewFragment;
}
