import chai from "chai";
const { expect } = chai;

import { buildTime, offset } from "../src/dates.mjs";

describe('Dates', function () {

    describe('buildTime', function () {

        it('should default to 00:00 on no params', function () {
            const time = buildTime();
            expect(time).to.be.equal("00:00");
        });

        it('should overflow 60 minutes to an hour', function () {
            const time = buildTime({ minutes: 120 });
            expect(time).to.be.equal("02:00");
        });

        it('should leave the overflow minutes if hour fraction', function () {
            const time = buildTime({ minutes: 128 });
            expect(time).to.be.equal("02:08");
        });

    });

    describe('offset', function () {

        it('should correctly offset days', function () {
            const source = "2020-01-06";

            const date = offset({ date: source, period: "days", numberOf: 4 });
            expect(date.getDate()).to.equal( new Date(source).getDate() - 4);
        });

        it('should correctly offset months', function () {
            const source = "2010-06-01";

            const date = offset({ date: source, period: "months", numberOf: 5 });
            expect(date.getMonth()).to.equal(new Date(source).getMonth() - 5);
        });

        it('should correctly offset years', function () {
            const date = offset({ date: "2050-08-07", period: "years", numberOf: 42 });
            expect(date.getFullYear()).to.equal(2008);
        });

    });

});