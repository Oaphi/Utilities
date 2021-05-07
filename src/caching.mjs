const cache = (callback) => {
    const cache = Object.create(null);

    return (thisObj, ...params) => {
        const { name } = callback;

        if (name in cache) {
            return cache[name];
        }

        return callback.apply(thisObj, params);
    };
};

export {
    cache
};

