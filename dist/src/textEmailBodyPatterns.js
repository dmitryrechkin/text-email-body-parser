import {} from './Types';
export const textEmailBodyPatterns = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    HEADER_REGEX: [
        /-*\s*(On\s.+\s.+\n?wrote:{0,1})\s{0,1}-*$/mi, // On DATE, NAME <EMAIL> wrote:
        /-*\s*(Le\s.+\s.+\n?écrit\s?:{0,1})\s{0,1}-*$/mi, // Le DATE, NAME <EMAIL> a écrit :
        /-*\s*(El\s.+\s.+\n?escribió:{0,1})\s{0,1}-*$/mi, // El DATE, NAME <EMAIL> escribió:
        /-*\s*(Il\s.+\s.+\n?scritto:{0,1})\s{0,1}-*$/mi, // Il DATE, NAME <EMAIL> ha scritto:
        /-*\s*(Em\s.+\s.+\n?escreveu:{0,1})\s{0,1}-*$/mi, // Em DATE, NAME <EMAIL> ha escreveu:
        /\s*(Am\s.+\s)\n?\n?schrieb.+\s?(\[|<).+(\]|>):$/mi, // Am DATE schrieb NAME <EMAIL>:
        /\s*(Op\s[\s\S]+?\n?schreef[\s\S]+:)$/mi, // Il DATE, schreef NAME <EMAIL>:
        /\s*((W\sdniu|Dnia)\s[\s\S]+?(pisze|napisał(\(a\))?):)$/mi, // W dniu DATE, NAME <EMAIL> pisze|napisał:
        /\s*(Den\s.+\s\n?skrev\s.+:)$/mi, // Den DATE skrev NAME <EMAIL>:
        /\s*(pe\s.+\s.+\n?kirjoitti:)$/mi, // pe DATE NAME <EMAIL> kirjoitti:
        /\s*(Am\s.+\sum\s.+\s\n?schrieb\s.+:)$/mi, // Am DATE um TIME schrieb NAME:
        /(在[\s\S]+写道：)$/mi, // > 在 DATE, TIME, NAME 写道：
        /(20[0-9]{2}\..+\s작성:)$/mi, // DATE TIME NAME 작성:
        /(20[0-9]{2}\/.+のメッセージ:)$/mi, // DATE TIME、NAME のメッセージ:
        /([^>\n]+\s<.+>\sschrieb:)$/mi, // NAME <EMAIL> schrieb:
        /(On\s.+\s.+\n?wrote:{0,1})\s{0,1}-*$/mi, // NAME on DATE wrote:
        /\s*(From\s?:.+\s?\n?\s*[\[|<].+[\]|>])/mi, // "From: NAME <EMAIL>" OR "From : NAME <EMAIL>" OR "From : NAME<EMAIL>"(With support whitespace before start and before <)
        /\s*(Von\s?:.+\s?\n?\s*[\[|<].+[\]|>])/mi, // "Von: NAME <EMAIL>" OR "Von : NAME <EMAIL>" OR "Von : NAME<EMAIL>"(With support whitespace before start and before <)
        /\s*(De\s?:.+\s?\n?\s*(\[|<).+(\]|>))/mi, // "De: NAME <EMAIL>" OR "De : NAME <EMAIL>" OR "De : NAME<EMAIL>"  (With support whitespace before start and before <)
        /\s*(Van\s?:.+\s?\n?\s*(\[|<).+(\]|>))/mi, // "Van: NAME <EMAIL>" OR "Van : NAME <EMAIL>" OR "Van : NAME<EMAIL>"  (With support whitespace before start and before <)
        /\s*(Da\s?:.+\s?\n?\s*(\[|<).+(\]|>))/mi, // "Da: NAME <EMAIL>" OR "Da : NAME <EMAIL>" OR "Da : NAME<EMAIL>"  (With support whitespace before start and before <)
        /(20[0-9]{2})-([0-9]{2}).([0-9]{2}).([0-9]{2}):([0-9]{2})\n?(.*)>:$/mi, // 20YY-MM-DD HH:II GMT+01:00 NAME <EMAIL>:
        /^\s*([a-z]{3,4}\.\s[\s\S]+\sskrev\s[^<]+<[^>]+>:)$/mi, // DATE skrev NAME <EMAIL>:
        /([0-9]{2}).([0-9]{2}).(20[0-9]{2})(.*)(([0-9]{2}).([0-9]{2}))(.*)\"( *)<(.*)>( *):$/mi, // DD.MM.20YY HH:II NAME <EMAIL>
        /[0-9]{2}:[0-9]{2}(.*)[0-9]{4}(.*)\"( *)<(.*)>( *):$/mi, // HH:II, DATE, NAME <EMAIL>:
        ///([^>]*)[0-9]{4}(.*)from(.*)<(.*)>:$/mi, // DATE, TIME, NAME from EMAIL:
        /[^\n>]*\b([A-Za-z]+,\s[0-9]{1,2}\s[A-Za-z]+\s[0-9]{4},\s[0-9]{1,2}:[0-9]{2}\s[APM]+\s\+\d{4}\sfrom\s[^\s]+@[^\s]+(\s<.+>)):$/im, // DAY, DD MONTH YYYY, HH:II AM/PM +0000 from NAME <EMAIL>:
        ///([^>]*)[0-9]{4}(.*)"(.*)" <(.*)>:$/mi, // DATE, TIME, "NAME" EMAIL:
        /-{1,10} ?(O|o)riginal (M|m)essage ?-{1,10}$/mi,
        /-{1,10} ?(O|o)prindelig (B|b)esked ?-{1,10}$/mi,
        /-{1,10} ?(M|m)essage d\'origine ?-{1,10}$/mi
    ],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SIGNATURE_REGEX: [
        /^\s*-{2,4}$/, // Separator
        /^\s*_{2,4}$/, // Separator
        /^-- $/, // Separator
        /^-- \s*.+$/, // Separator
        /^\+{2,4}$/, // Separator
        /^\={2,4}$/, // Separator
        /^________________________________$/, // Separator
        // EN
        /^Sent from (?:\s*.+)$/, // en
        /^Get Outlook for (?:\s*.+).*/m, // en
        /^Cheers,?!?$/mi, // en
        /^Best wishes,?!?$/mi, // en
        /^\w{0,20}\s?(\sand\s)?Regards,?!?！?$/mi, //en
        // DE
        /^Von (?:\s*.+) gesendet$/, // de
        // DA
        /^Sendt fra (?:\s*.+)$/, // da
        // FR
        /^Envoyé depuis (?:\s*.+)$/, //fr
        /^Envoyé de mon (?:\s*.+)$/, // fr - e.g. Envoyé de mon iPhone
        /^Envoyé à partir de (?:\s*.+)$/, //fr
        /^Télécharger Outlook pour (?:\s*.+).*/m, // fr
        /^Bien . vous,?!?$/mi, // fr
        /^\w{0,20}\s?cordialement,?!?$/mi, // fr
        /^Bonne (journ.e|soir.e)!?$/mi, // fr
        // ES
        /^Enviado desde (?:\s*.+)$/, // es,
        // NL
        /^Verzonden vanaf (?:\s*.+)$/ // nl - e.g. Verzonden vanaf Outlook voor Android<https://aka.ms/12345>
    ]
};
