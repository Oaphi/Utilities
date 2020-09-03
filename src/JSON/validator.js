(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Validator = factory();
    }
}(
    typeof self !== 'undefined' ? self : this,
    function () {

        /**
         * @summary validates JSON object
         * @param {object} schema
         */
        const validateJSON = (schema) =>

            /**
             * @param {object} json
             * @returns {boolean}
             */
            (json) => {
                try {

                    //draft 1: validates only top-level property
                    return Object.entries(json).every(entry => {
                        const [key, val] = entry;

                        if (typeof val === "object" && val !== null) {
                            return validateJSON(schema)(val);
                        }

                        const {
                            additionalProperties = true,
                            properties
                        } = schema;

                        const descriptor = properties[key];

                        //no descriptor and disallowed extra props -> invalid
                        if (!descriptor && !additionalProperties) {
                            return false;
                        }

                        //no descriptor and extra prop -> any valid
                        if (!descriptor) {
                            return true;
                        }

                        const {
                            enum: enumerable,
                            maxLength,
                            minLength,
                            type
                        } = descriptor;

                        const isEnumValid = enumerable ? enumerable.some(v => v === val) : true;

                        const isNullValid = type === null ? val === null : true;

                        const isTypeValid = type ? typeof val === type : true;

                        const isMinMaxValid = typeof val === "string" ? (
                            (!minLength || val.length >= minLength) &&
                            (!maxLength || val.length <= maxLength)
                        ) : true;

                        const isValid = isTypeValid && isNullValid && isEnumValid && isMinMaxValid;

                        return isValid;
                    });

                } catch (error) {
                    return false;
                }
            };

        return {
            validateJSON
        };

    }));