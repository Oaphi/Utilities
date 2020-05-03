

/**
 * @description traverses children left to right, calling comparator on each one
 * until it evaluates to true, then calls the callback with first element passing 
 * the condition or with root itself if none
 * @param {HTMLElement} root 
 * @param {function(HTMLElement): boolean} comparator 
 * @param {function(HTMLElement)} [callback] 
 */
function elementsRightUntil(root, comparator, callback) {

    let current = root.firstElementChild || root;

    while (current.nextElementSibling) {
        if (!comparator(current)) {
            current = current.nextElementSibling;
            continue;
        }
        break;
    }

    return callback ? callback(current) : current;
}

/**
 * @summary inverse of elementsRightUntil
 * @param {HTMLElement} root
 * @param {function(HTMLElement): boolean} comparator
 * @param {function(HTMLElement)} [callback]
 */
function elementsLeftUntil(root, comparator, callback) {

    let current = root.lastElementChild || root;

    while (current.previousElementSibling) {
        if (!comparator(current)) {
            current = current.previousElementSibling;
            continue;
        }
        break;
    }

    return callback ? callback(current) : current;
}

module.exports = {
    elementsRightUntil,
    elementsLeftUntil
}