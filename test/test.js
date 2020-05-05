const assert = require('assert');

const { expect } = require('chai');

const {
    keysByValue,
    getEntries, compare, getOtherElems,
    relativeGrowth, asyncMap,
    toDecimal, filterAndReorder,
    uniqueOccurrences, numCombinations,
    offsetK, subsplit
} = require('../src/utilities.js');

// const pl = require('../problems/palindrome.js');

/** @global {Object} */
const OBJECT = {
    "null": null,
    "undefined": undefined,
    "true": true,
    "false": false,
    "string": '',
    "string1": 'Howdy!',
    "string2": 'Chiao bella!',
    "integer": 1234,
    "double": 1230.5678,
    "empty object": {},
    "empty array": [],
    "date": new Date(Date.now()),
    "function": () => console.log('I am a function!'),
    "error": new Error('It\'s a trap!'),
    "error1": new Error('Resistance is futile'),
    "syntaxERR": new SyntaxError('Not compilable'),
    "regexp1": /\d+/g,
    "regexp2": /\w+/i
};
OBJECT.deepObj = Object.assign({}, OBJECT);
OBJECT.deepArr = getEntries(OBJECT);

const latinUP = new Array(25).fill(65).map((base, i) => String.fromCharCode(base + i));

/**
 * Counts ms execution time
 * @param {Function} measure 
 * @param  {...*} args
 * @returns {Promise}
 */
const timer = (measure, ...args) => new Promise((resolve) => {
    const start = Date.now();
    new Promise((res) => {
        res(measure(...args));
    }).then(() => {
        resolve(Date.now() - start);
    });
});

const empty = [];

describe('compare()', function () {
    it('should return true on equal objects', function () {
        console.time('compare() on equal');
        const equals = getEntries(OBJECT).every(entry => compare(entry, entry));
        assert.deepStrictEqual(equals, true);
        console.timeEnd('compare() on equal');
    });

    it('should return false on diff objects', function () {
        console.time('compare() on diff');
        const entries = getEntries(OBJECT);
        const diffs = entries
            .every((entry, k) => compare(entry, getOtherElems(k)(entries)));
        assert.deepStrictEqual(diffs, false);
        console.timeEnd('compare() on diff');
    });

});

describe('keysByValue()', function () {
    const empty = {};

    it('should correctly extract keys', function () {

        Object.keys(OBJECT)
            .filter(key => typeof OBJECT[key] !== 'object')
            .forEach(key => {
                const extracted = keysByValue(OBJECT)(OBJECT[key]);
                assert.deepStrictEqual(extracted, [key]);
            });

    });

});

describe('relativeGrowth()', function () {
    const relative = [1, 2, 3, 4, 5, 6, 7, 8];
    const desired = [1, 3, 6, 10, 15, 21, 28, 36];

    it('should not map empty array', function () {
        const grown = relativeGrowth(empty);
        assert.deepStrictEqual(grown, empty);
    });

    it('should map elements correctly', function () {
        const grown = relativeGrowth(relative);
        assert.deepStrictEqual(grown, desired);
    });

});

describe('asyncMap()', function () {
    this.slow(9999);

    const toMap = [1, 2, 3, 4, 5];
    const square = (elem) => elem ** 2;

    const squareAfter1S = async (elem) => new Promise((r, j) => setTimeout(() => r(square(elem)), 1000));

    it('should map and resolve correctly', async function () {
        const mapped = await asyncMap(toMap)(squareAfter1S);
        assert.deepStrictEqual(mapped, [1, 4, 9, 16, 25]);
    });

});

describe('toDecimal()', function () {
    const bitsEmpty = [];
    const bits5 = [1, 0, 1];
    const bits18880 = [1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0];

    it('should return 0 on empty array', function () {
        assert.strictEqual(toDecimal(bitsEmpty), 0);
    });

    it('should convert Array of bits to decimal number', function () {
        assert.strictEqual(toDecimal(bits5), 5);
        assert.strictEqual(toDecimal(bits18880), 18880);
    });

});

describe('filterAndReorder()', function () {
    const order = [3, 0, 2];

    const arr = [
        ['one', 'two', 'three', 'four', 'five'],
        ['one', 'two', 'three', 'four', 'five'],
        ['one', 'two', 'three', 'four', 'five']
    ];

    it('should reorder and filter Array ', function () {
        const out = filterAndReorder(arr, order);

        const expected = [
            ['four', 'one', 'three'],
            ['four', 'one', 'three'],
            ['four', 'one', 'three']
        ];

        assert.deepStrictEqual(out, expected);
    });

});

describe('subsplit()', function () {

    it('should return empty array on 0 split', function () {
        const splitted = ['uno', 'duo'];
        const zeroSplit = subsplit(0)(splitted);
        expect(zeroSplit).to.be.deep.equal([]);
    });

    it('should split empty array in correct subsplits', function () {
        const emptySplit = subsplit(3)([]);
        expect(emptySplit).to.be.deep.equal([[], [], []]);
    });

    it('should correctly split array', function () {
        const toSplit = [1, 2, 3, 4, 5, 6];
        const split = subsplit(3)(toSplit);
        expect(split).to.be.deep.equal([[1, 2], [3, 4], [5, 6]]);
    });

});

describe('uniqueOccurrences()', function () {

    it('should return true on empty', function () {
        const isUnique = uniqueOccurrences(empty);
        assert.strictEqual(isUnique, true);
    });

    it('should correctly determine uniqueness', function () {
        const isUniqueNum = uniqueOccurrences([1, 5, 29, 2, 1]);
        const isUniqueStr = uniqueOccurrences(['a', 'b', 'a', 'b', 'c', 'b']);
        assert.strictEqual(isUniqueNum, false);
        assert.strictEqual(isUniqueStr, true);
    });

});

describe('number of permutations', function () {

    it('should return 0 on empty set', function () {
        const emptySet = numCombinations([], 5);
        assert.strictEqual(emptySet, 0);
    });

    it('should return 0 on 0 repeats', function () {
        const noReps = numCombinations([1, 2, 3, 4], 0);
        assert.strictEqual(noReps, 0);
    });

    it('should return correct number of permutations', function () {
        const sanity = numCombinations([0, 1], 1);
        assert.strictEqual(sanity, 2);

        const normal = numCombinations([5, 7, 3, 5], 4);
        assert.strictEqual(normal, 256);

    });

});

describe('offsetK', function () {

    describe('offsetK should correctly determine offset', function () {
        const n0b4 = offsetK(4);
        const n0b32 = offsetK(32);
        const n0b64 = offsetK(64);

        const n0b32exp = offsetK(24);
        const n0b64exp = offsetK(53);

        assert.deepStrictEqual(
            [n0b4, n0b32, n0b64, n0b32exp, n0b64exp],
            [7, 2147483647, 9223372036854775807n, 8388607, 4503599627370495]
        );
    });

    describe('should correctly offset 32-bit', function () {

        it.skip('should correctly offset 0', function () {
            const n0b32 = offsetK(0, 32);
            assert.strictEqual(n0b32, 0);
        });

        it.skip('should correctly offset 1', function () {
            const n1b32 = offsetK(1, 32);
            assert.strictEqual(n1b32, 1023);
        });

        it.skip('should correctly offset arbitrary num', function () {
            let i = 0;
            while (i < 10000) {
                const rand = Math.random() * 10000;
                assert.strictEqual(rand, rand ** 31 - 1);
                i++;
            }

        });

    });

    describe('should correctly offset 64-bit', function () {

    });

});

describe.skip('palindrome problems', function () {

    describe('isPalindrome()', function () {

        it('should be true for empty str', function () {
            const isEmptyStrPalindrome = pl.isPalindrome('');
            assert.strictEqual(isEmptyStrPalindrome, true);
        });

        it('should be true for 1 char', function () {
            const is1CharPalindrome = latinUP.every(char => pl.isPalindrome(char));
            assert.strictEqual(is1CharPalindrome, true);
        });

        it('should be true for a palindrome', function () {
            const isArbPalindrome = pl.isPalindrome('abba');
            assert.strictEqual(isArbPalindrome, true);
        });

        it('should be false for non-palindrome', function () {
            const notPalindrome = pl.isPalindrome('basement');
            assert.strictEqual(notPalindrome, false);
        });

    });

});

