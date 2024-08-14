import { textEmailBodyPatterns } from './textEmailBodyPatterns';
import { type TypeTextEmailBodyFragment, type TextEmailBodyPatterns } from './Types';

export class TextEmailBodyParser
{
	private readonly QUOTE = '>';
	private patterns: TextEmailBodyPatterns;

	/**
	 * Constructor to initialize the regex patterns.
	 *
	 * @param {TextEmailBodyPatterns} patterns - The regex patterns to use for parsing.
	 */
	public constructor(patterns: TextEmailBodyPatterns = textEmailBodyPatterns)
	{
		this.patterns = patterns;
	}

	/**
	 * Parses an email message into a list of fragments.
	 *
	 * @param {string} emailText - The email body text to process.
	 * @returns {TypeTextEmailBodyFragment[]} - A list of parsed fragments.
	 */
	public parse(emailText: string): TypeTextEmailBodyFragment[]
	{
		const normalizedText = this.normalizeText(emailText);

		const fragmentsByHeaderText = this.splitTextToFragmentsByHeaderText(normalizedText);
		if (fragmentsByHeaderText.length === 0)
		{
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
	private splitsFragmentsByDepthAndSignature(fragmentsByHeaderText: TypeTextEmailBodyFragment[]): TypeTextEmailBodyFragment[]
	{
		return fragmentsByHeaderText.flatMap(fragmentWithHeaderText =>
		{
			const fragments: TypeTextEmailBodyFragment[] = [];
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
	private splitTextToFragmentsByHeaderText(emailText: string): TypeTextEmailBodyFragment[]
	{
		const fragmentsByHeaderText: TypeTextEmailBodyFragment[] = [];

		let nextHeaderText = '';

		while (emailText.length > 0)
		{
			let fragmentByHeaderText: TypeTextEmailBodyFragment;

			[ emailText, nextHeaderText, fragmentByHeaderText ] = this.getNextFragmentByHeaderText(emailText, nextHeaderText);

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
	private getNextFragmentByHeaderText(emailText: string, nextHeaderText: string): [string, string, TypeTextEmailBodyFragment]
	{
		let match = this.matchHeader(emailText);

		const text = match ? emailText.substring(0, match.index).trim() : emailText;
		const fragmentByHeaderText = {
			text: text,
			depth: -1,
			signature: false,
			headerText: nextHeaderText.length > 0 ? nextHeaderText : undefined,
			senderEmail: this.matchEmail(nextHeaderText)
		};

		if (match)
		{
			// remove processed part of the email text
			emailText = emailText.substring(match.index + match[0].length).trim();
			nextHeaderText = this.removeQuotesFromLine(match[0]).trim();
		}
		else
		{
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
	private matchHeader(emailText: string): RegExpExecArray | undefined
	{
		return this.matchPatterns(emailText, this.patterns.HEADER_REGEX);
	}

	/**
	 * Matches the email address in the email text.
	 *
	 * @param {string} emailText
	 * @returns {string|undefined}
	 */
	private matchEmail(emailText: string): string | undefined
	{
		const match = this.matchPatterns(emailText, this.patterns.EMAIL_REGEX);

		return match ? match[0] : undefined;
	}

	/**
	 * Matches the header of the email.
	 *
	 * @param {string} text
	 * @param {RegExp[]} patterns
	 * @returns {RegExpExecArray|undefined}
	 */
	private matchPatterns(text: string, patterns: RegExp[]): RegExpExecArray | undefined
	{
		let match: RegExpExecArray|undefined = undefined;

		patterns.forEach((regex) =>
		{
			// the reason we create new instance of RegExp is to avoid it caching last matches position especially if 'g' flag is used
			let newMatch = (new RegExp(regex)).exec(text);
			if (newMatch && (!match || newMatch.index < match.index))
			{
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
	private splitTextToFragmentsByDepthAndSignature(fragmentWithHeaderText: TypeTextEmailBodyFragment, fragmentsByDepthAndSignature: TypeTextEmailBodyFragment[]): void
	{
		let currentFragment = {
			...fragmentWithHeaderText,
			text: ''
		};

		// we want to handle every line separately
		const lines = fragmentWithHeaderText.text.split('\n');

		for (let lineNum = 0; lineNum < lines.length; lineNum++)
		{
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
	private processLine(currentFragment: TypeTextEmailBodyFragment, line: string, lineNum: number, fragments: TypeTextEmailBodyFragment[]): TypeTextEmailBodyFragment
	{
		// Get the quote depth of the line
		const depth = this.getDepth(line);

		// Remove quotes from the beginning
		line = this.removeQuotesFromLine(line);

		// Check if the line is a signature
		const isSignature = this.isSignature(line);

		// Start a new fragment if necessary
		if (this.shouldStartNewFragment(currentFragment, depth, isSignature))
		{
			currentFragment.text = currentFragment.text.trim();
			fragments.push(currentFragment);

			currentFragment = {
				text: '',
				depth: depth,
				signature: isSignature
			};
		}

		// If it a second or later line, add a newline for separation
		if (lineNum > 0)
		{
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
	private normalizeText(text: string): string
	{
		return text
			// normalize line endings
			.replace(/\r\n/g, '\n')
			// remove extra spaces between >
			.replace(/> (?=>)/g, '>')
			// remove extra spaces at the end of the line
			.trim();
	}

	/**
	 * Removes the quotes from the beginning of the line.
	 *
	 * @param {string} line
	 * @returns {string}
	 */
	private removeQuotesFromLine(line: string): string
	{
		return line.replace(new RegExp(`^(${this.QUOTE}\\s?)+`), '');
	}

	/**
	 * Calculates the depth of the fragment.
	 *
	 * @param {string} line - The line of text from the email.
	 * @returns {number} - The fragment's depth.
	 */
	private getDepth(line: string): number
	{
		let depth = 0;

		// Count the number of '>' characters at the beginning of the line
		while (line.charAt(depth) === this.QUOTE)
		{
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
	private isSignature(line: string): boolean
	{
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
	private shouldStartNewFragment(currentFragment: TypeTextEmailBodyFragment, depth: number, signature: boolean): boolean
	{
		const hasTextOrHeader = currentFragment.text.length > 0 || (currentFragment.headerText && currentFragment.headerText.length > 0) as boolean;
		const isDifferentDepth = currentFragment.depth > -1 && currentFragment.depth !== depth;
		const isDifferentSignature = !currentFragment.signature && signature;

		return hasTextOrHeader && (isDifferentDepth || isDifferentSignature);
	}
}
