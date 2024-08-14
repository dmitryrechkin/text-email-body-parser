# Text Email Body Parser

**Text Email Body Parser is a TypeScript library inspired by Email Reply Parser to parse plain-text email bodies and extract meaningful fragments.**

This library supports most email replies, signatures, and locales.

**Author**: Dmitry Rechkin <rechkin@gmail.com>

## Installation

Install the project using pnpm:

```bash
pnpm add @dmitryrechkin/text-email-body-parser
```

## Features

- Strip email replies like On DATE, NAME <EMAIL> wrote:
- Supports around 10 locales, including English, French, Spanish, Portuguese, Italian, Japanese, Chinese.
- Removes signatures like Sent from my iPhone
- Removes signatures like Best wishes

## Usage

```javascript
import { TextEmailBodyParser } from "@dmitryrechkin/text-email-body-parser";

const parser = new TextEmailBodyParser();
const email = parser.parse(MY_EMAIL_STRING);

console.log(email.map(fragment => fragment.text).join('\n'));
```

## Defining Custom Patterns

The TextEmailBodyParser class allows you to define custom patterns for headers and signatures. These patterns can be passed to the constructor using the TextEmailBodyPatterns interface.

```javascript
export interface TextEmailBodyPatterns {
    readonly HEADER_REGEX: RegExp[];
    readonly SIGNATURE_REGEX: RegExp[];
}
```

### Example of Custom Patterns

```javascript
import { TextEmailBodyParser, TextEmailBodyPatterns } from "text-email-body-parser";

const customPatterns: TextEmailBodyPatterns = {
    HEADER_REGEX: [
        // Custom header patterns
        /CustomHeaderPattern/,
    ],
    SIGNATURE_REGEX: [
        // Custom signature patterns
        /CustomSignaturePattern/,
    ]
};

const parser = new TextEmailBodyParser(customPatterns);
const email = parser.parse(MY_EMAIL_STRING);

console.log(email.map(fragment => fragment.text).join('\n'));
```

## Fragment Structure

The parsed email is broken down into fragments, each represented by the TypeTextEmailBodyFragment interface.

### TypeTextEmailBodyFragment Interface

```javascript
export interface TypeTextEmailBodyFragment {
    headerText?: string; // The header text, if any, associated with this fragment
    text: string;        // The main content of the fragment
    depth: number;       // The quote depth of the fragment, indicating how deeply nested the quote is
    signature: boolean;  // Indicates whether the fragment is recognized as a signature
}
```

### Example of a Parsed Fragment

```javascript
const parser = new TextEmailBodyParser();
const email = parser.parse(MY_EMAIL_STRING);

email.forEach(fragment => {
    console.log(`Header: ${fragment.headerText}`);
    console.log(`Text: ${fragment.text}`);
    console.log(`Depth: ${fragment.depth}`);
    console.log(`Is Signature: ${fragment.signature}`);
});
```

## Inspired By

It has been inspired by Email Reply Parser, which requires RE2 and does not work in nodeless environments like Cloudflare. 

Text Email Body Parser has been completely rewritten in TypeScript, retaining only the regex patterns and the core idea of fragments from the original. 
It has been thoroughly tested, and all unit tests pass.

## Contributing

Feel free to fork this project and submit fixes. We may adapt your code to fit the codebase.

You can run unit tests using:

```bash
pnpm test
```
