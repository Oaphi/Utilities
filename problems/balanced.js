/**
 * Checks if string is a balanced string
 * @param {String} input 
 * @param {Number} openingCode
 * @param {Number} closingCode
 * @returns {Boolean}
 */
const isBalanced = (input, openingCode, closingCode) => {
    const { length } = input;

    if (!length) {
        return false;
    }

    const numLR = length / 2;

    const shouldBe = numLR * (openingCode + closingCode);

    return !(numLR % 1) && shouldBe === Array.prototype.reduce
        .call(input, (a, c, i) => a + input.charCodeAt(i), 0);
};

/**
 * Splits a string into balanced strings
 * @param {String} input string to check
 * @param {String} match pair of balancers
 * @param {Array} [splits] accumulator
 * @returns {String[]}
 */
const balancedStringSplit = (input, match, splits = []) => {
    let end = 2;

    const { length } = input;

    const opChar = match.charCodeAt(0);
    const clChar = match.charCodeAt(1);

    let compared = input.slice(0, end);

    let balanced = isBalanced(compared, opChar, clChar);

    while (!balanced && end < length) {
        compared = input.slice(0, ++end);
        balanced = isBalanced(compared, opChar, clChar);
    }

    return balanced && length ?
        balancedStringSplit(input.slice(end), match, splits.concat([compared])) :
        splits;
};

module.exports = {
    isBalanced,
    balancedStringSplit
};