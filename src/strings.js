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
                return code < 65 && code > 90;
            });
    };

    return {
        isLcase
    };

}));