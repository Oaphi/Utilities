
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.returnExports = factory();
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

        return {
            elementsRightUntil,
            elementsLeftUntil
        };

    }));