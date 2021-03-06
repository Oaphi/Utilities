
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
                //always explicityl convert to string as Symbols cannot be coerced
                throw new RangeError(`Invalid enum property: ${key.toString()}`); 
            }

            return target[key];
        }
    });
};

export {
    defineConstant,
    makeEnum
};