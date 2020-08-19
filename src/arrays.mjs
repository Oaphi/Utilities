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
 * @typedef {object} StepReduceConfig
 * @property {any[]} source
 * @property {function(any,any,number?,any[]?) : any} callback
 * @property {number} [step]
 * @property {any} [initial]
 * 
 * @param {StepReduceConfig}
 */
const reduceWithStep = ({
    source = [],
    callback,
    step = 1,
    initial
}) => {
    return source
        .reduce((acc, curr, i) => {
            return i % step ?
                acc :
                callback(acc, curr, i + step - 1, source);
        }, initial || source[0]);
};

/**
 * @typedef {object} ShrinkConfig
 * @property {any[][]} [source]
 * @property {{ 
 *  top : number, 
 *  right : number, 
 *  bottom : number, 
 *  left : number 
 * }} [leave]
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
    vertically = 0,
    source,
    top = 0,
    right = 0,
    left = 0,
    leave = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    horizontally = 0,
    bottom = 0,
    all = 0
} = {}) => {

    if (!source || !source.length) {
        return [[]];
    }

    const {
        top: leaveTop = 0,
        right: leaveRight = 0,
        bottom: leaveBottom = 0,
        left: leaveLeft = 0
    } = leave;

    if (horizontally) {
        left = right = Math.floor(horizontally / 2);
    }

    if (vertically) {
        top = bottom = Math.floor(vertically / 2);
    }

    const { length } = source;

    const topShift = length - (leaveBottom || length);
    const bottomShift = length - (leaveTop || length);

    return source
        .slice((all || top || topShift), (all || length) - (bottom || bottomShift))
        .map(row => {
            const { length } = row;

            const leftShift = length - (leaveRight || length);
            const rightShift = length - (leaveLeft || length);

            return row.slice((all || left || leftShift), (all || length) - (right || rightShift));
        });
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

/**
 * @summary creates an object counter
 * @param {{
 *  onKey : string,
 *  source : object[]
 * }}
 */
const countObjects = ({ source = [], onKey } = {}) => {

    const validObjects = source.filter(Boolean);

    const { length } = validObjects;
    if (!length) {
        return {};
    }

    const validProp = onKey || Object.keys(validObjects[0])[0];

    const counter = {};

    validObjects.forEach(obj => {
        if (validProp in obj) {
            const val = obj[validProp];

            const inCount = counter[val] || 0;

            counter[val] = inCount + 1;
        }
    });

    return counter;
};

/**
 * @typedef {{
 *  keys : string[]
 * }} DedupeIgnore
 * 
 * @typedef {{
 *  ignore : DedupeIgnore,
 *  source : object[],
 *  type : ("entries"|"keys"|"values")
 * }} DedupeConfig
 * 
 * @summary deduplicates an array of objects
 * @param {DedupeConfig}
 * @returns {object[]}
 */
const deduplicate = ({
    ignore = {},
    source = [],
    type = "entries"
} = {}) => {

    const toDedupe = source.map(obj => obj).reverse();

    const { length } = toDedupe;

    const { keys = [] } = ignore;

    return source.filter((srcObj, srcIdx) => {

        const srcEntries = Object.entries(srcObj).filter(([k]) => !keys.includes(k));

        const lastIdx = toDedupe.findIndex((tgtObj) => {

            const tgtEntries = Object.entries(tgtObj).filter(([k]) => !keys.includes(k));

            if (tgtEntries.length !== srcEntries.length) { return false; }

            const sameOnEntries = type === "entries" &&
                tgtEntries.every(([key, val]) => srcObj[key] === val);

            const sameOnValues = type === "values" &&
                tgtEntries.map(([,v]) => v).every((tgtVal) => Object.values(srcObj).includes(tgtVal));

            const sameOnKeys = type === "keys" &&
                tgtEntries.map(([k]) => k).every((tgtKey) => Object.keys(srcObj).includes(tgtKey));

            return sameOnEntries || sameOnValues || sameOnKeys;
        });

        return srcIdx === (length - lastIdx - 1);
    });
};

export default {
    chunkify,
    countObjects,
    deduplicate,
    filterMap,
    filterMapped,
    forAll,
    keyMap,
    last,
    mergeOnto,
    reduceWithStep,
    shrinkGrid,
    spliceInto,
    splitIntoConseq
};