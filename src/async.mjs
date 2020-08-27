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

/**
 * @typedef {{
 *  interval : number,
 *  callback : function : Promise,
 *  times : number
 * }} IntervalConfig
 * 
 * @param {IntervalConfig}
 */
const withInterval = ({
    interval = 4,
    callback,
    times = 1
}) => {
    if (!times) {
        return Promise.resolve();
    }

    return new Promise(async (res, rej) => {

        await callback();

        console.log(new Date().toLocaleString());

        const timesLeft = times - 1;

        setTimeout(() => {

            withInterval({
                interval,
                callback,
                times: timesLeft
            })
            .then(res)
            .catch(rej);

        }, interval);

    });
};

export {
    forAwait,
    forEachAwait,
    waitAsync,
    withInterval
};