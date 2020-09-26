
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
 * 
 * @summary converts object to query
 * @param {object} json parameters
 * @param {JSONtoQueryConfig}
 * @returns {string} query string
 */
function JSONtoQuery(
    json,
    {
        encodeParams,
        paramOrder = []
    } = {
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

/**
 * @typedef {{
 *  key : string,
 *  obj : object,
 *  objectNotation : ("bracket"|"dot"),
 *  arrType : ("bracket"|"empty_bracket"|"comma")
 * }} ExpandParams
 * 
 * @summary expands object to parameter array
 * @param {ExpandParams}
 * @returns {string[]}
 */
const expandObjectToParams = ({
    key, obj,
    encode = true,
    objectNotation = "bracket",
    arrayNotation = "bracket"
}) => {

    const paramMap = new Map([
        ["bracket", (k, v) => `${key}[${k}]=${v}`],
        ["comma", (k, v) => v],
        ["dot", (k, v) => `${key}.${k}=${v}`],
        ["empty_bracket", (k, v) => `${key}[]=${v}`]
    ]);

    const isArr = Array.isArray(obj);

    if (isArr && arrayNotation === "comma") {
        return [`${key}=${obj.map(
            elem => typeof elem === "object" && elem ?
                expandObjectToParams({ 
                    key, obj: elem, 
                    objectNotation, 
                    arrayNotation
                }) :
                elem
        ).flat().join(",")}`];
    }

    const ambientParamType = isArr ? arrayNotation : objectNotation;

    return Object.entries(obj)
        .map(([k, v]) => {

            if (v === null || v === undefined) { return; }

            const isObj = typeof v === "object" && v;

            if (isObj) {
                return expandObjectToParams({
                    key: k, obj: v,
                    objectNotation,
                    arrayNotation
                });
            }

            const encoded = encode ? encodeURIComponent(v) : v;

            return paramMap.has(ambientParamType) ?
                paramMap.get(ambientParamType)(k, encoded) :
                encoded;
        })
        .flat();
};

/**
 * @summary customizable converter from object to query string
 * 
 * @param {object} source
 * @param {{
 *  arrayNotation? : ("comma"|"bracket"|"empty_bracket"),
 *  encode?        : boolean,
 *  objectNotation?: ("bracket"|"dot")
 * }}
 * 
 * @returns {string}
 */
const objectToQuery = (source, {
    arrayNotation = "bracket",
    objectNotation = "bracket",
    encode = true
} = {}) => {

    const output = [];

    Object.entries(source).forEach(([key, val]) => {

        if (val === null || val === undefined) { return; }

        const isObj = typeof val === "object" && val;

        if (isObj) {
            const objParams = expandObjectToParams({
                key, obj : val, 
                objectNotation, 
                arrayNotation,
                encode
            });
            return output.push(...objParams);
        }

        output.push(`${key}=${val}`);
    });

    return output.join("&");
};

export {
    objectToQuery,
    JSONtoQuery
};