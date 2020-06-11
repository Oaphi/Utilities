/**
 * @fileoverview Math utilities
 * @author Oleg Valter
 * @module
 */

/**
 * @typedef {function} OperationApplier
 * @param {...number} args
 * @returns {number}
 */

/**
 * Abstract binary (here: operator(A,B)) operation
 * @param {function} operation 
 * @returns {OperationApplier}
 */
const binaryOp = (operation) => (...args) => args.length ? args.reduce((total, arg) => operation(total, arg)) : 0;

/**
 * Divides all arguments
 * @param  {...number} args
 * @returns {number}
 */
const divide = (...args) => binaryOp((a, b) => {
    if (b === 0) {
        throw new RangeError('Cannot divide by 0');
    }
    return a / b;
})(...args);

/**
 * Multiplies all arguments
 * @param  {...number} args
 * @return {number}
 */
const multiply = (...args) => binaryOp((a, b) => a * b)(...args);

/**
 * Substracts all arguments
 * @param  {...number} args 
 * @returns {number}
 */
const substract = (...args) => binaryOp((a, b) => a - b)(...args);

/**
 * Sums all arguments
 * @param  {...number} args
 * @returns {number}
 */
const sum = (...args) => binaryOp((a, b) => a + b)(...args);

/**
 * Complex utilities (based on base ops)
 */

/**
 * Simple average of all arguments
 * @param  {...number} args
 * @returns {number}
 */
const average = (...args) => sum(...args) / (args.length || 1);

/**
 * Abstraction for M / (A + ... + Z)
 * @param {number} divisor 
 * @returns {function}
 */
const divSum = (divisor) => (...args) => divide(sum(...args), divisor);

/**
 * Abstraction for M * (A + ... + Z)
 * @param {number} multiplier 
 * @returns {function}
 */
const multSum = (multiplier) => (...args) => multiply(sum(...args), multiplier);


/**
 * @summary Finds greatest common divisor
 * @param  {...number} args
 * @returns {number}
 */
const GCD = (...args) => {
    const { length } = args;

    if (!length) {
        throw new RangeError(`Can't compute GCD of no args`);
    }

    if (length === 1) {
        return args[0];
    }

    const gcd = (a, b) => !a ? b : gcd(b % a, a);

    return args.reduce((out, arg) => gcd(out, arg), 0);
};

/**
 * @summary Finds least common multiplier
 * @param  {...number} args
 * @returns {number}
 */
const LCM = (...args) => {
    const { length } = args;

    if (!args.length) {
        throw new RangeError(`Can't compute LCM of no args`);
    }

    if (length === 1) {
        return args[0];
    }

    return args.reduce((out, arg) => arg * out / GCD(arg, out));
};

/**
 * @summary returns first N fibonacci numbers
 * @param {number} [n]
 * @returns {number[]}
 */
function fibonacci(n = 0) {

    const sequencer = (times, acc = [0]) => {
        if (times === 1) {
            return acc;
        }
        const { length } = acc;
        acc.push(acc[length - 1] + acc[length - 2] || 1);
        return sequencer(times - 1, acc);
    };

    return n < 1 ? [] : sequencer(n);
}


module.exports = {
    average,
    divide,
    divSum,
    fibonacci,
    GCD,
    HCF: GCD,
    LCM,
    multiply,
    multSum,
    substract,
    sum
};