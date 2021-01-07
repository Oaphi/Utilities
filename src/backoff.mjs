const backoffSync = (
  callback,
  {
    comparator,
    scheduler,
    retries = 3,
    threshold = 50,
    retryOnError = false,
    thisObj = null,
    onBeforeBackoff,
    onError = console.warn
  }
) => {
  return (...params) => {
    let exp = 0, errRetries = retries + 1;

    do {

      try {

        const response = callback.apply(thisObj, params);

        if (comparator(response) === true) {
          return response;
        }

        onBeforeBackoff && onBeforeBackoff(retries, exp, threshold);

        retries -= 1;

        scheduler(2 ** exp * threshold);

        exp += 1;

      } catch (error) {
        onError(error);

        errRetries -= 1;

        if (!retryOnError || errRetries < 1) {
          throw error;
        }
      }

    } while (retries > 0);
  };
};

/**
 *
 * @param {function} callback
 * @param {{
 *  comparator : (res: any) => boolean,
 *  scheduler : (t: number) => Promise<void>,
 *  onBeforeBackoff ?: (r: number, exp: number, t: number) => any,
 *  retries ?: number,
 *  threshold ?: number,
 *  thisObj ?: any
 * }} options
 */
const backoffAsync = (
  callback,
  { comparator, scheduler, retries = 3, threshold = 50, thisObj = null, onBeforeBackoff }
) => {
  return async (...params) => {
    let exp = 0;

    do {

      const res = await callback.apply(thisObj, params);

      if (comparator(res) === true) {
        return res;
      }

      onBeforeBackoff && onBeforeBackoff(retries, exp, threshold);

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

