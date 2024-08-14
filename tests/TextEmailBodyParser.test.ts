import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TextEmailBodyParser } from '../src/TextEmailBodyParser';
import { type TypeTextEmailBodyFragment } from '../src/Types';

// eslint-disable-next-line @typescript-eslint/naming-convention
const COMMON_FIRST_FRAGMENT = `Fusce bibendum, quam hendrerit sagittis tempor, dui turpis tempus erat, pharetra sodales ante sem sit amet metus.
Nulla malesuada, orci non vulputate lobortis, massa felis pharetra ex, convallis consectetur ex libero eget ante.
Nam vel turpis posuere, rhoncus ligula in, venenatis orci. Duis interdum venenatis ex a rutrum.
Duis ut libero eu lectus consequat consequat ut vel lorem. Vestibulum convallis lectus urna,
et mollis ligula rutrum quis. Fusce sed odio id arcu varius aliquet nec nec nibh.`;

function getEmailFragments(name: string): TypeTextEmailBodyFragment[]
{
	const data = readFileSync(resolve(__dirname, 'fixtures', `${name}.txt`), 'utf-8');
	const parser = new TextEmailBodyParser();
	return parser.parse(data);
}

describe('TextEmailBodyParser', () =>
{
	it('should be able to read a gmail thread', () =>
	{
		const fragments = getEmailFragments('email_gmail_thread');

		expect(fragments[0].depth).toEqual(0);
		expect(fragments[0].text).toEqual('I understand your replay, but I still want to book this room!');
		expect(fragments[0].headerText).toBeUndefined();
		expect(fragments[1].depth).toEqual(1);
		expect(fragments[1].text).toEqual('Yeah, I’m doing very good thanks!');
		expect(fragments[1].headerText).toEqual('On Sun, Aug 11, 2024 at 11:03 AM First Last wrote:');
		expect(fragments[3].depth).toEqual(2);
		expect(fragments[3].text.trim()).toEqual('I\'m doing well and you?');
		expect(fragments[3].headerText).toEqual('On Aug 11, 2024, at 10:19, Another Name > [user2@gmail.com]> wrote:');
		expect(fragments[3].senderEmail).toEqual('user2@gmail.com');
	});

	it('should read a simple body', () =>
	{
		const fragments = getEmailFragments('email_1');
		expect(fragments.length).toBe(2);
		expect(fragments.map(f => f.depth)).toEqual([0, 0]);
		expect(fragments.map(f => f.signature)).toEqual([false, true]);
		expect(fragments[0].text.trim()).toBe('Hi folks\n\nWhat is the best way to clear a Riak bucket of all key, values after\nrunning a test?\nI am currently using the Java HTTP API.\n\n-Abhishek Kona');
	});

	it('should read top post', () =>
	{
		const fragments = getEmailFragments('email_3');
		expect(fragments[2].text.trim()).toBe('Hi folks\n\nWhat is the best way to clear a Riak bucket of all key, values after\nrunning a test?\nI am currently using the Java HTTP API.');
	});

	it('should read bottom post', () =>
	{
		const fragments = getEmailFragments('email_2');
		expect(fragments.length).toBe(6);
		expect(fragments[0].text.trim()).toBe('Hi,');
		expect(fragments[1].headerText!.trim()).toBe('On Tue, 2011-03-01 at 18:02 +0530, Abhishek Kona wrote:');
	});

	it('should recognize data string above quote', () =>
	{
		const fragments = getEmailFragments('email_4');
		expect(/^Awesome/.test(fragments[0].text.trim())).toBe(true);
		expect(/^On/.test(fragments[1].headerText!.trim())).toBe(true);
		expect(/Loader/.test(fragments[1].text.trim())).toBe(true);
	});

	it('should deal with complex body with only one fragment', () =>
	{
		const fragments = getEmailFragments('email_5');
		expect(fragments.length).toBe(1);
	});

	it('should handle multiline reply headers', () =>
	{
		const fragments = getEmailFragments('email_6');
		expect(/^I get/.test(fragments[0].text.trim())).toBe(true);
	});

	it('should handle email with Italian', () =>
	{
		const fragments = getEmailFragments('email_7');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email with Dutch', () =>
	{
		const fragments = getEmailFragments('email_8');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email with signature', () =>
	{
		const fragments = getEmailFragments('email_9');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email with Hotmail', () =>
	{
		const fragments = getEmailFragments('email_10');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email with whitespace before header', () =>
	{
		const fragments = getEmailFragments('email_11');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email with square brackets', () =>
	{
		const fragments = getEmailFragments('email_12');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email from DA into Italian', () =>
	{
		const fragments = getEmailFragments('email_13');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email with Polish header', () =>
	{
		const fragments = getEmailFragments('email_14');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email sent from my device', () =>
	{
		const fragments = getEmailFragments('email_15');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email with Polish header and Dnia and Napisała', () =>
	{
		const fragments = getEmailFragments('email_16');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email header in Polish with date in ISO 8601', () =>
	{
		const fragments = getEmailFragments('email_17');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email from Outlook (EN)', () =>
	{
		const fragments = getEmailFragments('email_18');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email 22', () =>
	{
		const fragments = getEmailFragments('email_22');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email 23', () =>
	{
		const fragments = getEmailFragments('email_23');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email 25', () =>
	{
		const fragments = getEmailFragments('email_25');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email 26', () =>
	{
		const fragments = getEmailFragments('email_26');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email in Portuguese', () =>
	{
		const fragments = getEmailFragments('email_portuguese');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email in German', () =>
	{
		const fragments = getEmailFragments('email_german');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email in German (2)', () =>
	{
		const fragments = getEmailFragments('email_german_2');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email in Gmail (NO)', () =>
	{
		const fragments = getEmailFragments('email_norwegian_gmail');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email in Finnish', () =>
	{
		const fragments = getEmailFragments('email_finnish');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email with correct signature', () =>
	{
		const fragments = getEmailFragments('correct_sig');
		expect(fragments.length).toBe(2);
		expect(fragments[0].signature).toBe(false);
		expect(fragments[1].signature).toBe(true);
		expect(fragments[0].text.trim()).toBeTruthy();
		expect(fragments[1].text.trim()).toBeTruthy();
		expect(/^--\nrick/.test(fragments[1].text.trim())).toBe(true);
	});

	it('should read email with signature with no empty line above', () =>
	{
		const fragments = getEmailFragments('sig_no_empty_line');
		expect(fragments.length).toBe(2);
		expect(fragments[0].signature).toBe(false);
		expect(fragments[1].signature).toBe(true);
		expect(fragments[0].text.trim()).toBeTruthy();
		expect(fragments[1].text.trim()).toBeTruthy();
		expect(/^--\nrick/.test(fragments[1].text.trim())).toBe(true);
	});

	it('should handle case where one is not on', () =>
	{
		const fragments = getEmailFragments('email_one_is_not_on');
		expect(/One outstanding question/.test(fragments[0].text.trim())).toBe(true);
		expect(/^On Oct 1, 2012/.test(fragments[1].headerText!.trim())).toBe(true);
	});

	it('should handle "Sent from" signature', () =>
	{
		const fragments = getEmailFragments('email_sent_from');
		expect(fragments[0].text.trim()).toBe('Hi it can happen to any texts you type, as long as you type in between words or paragraphs.');
	});

	it('should handle email with emoji', () =>
	{
		const fragments = getEmailFragments('email_emoji');
		expect(fragments[0].text.trim()).toBe('🎉\n\n—\nJohn Doe\nCEO at Pandaland\n\n@pandaland');
	});

	it('should handle email that is not a signature', () =>
	{
		const fragments = getEmailFragments('email_not_a_signature');
		expect(fragments[0].signature).toBe(false);
	});

	it('should handle email 24', () =>
	{
		const fragments = getEmailFragments('email_24');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle email from Outlook', () =>
	{
		const fragments = getEmailFragments('email_outlook_split_line_from');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(2);
	});

	it('should handle email from Gmail', () =>
	{
		const fragments = getEmailFragments('email_gmail_split_line_from');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(2);
	});

	it('should handle text email with reply header', () =>
	{
		const fragments = getEmailFragments('email_reply_header');
		expect(/^On the other hand/m.test(fragments[0].text.trim())).toBe(true);
		expect(/^On Wed, Dec 9/m.test(fragments[1].headerText!.trim())).toBe(true);
	});

	it('should handle text email from iOS Outlook in French', () =>
	{
		const fragments = getEmailFragments('email_ios_outlook_fr');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(3);
	});

	it('should handle text email from iOS Outlook', () =>
	{
		const fragments = getEmailFragments('email_ios_outlook');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(3);
	});

	it('should handle text email from MSN', () =>
	{
		const fragments = getEmailFragments('email_msn');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});

	it('should handle text email from Zoho', () =>
	{
		const fragments = getEmailFragments('email_zoho');
		expect(fragments[0].text.trim()).toBe('What is the best way to clear a Riak bucket of all key, values after\nrunning a test?');
	});

	it('should handle text email with "Regards" signature', () =>
	{
		const fragments = getEmailFragments('email_with_regards');
		expect(fragments[0].text.trim()).toBe('Hi, \n\nI still have the same problem....\n\nCan you help?');
	});

	it('should handle text email in French with multiline', () =>
	{
		const fragments = getEmailFragments('email_fr_multiline');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(2);
	});

	it('should handle text email in English with multiline', () =>
	{
		const fragments = getEmailFragments('email_en_multiline_2');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(2);
	});

	it('should handle text email with "Original Message" header', () =>
	{
		const fragments = getEmailFragments('email_original_message');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(2);
	});

	it('should handle text email with "Original Message" header (2)', () =>
	{
		const fragments = getEmailFragments('email_original_message_2');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(2);
	});

	it('should handle text email with Danish dash separator', () =>
	{
		const fragments = getEmailFragments('email_danish_dash_separator');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
		expect(fragments.length).toBe(2);
	});

	it('should handle text email with French dash separator', () =>
	{
		const fragments = getEmailFragments('email_french_dash_separator');
		expect(fragments[0].text.trim()).toBe(COMMON_FIRST_FRAGMENT);
	});
});
