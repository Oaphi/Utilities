
/**
 * @summary recursive parser
 * @param {string[]} order
 * @param {[string, any][]} entries 
 * @param {boolean} encode
 * @param {string} seq
 * @returns {string}
 */
const deep = (order, entries, encode, seq) => entries
    .map(entry => {
        const [key, value] = entry;

        const seqOrSingleKey = `${seq ? `${seq}[${key}]` : key}`;

        if (value === null) {
            return;
        }

        if (typeof value === "object") {
            return deep(order, Object.entries(value), encode, seqOrSingleKey);
        }

        if (value !== undefined) {
            const encoded = encode ? encodeURIComponent(value) : value;
            return `${seqOrSingleKey}=${encoded}`;
        }
    })
    .filter(val => val !== undefined)
    .join("&");

/**
 * @typedef {object} JSONtoQueryConfig
 * @property {boolean} [encodeParams=false]
 * @property {string[]} [paramOrder=[]]
 */

/**
 * @summary converts object to query
 * @param {object} json parameters
 * @param {JSONtoQueryConfig} [config]
 * @returns {string} query string
 */
function JSONtoQuery(
    json,
    {
        encodeParams,
        paramOrder = []
    } = config = {
        encodeParams: false,
        paramOrder: []
    }
) {

    const ordered = [];

    Object
        .entries(json)
        .forEach((entry) => {
            const [key] = entry;

            const orderIndex = paramOrder.indexOf(key);

            if (orderIndex > -1) {
                ordered[orderIndex] = entry;
                return;
            }

            ordered.push(entry);
        });

    return deep(paramOrder, ordered, encodeParams);
}

export default {
    JSONtoQuery
};