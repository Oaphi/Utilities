
/**
 * @summary checks if string is lowcase
 * @param {string} [str] 
 * @returns {boolean}
 */
const isLcase = (str = "") => {

    if (!str) {
        return false;
    }

    return Array.prototype.every
        .call(str, char => {
            const code = char.codePointAt(0);
            return code < 65 || code > 90;
        });
};

/**
 * @summary checks if string is uppercase
 * @param {string} [str]
 * @returns {boolean}
 */
const isUcase = (str = "") => {

    if (!str) {
        return false;
    }

    return Array.prototype.every
        .call(str, char => {
            const code = char.codePointAt(0);
            return /\W/.test(char) || code > 64 && code < 91;
        });
};

/**
 * @summary changes noun (countable) to plural form and prepends amount
 * 
 * @example
 * 1,test -> 1 test
 * 2,test -> 2 tests
 * 21,test -> 21 tests
 * 
 * @param {number} amount
 * @param {string} noun
 * @returns {string}
 */
const pluralizeCountable = (amount, noun) => {

    const normalized = noun.toLowerCase();

    if (amount === 1) {
        return `1 ${normalized}`;
    }

    const irregulars = {
        "child": "children",
        "goose": "geese",
        "tooth": "teeth",
        "foot": "feet",
        "mous": "mice",
        "person": "people"
    };

    const irregularPlural = irregulars[normalized];

    if (irregularPlural) {
        return `${amount} ${irregularPlural}`;
    }

    let manWomanCase = normalized.match(/(\w*)(man|woman)$/);
    if (manWomanCase) {
        return `${amount} ${manWomanCase[1]}${manWomanCase[2].replace("a", "e")}`;
    }

    const staySameExceptions = new Set(["sheep", "series", "species", "deer", "fish"]);
    if (staySameExceptions.has(normalized)) {
        return `${amount} ${normalized}`;
    }

    const wordBase = normalized.slice(0, -2);

    const irregularEndingWithA = new Set(["phenomenon", "datum", "criterion"]);
    if (irregularEndingWithA.has(normalized)) {
        return `${amount} ${wordBase}a`;
    }

    const twoLastLetters = normalized.slice(-2);
    const oneLastLetter = twoLastLetters.slice(-1);

    const irregularEndingWithForFe = new Set(["roofs", "belief", "chef", "chief"]);
    if (irregularEndingWithForFe.has(normalized)) {
        return `${amount} ${normalized}s`;
    }

    if (/(?:f|fe)$/.test(noun)) {
        return `${amount} ${normalized.replace(/(?:f|fe)$/, "ves")}`;
    }

    const twoLettersReplaceMap = {
        "is": "es",
        "us": "i"
    };

    const lastLettersReplace = twoLettersReplaceMap[twoLastLetters];
    if (lastLettersReplace && wordBase.length > 1) {
        return `${amount} ${wordBase}${lastLettersReplace}`;
    }

    const twoLettersAddMap = new Set(["ch", "ss", "sh"]);
    if (twoLettersAddMap.has(twoLastLetters)) {
        return `${amount} ${normalized}es`;
    }

    const oneLastLetterMap = new Set(["s", "x", "z"]);
    if (oneLastLetterMap.has(oneLastLetter)) {
        return `${amount} ${normalized}es`;
    }

    const consonants = new Set([
        "b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n",
        "p", "q", "r", "s", "t", "v", "x", "z", "w", "y"
    ]);

    const isLetterBeforeLastConsonant = consonants.has(normalized.slice(-2, -1));

    if (oneLastLetter === "o" && isLetterBeforeLastConsonant) {
        const lastOexceptions = new Set(["photo", "buro", "piano", "halo"]);

        return `${amount} ${normalized}${lastOexceptions.has(normalized) ? "s" : "es"}`;
    }

    if (oneLastLetter === "y" && isLetterBeforeLastConsonant) {
        return `${amount} ${normalized.slice(0, -1)}ies`;
    }

    return `${amount} ${normalized}s`;
};

const sentensify = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

/**
 * @summary makes word Sentence-case
 * 
 * @param {{
 *  isSentence : (boolean|false),
 *  text : string,
 *  exempt : string[]
 * }}
 * 
 * @returns {string}
 */
const sentenceCase = ({
    text = "",
    isSentence = false,
    exempt = []
} = {}) => {

    if (isSentence) {
        const [first, ...rest] = text.split(/\s+/);
        return [
            exempt.includes(first) ? first : sentensify(first),
            ...rest.map(
                wd => exempt.includes(wd) ? wd : wd.toLowerCase()
            )
        ].join(" ");
    }

    return exempt.includes(text) ? text : sentensify(text);
};

/**
 * @summary splits a string into sentences
 * @param {string} paragraph 
 * @returns {string[]}
 */
const splitIntoSentences = (paragraph) => {

    if (!paragraph) { return []; }

    const splitRegExp = /([.?!]+)\s+/gim;

    return paragraph
        .split(splitRegExp)
        .reduce((acc, cur, i) => {
            i % 2 && (acc[acc.length - 1] += cur) || acc.push(cur);
            return acc;
        }, []);
};


/**
 * @summary trims string and removes non-word chars
 * 
 * @example
 *    "pineapple, apple (!); --juice" => "pineapple apple juice"
 * 
 * @param {string} [input] 
 * @returns {string}
 */
const trimAndRemoveSep = (input = "") => input.trim().replace(/[^\s\w]|_/g, '');

/**
 * @summary makes paragraph sentence case
 * 
 * @param {{
 *  text : string,
 *  exempt : string[]
 * }}
 * 
 * @returns {string}
 */
const parToSentenceCase = ({ text = "", exempt = [] } = {}) => {

    const sentences = splitIntoSentences(text);

    const normalized = sentences.map(
        (sentence) => sentenceCase({
            isSentence: true,
            text: sentence,
            exempt
        })
    );

    return normalized.join(" ");
};

/**
 * @summary joins a list of entities ("a,b, and c")
 * @param {string[]} entities 
 */
const getJoinedEntityList = (entities) => {
    const { length } = entities;

    const addComma = length > 2;

    const [ first ] = entities;

    if(length === 1) {
        return first;
    }

    return `${entities.slice(0, -1).join(", ")}${addComma ? "," : ""} and ${entities.slice(-1)[0]}`;
};

export {
    isLcase,
    isUcase,
    parToSentenceCase,
    pluralizeCountable,
    getJoinedEntityList,
    sentenceCase,
    splitIntoSentences,
    trimAndRemoveSep
};