/**
 * @fileoverview Date utility functions
 * @author Oleg Valter
 * @license MIT
 */

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


export {
    toISO8601Timestamp
};