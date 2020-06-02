
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


        return {
            filterMap,
            filterMapped,
            forAll,
            keyMap,
            last,
            mergeOnto,
            spliceInto,
            splitIntoConseq
        };

    }));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Emails = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    const Utilities = {};

    /**
     * @summary splits email address into domains
     * @param {string} email
     * @returns {string[]}
     */
    function smartEmailSplit(email) {

        const split = email.split('@') || [];

        const [ localPart, internetDomain ] = split;

        const partMatcher = /[!./+=%]/;

        const domains = internetDomain.split(partMatcher);

        const locals = localPart.split(partMatcher);

        domains.length > 1 && domains.pop();

        return locals.concat(domains).filter(Boolean).map(Utilities.toCase);
    }

    const registerCaseModifier = (modifier) => {
        if(typeof modifier === "function") {
            Utilities.toCase = modifier;
        }
    };

    return ({
        smartEmailSplit,
        registerCaseModifier
    });

}));

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

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Logic = factory();
    }
}(
    typeof self !== 'undefined' ? self : this,
    function () {

        /**
         * @summary ANDs lists of values
         * 
         * @description
         * For inputs of any size, fails if any of inputs are false
         *     
         *     | A | B | AND |
         *     | 0 | 0 | 0   |
         *     | 0 | 1 | 0   |
         *     | 1 | 0 | 0   |
         *     | 1 | 1 | 1   |
         * 
         * Due to being vacuously truthy, no arguments should produce`true`: \
         * ∀ arg: P (arg) => Q (arg) && ∀ arg: ¬ P (arg)
         * 
         * @param  {...any} [args]
         * @returns {boolean}
         */
        const AND = (...args) => args.every(Boolean);

        /**
         * @summary NANDs lists of values
         * 
         * @description
         * For inputs of any size, fails only if not all inputs are true
         * 
         *     | A | B | NAND |
         *     | 0 | 0 | 1    |
         *     | 0 | 1 | 1    |
         *     | 1 | 0 | 1    |
         *     | 1 | 1 | 0    |
         * 
         * Due to being vacuously truthy, no arguments should produce `true`: \
         * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
         * 
         * De Morgan's law:
         * 
         * Negation of conjunction: !A && !B === !(A + B)
         * 
         * @param  {...any} args 
         * @returns {boolean}
         */
        const NAND = (...args) => args.reduce((previous, current) => !AND(previous, current), true);

        /**
         * @summary ORs lists of values
         * 
         * @description
         * For inputs of any size, succeeds if any of the inputs are true
         * 
         *     | A | B | OR |
         *     | 0 | 0 | 0  |
         *     | 0 | 1 | 1  |
         *     | 1 | 0 | 1  |
         *     | 1 | 1 | 1  |
         * 
         * Due to being vacuously truthy, no arguments should produce `true`: \
         * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
         * 
         * @param  {...any} [args]
         * @returns {boolean}
         */
        const OR = (...args) => args.length ? args.some(Boolean) : true;

        /**
         * @summary NORs lists of values
         * 
         * @description
         * For inputs of any size, succeeds only if all inputs false
         * 
         *     | A | B | NOR |
         *     | 0 | 0 | 1   |
         *     | 0 | 1 | 0   |
         *     | 1 | 0 | 0   |
         *     | 1 | 1 | 0   |
         * 
         * Due to being vacuously truthy, no arguments should produce `true`: \
         * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
         * 
         * De Morgan's law:
         * 
         * Negation of disjunction: !A && !B === !(A + B)
         * 
         * @param  {...any} args 
         * @returns {boolean}
         */
        const NOR = (...args) => args.reduce((previous, current) => !OR(previous, current), true);

        /**
         * @summary XORs lists of values
         * 
         *  @description
         * For inputs > 2, proper XOR is several of XOR gates with result of binary XOR and new input
         * 
         *     | A | B | XOR |
         *     | 0 | 0 | 0   |
         *     | 0 | 1 | 1   |
         *     | 1 | 0 | 1   |
         *     | 1 | 1 | 0   |
         * 
         * Due to being vacuously truthy, no arguments should produce `true`: \
         * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
         * 
         * To be different from one-hot switch, XOR for more than 2 inputs \
         * should be a stacked instead of reducing XOR
         * 
         * @param  {...any} [args]
         * @returns {boolean}
         */
        const XOR = (...args) => {

            const { length } = args;

            if (!length) {
                return true;
            }

            if (length === 1) {
                return !!args[0];
            }

            const [curr, next] = args;

            const xored = OR(curr, next) && OR(!curr, !next);

            return XOR(xored, ...args.slice(2));
        };

        /**
         * @summary XNORs lists of values
         * 
         * @description
         * 
         * XNOR acts as an equivalence gate
         * 
         *     | A | B | XNOR |
         *     | 0 | 0 | 1    |
         *     | 0 | 1 | 0    |
         *     | 1 | 0 | 0    |
         *     | 1 | 1 | 1    |
         * 
         * XNOR = inverse of NOR
         * 
         * 
         * @param  {...any} args 
         * @returns {boolean}
         */
        const XNOR = (...args) => args.length ? !XOR(...args) : true;

        return {
            AND,
            NAND,
            NOR,
            OR,
            XNOR,
            XOR
        };

    }));

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
         * @summary returns a complement of objects
         * @param  {...object} sources 
         * @returns {object}
         */
        const complement = (...sources) => {

            const tracked = [];

            return sources.reduce((acc, curr) => {

                for (const key in curr) {

                    if (tracked.includes(key)) {
                        delete acc[key];
                        continue;
                    }

                    acc[key] = curr[key];

                    tracked.push(key);
                }

                return acc;
            }, {});
        };

        /**
         * @typedef {({ 
         *  configurable: boolean,
         *  enumerable: boolean,
         *  writable: boolean,
         *  get: function, 
         *  set: function,
         *  value: any
         * })} PropertyDescriptor
         * 
         * @param {object} obj
         * @returns {PropertyDescriptor}
         */
        const getGetterDescriptors = (obj = {}) => {
            return Object
                .entries(Object.getOwnPropertyDescriptors(obj))
                .filter(entry => typeof entry[1].get === "function");
        };

        /**
         * @summary gets value from object or inits it via callback
         * @param {object} obj
         * @param {string} propName
         * @param {function(object) : any} [callback]
         * @returns {any}
         */
        const getOrInitProp = (obj, propName, callback) => {

            if (propName in obj) {
                return obj[propName];
            }

            if (callback) {
                obj[propName] = callback(obj);
                return obj[propName];
            }
        };

        /**
         * @summary checks if an object is a valid object
         * @param {object} obj
         * @returns {boolean}
         */
        const isObject = (obj) => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

        /**
         * @summary pushes value in or inits array with value
         * @param {object} obj 
         * @param {string} key 
         * @param {*} value 
         * @returns {object}
         */
        const pushOrInitProp = (obj, key, value) => {

            if (key in obj) {
                const temp = obj[key];

                if (Array.isArray(temp)) {
                    temp.push(value);
                    return obj;
                }

                obj[key] = [temp, value];
                return obj;
            }

            obj[key] = [value];

            return obj;
        };

        /**
         * @typedef {object} SetOptions
         * @property {string} [coerce]
         * 
         * 
         * @summary copies property if it exists
         * @param {object} source
         * @param {string} key 
         * @param {object} [target]
         * @param {SetOptions} [options]
         * @returns {object}
         */
        const setIf = (source, key, target = {}, options = {}) => {

            if (typeof key !== "string") {
                return target;
            }

            /** @type {Map<string, function>} */
            const coercionMap = new Map()
                .set("string", val => {

                    if (typeof val === "string") {
                        return val;
                    }

                    if (typeof val === "number") {
                        return Number.prototype.toString.call(val);
                    }

                    return val;
                });

            const { coerce } = options;

            if (key in source) {
                const value = source[key];

                target[key] = coerce ? (coercionMap.get(coerce))(value) : value;
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
                    });

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

                if (!target) {
                    return source || {};
                }

                if (!source) {
                    return target || {};
                }

                return target[propName] === source[propName] ?
                    target :
                    source;
            };

        /**
         * @summary makes a union of object
         * @param {object} target 
         * @param  {...object} sources 
         * @returns {object}
         */
        const union = (target, ...sources) => {

            const union = Object.assign({}, target);

            const assignedKeys = {};

            for (const source of sources) {
                for (const key in source) {
                    if (!assignedKeys[key] && !(key in union)) {
                        assignedKeys[key] |= 1;
                        union[key] = source[key];
                    }
                }
            }

            return union;
        };

        /**
         * @summary checks which key is set on object
         * @param {object} obj 
         * @param  {...string} [keys] 
         * @returns {?string}
         * 
         * @throws {RangeError}
         */
        const whichKeyIsSet = (obj, ...keys) => {

            let matched = 0;

            const filtered = keys.filter(key => {
                const has = obj.hasOwnProperty(key);

                if (has) {

                    if (matched) {
                        throw new RangeError(`Object has more than one provided own keys`);
                    }

                    matched |= 1;
                }

                return has;
            });

            return filtered[0] || null;
        };

        /**
         * @summary checks which keys are set on object
         * @param {object} obj 
         * @param  {...string} [keys] 
         * @returns {string[]}
         */
        const whichKeysAreSet = (obj, ...keys) => {
            return keys.filter(key => obj.hasOwnProperty(key));
        };

        return {
            complement,
            getGetterDescriptors,
            getOrInitProp,
            isObject,
            pushOrInitProp,
            setIf,
            smartGetter,
            switchIfDiffProp,
            union,
            whichKeyIsSet,
            whichKeysAreSet
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

        if (!str) {
            return false;
        }

        return Array.prototype.every
            .call(str, char => {
                const code = char.codePointAt(0);
                return /\W/.test(char) || code > 64 && code < 91;
            });
    };

    /**
     * @summary changes noun (countable) to plural form and prepends amount
     * 
     * @example
     * 1,test -> 1 test
     * 2,test -> 2 tests
     * 21,test -> 21 tests
     * 
     * @param {number} amount
     * @param {string} noun
     * @returns {string}
     */
    const pluralizeCountable = (amount, noun) => {

        const normalized = noun.toLowerCase();

        if (amount === 1) {
            return `1 ${normalized}`;
        }

        const irregulars = {
            "child": "children",
            "goose": "geese",
            "tooth": "teeth",
            "foot": "feet",
            "mous": "mice",
            "person": "people"
        };

        const irregularPlural = irregulars[normalized];

        if (irregularPlural) {
            return `${amount} ${irregularPlural}`;
        }

        if (manWomanCase = normalized.match(/(\w*)(man|woman)$/)) {
            return `${amount} ${manWomanCase[1]}${manWomanCase[2].replace("a", "e")}`;
        }

        const staySameExceptions = new Set(["sheep", "series", "species", "deer", "fish"]);
        if (staySameExceptions.has(normalized)) {
            return `${amount} ${normalized}`;
        }

        const wordBase = normalized.slice(0, -2);

        const irregularEndingWithA = new Set(["phenomenon", "datum", "criterion"]);
        if (irregularEndingWithA.has(normalized)) {
            return `${amount} ${wordBase}a`;
        }

        const twoLastLetters = normalized.slice(-2);
        const oneLastLetter = twoLastLetters.slice(-1);

        const irregularEndingWithForFe = new Set(["roofs", "belief", "chef", "chief"]);
        if (irregularEndingWithForFe.has(normalized)) {
            return `${amount} ${normalized}s`;
        }

        if (/(?:f|fe)$/.test(noun)) {
            return `${amount} ${ normalized.replace(/(?:f|fe)$/,"ves")}`;
        }

        const twoLettersReplaceMap = {
            "is": "es",
            "us": "i"
        };

        const lastLettersReplace = twoLettersReplaceMap[twoLastLetters];
        if (lastLettersReplace && wordBase.length > 1) {
            return `${amount} ${wordBase}${lastLettersReplace}`;
        }

        const twoLettersAddMap = new Set(["ch", "ss", "sh"]);
        if (twoLettersAddMap.has(twoLastLetters)) {
            return `${amount} ${normalized}es`;
        }

        const oneLastLetterMap = new Set(["s", "x", "z"]);
        if (oneLastLetterMap.has(oneLastLetter)) {
            return `${amount} ${normalized}es`;
        }

        const consonants = new Set([
            "b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n",
            "p", "q", "r", "s", "t", "v", "x", "z", "w", "y"
        ]);

        const isLetterBeforeLastConsonant = consonants.has(normalized.slice(-2, -1));

        if (oneLastLetter === "o" && isLetterBeforeLastConsonant) {
            const lastOexceptions = new Set(["photo", "buro", "piano", "halo"]);

            return `${amount} ${normalized}${lastOexceptions.has(normalized) ? "s" : "es"}`;
        }

        if (oneLastLetter === "y" && isLetterBeforeLastConsonant) {
            return `${amount} ${normalized.slice(0, -1)}ies`;
        }

        return `${amount} ${normalized}s`;
    };

    /**
     * @summary makes word Sentence-case
     * @param {string} word 
     * @returns {string}
     */
    const sentenceCase = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

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
        pluralizeCountable,
        sentenceCase,
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

