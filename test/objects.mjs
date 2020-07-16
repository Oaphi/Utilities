import chai from "chai";
const { expect } = chai;

import * as objects from '../src/objects.mjs';
const {
    complement,
    deepGetByType,
    getGetterDescriptors,
    getOrInitProp,
    isObject,
    pushOrInitProp,
    smartGetter,
    switchIfDiffProp,
    setIf,
    union,
    whichKeyIsSet,
    whichKeysAreSet
} = objects;

describe('deepGetByType', function () {

    describe('type filtering', function () {

        const source = {
            undef1: undefined,
            nullish1: null,
            bool1: true,
            bool2: false,
            num1: 0,
            num2: 1,
            str1: "first",
            str2: "second",
            subObject: {
                undef2: undefined,
                nullish2: null,
                bool3: true,
                bool4: false,
                num3: 2,
                num4: 3,
                str3: "three",
                str4: "four"
            }
        };

        it('Boolean: should return boolean only', function () {
            const result = deepGetByType(source)("boolean");
            expect(result).to.deep.equal({
                bool1: true, bool2: false,
                bool3: true, bool4: false,
            });
        });

        it('Number: should return number only', function () {
            const result = deepGetByType(source)("number");
            expect(result).to.deep.equal({
                num1: 0, num2: 1,
                num3: 2, num4: 3,
            });
        });

        it('String: should returns string only', function () {
            const result = deepGetByType(source)("string");
            expect(result).to.deep.equal({
                str1: "first", str2: "second",
                str3: "three", str4: "four"
            });
        });

        it('null and undefined special cases', function () {
            const resultUndef = deepGetByType(source)("undefined");
            expect(resultUndef).to.to.deep.equal({
                undef1: undefined, undef2: undefined,
            });

            const resultNull = deepGetByType(source)(null);
            expect(resultNull).to.be.deep.equal({
                nullish1: null, nullish2: null,
            });
        });

    });

});

describe('getGetterDescriptors', function () {

    it('should return empty array on no source', function () {
        const getters = getGetterDescriptors();
        expect(getters).to.be.empty;
    });

    it('should return getters only (both init and added later)', function () {
        const source = {

            scored: 0,

            set score(value) {
                this.scored = +value;
            },

            get score() {
                return 9999;
            }
        };

        Object.defineProperty(source, "succeeded", {
            get() {
                return this.scored > 75;
            }
        });

        const getters = getGetterDescriptors(source);

        expect(getters).to.be.of.length(2);
        expect(getters).to.deep.contain(["score", Object.getOwnPropertyDescriptor(source, "score")]);
        expect(getters).to.deep.contain(["succeeded", Object.getOwnPropertyDescriptor(source, "succeeded")]);
    });

});

describe('getOrInitProp', function () {

    it('should noop if no callback and no property', function () {

        const source = {
            answer: 42
        };

        const question = getOrInitProp(source, "question");

        expect(source).to.not.have.property("question");

        expect(question).to.be.undefined;
    });

    it('should return created value if not set', function () {

        const source = {
            delta: 4,
            epsilon: 5
        };

        const zeta = getOrInitProp(source, "zeta", () => 6);

        expect(zeta).to.equal(6);

        expect(source).to.have.property("zeta");
    });

    it('should return value if already set', function () {

        const source = {
            eta: 7
        };

        const eta = getOrInitProp(source, "eta", () => "should not run");

        expect(eta).to.equal(7);

        expect(source).to.have.property("eta").that.equals(7);
    });

    it('should work on static class properties', function () {

        class Timer {

            static getTime() {
                return getOrInitProp(Timer, "time", () => 59);
            }
        }

        expect(Timer.getTime()).to.equal(59);
        expect(Timer.time).to.equal(59);
    });

});

describe('complement', function () {

    it('should return empty object if no sources', function () {
        const output = complement();
        expect(output).to.be.instanceof(Object).and.be.empty;
    });

    it('should return object itself if no sources', function () {
        const output = complement({ answer: 42 });
        expect(output).to.be.deep.equal({ answer: 42 });
    });

    it('should not mutate original', function () {
        const target = {
            question: "life, universe and everything",
            answer: 42
        };

        complement(target, {
            invader: "space"
        });

        expect(target).to.not.have.property("invader");
    });

    it('should return only unique values', function () {
        const target = {
            numbers: [2, 3, 5, 7],
            string: "aloha",
            bool: true
        };

        const source = {
            string: "hola",
            drink: "cocoa"
        };

        const output = complement(target, source);

        expect(output).to.be.deep.equal({
            numbers: [2, 3, 5, 7],
            bool: true,
            drink: "cocoa"
        });
    });

});

describe('whichKeyIsSet', function () {

    it('should return null on no keys', function () {
        const obj = {
            some: "value"
        };

        const result = whichKeyIsSet(obj);
        expect(result).to.be.null;
    });

    it('should return null on no match', function () {
        const obj = {
            another: 42
        };

        const result = whichKeyIsSet(obj, "other");
        expect(result).to.equal(null);
    });

    it('should correctly match key', function () {
        const obj = {
            and_another: 1024
        };

        const result = whichKeyIsSet(obj, "and_another", "and_even_more", "that");
        expect(result).to.equal("and_another");
    });

    it('should throw RangeError on 2 and more matches', function () {
        const obj = {
            that: "will",
            indeed: "fail"
        };

        const makeResult = () => whichKeyIsSet(obj, "that", "indeed");
        expect(makeResult).to.throw(RangeError);
    });

});

describe('whichKeysAreSet', function () {

    it('should return empty array on no keys', function () {

        const source = {
            apha: 1,
            beta: 2
        };

        const result = whichKeysAreSet(source);
        expect(result).to.be.empty;
    });

    it('should correctly filter keys', function () {

        const source = {
            gamma: 3,
            delta: 4
        };

        const result = whichKeysAreSet(source, "delta");
        expect(result).to.deep.equal(["delta"]);
    });

});

describe('isObject', function () {

    it('should return false on undefined', function () {
        const undef = isObject();
        expect(undef).to.be.false;
    });

    it('should return false on null', function () {
        const nulled = isObject(null);
        expect(nulled).to.be.false;
    });

    it('should return false for arrays', function () {
        const arr = isObject([1, 2, 3]);
        expect(arr).to.be.false;
    });

    it('should return true on empty obj', function () {
        const obj = isObject({});
        expect(obj).to.be.true;
    });

    it('should return true on non-empty obj', function () {
        const obj = isObject({ keys: "values" });
        expect(obj).to.be.true;
    });

});

describe('pushOrInitProp', function () {

    it('should init property to array with value', function () {
        const output = pushOrInitProp({}, "chapter", 24);
        expect(output).to.have.property("chapter").that.deep.equals([24]);
    });

    it('should push to property if already set', function () {
        const output = pushOrInitProp({ "volumes": [1, 2] }, "volumes", 3);
        expect(output).to.haveOwnProperty("volumes").that.deep.equals([1, 2, 3]);
    });

    it('should wrap non-array props in array first', function () {
        const output = pushOrInitProp({ "par": "introduction" }, "par", "foreword");
        expect(output).to.have.property("par").deep.equal(["introduction", "foreword"]);
    });

});

describe('smartGetter', function () {

    it('should define getter on context', function () {
        const obj = {};
        smartGetter(obj, "alpha", () => "beta");
        expect(obj).to.haveOwnProperty("alpha");
    });

    it('should memoize value', function () {
        const obj = { count: 1 };
        smartGetter(obj, "viconts", (o) => {
            return o.count * 2;
        });
        expect(obj.viconts).to.equal(2);

        obj.count = 4;

        expect(obj.viconts).to.equal(2);
    });

});

describe('switchIfSameProp', function () {

    it('should return empty object if none passed in', function () {
        const out = switchIfDiffProp()();
        expect(out).to.be.instanceOf(Object);
    });

    it('should correctly treat one object in', function () {
        const in1 = { test: 1 };
        const in2 = { Id: "abcd" };

        const out1 = switchIfDiffProp(in1)();
        const out2 = switchIfDiffProp(in2, "Id")();

        expect(out1).to.deep.equal(in1);
        expect(out2).to.deep.equal(in2);
    });

    it('should switch to last in if not same', function () {
        const in1 = { Id: "abcd" };
        const in2 = { Id: "efgh" };

        const out3 = switchIfDiffProp(in1, "Id")(in2);

        expect(out3).to.deep.equal(in2);
    });

    it('should leave first in if same', function () {
        const apple = { type: "fruit" };
        const banana = { type: "fruit" };

        const fruit = switchIfDiffProp(apple, "type")(banana);
        expect(fruit).to.deep.equal(apple);
    });

    it('should be usable functional-style', function () {
        const minefield = [
            { bomb: true, defused: false },
            { bomb: false },
            { bomb: true, defused: false }
        ];

        const defused = minefield.map(switchIfDiffProp({ bomb: true, defused: true }, "bomb"));
        expect(defused).to.not.deep.include({ bomb: true, defused: false });
    });

});

describe('setIf', function () {

    it('should return target object on no key', function () {
        const out = setIf({}, null, { output: 42 });
        expect(out.output).to.equal(42);
    });

    it('should construct new object if no target', function () {
        const out = setIf({ answer: 42 }, "answer");
        expect(out).to.be.an.instanceOf(Object);
        expect(out.answer).to.equal(42);
    });

    it('should not set non-defined properties', function () {
        const out = setIf({}, "none", {});
        expect(out).to.not.haveOwnProperty("none");
    });

    it('should set properties defined on prototype', function () {
        const proto = { answer: 42 };
        const child = Object.create(proto);
        const out = setIf(child, "answer", {});
        expect(out.answer).to.equal(42);
    });

    it('should correctly set falsy properties', function () {
        const out = setIf({ found: false }, "found");
        expect(out.found).to.be.false;
    });

    describe('Options', function () {

        describe('coerce', function () {

            it('should convert to string correctly', function () {
                const source = {
                    str: "question",
                    num: 12.5
                };

                const output = {};

                setIf(source, "num", output, { coerce: "string" });
                setIf(source, "str", output, { coerce: "string" });

                expect(output).to.have.property("num").that.is.equal("12.5");
                expect(output).to.have.property("str").that.equals("question");
            });

        });

    });

});

describe('union', function () {

    it('should not fail on undefined as source', function () {
        const out = union(undefined, { delta: 4 });
        expect(out.delta).to.equal(4);
    });

    it('should not fail on null as source', function () {
        const out = union(null, { epsilon: 5 });
        expect(out.epsilon).to.equal(5);
    });

    it('should not override target fields', function () {
        const out = union({ alpha: 1 }, { alpha: 2 });
        expect(out.alpha).to.equal(1);
    });

    it('should correctly transfer properties', function () {
        const out = union({ alpha: 1 }, { beta: 2 }, { gamma: 3 });
        expect(out.beta).to.equal(2);
        expect(out.gamma).to.equal(3);
    });

    it('should decouple union from target (shallow)', function () {
        const init = { theta: 4 };

        const out = union(init);
        init.theta = 42;

        expect(out.theta).to.equal(4);
    });

});