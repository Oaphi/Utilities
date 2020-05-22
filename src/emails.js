(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Emails = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    const Utilities = {};

    /**
     * @summary splits email address into domains
     * @param {string} email
     * @returns {string[]}
     */
    function smartEmailSplit(email) {

        const split = email.split('@') || [];

        const [ localPart, internetDomain ] = split;

        const partMatcher = /[!./+=%]/;

        const domains = internetDomain.split(partMatcher);

        const locals = localPart.split(partMatcher);

        domains.length > 1 && domains.pop();

        return locals.concat(domains).filter(Boolean).map(Utilities.toCase);
    }

    const registerCaseModifier = (modifier) => {
        if(typeof modifier === "function") {
            Utilities.toCase = modifier;
        }
    };

    return ({
        smartEmailSplit,
        registerCaseModifier
    });

}));