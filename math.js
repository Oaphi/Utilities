/**
 * Mathematical utilities
 * @module
 */

/**
 * @typedef {Function} OperationApplier
 * @param {...Number} args
 * @returns {Number}
 */

/**
 * Abstract binary (here: operator(A,B)) operation
 * @param {Function} operation 
 * @returns {OperationApplier}
 */
const binaryOp = (operation) => (...args) => args.length ? args.reduce((total, arg) => operation(total, arg)) : 0;

/**
 * Divides all arguments
 * @param  {...Number} args
 * @returns {Number}
 */
const divide = (...args) => binaryOp((a, b) => {
    if(b === 0) {
        throw new RangeError('Cannot divide by 0');
    }
    return a / b;
})(...args);

/**
 * Multiplies all arguments
 * @param  {...Number} args
 * @return {Number}
 */
const multiply = (...args) => binaryOp((a, b) => a * b)(...args);

/**
 * Substracts all arguments
 * @param  {...Number} args 
 * @returns {Number}
 */
const substract = (...args) => binaryOp((a, b) => a - b)(...args);

/**
 * Sums all arguments
 * @param  {...Number} args
 * @returns {Number}
 */
const sum = (...args) => binaryOp((a, b) => a + b)(...args);

/**
 * Complex utilities (based on base ops)
 */

/**
 * Simple average of all arguments
 * @param  {...Number} args
 * @returns {Number}
 */
const average = (...args) => sum(...args) / (args.length || 1);

/**
 * Abstraction for M / (A + ... + Z)
 * @param {Number} divisor 
 * @returns {Function}
 */
const divSum = (divisor) => (...args) => divide(sum(...args), divisor);

/**
 * Abstraction for M * (A + ... + Z)
 * @param {Number} multiplier 
 * @returns {Function}
 */
const multSum = (multiplier) => (...args) => multiply(sum(...args), multiplier);

module.exports = {
    average,
    divide,
    divSum,
    multiply,
    multSum,
    substract,
    sum
};