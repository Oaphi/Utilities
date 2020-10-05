/**
 * @typedef {object} EmphasisConfig
 * @property {HTMLInputElement} element
 * @property {string} [link]
 * @property {string} [target]
 * @property {("bold"|"italic"|"link"|"strike"|"underline")} type
 * 
 * @param {EmphasisConfig}
 * @returns {HTMLInputElement}
 */
const emphasizeSelectedText = ({ 
    element, 
    type = "italic", 
    target = "_self", 
    link 
}) => {

    const emphasis = new Map([
        ["italic", "em"],
        ["bold", "strong"],
        ["link", "a"],
        ["underline", "u"],
        ["strike", "s"]
    ]);

    const tag = emphasis.get(type);

    if (!tag) {
        return element;
    }

    const linkAttrs = type === "link" ? ` target="${target}" href="${link}"` : "";

    const { selectionStart, selectionEnd, value } = element;

    const selected = value.slice(selectionStart, selectionEnd);

    element.value = value.replace(selected, `<${tag}${linkAttrs}>${selected}</${tag}>`);
    
    return element;
};

/**
 * @description traverses children left to right, calling comparator on each one
 * until it evaluates to true, then calls the callback with first element passing 
 * the condition or with root itself if none
 * @param {HTMLElement} root 
 * @param {number} [offset]
 * @param {function(HTMLElement): boolean} comparator 
 * @param {function(HTMLElement)} [callback] 
 * @param {function(HTMLElement)} [fallback]
 * @param {boolean} [strict]
 */
function elementsRightUntil(root, offset, comparator, callback, fallback, strict = false) {

    if (typeof offset === "function") {
        fallback = callback;
        callback = comparator;
        comparator = offset;
        offset = 0;
    }

    if (typeof callback === "boolean") {
        strict = callback;
        callback = null;
    }

    if (typeof fallback === "boolean") {
        strict = fallback;
        fallback = null;
    }

    let current = root.children[offset] || (strict ? null : root);

    let matchedOnce = comparator(current) ? 1 : 0;

    let index = offset;

    if (!matchedOnce) {
        while (current.nextElementSibling) {
            index++;

            current = current.nextElementSibling;
            if (comparator(current)) {
                matchedOnce |= 1;
                break;
            }
        }
    }

    const use = matchedOnce ? callback : fallback;
    return use ? use(current, index) : current;
}

/**
 * @summary inverse of elementsRightUntil
 * @param {HTMLElement} root
 * @param {number} [offset]
 * @param {function(HTMLElement): boolean} comparator
 * @param {function(HTMLElement)} [callback]
 * @param {function(HTMLElement)} [fallback]
 * @param {boolean} [strict]
 */
function elementsLeftUntil(root, offset, comparator, callback, fallback, strict = false) {

    if (typeof offset === "function") {
        fallback = callback;
        callback = comparator;
        comparator = offset;
        offset = 0;
    }

    if (typeof callback === "boolean") {
        strict = callback;
        callback = null;
    }

    if (typeof fallback === "boolean") {
        strict = fallback;
        fallback = null;
    }

    const { children } = root;

    const lastIndex = children.length - 1 - offset;

    let current = children[lastIndex] || (strict ? null : root);

    let matchedOnce = comparator(current) ? 1 : 0;

    let index = lastIndex;

    if (!matchedOnce) {
        while (current.previousElementSibling) {
            index--;

            current = current.previousElementSibling;
            if (comparator(current)) {
                matchedOnce |= 1;
                break;
            }
        }
    }

    const use = matchedOnce ? callback : fallback;
    return use ? use(current, index) : current;
}

/**
 * @summary checks if some tokens are contained
 * @param {DOMTokenList} list
 */
const listContainsSome = (list) =>

    /**
     * @param {...string} [tokens]
     * @returns {boolean}
     */
    (...tokens) => {
        const boundContains = list.contains.bind(list);
        return tokens.some(boundContains);
    };

/**
 * @summary removes last child of Element
 * @param {Element} element
 * @returns {void}
 */
const removeLastChild = (element) => element.lastChild && element.lastChild.remove();

export {
    emphasizeSelectedText,
    elementsRightUntil,
    elementsLeftUntil,
    listContainsSome,
    removeLastChild
};