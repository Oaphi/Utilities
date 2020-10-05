
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
 * @summary deep gets properties of type
 * @param {object} [obj]
 */
const deepGetByType = (obj = {}) =>

    /**
     * @param {("string"|"number"|"object"|"undefined"|"boolean"|null)} type
     * @returns {object}
     */
    (type) => {

        const output = {};

        Object
            .entries(obj)
            .forEach(([key, val]) => {

                if (typeof val === "object" && val) {
                    const subvals = deepGetByType(val)(type);
                    return Object.assign(output, subvals);
                }

                const shouldSet = typeof val === type ||
                    type === null && val === null;

                if (shouldSet) {
                    output[key] = val;
                }

            });

        return output;
    };

const initArrOrObj = (entity) => entity !== undefined ? [] : {};

/**
 * @summary deep parses properties of type
 * @param {object} source 
 * @returns {object}
 */
const deepParseByPath = (source) => {

    if (!isObject(source)) {
        return source;
    }

    const output = {};

    const idxRegExp = /([\w$@]+)(?:\[(\d+)\])?/;

    Object
        .entries(source)
        .forEach(([key, val]) => {

            const levels = key.split(".");

            let tmp = output;
            let tmpIdx;

            const { length } = levels;

            levels.forEach((level, i) => {

                const [, subkey, idx] = level.match(idxRegExp);

                tmpIdx || subkey in tmp || (tmp[subkey] = initArrOrObj(idx));

                if (i < length - 1) {
                    tmp = tmp[subkey];
                    idx !== undefined && (tmpIdx = idx);
                    return;
                }

                if (tmpIdx) {
                    tmpIdx in tmp || (tmp[tmpIdx] = initArrOrObj(idx));
                }

                const parsedVal = deepParseByPath(val);

                const idxOrKey = tmpIdx || subkey;

                if (tmpIdx !== undefined) {
                    tmp[tmpIdx][subkey] = parsedVal;
                    return;
                }

                if (idx !== undefined) {
                    tmp[idxOrKey][idx] = parsedVal;
                } else {
                    tmp[idxOrKey] = parsedVal;
                }
            });
        });


    return output;
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



/**
 * @summary maps each object key with mapper
 * @param {object|[]} obj 
 * @param {function (string,any) : any} mapper 
 * @param {{ 
 *  opaqueArrays : (boolean|true), 
 *  keyMapper : function (string) : string 
 * }} [options]
 * @returns {object|[]}
 */
const deepMap = (obj, mapper, { keyMapper, opaqueArrays = true } = {}) => {
    const isArr = Array.isArray(obj);

    const output = isArr ? [] : {};

    const mapKeys = typeof keyMapper === "function";

    Object
        .entries(obj)
        .forEach(([key, value]) => {

            if (Array.isArray(value) && !opaqueArrays) {
                output[mapKeys ? keyMapper(key) : key] = mapper(key, value);
                return;
            }

            let mapped = typeof value === "object" && value ?
                deepMap(value, mapper, { keyMapper, opaqueArrays }) :
                mapper(mapKeys ? keyMapper(key) : key, value);

            output[mapKeys && !isArr ? keyMapper(key) : key] = mapped;
        });

    return output;
};

/**
 * @summary pushes or sets property
 * @param {object|[]} arrOrObj 
 * @param {string} key 
 * @param {any} val 
 * @returns {object|[]}
 */
const pushOrSet = (arrOrObj, key, val) => {
    Array.isArray(arrOrObj) ?
        arrOrObj.push(val) :
        (arrOrObj[key] = val);
    return arrOrObj;
};

/**
 * @typedef {object} DeepFilterConfig
 * @property {object} [accumulator] accumulates entities filtered out
 * @property {boolean|true} [opaqueArrays] if false, treats arrays as values
 * @property {boolean|true} [opaqueObjects] if false, treats objects as values
 * 
 * @summary filters each object key with filterer
 * 
 * @description
 *  Predicate in deep filter behaves similar built-in 
 *  Array.prototype.filter method, but passes a key first
 * 
 * @param {any} input 
 * @param {function (string,any, number, object|[], boolean): boolean} filterer 
 * @param {DeepFilterConfig} [options]
 * @returns {object|[]}
 */
const deepFilter = (
    input,
    filterer,
    options = {}
) => {

    const {
        accumulator,
        opaqueArrays = true,
        opaqueObjects = true,
    } = options;

    const arrAsBase = Array.isArray(input);
    const objAsBase = typeof input === "object" && input;


    const output = arrAsBase ? [] : objAsBase ? {} : input;

    Object.entries(input).forEach(([key, val], index) => {

        const arrAsVal = Array.isArray(val);
        const objAsVal = typeof val === "object" && val;

        if (
            opaqueArrays && arrAsVal ||
            opaqueObjects && objAsVal
        ) {
            const filtered = deepFilter(val, filterer, options) || {};

            const hasKeys = Object.keys(filtered).length;

            if (hasKeys) {
                return pushOrSet(output, key, filtered);
            }

            return accumulator && pushOrSet(accumulator, key, val);
        }

        const canAdd = filterer(key, val, index, input, arrAsBase);

        if (canAdd) {
            return pushOrSet(output, key, val);
        }

        return accumulator && pushOrSet(accumulator, key, val);
    });

    return output;
};

/**
 * @typedef {object} ShallowFilterConfig
 * @property {object[]|object} source
 * @property {function (string,any) : boolean} [filter]
 * @property {object[]|object} [accumulator]
 * 
 * @summary shallow filters an object or array of objects
 * @param {ShallowFilterConfig}
 * @returns {objct[]|object}
 */
const shallowFilter = ({
    source,
    filter = () => true,
    accumulator
}) => {
    const arrAsBase = Array.isArray(source);
    const objAsBase = typeof source === "object" && source;

    const output = arrAsBase ? [] : objAsBase ? {} : source;

    Object.entries(source).forEach(([k, v]) => {
        filter(v, k, source) ?
            pushOrSet(output, k, v) :
            accumulator && pushOrSet(accumulator, k, v);
    });

    return output;
};

/**
 * @summary type guard for proper objects
 * @param {any} [obj]
 * @returns {boolean}
 */
const isObj = (obj) => typeof obj === "object" && obj;

/**
 * @summary deep copies an object
 * @param {{ 
 *   source : object|Array, 
 *   skip? : string[] 
 * }}
 * @returns {object|Array}
 */
const deepCopy = ({ source = {}, skip = [] } = {}) => {

    const output = Array.isArray(source) ? [] : {};

    Object.entries(source).forEach(([key, val]) => {

        if (skip.includes(key)) { return; }

        output[key] = isObj(val) ? deepCopy({ source: val, skip }) : val;
    });

    return output;
};

/**
 * @summary deep assigns object props
 * @param {{
 *  source?   : object,
 *  updates?  : object[],
 *  objGuard? : (any) => boolean,
 *  onError?  : console.warn
 * }} 
 * @returns {object}
 */
const deepAssign = ({ 
    source = {}, 
    updates = [],
    objGuard = (obj) => typeof obj === "object" && obj,
    onError = console.warn
} = {}) => {

    try {

        return updates.reduce((ac, up) => {

            const entries = Object.entries(up);

            const objEntries = entries.filter(([_, v]) => objGuard(v));
            const restEntries = entries.filter(([_, v]) => !objGuard(v));

            Object.assign(source, Object.fromEntries(restEntries));

            objEntries.reduce((a, [k, v]) => a[k] = deepAssign({
                source: a[k] || {},
                updates: [v]
            }), ac);

            return ac;

        }, source);

    } catch (error) {
        onError(error);
    }

    return source;
};

/**
 * @summary parse an object from path and value
 * @param {{
 *  path   : string,
 *  value ?: any
 * }} [options]
 * @return {object} 
 */
const fromPath = (options = {}) => {

    const { path = "", value } = options;

    const output = {};

    path.split(/\/|\\/).reduce(
        (a, c, i, paths) => a[c] = i < paths.length - 1 || !("value" in options) ? {} : value,
        output
    );

    return output;
};

/**
 * @typedef {{
 *  source  ?: any[],
 *  keys    ?: string,
 *  values  ?: string,
 *  onError ?: (err : Error) => void
 * }} ArrayToDictoptions
 * 
 * @param {ArrayToDictoptions}
 */
const objectArrayToDict = ({
    source = [],
    keys,
    values,
    onError = (err) => console.warn(err)
} = {}) => {
    const output = {};

    try {
        source.forEach((elem) => {
            const [ defaultKey, defaultVal ] = Object.entries(elem)[0];

            const key = elem[ keys || defaultKey ];
            const val = values ? elem[values] : defaultVal;

            output[key] = val;
        });
    }
    catch(error) {
        onError(error);
    }

    return output;
};

export {
    objectArrayToDict,
    complement,
    deepAssign,
    deepCopy,
    deepFilter,
    deepGetByType,
    deepMap,
    deepParseByPath,
    fromPath,
    getGetterDescriptors,
    getOrInitProp,
    isObj,
    isObject,
    pushOrInitProp,
    setIf,
    shallowFilter,
    smartGetter,
    switchIfDiffProp,
    union,
    whichKeyIsSet,
    whichKeysAreSet
};