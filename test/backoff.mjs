import chai from "chai";
import sinon from "sinon";
import { backoffAsync, backoffSync, totalBackoff } from "../src/backoff.mjs";
const { expect } = chai;

describe('totalBackoff', function () {

    it('should correctly sum backoffs', function () {

        const total = totalBackoff(100, 5);

        expect(total).to.eq(3100);
    });

    it('should offset backoff if need be', function () {

        const total = totalBackoff(100, 5, 3);

        expect(total).to.eq(24800);
    });

});

describe('backoffSync', function () {

    it('should retry backoff if retryOnError specified', function () {
        const testErrMsg = "just throw it";

        const func = sinon.stub().throwsException(new Error(testErrMsg));

        const errHandler = sinon.fake();

        try {
            const backoffable = backoffSync(func, {
                comparator: () => true,
                retryOnError: true,
                retries: 1,
                onError: errHandler
            });

            backoffable();
        } catch (error) {
            expect(errHandler.calledTwice).to.be.true;
            expect(func.calledTwice).to.be.true;
            expect(errHandler.args[0][0]).to.be.an.instanceof(Error).and.property("message", testErrMsg);
        }
    });

});

describe('backoffAsync', function () {

    let clock = null;

    this.beforeEach(function () {
        clock = sinon.useFakeTimers();
    });

    this.afterEach(function () {
        clock && clock.restore();
    });

    it('should forward thisObj', async function () {

        const obj = {
            count: 0,
            method() {
                this.count += 1;
                return true; //important to stop backoff
            }
        };

        const backoffable = backoffAsync(obj.method, {
            comparator: () => true,
            scheduler: sinon.stub().resolves(),
            thisObj: obj
        });

        await backoffable();

        expect(obj.count).to.eq(1);
    });

    it('should fire backoff hook before each retry', async function () {

        const cbk = sinon.stub().resolves(false);
        const hook = sinon.fake();

        const backoffable = backoffAsync(cbk, {
            comparator: () => false,
            scheduler: sinon.stub().resolves(),
            onBeforeBackoff: hook
        });

        await backoffable();

    });

    it('should return immediately on success', async function () {

        const scheduler = sinon.stub().resolves();

        const backoffConfig = {
            comparator: (res) => res === true,
            scheduler
        };

        const cbk = async () => {
            await clock.tickAsync(1e3);
            return true;
        };

        const spied = sinon.spy(cbk);

        const backableReq = backoffAsync(spied, backoffConfig);

        await backableReq();

        expect(spied.calledOnce).to.be.true;
        expect(clock.now).to.equal(1e3);
        expect(scheduler.notCalled).to.be.true;
    });

    it('should retry number of times on failure and call scheduler with correct threshold', async function () {
        let calls = 3, wait = 1e3;

        const cbk = sinon.spy(async () => {
            await clock.tickAsync(wait);
            return cbk.callCount > calls;
        });

        const scheduler = sinon.spy(async (waitArg) => {
            await clock.tickAsync(waitArg);
        });

        const config = {
            comparator: (res) => res === true,
            scheduler,
            threshold: 100
        };

        const backable = backoffAsync(cbk, config);

        await backable();

        expect(scheduler.calledWith(config.threshold)).to.be.true;
        expect(scheduler.callCount).to.equal(calls);
        expect(clock.now).to.equal(wait * calls + totalBackoff(config.threshold, calls));
    });
});