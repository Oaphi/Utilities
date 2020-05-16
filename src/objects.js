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
         * @summary pushes value in or inits array with value
         * @param {object} obj 
         * @param {string} key 
         * @param {*} value 
         * @returns {object}
         */
        const pushOrInitProp = (obj, key, value) => {

            if(key in obj) {
                const temp = obj[key];

                if(Array.isArray(temp)) {
                    temp.push(value);
                    return obj;
                }

                obj[key] = [ temp, value ];
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

                    if(typeof val === "string") {
                        return val;
                    }

                    if(typeof val === "number") {
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

                if(has) {

                    if(matched) {
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