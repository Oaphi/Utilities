const backoffSync = (
  callback,
  { comparator, scheduler, retries = 3, threshold = 50, thisObj = null }
) => {
  return (...params) => {
    let exponent = 0;

    do {
      const response = callback.apply(thisObj, params);

      if (comparator(response) === true) {
        return response;
      }

      retries -= 1;

      scheduler(2 ** exponent * threshold);

      exponent += 1;

    } while (retries);
  };
};

/**
 *
 * @param {function} callback
 * @param {{
 *  comparator : (res: any) => boolean,
 *  scheduler : (t: number) => Promise<void>,
 *  retries ?: number,
 *  threshold ?: number,
 *  thisObj ?: any
 * }} options
 */
const backoffAsync = (
  callback,
  { comparator, scheduler, retries = 3, threshold = 50, thisObj = null }
) => {
  return async (...params) => {
    let exp = 0;

    do {

      const res = await callback.apply(thisObj, params);

      if (comparator(res) === true) {
        return res;
      }

      retries -= 1;

      await scheduler(2 ** exp * threshold);

      exp += 1;

    } while (retries);

  };
};

const totalBackoff = (threshold, calls, start = 0) => new Array(calls).fill(threshold).reduce((a, c, i) => a + 2 ** (i + start) * c, 0);

export {
  backoffSync,
  backoffAsync,
  totalBackoff
};

