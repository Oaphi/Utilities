/**
 * @fileoverview Array utilities
 * @author Oleg Valter
 * @module
 */

/**
 * @typedef {object} ChunkifyConfig
 * @property {number} [size]
 * @property {number[]} [limits]
 * 
 * @summary splits an array into chunks
 * @param {any[]} source 
 * @param {ChunkifyConfig}
 * @returns {any[][]}
 */
const chunkify = (source, { limits = [], size } = {}) => {

    const output = [];

    if (size) {
        const { length } = source;

        const maxNumChunks = Math.ceil((length || 1) / size);
        let numChunksLeft = maxNumChunks;

        while (numChunksLeft) {
            const chunksProcessed = maxNumChunks - numChunksLeft;
            const elemsProcessed = chunksProcessed * size;
            output.push(source.slice(elemsProcessed, elemsProcessed + size));
            numChunksLeft--;
        }

        return output;
    }

    const { length } = limits;

    if (!length) {
        return [Object.assign([], source)];
    }

    let lastSlicedElem = 0;

    limits.forEach((limit, i) => {
        const limitPosition = lastSlicedElem + limit;
        output[i] = source.slice(lastSlicedElem, limitPosition);
        lastSlicedElem = limitPosition;
    });

    const lastChunk = source.slice(lastSlicedElem);
    lastChunk.length && output.push(lastChunk);

    return output;
};

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
 * @summary returns last element of array
 * @param {any[]} array
 * @returns {any} 
 */
const last = (array) => array[array.length - 1];

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

/**
 * @summary merges arrays
 * @param {any[]} source 
 * @param  {...any[]} [targets]
 * @returns {any[]}
 */
const mergeOnto = (source, ...targets) => {

    const output = [];

    for (let index = 0; index < source.length; index++) {
        const item = source[index];

        if (typeof item === "undefined") {

            let finalValue = item;

            for (const target of targets) {
                finalValue = target[index];
            }

            output.push(finalValue);
            continue;
        }

        output.push(item);
    }

    return output;
};

/**
 * @typedef {object} ShrinkConfig
 * @property {any[][]} [source]
 * @property {number} [left]
 * @property {number} [right]
 * @property {number} [bottom]
 * @property {number} [horizontally]
 * @property {number} [top]
 * @property {number} [vertically]
 * 
 * @summary shirnks a grid
 * @param {ShrinkConfig} [source]
 */
const shrinkGrid = ({
    source,
    horizontally = 0,
    vertically = 0,
    top = 0,
    right = 0,
    bottom = 0,
    left = 0
} = {}) => {

    if (!source || !source.length) {
        return [[]];
    }

    if(horizontally) {
        left = right = Math.floor(horizontally / 2);
    }

    if(vertically) {
        top = bottom = Math.floor(vertically / 2);
    }

    let temp = [];

    temp = source.slice(top);
    temp = bottom ? temp.slice(0, -bottom) : temp;

    return temp
        .map(row => right ? row.slice(0, -right) : row)
        .map(row => row.slice(left));
};

/**
 * 
 * @param {any[]} source 
 * @param {...any[]} targets
 * @returns {any[]}
 */
const spliceInto = (source, ...targets) => {

    const output = source.map(item => item); //shallow copy;

    for (const target of targets) {
        target.forEach((item, index) => {
            if (typeof item !== "undefined") {
                output.splice(index, 0, item);
            }
        });
    }

    return output;
};

/**
 * @summary splits array in consequitive subsequences
 * @param {any[]} [source] 
 * @returns {any[][]}
 */
const splitIntoConseq = (source = []) => {

    const sequences = [], tails = [];

    let highestElem = -Infinity;

    source.forEach(element => {

        const precedeIndex = tails.indexOf(element + 1);
        const tailIndex = tails.indexOf(element - 1);

        if (tailIndex > -1) {
            sequences[tailIndex].push(element);
            tails[tailIndex] = element;
            return;
        }

        if (precedeIndex > -1) {
            sequences[precedeIndex].unshift(element);
            tails[precedeIndex] = element;
            return;
        }

        if (element > highestElem) {
            tails.push(element);
            sequences.push([element]);
            highestElem = element;
            return;
        }

        const spliceIndex = tails.findIndex((e) => e < element) + 1;
        tails.splice(spliceIndex, 0, element);
        sequences.splice(spliceIndex, 0, [element]);
    });

    return sequences;
};

export {
    chunkify,
    filterMap,
    filterMapped,
    forAll,
    keyMap,
    last,
    mergeOnto,
    shrinkGrid,
    spliceInto,
    splitIntoConseq
};