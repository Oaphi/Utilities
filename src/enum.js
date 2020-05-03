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
     * @param {any[]} [values]
     * @returns {object}
     */
    const makeEnum = (choices,values = []) => {
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

