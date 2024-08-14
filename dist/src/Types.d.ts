export interface TypeTextEmailBodyFragment {
    headerText?: string;
    text: string;
    depth: number;
    signature: boolean;
}
export interface TextEmailBodyPatterns {
    readonly HEADER_REGEX: RegExp[];
    readonly SIGNATURE_REGEX: RegExp[];
}
