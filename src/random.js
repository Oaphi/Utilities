/**
 * Generates pseudo-random int[]
 * @param {number} len 
 * @param {number} [seed]
 * @returns {number[]} 
 */
const randomArray = (len, seed = 1) => {
    const output = [];

    let i = 0;

    while (i < len) {
        const val = Math.floor(Math.random() * seed);
        output[i] = val;
        i++;
    }

    return output;
};

module.exports = {
    randomArray
};