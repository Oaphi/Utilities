import bench from "benchmark";
import chai from "chai";
import sinon from "sinon";
import { cache } from "../src/caching.mjs";
const { expect } = chai;

describe('cache', function () {

    it('should cache results', function () {

        const slow = sinon.fake(() => new Array(1e6).fill(0).map(String));

        const cachableSlow = cache(slow);

        const suite = new bench.Suite("cache");

        const common = { maxTime: 0.2 };

        suite
            .add("first run", cachableSlow, common)
            .add("second run", cachableSlow, common)
            .on("complete", function () {
                const [first, second] = suite.map("times");

                expect(first.elapsed).to.be.greaterThan(second.elapsed);
            })
            .run();


    });

});