import chai from "chai";
const { expect } = chai;

import { buildTime } from "../src/dates.mjs";

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

});