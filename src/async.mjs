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
 *  interval ?: number,
 *  callback  : function () : Promise,
 *  delay    ?: number,
 *  stopIf   ?: boolean,
 *  times    ?: number
 * }} IntervalConfig
 *
 * @param {IntervalConfig}
 */
const withInterval = async ({
    timeouts = [],
    delay = 0,
    interval = 4,
    callback,
    times = 1,
    stopIf = () => false
}) => {
    if (!times) {
        return;
    }

    if (delay) {
        await new Promise((res) => setTimeout(res, delay));
    }

    if (typeof callback !== "function") { return; }

    const result = await callback();

    if (stopIf(result)) {
        return result;
    }

    return new Promise((res, rej) => {

        const timesLeft = times - 1;

        const newId = setTimeout(
            () => withInterval({
                timeouts,
                delay,
                interval,
                callback,
                times: timesLeft,
                stopIf
            }).then((output) => {
                timeouts.splice(timeouts.indexOf(newId), 1);
                res(output);
            }).catch(rej),
            interval);

        timeouts.push(newId);
    });
};

/**
 * @summary debounces a function
 * @param {(...args) => any} callback
 * @param {{ period ?: number, immediate ?: boolean }} [opts]
 */
const debounce = (callback, { period = 50, immediate = false } = {}) => {
    let timeout = null;

    return (...params) => {

        if (timeout === null && immediate) {
            callback(...params);
        }

        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }

        timeout = setTimeout(() => {
            immediate || callback(...params);
            timeout = null;
        }, period);
    };
};

export {
    forAwait,
    forEachAwait,
    waitAsync,
    withInterval
};
export {
    debounce
};

