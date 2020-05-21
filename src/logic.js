(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Logic = factory();
    }
}(
    typeof self !== 'undefined' ? self : this,
    function () {

        /**
         * @summary ANDs lists of values
         * 
         * @description
         * For inputs of any size, fails if any of inputs are false
         *     
         *     | A | B | AND |
         *     | 0 | 0 | 0   |
         *     | 0 | 1 | 0   |
         *     | 1 | 0 | 0   |
         *     | 1 | 1 | 1   |
         * 
         * Due to being vacuously truthy, no arguments should produce`true`: \
         * ∀ arg: P (arg) => Q (arg) && ∀ arg: ¬ P (arg)
         * 
         * @param  {...any} [args]
         * @returns {boolean}
         */
        const AND = (...args) => args.every(Boolean);

        /**
         * @summary NANDs lists of values
         * 
         * @description
         * For inputs of any size, fails only if not all inputs are true
         * 
         *     | A | B | NAND |
         *     | 0 | 0 | 1    |
         *     | 0 | 1 | 1    |
         *     | 1 | 0 | 1    |
         *     | 1 | 1 | 0    |
         * 
         * Due to being vacuously truthy, no arguments should produce `true`: \
         * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
         * 
         * De Morgan's law:
         * 
         * Negation of conjunction: !A && !B === !(A + B)
         * 
         * @param  {...any} args 
         * @returns {boolean}
         */
        const NAND = (...args) => args.reduce((previous, current) => !AND(previous, current), true);

        /**
         * @summary ORs lists of values
         * 
         * @description
         * For inputs of any size, succeeds if any of the inputs are true
         * 
         *     | A | B | OR |
         *     | 0 | 0 | 0  |
         *     | 0 | 1 | 1  |
         *     | 1 | 0 | 1  |
         *     | 1 | 1 | 1  |
         * 
         * Due to being vacuously truthy, no arguments should produce `true`: \
         * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
         * 
         * @param  {...any} [args]
         * @returns {boolean}
         */
        const OR = (...args) => args.length ? args.some(Boolean) : true;

        /**
         * @summary NORs lists of values
         * 
         * @description
         * For inputs of any size, succeeds only if all inputs false
         * 
         *     | A | B | NOR |
         *     | 0 | 0 | 1   |
         *     | 0 | 1 | 0   |
         *     | 1 | 0 | 0   |
         *     | 1 | 1 | 0   |
         * 
         * Due to being vacuously truthy, no arguments should produce `true`: \
         * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
         * 
         * De Morgan's law:
         * 
         * Negation of disjunction: !A && !B === !(A + B)
         * 
         * @param  {...any} args 
         * @returns {boolean}
         */
        const NOR = (...args) => args.reduce((previous, current) => !OR(previous, current), true);

        /**
         * @summary XORs lists of values
         * 
         *  @description
         * For inputs > 2, proper XOR is several of XOR gates with result of binary XOR and new input
         * 
         *     | A | B | XOR |
         *     | 0 | 0 | 0   |
         *     | 0 | 1 | 1   |
         *     | 1 | 0 | 1   |
         *     | 1 | 1 | 0   |
         * 
         * Due to being vacuously truthy, no arguments should produce `true`: \
         * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
         * 
         * To be different from one-hot switch, XOR for more than 2 inputs \
         * should be a stacked instead of reducing XOR
         * 
         * @param  {...any} [args]
         * @returns {boolean}
         */
        const XOR = (...args) => {

            const { length } = args;

            if (!length) {
                return true;
            }

            if (length === 1) {
                return !!args[0];
            }

            const [curr, next] = args;

            const xored = OR(curr, next) && OR(!curr, !next);

            return XOR(xored, ...args.slice(2));
        };

        /**
         * @summary XNORs lists of values
         * 
         * @description
         * 
         * XNOR acts as an equivalence gate
         * 
         *     | A | B | XNOR |
         *     | 0 | 0 | 1    |
         *     | 0 | 1 | 0    |
         *     | 1 | 0 | 0    |
         *     | 1 | 1 | 1    |
         * 
         * XNOR = inverse of NOR
         * 
         * 
         * @param  {...any} args 
         * @returns {boolean}
         */
        const XNOR = (...args) => args.length ? !XOR(...args) : true;

        return {
            AND,
            NAND,
            NOR,
            OR,
            XNOR,
            XOR
        };

    }));