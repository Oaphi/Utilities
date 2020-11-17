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
 * @summary partitions an array
 * @param {{ source: any[], parts?: number }}
 * @returns {any[]}
 */
const partify = ({ source, parts = 2 }) => {
    const size = Math.ceil(source.length / parts) || 1;

    const output = [];

    let chunk = 0;
    while (chunk < parts) {
        const offset = chunk * size;

        const chnk = source.slice(offset, size + offset);

        if (!chnk.length) { return output; }

        output.push(chnk);
        chunk++;
    }

    return output;
};

/**
 * @typedef {{
 *  source : any[][]
 * }} TransposeOptions
 * 
 * @summary transposes a grid
 * @param {TransposeOptions}
 */
const transposeGrid = ({ source = [[]] } = {}) => source[0].map((_, ci) => source.map((row) => row[ci]));

/**
 * @summary Combines filter() and map() in O(n)
 * @param {any[]} [array]
 * @returns {function(function):function(function):any[]}
 */
const filterMap = (array = []) => (filter = () => true) => (mapper = e => e) => {
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
 * @typedef {{
 *  upToMatching ?: (any) => boolean,
 *  upToIndex    ?: number,
 *  source       ?: any[],
 *  mapper       ?: function,
 *  onError      ?: (err : Error) => void
 * }} MapUntilOptions
 * 
 * @param {MapUntilOptions}
 * @returns {any[]}
 */
const mapUntil = ({
    upToMatching,
    upToIndex,
    source = [],
    mapper = (v) => v,
    onError = (err) => console.warn(err)
} = {}) => {
    try {
        const mapped = [];

        for (let i = 0; i < source.length; i++) {
            const element = source[i];

            if (i >= upToIndex || typeof upToMatching === "function" && upToMatching(element)) { break; }

            mapped[i] = mapper(element);
        }

        return mapped;
    }
    catch (error) {
        onError(error);
        return source;
    }
};

/**
 * @typedef {{
 *  col?: number,
 *  grid: any[][],
 *  values: any[]
 * }} ColumnMixinOpts
 * 
 * @param {ColumnMixinOpts} options
 */
const mixinColumn = ({ col = 0, grid, values }) => grid.map((row, ri) => {
    row[col] = row[col] || values[ri];
    return row;
});

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

const unionGrids = ({
    sources = [],
    hasher = (v) => v === "" ? "" : JSON.stringify(v)
} = {}) => {

    const hashes = new Set();

    const output = sources.reduce((acc, cur) => {

        const added = cur.reduce((a, row) => {
            const h = hasher(row);

            if (!hashes.has(h)) {
                a.push(row);
                hashes.add(h);
            }

            return a;

        }, []);

        return [...acc, ...added];

    }, []);

    if (!output.length) { output.push([]); }

    return output;
};

/**
 * @typedef {object} ExpandGridOptions
 * @property {any[][]} source
 * @property {number|string|boolean|undefined|null} fill
 * @property {number} [horizontally]
 * @property {number} [vertically]
 * 
 * @param {ExpandGridOptions}
 */
const expandGrid = ({
    source,
    vertically = 0,
    horizontally = 0,
    fill
} = {}) => {
    //TODO: add utility
};

/**
 * @typedef {} InsertInGridOptions
 */
const insertInGrid = ({
    source
} = {}) => {
    //TODO: add utility
};

/**
 * @typedef {{
 *  source ?: any[][],
 *  accumulator ?: any,
 *  callback ?: (acc : any, cur : any) => any,
 *  overColumn ?: number
 * }} FoldGridOptions
 * 
 * @param {FoldGridOptions}
 */
const foldGrid = ({
    source = [[]],
    accumulator = 0,
    callback = (acc) => acc += 1,
    overColumn = 0,
    matching = () => true,
    onError = (err) => console.warn(err)
} = {}) => {
    try {

        const column = source.map((row) => row[overColumn]);

        return column.reduce((acc, cur, ri) => {
            if (matching(cur, column)) {
                return callback(acc, cur, source[ri]);
            }
            return acc;
        }, accumulator);
    }
    catch (error) {
        onError(error);
    }
};

/**
 * @summary mixes grids into one
 * @param {(a: any,b: any) => any} operation
 * @param {...any[][]} grids
 */
const foldGrids = (operation, ...grids) => grids.reduce((acc, cur) => acc.map((row, ri) => row.map((cell, ci) => operation(cell, cur[ri][ci]))));

/**
 * @typedef {object} ShrinkGridOptions
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
 * @param {ShrinkGridOptions} [source]
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
                tgtEntries.map(([, v]) => v).every((tgtVal) => Object.values(srcObj).includes(tgtVal));

            const sameOnKeys = type === "keys" &&
                tgtEntries.map(([k]) => k).every((tgtKey) => Object.keys(srcObj).includes(tgtKey));

            return sameOnEntries || sameOnValues || sameOnKeys;
        });

        return srcIdx === (length - lastIdx - 1);
    });
};

/**
 * @typedef {{
 *  value : any,
 *  values : any[]
 * }} ClosestConfig
 * 
 * @summary finds closest value in the array
 * @param {ClosestConfig} [config]
 */
const closestValue = (config = {}) => {

    if (!("value" in config)) {
        return null;
    }

    const { value, values = [] } = config;

    if (!values.length) {
        return null;
    }

    let closestIndex = 0, currClosest = Math.abs(value - values[0]);

    values.forEach((val, i) => {
        const diff = Math.abs(value - val);

        if (currClosest > diff) {
            closestIndex = i;
            currClosest = diff;
        }
    });

    return values[closestIndex];
};

/**
 * @summary removes elements from an array
 * @param {any[]} arr 
 * @param {...any} elems
 * @returns {any[]}
 */
const removeElements = (arr, ...elems) => arr.filter((elem) => !elems.includes(elem));

/**
 * @summary validates a grid of value
 * 
 * @param {{
 *  without : (any|undefined),
 *  grid : any[][],
 *  has : (any|undefined),
 *  minCols : (number|undefined),
 *  minRows : (number|undefined),
 *  notBlank : (boolean|false),
 *  notEmpty : (boolean|false),
 *  notFull : (boolean|false)
 * }} 
 * 
 * @returns {boolean}
 */
const validateGrid = ({
    grid = [[]],
    has,
    without,
    blank,
    notBlank = false,
    notEmpty = false,
    notFilled = false,
    minCols,
    minRows
} = {}) => {

    const { length } = grid;

    if (!length) {
        throw new RangeError("Grid must have at least one row");
    }

    const validRows = minRows || length;
    if (length < validRows) { return false; }

    const [{ length: firstRowLength }] = grid;
    if (notEmpty && !firstRowLength) { return false; }

    const validCols = minCols || firstRowLength;
    if (firstRowLength < validCols) { return false; }

    let numEmpty = 0, numFilled = 0, matchOnVal = 0;

    const gridValidated = grid.every((row) => row.every((cell) => {

        const notContains = without !== undefined ? cell !== without : true;

        if (!notContains) { return false; }

        cell === "" ? numEmpty++ : numFilled++;
        cell === has && (matchOnVal |= 1);

        return true;
    }));

    const blankValid = blank !== undefined ? !numFilled === blank : true;

    return gridValidated && blankValid &&
        (!notFilled || !!numEmpty) &&
        (!notBlank || !!numFilled) &&
        (has === undefined || !!matchOnVal);

};

/**
 * @summary finds longest array in a grid
 * @param {any[][]} grid
 * @returns {number}
 */
const longest = (grid) => Math.max(...grid.map(({ length }) => length));

/**
 * @summary leaves only unique elements (shallow)
 * @param {any[]} [arr]
 * @returns {any[]}
 */
const uniqify = (arr = []) => [...new Set(arr).values()];

const safeRemove = (r, i) => [...r.slice(0, i), ...r.slice(i + 1)];

class Sorter {

    constructor(arr = []) {
        this.arr = arr;
    }

    alphabetical() {
        const { arr } = this;
        return arr.slice().sort((a, b) => a === b ? 0 : a > b ? 1 : -1);
    }

    invert() {
        const { arr } = this;
        return arr.slice().reverse();
    }
}

/**
 * @param {any[][]} grid
 * @param {number} [col]
 * @returns {{ [x: string] : any[][] }}
 */
const indexGrid = (grid, col = 0) => {

    const dict = {};

    grid.forEach((row) => {
        const key = row[col];
        const record = dict[key] || [];
        record.push(row);
        dict[key] = record;
    });

    return dict;
};

const shiftToIndex = ({
    source = [],
    index = 0,
    keep = true
}) => {
    const before = source.slice(0, index);
    const after = source.slice(index);
    return keep ? [...after, ...before] : after;
};

export {
    chunkify,
    closestValue,
    countObjects,
    deduplicate,
    filterMap,
    filterMapped,
    foldGrid,
    foldGrids,
    forAll,
    indexGrid,
    keyMap,
    last,
    longest,
    mapUntil,
    mergeOnto,
    mixinColumn,
    partify,
    reduceWithStep,
    removeElements,
    safeRemove,
    shiftToIndex,
    shrinkGrid,
    spliceInto,
    splitIntoConseq,
    transposeGrid,
    validateGrid,
    unionGrids,
    uniqify
};