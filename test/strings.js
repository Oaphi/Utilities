const { expect } = require("chai");

const { 
    isLcase, 
    isUcase, 
    pluralizeCountable, 
    sentenceCase 
} = require("../src/strings.js");

describe('sentenceCase', function () {

    it('should result in no-op for empty strings', function () {

        const empty = sentenceCase("");
        expect(empty).to.equal("");
    });

    it('should not fail on single char', function () {
        
        const single = sentenceCase("o");
        expect(single).to.equal("O");
    });
    
    it('should uppercase first char and lowercase others', function () {

        const camel = sentenceCase("camelCase");
        const allLow = sentenceCase("lowercase");
        const allUp = sentenceCase("UPPERCASE");

        expect(camel).to.equal("Camelcase");
        expect(allLow).to.equal("Lowercase");
        expect(allUp).to.equal("Uppercase");
    });

});

describe('pluralizeCountable', function () {

    describe('Utility features', function () {
        
        it('should return string of form <count>\s<plural>', function () {

            const testWord = "citizenship";

            const result = pluralizeCountable(20, testWord);

            expect(result).to.match(/\d+ \w+/);
        });

        it('should work for case mismatch', function () {
            
            const testWord = "toolBOX";

            const result = pluralizeCountable(42, testWord);

            expect(result).to.equal(`42 toolboxes`);
        });

    });

    it('should retain single form on 1 amount', function () {

        const testWords = ["cactus", "monorepo", "business"];

        const result = testWords.every(singular => {
            const plural = pluralizeCountable(1, singular);
            return plural === `1 ${singular}`;
        });

        expect(result).to.be.true;
    });

    it('should add -s for normal nouns', function () {

        const normal = ["test", "change", "flight", "train", "board", "tattoo", "vodoo", "gnome"];

        const result = normal.every(singular => {
            const randomAmount = Math.floor(Math.random() * 100) + 2;
            const plural = pluralizeCountable(randomAmount, singular);
            return plural === `${randomAmount} ${singular}s`;
        });

        expect(result).to.be.true;

    });

    describe('Changes ending to -es', function () {
        
        it('should add -es for nouns ending in ‑s, -ss, -sh, -ch, -x, -z and -o + consonant', function () {

            const special = [
                "truss", "bus", "marsh", "lunch", "tax", "blitz",
                "bench", "trench", "xerox", "toolbox", "cruiz",
                "potato", "tomato", "volcano", "mix"
            ];

            const result = special.every(singular => {
                const randomAmount = Math.floor(Math.random() * 100) + 2;
                const plural = pluralizeCountable(randomAmount, singular);
                return plural === `${randomAmount} ${singular}es`;
            });

            expect(result).to.be.true;
        });

        it('should change to -es if noun ends in -is', function () {

            const regulars = ["analysis", "ellipsis", "basis", "axis", "crisis", "osmosis"];

            const result = regulars.every(singular => {
                const randomAmount = Math.floor(Math.random() * 100) + 2;
                const plural = pluralizeCountable(randomAmount, singular);
                return plural === `${randomAmount} ${singular.slice(0, -2)}es`;
            });

            expect(result).to.be.true;
        });

        it('should add -s for exceptions', function () {

            const exceptions = ["photo", "piano", "halo", "buro"];

            const result = exceptions.every(singular => {
                const randomAmount = Math.floor(Math.random() * 100) + 2;
                const plural = pluralizeCountable(randomAmount, singular);
                return plural === `${randomAmount} ${singular}s`;
            });

            expect(result).to.be.true;
        });

    });

    describe('Changes ending with -f | -fe -> -ves', function () {

        it('should change to -ves for nouns ending in ‑f or ‑fe', function () {

            const special = ["leaf", "loaf", "wife", "wolf"];

            const result = special.every(singular => {
                const randomAmount = Math.floor(Math.random() * 100) + 2;
                const plural = pluralizeCountable(randomAmount, singular);
                return plural === `${randomAmount} ${singular.slice(0, singular.lastIndexOf("f"))}ves`;
            });

            expect(result).to.be.true;
        });

        it('should add -s for exceptions', function () {

            const exceptions = ["roofs", "belief", "chef", "chief"];

            const result = exceptions.every(singular => {
                const randomAmount = Math.floor(Math.random() * 100) + 2;
                const plural = pluralizeCountable(randomAmount, singular);
                return plural === `${randomAmount} ${singular}s`;
            });

            expect(result).to.be.true;
        });

    });

    it('should change to -ies if noun ends in ‑y and the letter before the -y is a consonant', function () {

        const yPrecededByConsonant = ["butterfly", "story", "city", "puppy", "corgy", "pony", "diary"];

        const result = yPrecededByConsonant.every(singular => {
            const randomAmount = Math.floor(Math.random() * 100) + 2;
            const plural = pluralizeCountable(randomAmount, singular);
            return plural === `${randomAmount} ${singular.slice(0,-1)}ies`;
        });

        expect(result).to.be.true;
    });

    it('should add -s if noun ends in -y and the letter before the -y is a vowel', function () {

        const yPrecededByVowel = ["toy", "boy", "ray", "tray", "ploy"];

        const result = yPrecededByVowel.every(singular => {
            const randomAmount = Math.floor(Math.random() * 100) + 2;
            const plural = pluralizeCountable(randomAmount, singular);
            return plural === `${randomAmount} ${singular}s`;
        });

        expect(result).to.be.true;
    });

    it('should change to -i if the noun ends in ‑us', function () {

        const regulars = ["consensus", "oculus", "cactus", "focus"];

        const result = regulars.every(singular => {
            const randomAmount = Math.floor(Math.random() * 100) + 2;
            const plural = pluralizeCountable(randomAmount, singular);
            return plural === `${randomAmount} ${singular.slice(0, -2)}i`;
        });

        expect(result).to.be.true;
    });

    describe('exceptions', function () {

        it('should return special form for irregulars', function () {
    
            const irregular = {
                "child" : "children",
                "goose" : "geese",
                "man" : "men",
                "woman" : "women",
                "tooth" : "teeth",
                "foot" : "feet",
                "mous" : "mice",
                "person" : "people",
                "postman" : "postmen",
                "fireman" : "firemen"
            };

            const result = Object.entries(irregular).every(entry => {
                const [singular, plural] = entry;
                const randomAmount = Math.floor(Math.random() * 100) + 2;
                const pluralized = pluralizeCountable(randomAmount, singular);
                return pluralized === `${randomAmount} ${plural}`;
            });

            expect(result).to.be.true;
        });

        it('should add nothing for singular exceptions that require it', function () {

            const exceptions = ["sheep", "series", "species", "deer", "fish"];

            const result = exceptions.every(singular => {
                const randomAmount = Math.floor(Math.random() * 100) + 2;
                const plural = pluralizeCountable(randomAmount, singular);
                return plural === `${randomAmount} ${singular}`;
            });

            expect(result).to.be.true;
        });

        it('should add -a for irregular exceptions that require it', function () {

            const exceptions = ["phenomenon", "datum", "criterion"];

            const amounts = [];

            const result = exceptions.map(singular => {
                const randomAmount = Math.floor(Math.random() * 100) + 2;
                amounts.push(randomAmount);
                const plural = pluralizeCountable(randomAmount, singular);
                return plural;
            });

            expect(result).to.be.deep.equal([
                `${amounts[0]} phenomena`,
                `${amounts[1]} data`,
                `${amounts[2]} criteria`
            ]);
        });

    });

});

describe('isLcase', function () {

    it('should be false if empty string', function () {
        const check = isLcase("");
        expect(check).to.be.false;
    });

    it('should be false if at least one uppercase char', function () {
        const check = isLcase("desolate Places");
        expect(check).to.be.false;
    });

    it('should be true if all lowercase', function () {
        const check = isLcase("this is truly low");
        expect(check).to.be.true;
    });

});

describe('isUcase', function () {

    it('should be false if empty string', function () {
        const check = isUcase("");
        expect(check).to.be.false;
    });

    it('should be false if at least one lowercase char', function () {
        const check = isUcase("desolate Places");
        expect(check).to.be.false;
    });

    it('should be true if all uppercase', function () {
        const check = isUcase("DO NOT SHOUT AT ME");
        expect(check).to.be.true;
    });

});