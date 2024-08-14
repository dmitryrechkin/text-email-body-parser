// src/textEmailBodyPatterns.ts
var textEmailBodyPatterns = {
  HEADER_REGEX: [
    /-*\s*(On\s.+\s.+\n?wrote:{0,1})\s{0,1}-*$/mi,
    /-*\s*(Le\s.+\s.+\n?écrit\s?:{0,1})\s{0,1}-*$/mi,
    /-*\s*(El\s.+\s.+\n?escribió:{0,1})\s{0,1}-*$/mi,
    /-*\s*(Il\s.+\s.+\n?scritto:{0,1})\s{0,1}-*$/mi,
    /-*\s*(Em\s.+\s.+\n?escreveu:{0,1})\s{0,1}-*$/mi,
    /\s*(Am\s.+\s)\n?\n?schrieb.+\s?(\[|<).+(\]|>):$/mi,
    /\s*(Op\s[\s\S]+?\n?schreef[\s\S]+:)$/mi,
    /\s*((W\sdniu|Dnia)\s[\s\S]+?(pisze|napisał(\(a\))?):)$/mi,
    /\s*(Den\s.+\s\n?skrev\s.+:)$/mi,
    /\s*(pe\s.+\s.+\n?kirjoitti:)$/mi,
    /\s*(Am\s.+\sum\s.+\s\n?schrieb\s.+:)$/mi,
    /(在[\s\S]+写道：)$/mi,
    /(20[0-9]{2}\..+\s작성:)$/mi,
    /(20[0-9]{2}\/.+のメッセージ:)$/mi,
    /([^>\n]+\s<.+>\sschrieb:)$/mi,
    /(On\s.+\s.+\n?wrote:{0,1})\s{0,1}-*$/mi,
    /\s*(From\s?:.+\s?\n?\s*[\[|<].+[\]|>])/mi,
    /\s*(Von\s?:.+\s?\n?\s*[\[|<].+[\]|>])/mi,
    /\s*(De\s?:.+\s?\n?\s*(\[|<).+(\]|>))/mi,
    /\s*(Van\s?:.+\s?\n?\s*(\[|<).+(\]|>))/mi,
    /\s*(Da\s?:.+\s?\n?\s*(\[|<).+(\]|>))/mi,
    /(20[0-9]{2})-([0-9]{2}).([0-9]{2}).([0-9]{2}):([0-9]{2})\n?(.*)>:$/mi,
    /^\s*([a-z]{3,4}\.\s[\s\S]+\sskrev\s[^<]+<[^>]+>:)$/mi,
    /([0-9]{2}).([0-9]{2}).(20[0-9]{2})(.*)(([0-9]{2}).([0-9]{2}))(.*)\"( *)<(.*)>( *):$/mi,
    /[0-9]{2}:[0-9]{2}(.*)[0-9]{4}(.*)\"( *)<(.*)>( *):$/mi,
    /[^\n>]*\b([A-Za-z]+,\s[0-9]{1,2}\s[A-Za-z]+\s[0-9]{4},\s[0-9]{1,2}:[0-9]{2}\s[APM]+\s\+\d{4}\sfrom\s[^\s]+@[^\s]+(\s<.+>)):$/im,
    /-{1,10} ?(O|o)riginal (M|m)essage ?-{1,10}$/mi,
    /-{1,10} ?(O|o)prindelig (B|b)esked ?-{1,10}$/mi,
    /-{1,10} ?(M|m)essage d\'origine ?-{1,10}$/mi
  ],
  SIGNATURE_REGEX: [
    /^\s*-{2,4}$/,
    /^\s*_{2,4}$/,
    /^-- $/,
    /^-- \s*.+$/,
    /^\+{2,4}$/,
    /^\={2,4}$/,
    /^________________________________$/,
    /^Sent from (?:\s*.+)$/,
    /^Get Outlook for (?:\s*.+).*/m,
    /^Cheers,?!?$/mi,
    /^Best wishes,?!?$/mi,
    /^\w{0,20}\s?(\sand\s)?Regards,?!?！?$/mi,
    /^Von (?:\s*.+) gesendet$/,
    /^Sendt fra (?:\s*.+)$/,
    /^Envoyé depuis (?:\s*.+)$/,
    /^Envoyé de mon (?:\s*.+)$/,
    /^Envoyé à partir de (?:\s*.+)$/,
    /^Télécharger Outlook pour (?:\s*.+).*/m,
    /^Bien . vous,?!?$/mi,
    /^\w{0,20}\s?cordialement,?!?$/mi,
    /^Bonne (journ.e|soir.e)!?$/mi,
    /^Enviado desde (?:\s*.+)$/,
    /^Verzonden vanaf (?:\s*.+)$/
  ]
};

// src/TextEmailBodyParser.ts
class TextEmailBodyParser {
  QUOTE = ">";
  patterns;
  constructor(patterns = textEmailBodyPatterns) {
    this.patterns = patterns;
  }
  parse(emailText) {
    const normalizedText = this.normalizeText(emailText);
    const fragmentsByHeaderText = this.splitTextToFragmentsByHeaderText(normalizedText);
    if (fragmentsByHeaderText.length === 0) {
      return [];
    }
    return this.splitsFragmentsByDepthAndSignature(fragmentsByHeaderText);
  }
  splitsFragmentsByDepthAndSignature(fragmentsByHeaderText) {
    return fragmentsByHeaderText.flatMap((fragmentWithHeaderText) => {
      const fragments = [];
      this.splitTextToFragmentsByDepthAndSignature(fragmentWithHeaderText, fragments);
      return fragments;
    });
  }
  splitTextToFragmentsByHeaderText(emailText) {
    const fragmentsByHeaderText = [];
    let nextHeaderText = "";
    while (emailText.length > 0) {
      let fragmentByHeaderText;
      [emailText, nextHeaderText, fragmentByHeaderText] = this.getNextFragmentByHeaderText(emailText, nextHeaderText);
      fragmentsByHeaderText.push(fragmentByHeaderText);
    }
    return fragmentsByHeaderText;
  }
  getNextFragmentByHeaderText(emailText, nextHeaderText) {
    let match = this.matchHeader(emailText);
    const text = match ? emailText.substring(0, match.index).trim() : emailText;
    const fragmentByHeaderText = {
      text,
      depth: -1,
      signature: false,
      headerText: nextHeaderText
    };
    if (match) {
      emailText = emailText.substring(match.index + match[0].length).trim();
      nextHeaderText = this.removeQuotesFromLine(match[0]).trim();
    } else {
      emailText = "";
    }
    return [emailText, nextHeaderText, fragmentByHeaderText];
  }
  matchHeader(emailText) {
    let match = undefined;
    this.patterns.HEADER_REGEX.forEach((regex) => {
      let newMatch = new RegExp(regex).exec(emailText);
      if (newMatch && (!match || newMatch.index < match.index)) {
        match = newMatch;
      }
    });
    return match;
  }
  splitTextToFragmentsByDepthAndSignature(fragmentWithHeaderText, fragmentsByDepthAndSignature) {
    let currentFragment = {
      ...fragmentWithHeaderText,
      text: ""
    };
    const lines = fragmentWithHeaderText.text.split("\n");
    for (let lineNum = 0;lineNum < lines.length; lineNum++) {
      currentFragment = this.processLine(currentFragment, lines[lineNum], lineNum, fragmentsByDepthAndSignature);
    }
    fragmentsByDepthAndSignature.push(currentFragment);
  }
  processLine(currentFragment, line, lineNum, fragments) {
    const depth = this.getDepth(line);
    line = this.removeQuotesFromLine(line);
    const isSignature = this.isSignature(line);
    if (this.shouldStartNewFragment(currentFragment, depth, isSignature)) {
      currentFragment.text = currentFragment.text.trim();
      fragments.push(currentFragment);
      currentFragment = {
        text: "",
        depth,
        signature: isSignature
      };
    }
    if (lineNum > 0) {
      currentFragment.text += "\n";
    }
    currentFragment.text += line;
    currentFragment.depth = depth;
    return currentFragment;
  }
  normalizeText(text) {
    return text.replace(/\r\n/g, "\n").trim();
  }
  removeQuotesFromLine(line) {
    return line.replace(new RegExp(`^${this.QUOTE}+\\s?`), "");
  }
  getDepth(line) {
    let depth = 0;
    while (line.charAt(depth) === this.QUOTE) {
      depth++;
    }
    return depth;
  }
  isSignature(line) {
    return this.patterns.SIGNATURE_REGEX.some((regex) => new RegExp(regex).test(line));
  }
  shouldStartNewFragment(currentFragment, depth, signature) {
    const hasTextOrHeader = currentFragment.text.length > 0 || currentFragment.headerText && currentFragment.headerText.length > 0;
    const isDifferentDepth = currentFragment.depth > -1 && currentFragment.depth !== depth;
    const isDifferentSignature = !currentFragment.signature && signature;
    return hasTextOrHeader && (isDifferentDepth || isDifferentSignature);
  }
}
export {
  textEmailBodyPatterns,
  TextEmailBodyParser
};
