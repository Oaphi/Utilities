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
            smartGetter,
            switchIfDiffProp
        };
    }));