/**
 * @typedef {{
 *  contentType : ("application/json"),
 *  domain : string,
 *  method : ("GET"|"POST"|"PUT"|"DELETE"|"OPTIONS"),
 *  redirect : (boolean|true),
 *  paths : string[],
 *  payload : (Object.<string, any>|undefined),
 *  subdomains : string[],
 *  query : Object.<string, string>
 * }} FetchSettings
 * 
 * @typedef {{
 *  base : string,
 *  domain : string,
 *  method : ("GET"|"POST"|"PUT"|"DELETE"|"OPTIONS"),
 *  path : string,
 *  paths : string[],
 *  payload : (string|object|null),
 *  search : string,
 *  subdomains : string[],
 *  type : ("application/json"|"multipart/form-data"|"text/plain"|"application/x-www-form-urlencoded"),
 *  query : Object.<string, string>,
 *  url : string,
 *  addHeader : function (string, string) : FetchConfigurer,
 *  addHeaders : function (Object.<string, string>) : FetchConfigurer,
 *  addParam : function (string, any) : FetchConfigurer,
 *  addPaths : function (...string) : FetchConfigurer,
 *  getJSONPayload : function () : string,
 *  getUrlPayload : function () : string, 
 *  removeHeader : function (string) : FetchConfigurer,
 *  json : function (Object.<string, string>) : object
 * }} FetchConfigurer
 * 
 * @summary configures request
 * @param {FetchSettings}
 * @returns {FetchConfigurer}
 */
function FetchConfig({
    contentType = "application/json",
    domain,
    method = "GET",
    subdomains = [],
    payload = null,
    redirect = true,
    paths = [],
    query
} = {}) {

    const AllowedMethods = new Set([
        "GET", "POST", "PUT", "DELETE", "OPTIONS"
    ]);

    const AllowedTypes = new Set([
        "application/json",
        "multipart/form-data",
        "text/plain",
        "application/x-www-form-urlencoded"
    ]);

    const fetch = {
        method,
        payload,
        redirect,
        type: contentType
    };

    const headers = new Map([
        ["Content-Type", contentType]
    ]);

    /**
     * @summary generic configurer prepare utility
     * @param {FetchConfigurer} configurer
     * @param {Object.<string,string>} mapping 
     * @returns {object}
     */
    const prepareConfig = (configurer, mapping) => {

        const { method, url } = configurer;

        const { redirect } = fetch;

        const config = {};

        if (!mapping) {
            config.method = method;
            config.headers = Object.fromEntries(headers);
            config.redirect = redirect ? "follow" : "manual"; //default to Fetch API choice
            config.url = url;

            return config;
        }

        Object.entries(mapping)
            .forEach(
                ([mappedKey, mapTo]) => config[mapTo] = mappedKey in this ?
                    this[mappedKey] :
                    fetch[mappedKey]
            );

        return config;
    };

    const configurer = Object.seal({
        domain,
        headers,
        paths,
        subdomains,
        query,

        /**
         * @summary getter for full base URI
         * @returns {string}
         */
        get base() {
            const { subdomains, domain } = this;
            const base = [...subdomains, domain];
            return base.join(".");
        },

        /**
         * @summary getter for method
         * @returns {string}
         */
        get method() {
            const { method } = fetch;
            return method;
        },

        /**
         * @summary setter for method
         * @param {("GET"|"POST"|"PUT"|"DELETE"|"OPTIONS")} newMethod
         * @returns {string}
         */
        set method(newMethod) {

            const ucased = newMethod.toUpperCase();

            const validated = AllowedMethods.has(ucased) ? ucased : "GET";

            return (fetch.method = validated);
        },

        /**
         * @summary getter for full path
         * @returns {string}
         */
        get path() {
            const { paths } = this;
            const path = paths.join("/");
            return path ? `/${path}` : "";
        },

        /**
         * @summary payload getter (if method is not GET)
         * @returns {?(string|object)}
         */
        get payload() {
            const { method, payload } = fetch;
            return method !== "GET" ? payload : null;
        },

        /**
         * @summary setter for payload
         * @param {object} value
         * @returns {object}
         */
        set payload(value) {

            if (value === undefined || value === null) {
                return value;
            }

            const { method } = this;

            fetch.payload = value;

            if (method === "GET") {
                this.method = "POST";
            }

            return value;
        },

        /**
         * @summary getter for query string (including "?")
         * @returns {string}
         */
        get search() {
            const { query } = this;
            return query ? `?${FetchConfig.toQuery(query)}` : "";
        },

        /**
         * @summary getter for content type
         * @returns {string}
         */
        get type() {
            const { type } = fetch;
            return type;
        },

        /**
         * @summary setter for content type
         * @param {string} value
         * @returns {string}
         */
        set type(value) {

            const validType = AllowedTypes.has(value) ? value : "application/json";

            fetch.type = validType;

            headers.set("Content-Type", validType);

            return value;
        },

        /**
         * @summary getter for full URI (https only)
         * @returns {string}
         */
        get url() {
            const { base, path, search } = this;
            const protocol = /^https:\/\//.test(base) ? "" : "https://";
            return `${protocol}${base}${path}${search}`;
        },

        /**
         * @summary add header to list of headers
         * @param {string} key 
         * @param {string} value
         */
        addHeader(key, value) {
            headers.set(key, value);
            return this;
        },

        /**
         * @summary adds headers from map
         * @param {object} [mapper] 
         */
        addHeaders(mapper = {}) {

            Object
                .entries(mapper)
                .forEach(([name, val]) => {
                    headers.set(name, val);
                });

            return this;
        },

        /**
         * @summary removes a header
         * @param {string} key 
         */
        removeHeader(key) {
            headers.delete(key);
            return this;
        },

        /**
         * @summary gets payload as x-www-form-urlencoded
         * @returns {string}
         */
        getUrlPayload() {
            const { payload } = this;

            const form = FetchConfig.toQuery(payload);
            const encoded = encodeURI(form);

            /** @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI} */
            return encoded.replace(/\%5(B|D)/g, (full, type) => type === "B" ? "[" : "]");
        },

        /**
         * @summary gets payload as application/json
         * @returns {string}
         */
        getJSONPayload() {
            const { payload } = this;
            return payload ? JSON.stringify(payload) : "";
        },

        /**
         * @summary adds parameter to query
         * @param {string} key 
         * @param {*} value 
         * @returns {FetchAppConfigurer}
         */
        addParam(key, value) {
            const { query } = this;

            this.query = FetchConfig.union(query, { [key]: value });

            return this;
        },

        /**
         * @summary adds path part
         * @param {...string} pathsToAdd 
         * @returns {FetchAppConfigurer}
         */
        addPaths(...pathsToAdd) {
            const { paths } = this;
            paths.push(...pathsToAdd);
            return this;
        },

        /**
         * @summary prepares config as JSON
         * @param {Object.<string, string>} [mapping]
         * @returns {object}
         */
        json(mapping) {

            const config = prepareConfig(this, mapping);

            const { method } = this;

            if (method === "GET") { return config; }

            const payload = this.getJSONPayload();

            const shouldMap = mapping && "payload" in mapping;

            shouldMap &&
                (config[mapping.payload] = payload) ||
                (config.body = payload);

            return config;
        }
    });

    configurer.method = method;
    configurer.payload = payload;

    return configurer;
}

/**
 * @summary sets object union utility
 * @param {function (object, ...object) : object} unionizer
 * @returns {FetchConfig}
 */
FetchConfig.setUnionizer = function (unionizer) {

    console.log("injected object union dependency");

    Object.defineProperty(FetchConfig, "union", {
        configurable: false,
        writable: false,
        value: unionizer
    });

    return FetchConfig;
};

/**
 * @summary sets JSON to query dependency
 * @param {function (object) : string} jsonToQueryUtil 
 * @returns {FetchConfig}
 */
FetchConfig.setToQuery = function (jsonToQueryUtil) {

    console.log("injected JSON to query dependency");

    Object.defineProperty(FetchConfig, "toQuery", {
        configurable: false,
        writable: false,
        value: jsonToQueryUtil
    });

    return FetchConfig;
};

export {
    FetchConfig
};