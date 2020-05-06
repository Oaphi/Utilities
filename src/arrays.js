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