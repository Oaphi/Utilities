const { expect } = require("chai");

const {
    smartEmailSplit,
    registerCaseModifier
} = require("../src/emails.js");

/**
 * 
 * @param {string} input 
 * @returns {string}
 */
function testCaseModifier(input) {
    return input[0].toUpperCase() + input.slice(1);
}

/**
 * @returns {Object.<string, string[]>}
 */
function getEmailMappings() {
    return {
        "Joe@example.com": ["Joe", "Example"],
        "user+mailbox@example.com": ["User", "Mailbox", "Example"],
        "_somename@example.com": ["_somename", "Example"],
        "customer/department=shipping@example.com": ["Customer", "Department", "Shipping", "Example"],
        "$A12345@example.com": ["$A12345", "Example"],
        "!def!xyz%abc@example.com": ["Def","Xyz", "Abc", "Example"]
    };
}

registerCaseModifier(testCaseModifier);

describe('smartEmailSplit', function () {

    it('should correctly parse email addresses', function () {
        
        const mappings = getEmailMappings();

        for(const key in mappings) {
           const output = smartEmailSplit(key);
           expect(output).to.deep.equal(mappings[key]);
        }

    });

});