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
            const time = buildTime({ minutes : 120 });
            expect(time).to.be.equal("02:00");
        });

        it('should leave the overflow minutes if hour fraction', function () {
            const time = buildTime({ minutes : 128 });
            expect(time).to.be.equal("02:08");
        });

    });

    describe('offset', function () {
        
        it('should correctly offset days', function () {
            const date = offset({ date : "2020-01-06", period : "days", numberOf : 5 });
            expect(date.toISOString().slice(0,10)).to.equal("2020-01-01");
        });

        it('should correctly offset months', function () {
            const date = offset({ date : "2010-06-01", period : "months", numberOf : 5 });
            expect(date.toISOString().slice(0,10)).to.equal("2009-12-31");
        });

        it('should correctly offset years', function () {
            const date = offset({ date : "2050-08-07", period : "years", numberOf : 42 });
            expect(date.toISOString().slice(0, 10)).to.equal("2008-08-07");
        });

    });

});