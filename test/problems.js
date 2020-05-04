const assert = require('assert');

const {
    romanToDecimal
} = require('../problems/roman_kata.js');

describe('romanToDecimal()', function () {

    it('it should correctly convert roman primitives', function () {
        assert.strictEqual(romanToDecimal('I'), '1');
        assert.strictEqual(romanToDecimal('V'), '5');
        assert.strictEqual(romanToDecimal('X'), '10');
        assert.strictEqual(romanToDecimal('L'), '50');
        assert.strictEqual(romanToDecimal('C'), '100');
        assert.strictEqual(romanToDecimal('D'), '500');
        assert.strictEqual(romanToDecimal('M'), '1000');
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
            assert.strictEqual(romanToDecimal(romanMap[dec - 1]), dec.toString());
            dec++;
        }
    });

    it('should correctly convert arbitrary roman to decimal', function () {
        assert.strictEqual(romanToDecimal('MDCCXXXII'), '1732');
    });

});

const { balancedStringSplit, isBalanced } = require('../problems/balanced.js');

describe('#isBalanced()', function () {

    it('should return false for empty strings', function () {
        const empty = isBalanced('', 45, 54);
        assert.strictEqual(empty, false);
    });

    it('should return true for balanced strings', function () {
        const balanced = ['RL', 'RLRL', 'LRLR', 'RRRLLL'];
        const areBalanced = balanced.every(str => isBalanced(str, 76, 82));
        assert.strictEqual(areBalanced, true);
    });

    it('should return false for unbalanced', function () {
        const unbalanced = ['RLR', 'LRL', 'RRRLL', 'LRRRRRR'];
        const areUnbalanced = unbalanced.every(str => !isBalanced(str, 76, 82));
        assert.strictEqual(areUnbalanced, true);
    });

});

describe('#balancedStringSplit()', function () {

    it('should return correct splits', function () {
        const str = 'RLRRRLLLRLRL';
        const splits = ['RL', 'RRRLLL', 'RL', 'RL'];
        const split = balancedStringSplit(str, 'RL');
        assert.deepStrictEqual(split, splits);
    });

});