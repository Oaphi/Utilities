const chai = require("chai");

chai.use(require("chai-as-promised"));

const { expect } = chai;

const { ExtendedPromise } = require("../src/promises.js");

describe('ExtendedPromise', function () {

    const makePromise = (callback) => new ExtendedPromise(callback);

    it('should return a Promise', function () {
        const promise = makePromise((r, j) => r(42));
        expect(promise).to.be.an.instanceOf(Promise);
        expect(promise).to.be.an.instanceOf(ExtendedPromise);
    });

    it('should have then, catch, finally', function () {
        const promise = makePromise((r, j) => r(42));
        expect(typeof promise.then === "function").to.be.true;
        expect(typeof promise.catch === "function").to.be.true;
    });

    it('pending should be true at init, others false', function () {
        const promise = makePromise((r, j) => setTimeout(r, 100));
        expect(promise.pending).to.be.true;
        expect(promise.fulfilled).to.be.false;
        expect(promise.rejected).to.be.false;
        expect(promise.settled).to.be.false;
    });

    it('fulfilled should be true on resolve, others false', async function () {
        const promise = makePromise((r, j) => setTimeout(r, 100));

        await promise;

        expect(promise.fulfilled).to.be.true;
        expect(promise.pending).to.be.false;
        expect(promise.rejected).to.be.false;
    });

    it('rejected should be true on reject', function () {
        const promise = makePromise((r, j) => setTimeout(j, 100));
        return expect(promise).to.eventually.be.rejected;
    });

    it('should resolve to a specified value', function () {
        const promise = makePromise((r, j) => setTimeout(() => r(42), 100));
        return expect(promise).to.eventually.become(42);
    });

    it('should expose "value" after resolving', async function () {
        const promise = makePromise((r, j) => setTimeout(() => r(42), 100));

        await promise;

        expect(promise.value).to.equal(42);
    });

    it('should become settled after resolved or rejected', async function () {

        const willResolve = makePromise((r, j) => r());
        const willReject = makePromise((r, j) => j()).catch(() => {});

        await Promise.all([willReject,willResolve]);

        expect(willResolve).to.have.property("settled",true);
        expect(willReject).to.have.property("settled",true);
    });

});