const { expect } = require('chai');

const { AND, NAND, OR, NOR, XNOR, XOR } = require('../src/logic.js');

describe('Logic', function () {

    this.retries(2);

    describe('Vacuous truth', function () {
        
        it('All gates should be true', function () {
            
            expect(AND()).to.be.true;
            expect(NAND()).to.be.true;
            expect(OR()).to.be.true;
            expect(NOR()).to.be.true;
            expect(XOR()).to.be.true;
            expect(XNOR()).to.be.true;

        });

    });

    describe('AND', function () {

        describe('should return correct results', function () {

            it('should return false on all false', function () {
                expect(AND(false, false, false)).to.be.false;
            });

            it('should return true on all true', function () {
                expect(AND(true, true, true)).to.be.true;
            });

            it('should return false on any false', function () {
                expect(AND(true, false, true)).to.be.false;
            });

        });

    });

    describe('NAND', function () {

        it('should be true on no args true', function () {
            expect(NAND("",null,undefined,false,0)).to.be.true;
        });

        it('should be true on any args true', function () {
            expect(NAND(true,"","any",0,false)).to.be.true;
        });

        it("should be false on all args true", function () {
            expect(NAND(true,"true",{},[],1)).to.be.false;
        });

    });

    describe('OR', function () {

        it('should return true on any true', function () {
            expect(OR(false, false, true, false)).to.be.true;
        });

        it('should return false on all false', function () {
            expect(OR(false, false, false)).to.be.false;
        });
    });

    describe('NOR', function () {

        it('should return true on all args false', function () {
            
        });

        it('should return false on some args true', function () {
            
        });

        it('should return false on all args true', function () {
            
        });

    });

    describe('XOR', function () {

        it('should return arg conversion if one arg', function () {
            expect(XOR("truthy")).to.be.true;
            expect(XOR("")).to.be.false;
        });

        it('should return false for even inputs truthy', function () {
            expect(XOR(true,false,true,false)).to.be.false;
        });

        it('should return true for odd inputs truthy', function () {
            expect(XOR(true,false,true,false,true)).to.be.true;
        });
    });

    describe("XNOR", function () {

        it('should return true if args all true or all false', function () {
            expect(XNOR(true,true,true,true)).to.be.true;
            expect(XNOR(false,false,false,false)).to.be.true;
        });

        it('should return false if any args value mismatch', function () {
            expect(XNOR(true,true,false,true)).to.be.false;
            expect(XNOR(false,false,true,false)).to.be.false;
        });

    });

});