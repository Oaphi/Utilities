import chai from "chai";
const { expect } = chai;

import * as asynchronous from "../src/async.mjs";
const { waitAsync, forEachAwait } = asynchronous;

describe('forEachAwait', function () {

    it('should not fail on empty or empty source', function () {
        const runEmpty = () => forEachAwait([], () => {});
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