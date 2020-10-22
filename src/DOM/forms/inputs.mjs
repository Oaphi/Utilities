/**
 * @summary extracts values from select
 * @param {HTMLSelectElement} sel
 * @returns {string[]}
 */
const getSelectVals = ({ options }) => Array.from(options).map(({ value }) => value);

export {
    getSelectVals
};