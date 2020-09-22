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
 * @summary builds time string from hours and minutes config
 * @param {{
 *  hours?   : number
 *  minutes? : number
 * }}
 * @returns {string}
 */
const buildTime = ({
    hours = 0, 
    minutes = 0
} = {}) => {
    const over = minutes > 59 ? Math.floor(minutes / 60) || 1 : 0;

    const hh = hours + over;

    const mm = over ? minutes - ( over * 60 ) : minutes;

    return `${hh < 10 ? `0${hh}` : hh}:${mm < 10 ? `0${mm}` : mm}`;
};

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
    buildTime,
    dateDiff,
    toISO8601Timestamp,
    yesterday
};