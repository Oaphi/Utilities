(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Headers = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * @summary maps headers to headers object
     * @param {string} [headers]
     * @returns {Object.<string, string>}
     */
    const mapResponseHeaders = (headers = "") => {

        const split = headers.split(/[\r\n]+/);

        const headerMap = {};

        if (!headers) {
            return headerMap;
        }

        for (const header of split) {
            const data = header.trim().split(': ');

            const name = data.shift();

            if(name) {
                const value = data.join(': ');
                headerMap[name] = value;

                if (/\-/.test(name)) {
                    const snakeCase = name
                        .split("-")
                        .map((part) => {
                            const fchar = part[0];

                            return part.length > 1 ? fchar.toUpperCase() + part.slice(1) : part;
                        })
                        .join("");

                    headerMap[snakeCase] = value;
                }
            }

        }

        return headerMap;
    };

    return {
        mapResponseHeaders
    };

}));
