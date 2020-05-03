/**
 * @summary runs a function several times
 * @param {number} [num] 
 */
const runUntil = (num = 1) =>

	/**
	 * @param {function} callback
	 */
    (callback, ...args) => {

        let i = 0;
        while (i < num) {
            callback(i, ...args);
            i++;
        }
    };

module.exports = {
    runUntil
};