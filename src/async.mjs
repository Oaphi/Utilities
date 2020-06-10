import utilities from "./utilities.js";
const { noop } = utilities;

/**
 * @typedef {object} WaitConfig
 * @property {number} [ms = 1]
 * @property {function(number) : any} [callback]
 * 
 * @summary runs a callback after specified number of milliseconds and resolves
 * @param {WaitConfig} param0 
 * @returns {Promise<any>}
 */
const waitAsync = ({ ms = 1, callback = noop }) =>

    new Promise((resolve) => {
        const now = Date.now();

        setTimeout(() => {
            const newNow = Date.now();
            resolve(callback(newNow - now));
        }, ms);
    });

/**
 * @summary promise-based forEach preserving value and execution order
 * @param {any[]} source 
 * @param {function(any,number, any[]) : Promise<void>} asyncCallback
 * @returns {Promise<void>}
 */
const forAwait = async (source, asyncCallback) => {
    let i = 0;
    for (const val of source) {
        await asyncCallback(val, i++, source);
    }
};

/**
 * @summary promise-based forEach preserving value order
 * @param {Promise<any>[]} array
 * @param {function(any,number, Promise<any>[]) : void} callback
 * @returns {void}
 */
const forEachAwait = async (source, callback) => {
    const results = await Promise.all(source);
    return results.forEach((val, idx) => callback(val, idx, source));
};

export {
    forAwait,
    forEachAwait,
    waitAsync
};