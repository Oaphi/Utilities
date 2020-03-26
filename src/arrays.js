/**
 * Combines filter() and map() in O(n)
 * @param {*[]} array
 * @returns {function(function):function(function):*[]}
 */
const filterMap = (array) => (filter = e => true) => (mapper = e => e) => {
    const mappedArr = [];

    for (const elem of array) {
        filter(elem) && mappedArr.push(mapper(elem));
    }

    return mappedArr;
};

/**
 * Executes a callback for each element
 * (same as forEach, but in FP style + faster)
 * @param {*[]} array
 * @returns {function(function):void} 
 */
const forAll = (array) => (callback) => {

    let index = 0;

    for (const elem of array) {
        callback(elem, index++);
    }

    return;
};

module.exports = {
    filterMap,
    forAll
};