const { expect } = require('chai');
const bench = require('benchmark');

const { AND, OR, XOR } = require('../src/boolean.js');

describe('Boolean Utils', function () {

    this.retries(2);

    describe('AND()', function () {

        const suite = new bench.Suite('AND');

        suite
            .add('AND Reduce', () => {
                const res = AND(false, true, true, false, true, false, true, false);
            }, {
                maxTime: .1
            })
            .add('AND Normal', () => {
                const res = false && true && true && false && true && false && true && false;
            }, {
                maxTime: .1
            })
            .on('complete', () => {
                const diff = suite[0].times.elapsed - suite[1].times.elapsed;
                expect(diff > -.25).to.be.true;
            });

        describe('should return correct results', function () {

            it('should return false on no args', function () {
                expect(AND()).to.be.false;
            });

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

        it('should not be much slower', () => suite.run());
    });

    describe('OR', function () {

        const suite = new bench.Suite('AND');

        suite
            .add('OR Reduce', () => {
                OR(false, false, false, true, false);
            }, {
                maxTime: .1
            })
            .add('OR Normal', () => {
                false || false || false || true || false;
            }, {
                maxTime: .1
            })
            .on('complete', () => {
                const diff = suite[0].times.elapsed - suite[1].times.elapsed;
                expect(diff > -.25).to.be.true;
            });

        it('should return false on no args', function () {
            expect(OR()).to.be.false;
        });

        it('should return true on any true', function () {
            expect(OR(false, false, true, false)).to.be.true;
        });

        it('should return false on all false', function () {
            expect(OR(false, false, false)).to.be.false;
        });

        it('should not be much slower', () => suite.run());
    });

    describe('XOR', function () {

        const suite = new bench.Suite('XOR');

        suite
            .add('XOR Reduce', () => {
                XOR(false, true, false, true, false, true, true);
            }, {
                maxTime: .1
            })
            .add('XOR Normal', () => {
                (false ^ true ^ false ^ true ^ false ^ true ^ true) ? true : false;
            }, {
                maxTime: .1
            })
            .on('complete', () => {
                const diff = suite[0].times.elapsed - suite[1].times.elapsed;
                expect(diff > -.25).to.be.true;
            });

        it('should return true on no args', function () {
            expect(XOR()).to.be.true;
        });

        it('should return false on repeat', function () {
            expect(XOR(false, true, true, false)).to.be.false;
            expect(XOR(false, true, false, false)).to.be.false;
        });

        it('should return true on no repeat', function () {
            expect(XOR(true, false, true, false)).to.be.true;
            expect(XOR(false, true, false, true)).to.be.true;
        });

        it('should not be much slower', () => suite.run());

    });

});