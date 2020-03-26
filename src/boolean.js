/**
 * ANDs lists of boolean values
 * @param  {...boolean} [args]
 * @returns {boolean}
 */
const AND = (...args) => !args.length ? false : args.reduce((ok, arg) => ok && arg);

/**
 * ORs lists of boolean values
 * @param  {...boolean} [args]
 * @returns {boolean}
 */
const OR = (...args) => args.reduce((ok, arg) => ok || arg, false);

/**
 * XORs lists of boolean values
 * @param  {...boolean} [args]
 * @returns {boolean}
 */
const XOR = (...args) => args.reduce((ok, arg, idx, arr) => arg === arr[idx - 1] ? false : ok, true);

module.exports = {
    AND,
    OR,
    XOR
};