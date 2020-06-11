const { strictEqual, throws } = require('assert');
const { expect } = require('chai');

const {
    average, divide, divSum,
    multiply, multSum, substract,
    sum, LCM, GCD, fibonacci
} = require('../src/math.js');

const { randomArray } = require('../src/random.js');

describe('Math Utilities', function () {

    describe('Simple', function () {

        describe('divide()', function () {

            it('should throw on 0 division', function () {
                throws(() => divide(1, 2, 0));
            });

            it('should return 0 if first arg is 0', function () {
                const res = divide(0, 1, 2, 3, 4, 5);
                strictEqual(res, 0);
            });

            it('should correctly divide args', function () {
                const res = divide(100, 2, 25, 1);
                strictEqual(res, 2);
            });

        });

        describe('multiply()', function () {

            it('should return 0 on no args', function () {
                const res = multiply();
                strictEqual(res, 0);
            });

            it('should correctly multiply args', function () {
                const res = multiply(50, 2, 5);
                strictEqual(res, 500);
            });

        });

        describe('substract()', function () {

            it('should return 0 on no args', function () {
                const res = substract();
                strictEqual(res, 0);
            });

            it('should correctly substract args >= 0', function () {
                const res = substract(50, 2, 10, 13);
                strictEqual(res, 25);
            });

            it('should correctly substract args < 0', function () {
                const res = substract(-1, -5, -10);
                strictEqual(res, 14);
            });

        });

        describe('sum()', function () {

            it('should return 0 on no args', function () {
                const res = sum();
                strictEqual(res, 0);
            });

            it('should correctly sum args', function () {
                const args = [1, 2, 3, 4, 5, 6];
                const res = sum(...args);
                strictEqual(res, 21);
            });

        });

    });

    describe('Complex', function () {
        describe('average()', function () {

            it('should return 0 on no args', function () {
                const res = average();
                strictEqual(res, 0);
            });

            it('should correctly find average', function () {
                const res = average(1, 2, 4);
                strictEqual(res, 7 / 3);
            });

        });

        describe('divSum()', function () {

            it('should throw on 0 as divisor', function () {
                throws(() => divSum(0)(1, 2, 3, 4));
            });

            it('should return 0 on no args', function () {
                const res = divSum(20)();
                strictEqual(res, 0);
            });

            it('should correctly apply sum() -> divide()', function () {
                const res = divSum(3)(1, 2, 3, 4, 5, 6);
                strictEqual(res, 7);
            });

        });

        describe('fibonacci()', function () {
            
            it('should return empty array on no N', function () {
                const numsNo = fibonacci();
                const numsZero = fibonacci(0);
                expect(numsNo).to.be.deep.equal(numsNo).and.to.be.empty;
            });

            it('should return first N numbers correctly', function () {
                const first = [0,1,1,2,3,5,8];
                const out = fibonacci(first.length);
                expect(out).to.deep.equal(first);
            });

        });

        describe('GCD()', function () {

            it('should throw on no args or empty array', function () {
                expect(() => GCD()).to.throw(RangeError);
                expect(() => GCD(...[])).to.throw(RangeError);
            });

            it('should return element on 1 elem', function () {
                const arr = randomArray(1, 1e2);
                expect(GCD(...arr)).to.equal(arr[0]);
            });

            it('should correctly find GCD for 2 elems', function () {
                const arr = [3, 9];
                expect(GCD(...arr)).to.equal(3);
            });

            it('should correctly find GCD for >2 elems', function () {
                const arr = [5, 25, 50];
                expect(GCD(...arr)).to.equal(5);
            });

        });

        describe('LCM()', function () {

            it('throw on no args or empty array', function () {
                expect(() => LCM()).to.throw(RangeError);
                expect(() => LCM(...[])).to.throw(RangeError);
            });

            it('should return element on 1 elem', function () {
                const arr = randomArray(1, 1e5);
                expect(LCM(...arr)).to.equal(arr[0]);
            });

            it('should correctly find LCM for 2 elems', function () {
                const arr = randomArray(2, 125);
                const [a, b] = arr;
                expect(LCM(...arr)).to.equal(a * b / GCD(a, b));
            });

            it('should correctly find LCM for >2 elems', function () {
                const arr = [1, 2, 3, 4];
                expect(LCM(...arr)).to.equal(12);
            });

        });

        describe('multSum()', function () {

            it('should return 0 on 0 multiplier', function () {
                const res = multSum(0)(1, 2, 3, 4, 5);
                strictEqual(res, 0);
            });

            it('should correctly apply sum() -> multiply()', function () {
                const res = multSum(10)(5, 24);
                strictEqual(res, 290);
            });

        });

    });
});