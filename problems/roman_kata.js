/**
 * Converts roman numeric notation
 * into a decimal notation
 * @param {String} roman
 * @return {String}
 */
const romanToDecimal = (roman) => {
    const norm = roman.toUpperCase();

    const map = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    };

    let decimal = Array.prototype.reduce.call(norm, (acc, char, pos) => {
        const prevChar = norm[pos - 1];

        return acc + (
            prevChar === 'I' && char !== 'I' ?
                map[char] - 2 :
                map[char]
        );
    }, 0);

    return decimal.toString();
};

module.exports = {
    romanToDecimal
};