import chai from "chai";
const { expect } = chai;

import * as asynchronous from "../src/async.mjs";
const { waitAsync, forEachAwait, forAwait, withInterval } = asynchronous;

describe('withInterval', function () {

    it('should delay execution correctly', async function () {
        let i = 0;

        const init = Date.now();

        await withInterval({ interval: 1e3, callback: () => i++ });

        const now = Date.now();

        expect(now - init).to.be.above(1e3);
        expect(i).to.equal(1);
    });

    it('should repeat specified number of times', async function () {

        this.timeout(4e3);

        let i = 0;

        const init = Date.now();

        await withInterval({ interval: 1001, callback: () => i++, times : 3 });

        const now = Date.now();

        expect(now - init).to.be.above(3e3);
        expect(i).to.equal(3);
    });

    it('should stop upon matching condition', async function () {
        
        this.timeout(4e3);

        let i = 0;

        await withInterval({ 
            interval : 1e3, 
            callback : () => ++i, 
            times : Infinity,
            stopIf : (r) => r > 1 
        });

        expect(i).to.equal(2);

    });

});

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