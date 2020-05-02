/**
 * @summary Makes an inspectable Promise
 */
class ExtendedPromise extends Promise {

    /**
     * @param {function(function, function)} executor
     */
    constructor(executor) {

        const privates = {
            fulfilled: false,
            pending: true,
            rejected: false
        };

        super((resolve, reject) => {
            executor(
                res => {
                    privates.fulfilled = true;
                    privates.pending = false;
                    resolve(res);
                },
                err => {
                    privates.rejected = true;
                    privates.pending = false;
                    reject(err);
                }
            );
        });

        Object.defineProperties(this, {
            fulfilled: {
                configurable: false,
                get () {
                    return privates.fulfilled;
                }
            },
            pending: {
                configurable: false,
                get () {
                    return privates.pending;
                }
            },
            rejected: {
                configurable: false,
                get () {
                    return privates.rejected;
                }
            }
        });

    }

}

module.exports = {
    ExtendedPromise
};