/**
 * General Utilities
 */

//delays callback for a specified number of milliseconds;
const delay = (time) => (callback) => (...args) => setTimeout(() => callback(...args), time || 100);

//explicit no ops;
const doNothing = (value) => value;

/**
 * String Utilities
 */

//Applies sentence case to a string
const sentenceCase = (text) => text.charAt(0).toUpperCase() + text.slice(1);

//trims whitespaces and removes non-word characters
//example: orange, apple (!); --juice => 
const trimAndRemoveSep = (input) => input.trim().replace(/[^\s\w]|_/g, '');

/**
 * Object Utilities
 */

//Checks if object is a valid object (not null);
const isObject = (obj) => typeof obj === 'object' && obj !== null;

//Extracts entries from an object;
const getEntries = (object) => Object.keys(object).map(key => object[key]);

//Extracts key name by its value;
const keysByValue = (object) => (value) => Object.keys(object).filter(key => object[key] === value);

//performs deep Object comparison;
const compare = (...args) => {
    return args.every((arg, a) => {
        if (a) {
            const previous = args[a - 1];

            if (typeof arg !== typeof previous && !(arg instanceof RegExp) && !(previous instanceof RegExp))
                return false;

            switch (typeof arg) {
                case 'function':
                    return Function.prototype.toString.call(arg) === Function.prototype.toString.call(previous);
                case 'object':
                    //test against null;
                    if (arg === null || previous === null)
                        return arg === previous;

                    //test against RegExp (backwards);
                    if (arg instanceof RegExp && (typeof previous === 'string' || typeof previous === 'number'))
                        return arg.test(previous.toString());

                    let isOK = true;

                    //check current element;
                    for (const key in arg) {
                        isOK = previous.hasOwnProperty(key) && compare(arg[key], previous[key]);
                        if (!isOK)
                            return false;
                    }

                    //check previous element;
                    for (const key in previous) {
                        isOK = arg.hasOwnProperty(key) && compare(arg[key], previous[key]);
                        if (!isOK)
                            return false;
                    }

                    return isOK;
                default:
                    //test against RegExp (forwards);
                    if ((typeof arg === 'string' || typeof arg === 'number') && previous instanceof RegExp)
                        return previous.test(arg.toString());

                    return arg === previous;
            }
        } else {
            return true;
        }
    });
}

//finds latest element deeply equal to a given one;
const getDeepLastIndex = (arr, elem) => {
    let lidx = -1;

    const aIndex = arr.length - 1;

    for (let index = aIndex; index >= 0; index--) {
        const same = compare(arr[index], elem);
        if (same) {
            lidx = index;
            break;
        }
    }

    return lidx;
}

/**
 * Array Utilities
 */

/**
 * Converts bits list to decimal number
 * @param {Number[]} bits
 * @returns {Number}
 */
const toDecimal = (bits) => {
    const len = bits.length - 1;
    return bits.reduce((acc, bit, pos) => acc + bit * 2 ** (len - pos), 0);
};

//Allocates an Array (avoids using loops);
const allocArray = (numElems) => new Array(numElems || 0).fill(1);

//Wraps non-Array data into an Array;
const arrayify = (data) => data instanceof Array ? data : [data];

//Resolves with the result of async mapping over an Array;
const asyncMap = (array) => async (callback) => await Promise.all(array.map(callback));

//Gets an object satisfying value;
const byKeyVal = (array) => (key) => (value) => array.filter(obj => obj[key] === value);

//Gets last element of an Array (regardless of length);
const getLastElem = (array) => array[array.length - 1];

//Gets every Nth element of an Array (optional offset);
const getEveryNthElem = (pos) => (array, offset) => array.slice(offset || 0).filter((elem, e) => !((e + 1) % pos));

//Gets all elements of an Array except for one at position (composable);
const getOtherElems = (pos) => (array) => array.filter((elem, e) => e !== pos);

//Gets elements of an Array at even positions;
const getEvenPosElems = (array) => array.filter((elem, e) => e % 2);

//Gets elements of an Array at odd positions;
const getOddPosElems = (array) => array.filter((elem, e) => !(e % 2));

//Maps elements of an Array and returns only elements that are defined;
const mapExisting = (callback) => (array) => array.map(callback).filter(e => e !== undefined);

//Maps relative growth Array into actual values using [0] element as base
const relativeGrowth = (array) => array.reduce((acc, elem) => {
    return acc.concat([elem + (acc[acc.length - 1] || 0)]);
}, []);

//Reorders a 2D Array by provided ordering criteria 
//and filters out indices not present in criteria
const filterAndReorder = (source, order) => source
    .map(
        (row, r) => row
            .map((cell, c) => source[r][order[c]])
            .filter((cell, c) => cell !== undefined)
    );

//Removes elements from start to end and returns modified Array (no mutation);
const simpleSplice = (array) => (start, end) => array.filter((e, pos) => pos < start || pos > end);

//Splits an Array on every Nth element;
//[1,2,3,4] on second elem returns [ [1,2], [3,4] ];
//0 as position results in an empty Array;
const splitOnNthElem = (pos) => (array) => array
    .map((e, i, a) => !(i % pos) ? a.slice(i, i + pos) : 0)
    .filter(e => e.length);

//Returns whether number of occurencies of each element is unique
const uniqueOccurrences = (arr) => {
    const copy = arr.map(e => e).sort();

    const occurs = copy
        .reduce((a, c, i) => {
            return c !== copy[i - 1] ?
                a.concat([copy.slice(i, copy.lastIndexOf(c) + 1).length]) :
                a;
        }, []);

    return !occurs
        .some((e, i) => occurs.lastIndexOf(e) > i);
};

/**
 * Date Utilities
 */

//adds number od days to a Date;
const addDays = (days) => (date) => new Date(date.valueOf() + (days || 0) * 86400000);

//splits date into ISO standard date or time string;
const isoDate = (date) => date.toISOString().slice(0, 10);
const isoTime = (date) => date.toISOString().slice(11, 19);

//counts number of nights between two date instances;
const nights = (start, end) => (end.valueOf() - start.valueOf()) / 86400000;

/**
 * Logging Utilities
 */

//logs object at log time;
const logFixed = (object) => console.log(JSON.parse(JSON.stringify(object)));

/**
 * DOM Utilities
 */

//simply gets element by id;
const byId = (id) => document.querySelector(`#${id}`);
const byClass = (cls) => document.querySelector(`.${cls}`);

//clears element of children (chainable);
const clearElem = (elem) => Array.from(elem.children).forEach(child => child.remove()) || elem;

//removes first child from element if it has any (non-leaking);
const removeFirstChild = (element) => void !element.firstChild || element.firstChild.remove();

//removes last child from element if it has any (non-leaking);
const removeLastChild = (element) => void !element.lastChild || element.lastChild.remove();

//removes N last children from element if it has any (non-leaking);
const removeLastChildren = (num) => (element) => void Array.from(element.children).slice(-num).forEach(child => child.remove());

//changes check state of an element + 2 use cases;
const changeCheck = (cbx) => (value) => cbx.checked = value;
const check = (cbx) => changeCheck(cbx)(true);
const uncheck = (cbx) => changeCheck(cbx)(false);

//toggles class on an element if it is set and vice versa (non-leaking);
const toggleClassIfSet = (name) => (element) => void (!element.classList.contains(name) || element.classList.toggle(name));
const toggleClassIfNot = (name) => (element) => void (element.classList.contains(name) || element.classList.toggle(name));

module.exports = {
    delay,
    trimAndRemoveSep,
    keysByValue,
    getEntries,
    compare,
    getOtherElems,
    getDeepLastIndex,
    relativeGrowth,
    asyncMap,
    toDecimal,
    filterAndReorder,
    uniqueOccurrences,
    isoDate,
    isoTime
};