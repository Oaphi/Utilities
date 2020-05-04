(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AppendQueue = factory();
    }
}(
    typeof self !== 'undefined' ? self : this,
    function () {

        /**
         * @summary wrapper around promise of HTMLElement
         * @class
         */
        class AsyncAppendable {

			/**
			 * @param {Promise<HTMLElement>} promise
             * @param {AsyncAppendQueue} queue
             * @param {function} callback
			 * @param {number} [index]
			 */
            constructor(promise, queue, callback, index = 0) {
                this.promise = promise;
                this.index = index;
                this.queue = queue;

                this.callback = callback;

                promise
                    .then(res => {

                        const { callback, index } = this;

                        res.weight = index;

                        const { root } = queue;
                        const { children } = root;
                        const { length } = children;

                        if (!length) {
                            root.append(res);
                            callback && callback(res);
                            return res;
                        }

                        elementsLeftUntil(
                            root,
                            (elem) => elem.weight < index,

                            (matched, idx) => elementsRightUntil(
                                root,
                                idx,
                                (elem) => elem.weight > index,
                                elem => elem.before(res),
                                () => matched.after(res)
                            ),

                            () => elementsRightUntil(
                                root,

                                elem => elem.weight > index,

                                (matched, idx) => elementsLeftUntil(
                                    root,
                                    idx,
                                    elem => elem.weight < index,
                                    elem => elem.after(res),
                                    () => matched.before(res)
                                )

                            )

                        );

                        callback && callback(res);
                        return res;
                    });

            }

        }


        /**
         * @summary queue controller
         * @class
         */
        class AsyncAppendQueue {

            /**
             * @param {HTMLElement} root 
             */
            constructor(root) {

                /** @type {AsyncAppendable[]} */
                this.promises = [];

                this.root = root;
            }

            /**
             * @summary enqueues promise of HTMLElement
             * @param {Promise<HTMLElement>} promise 
             * @param {function} callback
             * @returns {AsyncAppendQueue}
             */
            enqueue(promise, callback) {
                const { promises } = this;

                const { length } = promises;

                const prepared = new AsyncAppendable(promise, this, callback, length);

                promises.push(prepared);
                return this;
            }

            /**
             * @summary clears promise queue
             * @returns {AsyncAppendQueue}
             */
            clear() {
                const { promises } = this;
                promises.length = 0;
                return this;
            }

        }

        return AsyncAppendQueue;

    }));