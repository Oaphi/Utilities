/**
 * @fileoverview Array utilities
 * @author Oleg Valter
 * @module
 */

/**
 * Combines filter() and map() in O(n)
 * @param {any[]} [array]
 * @returns {function(function):function(function):any[]}
 */
const filterMap = (array = []) => (filter = e => true) => (mapper = e => e) => {
    const mappedArr = [];

    let initialIndex = 0, filteredIndex = 0;

    for (const elem of array) {
        filter(elem, initialIndex++) &&
            mappedArr.push(mapper(elem, filteredIndex++));
    }

    return mappedArr;
};

/**
 * Combines filter() and map() in reverse in O(n)
 * @param {any[]} [array] 
 * @returns {function(function):function(function):any[]}
 */
const filterMapped = (array = []) => (mapper = e => e) => (filter = e => true) => {
    const filteredArr = [];

    let initialIndex = 0, filteredIndex = 0;

    for (const elem of array) {
        const mappedElem = mapper(elem, initialIndex++);

        filter(mappedElem, filteredIndex++) &&
            filteredArr.push(mappedElem);
    }

    return filteredArr;
};

/**
 * Executes a callback for each element
 * (same as forEach, but in FP style + faster)
 * @param {any[]} [array]
 * @returns {function(function):void} 
 */
const forAll = (array = []) => (callback) => {

    let index = 0;

    for (const elem of array) {
        callback(elem, index++);
    }

    return;
};

/**
 * Maps array to values of 
 * property by key
 * @param {any[]} [array] 
 * @returns {function(string):any[]}
 */
const keyMap = (array = []) => (key) => {
    return !key ? array : array.map(elem => elem[key]);
};

module.exports = {
    filterMap,
    filterMapped,
    forAll,
    keyMap
};