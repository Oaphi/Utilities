import { deepStrictEqual, strictEqual } from 'assert';
import { binarySearch } from "../problems/arrays/searching.mjs";
import b from '../problems/balanced.js';
import rd from '../problems/roman_kata.js';
const { balancedStringSplit, isBalanced } = b;
const { romanToDecimal } = rd;


describe('binarySearch', function () {

    it('should search an item correctly', function () {

        const arr = [1, 2, 3, 4, 5], el = 3, action = (idx) => idx;

        const res = binarySearch(arr, el, action);

        strictEqual(res, 2);
    });

    it('should correctly process single element', function () {

        const arr = ["some"], el = "some", action = (idx) => idx > -1;

        const res = binarySearch(arr, el, action);

        strictEqual(res, true);
    });

    it('should correctly process empty arrays', function () {
        const arr = [], el = true, action = (idx) => idx;
        const res = binarySearch(arr, el, action);
        strictEqual(res, -1);
    });

});

describe('romanToDecimal()', function () {

    it('it should correctly convert roman primitives', function () {
        strictEqual(romanToDecimal('I'), '1');
        strictEqual(romanToDecimal('V'), '5');
        strictEqual(romanToDecimal('X'), '10');
        strictEqual(romanToDecimal('L'), '50');
        strictEqual(romanToDecimal('C'), '100');
        strictEqual(romanToDecimal('D'), '500');
        strictEqual(romanToDecimal('M'), '1000');
    });

    it('should correctly convert to first decimals (excl. base)', function () {

        const romanMap = [
            'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
            'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV',
            'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
            'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV',
            'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'
        ];
        let dec = 1;

        while (dec < 31) {
            strictEqual(romanToDecimal(romanMap[dec - 1]), dec.toString());
            dec++;
        }
    });

    it('should correctly convert arbitrary roman to decimal', function () {
        strictEqual(romanToDecimal('MDCCXXXII'), '1732');
    });

});


describe('#isBalanced()', function () {

    it('should return false for empty strings', function () {
        const empty = isBalanced('', 45, 54);
        strictEqual(empty, false);
    });

    it('should return true for balanced strings', function () {
        const balanced = ['RL', 'RLRL', 'LRLR', 'RRRLLL'];
        const areBalanced = balanced.every(str => isBalanced(str, 76, 82));
        strictEqual(areBalanced, true);
    });

    it('should return false for unbalanced', function () {
        const unbalanced = ['RLR', 'LRL', 'RRRLL', 'LRRRRRR'];
        const areUnbalanced = unbalanced.every(str => !isBalanced(str, 76, 82));
        strictEqual(areUnbalanced, true);
    });

});

describe('#balancedStringSplit()', function () {

    it('should return correct splits', function () {
        const str = 'RLRRRLLLRLRL';
        const splits = ['RL', 'RRRLLL', 'RL', 'RL'];
        const split = balancedStringSplit(str, 'RL');
        deepStrictEqual(split, splits);
    });

});