export interface TypeTextEmailBodyFragment
{
	headerText?: string;
	senderEmail?: string;
	text: string;
	depth: number;
	signature: boolean;
}

export interface TextEmailBodyPatterns
{
	readonly EMAIL_REGEX: RegExp[];
	readonly HEADER_REGEX: RegExp[];
	readonly SIGNATURE_REGEX: RegExp[];
}
