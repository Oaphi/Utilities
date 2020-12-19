/**
 * @summary searches an array for the element
 * @param {any[]} arr
 * @param {any} el
 * @param {function(number,any,any[])} action
 */
const binarySearch = (arr, el, action) => {
    const { length } = arr;

    if (length === 0) { //if no elements -> not found
        return action(-1, el, arr);
    }

    const pivot = Math.floor(length / 2), pivotEl = arr[pivot];

    if (pivotEl === el) { //already found -> exit early
        return action(pivot, el, arr);
    }

    const l = arr.slice(0, pivot), r = arr.slice(pivot, length);

    return binarySearch(pivotEl < el ? l : r); //recurse on array part
};


export { binarySearch };

