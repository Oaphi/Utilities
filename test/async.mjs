import chai from "chai";
const { expect } = chai;

import * as asynchronous from "../src/async.mjs";
const { waitAsync, forEachAwait, forAwait } = asynchronous;

describe('forAwait', function () {

    it('should preserve execution order', function () {

        const values = [1, 2, 3, 4, 5];

        let testI = 0;

        forAwait(values, async (value, i, source) => {
            await waitAsync({ ms: 1e3 });
            expect(source).to.deep.equal(values);
            expect(value).to.equal(values[i]);
            expect(i).to.equal(testI++);
        });

    });

});

describe('forEachAwait', function () {

    it('should not fail on empty or empty source', function () {
        const runEmpty = () => forEachAwait([], () => { });
        expect(runEmpty).to.not.throw();
    });

    it('should iterate over results in order', function () {

        let testI = 0;

        const callback = () => testI;

        const promises = [
            waitAsync({ ms: 50, callback }),
            waitAsync({ ms: 20, callback }),
            waitAsync({ ms: 35, callback })
        ];

        forEachAwait(promises, (result, i, source) => {
            expect(source).to.deep.equal(promises);
            expect(i).to.equal(testI++);
        });
    });

});