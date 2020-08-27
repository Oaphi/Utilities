import chai from "chai";
const { expect } = chai;

import { JSONtoQuery } from "../src/JSON/json.mjs";

describe('JSONtoQuery', function () {

    it('should convert empty object to empty string', function () {
        const query = JSONtoQuery({});
        expect(query).to.be.an.empty;
    });

    it('should correctly convert key-value pairs', function () {
        const query = JSONtoQuery({
            first: 1,
            second: "two",
            third: true
        });

        expect(query).to.equal("first=1&second=two&third=true");
    });

    it('should correctly convert keys with no values', function () {
        const query = JSONtoQuery({
            empty: undefined,
            nullable: null
        });

        expect(query).to.be.empty;
    });

    it('should convert objects to key[prop]=value sequence', function () {
        const query = JSONtoQuery({
            object: {
                one: 1,
                two: 2
            }
        });

        expect(query).to.equal("object[one]=1&object[two]=2");
    });

    it('should convert arrays to key[index]=value sequence', function () {
        const query = JSONtoQuery({
            array: ["alpha", "beta", "gamma"]
        });

        expect(query).to.equal("array[0]=alpha&array[1]=beta&array[2]=gamma");
    });

    describe('Config options', function () {
        it('should encodeURIComponent params if provided', function () {

            const query = JSONtoQuery({
                cid: 12345,
                dp: "/test/email"
            }, {
                encodeParams: true
            });

            expect(query).to.match(/%2Ftest%2Femail/);

        });

        it('should order keys if provided order', function () {

            const countDown = ["three", "two", "one"];

            const query = JSONtoQuery({
                one: 1,
                two: 2,
                three: 3,
                doesNotCount : 999
            }, {
                paramOrder: countDown
            });

            expect(query).to.equal("three=3&two=2&one=1&doesNotCount=999");
        });
    });

});