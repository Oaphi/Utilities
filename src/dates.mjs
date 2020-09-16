/**
 * @fileoverview Date utility functions
 * @author Oleg Valter
 * @license MIT
 */

/**
 * @summary calculates difference between 2 dates (in 24-hour based days)
 * @param {Date|number|string} a 
 * @param {Date|number|string} b 
 */
const dateDiff = (a, b) => Math.abs(Math.floor((new Date(a) - new Date(b)) / 864e5));

/**
 * @summary converts a date-like value to ISO 8601 timestamp
 * @param {number|string|Date} [date] 
 * @returns {string}
 */
const toISO8601Timestamp = (date = Date.now()) => {
    const parsed = new Date(date);

    const MIN_IN_HOUR = 60;

    const hours = parsed.getTimezoneOffset() / MIN_IN_HOUR;

    const fraction = (hours - Number.parseInt(hours)) * MIN_IN_HOUR;

    const sign = hours < 0 ? "-" : "+";

    const offset = `${sign}${`${Math.abs(hours)}`.padStart(2, "0")}:${`${fraction}`.padEnd(2, "0")}`;

    return parsed.toISOString().slice(0, -5) + offset;
};

/**
 * @summary offsets a date-like value to day before
 * @param {number|string|Date} [date]
 * @returns {Date}
 */
const yesterday = (date = Date.now()) => {
    const parsed = new Date(date);
    const MIL_IN_DAY = 864e5;
    return new Date(parsed - MIL_IN_DAY);
};

export {
    dateDiff,
    toISO8601Timestamp,
    yesterday
};