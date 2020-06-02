(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Strings = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

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

        if (manWomanCase = normalized.match(/(\w*)(man|woman)$/)) {
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
            return `${amount} ${ normalized.replace(/(?:f|fe)$/,"ves")}`;
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

    /**
     * @summary makes word Sentence-case
     * @param {string} word 
     * @returns {string}
     */
    const sentenceCase = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

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

    return {
        isLcase,
        isUcase,
        pluralizeCountable,
        sentenceCase,
        trimAndRemoveSep
    };

}));