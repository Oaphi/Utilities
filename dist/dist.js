
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.utilsDOM = factory();
    }
}(
    typeof self !== 'undefined' ? self : this,
    function () {

        /**
         * @description traverses children left to right, calling comparator on each one
         * until it evaluates to true, then calls the callback with first element passing 
         * the condition or with root itself if none
         * @param {HTMLElement} root 
         * @param {number} [offset]
         * @param {function(HTMLElement): boolean} comparator 
         * @param {function(HTMLElement)} [callback] 
         * @param {function(HTMLElement)} [fallback]
         * @param {boolean} [strict]
         */
        function elementsRightUntil(root, offset, comparator, callback, fallback, strict = false) {

            if (typeof offset === "function") {
                fallback = callback;
                callback = comparator;
                comparator = offset;
                offset = 0;
            }

            if (typeof callback === "boolean") {
                strict = callback;
                callback = null;
            }

            if (typeof fallback === "boolean") {
                strict = fallback;
                fallback = null;
            }

            let current = root.children[offset] || (strict ? null : root);

            let matchedOnce = comparator(current) ? 1 : 0;

            let index = offset;

            if (!matchedOnce) {
                while (current.nextElementSibling) {
                    index++;

                    current = current.nextElementSibling;
                    if (comparator(current)) {
                        matchedOnce |= 1;
                        break;
                    }
                }
            }

            const use = matchedOnce ? callback : fallback;
            return use ? use(current, index) : current;
        }

        /**
         * @summary inverse of elementsRightUntil
         * @param {HTMLElement} root
         * @param {number} [offset]
         * @param {function(HTMLElement): boolean} comparator
         * @param {function(HTMLElement)} [callback]
         * @param {function(HTMLElement)} [fallback]
         * @param {boolean} [strict]
         */
        function elementsLeftUntil(root, offset, comparator, callback, fallback, strict = false) {

            if (typeof offset === "function") {
                fallback = callback;
                callback = comparator;
                comparator = offset;
                offset = 0;
            }

            if (typeof callback === "boolean") {
                strict = callback;
                callback = null;
            }

            if (typeof fallback === "boolean") {
                strict = fallback;
                fallback = null;
            }

            const { children } = root;

            const lastIndex = children.length - 1 - offset;

            let current = children[lastIndex] || (strict ? null : root);

            let matchedOnce = comparator(current) ? 1 : 0;

            let index = lastIndex;

            if (!matchedOnce) {
                while (current.previousElementSibling) {
                    index--;

                    current = current.previousElementSibling;
                    if (comparator(current)) {
                        matchedOnce |= 1;
                        break;
                    }
                }
            }

            const use = matchedOnce ? callback : fallback;
            return use ? use(current, index) : current;
        }

        /**
         * @summary checks if some tokens are contained
         * @param {DOMTokenList} list
         */
        const listContainsSome = (list) =>

            /**
             * @param {...string} [tokens]
             * @returns {boolean}
             */
            (...tokens) => {
                const boundContains = list.contains.bind(list);
                return tokens.some(boundContains);
            };

        /**
         * @summary removes last child of Element
         * @param {Element} element
         * @returns {void}
         */
        const removeLastChild = (element) => element.lastChild && element.lastChild.remove();

        return {
            elementsRightUntil,
            elementsLeftUntil,
            listContainsSome,
            removeLastChild
        };

    }));

/**
 * @fileoverview Array utilities
 * @author Oleg Valter
 * @module
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Arrays = factory();
    }
}(
    typeof self !== 'undefined' ? self : this,
    function () {

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

        /**
         * @summary merges arrays
         * @param {any[]} source 
         * @param  {...any[]} [targets]
         * @returns {any[]}
         */
        const mergeOnto = (source, ...targets) => {

            const output = [];

            for(let index = 0; index < source.length; index++) {
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
         * 
         * @param {any[]} source 
         * @param {...any[]} targets
         * @returns {any[]}
         */
        const spliceInto = (source, ...targets) => {

            const output = source.map(item => item); //shallow copy;

            for(const target of targets) {
                target.forEach((item, index) => {
                    if (typeof item !== "undefined") {
                        output.splice(index, 0, item);
                    }
                });
            }

            return output;
        }


        return {
            filterMap,
            filterMapped,
            forAll,
            keyMap,
            mergeOnto,
            spliceInto
        };

    }));

/**
 * ANDs lists of boolean values
 * @param  {...boolean} [args]
 * @returns {boolean}
 */
const AND = (...args) => !args.length ? false : args.reduce((ok, arg) => ok && arg);

/**
 * ORs lists of boolean values
 * @param  {...boolean} [args]
 * @returns {boolean}
 */
const OR = (...args) => args.reduce((ok, arg) => ok || arg, false);

/**
 * XORs lists of boolean values
 * @param  {...boolean} [args]
 * @returns {boolean}
 */
const XOR = (...args) => args.reduce((ok, arg, idx, arr) => arg === arr[idx - 1] ? false : ok, true);

module.exports = {
    AND,
    OR,
    XOR
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.returnExports = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * @summary defines a non-changeable property
     * @param {object} obj 
     * @param {string} key 
     * @param {any} val 
     * @param {boolean} [enumerable=true]
     * @returns {object}
     */
    const defineConstant = (obj, key, val, enumerable = true) => {
        return Object.defineProperty(obj, key, {
            enumerable,
            configurable: false,
            writable: false,
            value: val
        });
    };

    /**
     * @summary makes a Enum
     * @param {string[]} choices
     * @returns {object}
     */
    const makeEnum = (choices) => {
        const { length } = choices;

        const enumerator = Object.create(null);

        let increment = 1, index = 0;

        for (const choice of choices) {
            defineConstant(enumerator, index, choice, false);
            defineConstant(enumerator, choice, increment);

            increment = increment << 1;
            index++;
        }

        defineConstant(enumerator, "length", length, false);
        defineConstant(enumerator, "toString", () => `[object Enum]`, false);

        enumerator[Symbol.iterator] = () => {
            let i = 0;

            return {
                next: () => ({
                    done: i >= length,
                    value: enumerator[i++]
                })
            };
        };

        const frozen = Object.freeze(enumerator);

        return new Proxy(frozen, {
            get: (target, key) => {

                if (!Reflect.has(target, key)) {
                    throw new RangeError(`Invalid enum property: ${key}`);
                }

                return target[key];
            }
        });
    };
    
    return {
        defineConstant,
        makeEnum
    };

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Headers = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * @summary maps headers to headers object
     * @param {string} [headers]
     * @returns {Object.<string, string>}
     */
    const mapResponseHeaders = (headers = "") => {

        const split = headers.split(/[\r\n]+/);

        const headerMap = {};

        if (!headers) {
            return headerMap;
        }

        for (const header of split) {
            const data = header.trim().split(': ');

            const name = data.shift();

            if(name) {
                const value = data.join(': ');
                headerMap[name] = value;

                if (/\-/.test(name)) {
                    const snakeCase = name
                        .split("-")
                        .map((part) => {
                            const fchar = part[0];

                            return part.length > 1 ? fchar.toUpperCase() + part.slice(1) : part;
                        })
                        .join("");

                    headerMap[snakeCase] = value;
                }
            }

        }

        return headerMap;
    };

    return {
        mapResponseHeaders
    };

}));


/**
 * @summary runs a function several times
 * @param {number} [num] 
 */
const runUntil = (num = 1) =>

	/**
	 * @param {function} callback
	 */
    (callback, ...args) => {

        let i = 0;
        while (i < num) {
            callback(i, ...args);
            i++;
        }
    };

module.exports = {
    runUntil
};

/**
 * @fileoverview Math utilities
 * @author Oleg Valter
 * @module
 */

/**
 * @typedef {function} OperationApplier
 * @param {...number} args
 * @returns {number}
 */

/**
 * Abstract binary (here: operator(A,B)) operation
 * @param {function} operation 
 * @returns {OperationApplier}
 */
const binaryOp = (operation) => (...args) => args.length ? args.reduce((total, arg) => operation(total, arg)) : 0;

/**
 * Divides all arguments
 * @param  {...number} args
 * @returns {number}
 */
const divide = (...args) => binaryOp((a, b) => {
    if (b === 0) {
        throw new RangeError('Cannot divide by 0');
    }
    return a / b;
})(...args);

/**
 * Multiplies all arguments
 * @param  {...number} args
 * @return {number}
 */
const multiply = (...args) => binaryOp((a, b) => a * b)(...args);

/**
 * Substracts all arguments
 * @param  {...number} args 
 * @returns {number}
 */
const substract = (...args) => binaryOp((a, b) => a - b)(...args);

/**
 * Sums all arguments
 * @param  {...number} args
 * @returns {number}
 */
const sum = (...args) => binaryOp((a, b) => a + b)(...args);

/**
 * Complex utilities (based on base ops)
 */

/**
 * Simple average of all arguments
 * @param  {...number} args
 * @returns {number}
 */
const average = (...args) => sum(...args) / (args.length || 1);

/**
 * Abstraction for M / (A + ... + Z)
 * @param {number} divisor 
 * @returns {function}
 */
const divSum = (divisor) => (...args) => divide(sum(...args), divisor);

/**
 * Abstraction for M * (A + ... + Z)
 * @param {number} multiplier 
 * @returns {function}
 */
const multSum = (multiplier) => (...args) => multiply(sum(...args), multiplier);


/**
 * @summary Finds greatest common divisor
 * @param  {...number} args
 * @returns {number}
 */
const GCD = (...args) => {
    const { length } = args;

    if (!length) {
        throw new RangeError(`Can't compute GCD of no args`);
    }

    if (length === 1) {
        return args[0];
    }

    const gcd = (a, b) => !a ? b : gcd(b % a, a);

    return args.reduce((out, arg) => gcd(out, arg), 0);
};

/**
 * @summary Finds least common multiplier
 * @param  {...number} args
 * @returns {number}
 */
const LCM = (...args) => {
    const { length } = args;

    if (!args.length) {
        throw new RangeError(`Can't compute LCM of no args`);
    }

    if (length === 1) {
        return args[0];
    }

    return args.reduce((out, arg) => arg * out / GCD(arg, out));
};


module.exports = {
    average,
    divide,
    divSum,
    GCD,
    HCF: GCD,
    LCM,
    multiply,
    multSum,
    substract,
    sum
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Objects = factory();
    }
}(
    typeof self !== 'undefined' ? self : this,
    function () {

        /**
         * @summary checks if an object is a valid object
         * @param {object} obj
         * @returns {boolean}
         */
        const isObject = (obj) => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

        /**
         * @summary copies property if it exists
         * @param {object} source
         * @param {string} key 
         * @param {object} [target]
         * @returns {object}
         */
        const setIf = (source, key, target = {}) => {

            if(typeof key !== "string") {
                return target;
            }

            if(key in source) {
                target[key] = source[key];
            }

            return target;
        };

        /**
         * @summary defines a smart (memoizable) getter
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get}
         * @param {object} context 
         * @param {string} propName 
         * @param {function} callback 
         * @returns {object}
         */
        const smartGetter = (context, propName, callback) => {
            return Object.defineProperty(context, propName, {
                configurable: true,
                get() {
                    const temp = callback(context);

                    Object.defineProperty(context, propName, {
                        value: temp
                    } )
                    
                    return temp;
                }
            });
        };

        /**
         * @summary returns one of the object props equal
         * @param {object} [target] first object to compare
         * @param {string} propName property name
         */
        const switchIfDiffProp = (target, propName) =>

            /**
             * @param {object} [source] second object to compare
             * @returns {object}
             */
            (source) => {

                if(!target) {
                    return source || {};
                }

                if(!source) {
                    return target || {};
                }

                return target[propName] === source[propName] ?
                target :
                source;
            }

        return {
            isObject,
            setIf,
            smartGetter,
            switchIfDiffProp
        };
    }));

/**
 * Generates pseudo-random int[]
 * @param {number} len 
 * @param {number} [seed]
 * @returns {number[]} 
 */
const randomArray = (len, seed = 1) => {
    const output = [];

    let i = 0;

    while (i < len) {
        const val = Math.floor(Math.random() * seed);
        output[i] = val;
        i++;
    }

    return output;
};

module.exports = {
    randomArray
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Strings = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * @summary checks if string is lowcase
     * @param {string} [str] 
     * @returns {boolean}
     */
    const isLcase = (str = "") => {

        if (!str) {
            return false;
        }

        return Array.prototype.every
            .call(str, char => {
                const code = char.codePointAt(0);
                return code < 65 || code > 90;
            });
    };

    /**
     * @summary checks if string is uppercase
     * @param {string} [str]
     * @returns {boolean}
     */
    const isUcase = (str = "") => {

        if(!str) {
            return false;
        }

        return Array.prototype.every
            .call(str, char => {
                const code = char.codePointAt(0);
                return /\W/.test(char) || code > 64 && code < 91;
            });
    };

    /**
     * @summary trims string and removes non-word chars
     * 
     * @example
     *    "pineapple, apple (!); --juice" => "pineapple apple juice"
     * 
     * @param {string} [input] 
     * @returns {string}
     */
    const trimAndRemoveSep = (input = "") => input.trim().replace(/[^\s\w]|_/g, '');

    return {
        isLcase,
        isUcase,
        trimAndRemoveSep
    };

}));

/**
 * @fileoverview JavaScript Utilities
 * @author Oleg Valter
 * @version 0.0.2
 */


/**
 * General Utilities
 */

//delays callback for a specified number of milliseconds;
const delay = (time) => (callback) => (...args) => setTimeout(() => callback(...args), time || 100);

/**
 * Number utilities
 */

/**
 * Calculates bias offset (offset-K) 
 * for a given number of bits
 * @param {BigInt|Number} bits 
 */
const offsetK = (bits) => {
    const offset = 2 ** (bits - 1);

    return (
        offset > Number.MAX_SAFE_INTEGER ?
            BigInt(offset) - 1n :
            offset - 1
    );
};

//partially applied utils;
const exp32 = offsetK(32);
const exp64 = offsetK(64);

/**
 * String Utilities
 */

//Applies sentence case to a string
const sentenceCase = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Object Utilities
 */

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
};

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
};

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

/**
 * Subsplits an Array into several parts
 * @param {number} [n] 
 * @returns {function(Array): any[][]}
 */
const subsplit = (n = 1) => (array) => {
    const { length } = array;

    const maxSplitLength = Math.floor(length / n);

    const output = [];

    for (let i = 0; i < n; i++) {
        const start = i * maxSplitLength;
        output.push(array.slice(start, start + maxSplitLength));
    }

    return output;
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

/**
 * Counts number of permutations given the 
 * set of entities and repetitions number
 * @param {any[]} set 
 * @param {Number} repeat
 * @returns {Number}
 */
const numCombinations = (set, repeat) => {
    const len = set.length;
    return repeat ? len ** repeat : 0;
};

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

/**
 * Transforms json to key : value; string
 * @param {Object} [json]
 * @returns {String}
 */
const jsonToFormatString = (json = {}) => {
    return Object.entries(json).map(entry => {
        const [key, value] = entry;
        return `${key}: ${value}`;
    }).join('; ');
};

/**
 * Stringifies JSON into DOMString
 * @param {Object} [json] 
 * @returns {DOMString}
 */
const jsonToDOMString = (json = {}) => {
    const keyErrMsg = `DOMString key should be set`;
    const valueErrMsg = `DOMString value should be set`;

    const errors = new Map()
        .set('key', (value) => { throw new SyntaxError(`${keyErrMsg}: ${value}`); })
        .set('value', (key) => { throw new SyntaxError(`${valueErrMsg}: ${key}`); });

    return Object.entries(json).map(entry => {
        const [key, value] = entry;

        value === '' && errors.get('value')(key);
        key === '' && errors.get('key')(value);

        return `${key}=${value}`;
    }).join(',');
};

//removes first child from element if it has any (non-leaking);
const removeFirstChild = (element) => void !element.firstChild || element.firstChild.remove();

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
    asyncMap,
    compare,
    delay,
    filterAndReorder,
    getEntries,
    getOtherElems,
    getDeepLastIndex,
    isoDate,
    isoTime,
    jsonToDOMString,
    jsonToFormatString,
    keysByValue,
    numCombinations,
    offsetK,
    relativeGrowth,
    subsplit,
    toDecimal,
    uniqueOccurrences
};

