import chai from "chai";
const { expect } = chai;

import { JSONtoQuery } from "../src/JSON/json.mjs";

import { union } from "../src/objects.mjs";

import { FetchConfig } from '../src/fetch/fetch.mjs';

describe('FetchConfig', function () {

    FetchConfig
        .setToQuery(JSONtoQuery)
        .setUnionizer(union);

    it('should default to get method', function () {

        const { method } = new FetchConfig({
            url: "https://google.com"
        });

        expect(method).to.equal("GET");
    });

    it('setting type should set Content-Type header', function () {

        const testType = "application/x-www-form-urlencoded";

        const { headers, type } = new FetchConfig({ contentType: testType });

        const actualType = headers.get("Content-Type");

        expect(type).to.equal(testType);
        expect(actualType).to.equal(testType);
    });

    it('should set payload for POST request configs', function () {

        const { method, payload } = new FetchConfig({
            payload: {
                lines: 1
            }
        });

        expect(method).to.equal("POST");
        expect(payload).to.be.an.instanceof(Object);
        expect(payload.lines).to.equal(1);
    });

    describe("getJSONPayload", function () {

        it('should format payload correctly', function () {

            const pie = new FetchConfig({
                payload: {
                    apples: 5
                }
            });

            const payload = pie.getJSONPayload();
            expect(payload).to.equal("{\"apples\":5}");
        });

    });

    describe("getUrlPayload", function () {

        it('should format payload correctly', function () {

            const juice = new FetchConfig({
                payload: {
                    oranges: 5,
                    extras: {
                        cinnamon: 0,
                        sugar: 1
                    },
                    vitamins: ["A", "C"]
                }
            });

            const payload = juice.getUrlPayload();
            expect(payload).to.equal("oranges=5&extras[cinnamon]=0&extras[sugar]=1&vitamins[0]=A&vitamins[1]=C");
        });

    });

    describe("json", function () {

        const params = {
            method: "PUT",
            payload: [1, 2, 3],
            domain: "example.org",
            paths: ["test"],
            query : {
                "alpha" : 1,
                "beta" : 2
            }
        };

        const headersToSet = {
            "Authorization": `Bearer <token>`,
            "Accept": "application/json"
        };

        it("should default to Fetch API without params", function () {

            const config = new FetchConfig(params);

            config.addHeaders(headersToSet);

            const { headers, method, body, redirect, url } = config.json();

            expect(headers).to.deep.equal(
                Object.assign({
                    "Content-Type": "application/json"
                },
                    headersToSet
                )
            );

            expect(method).to.equal("PUT");
            expect(body).to.equal(JSON.stringify(params.payload));
            expect(redirect).to.equal("follow");
            expect(url).to.equal("https://example.org/test?alpha=1&beta=2");
        });



    });

});