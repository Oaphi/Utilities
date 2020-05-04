const { expect } = require("chai");

const { mapResponseHeaders } = require('../src/fetch/headers.js');

describe('mapResponseHeaders', function () {
    
    it('should return empty object on no headers', function () {
        const parsed = mapResponseHeaders();
        expect(parsed).to.be.deep.equal({});
    });

    it('should correctly parse headers', function () {
        
        const headerString = `
            date: Fri, 08 Dec 2017 21:04:30 GMT\r\n
            content-encoding: gzip\r\n
            x-content-type-options: nosniff\r\n
            server: meinheld/0.6.1\r\n
            x-frame-options: DENY\r\n
            content-type: text/html; charset=utf-8\r\n
            connection: keep-alive\r\n
            strict-transport-security: max-age=63072000\r\n
            vary: Cookie, Accept-Encoding\r\n
            content-length: 6502\r\n
            x-xss-protection: 1; mode=block\r\n
        `;

        const parsed = mapResponseHeaders(headerString);
        
        expect(parsed.date).to.equal("Fri, 08 Dec 2017 21:04:30 GMT");
        expect(parsed["server"]).to.equal("meinheld/0.6.1");
        expect(parsed["x-xss-protection"]).to.equal("1; mode=block");
        expect(parsed.xContentTypeOptions).to.not.be.undefined;
    });

});