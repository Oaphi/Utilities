import chai from "chai";
const { expect } = chai;

import {
    complement,
    deepAssign,
    deepCopy,
    deepFilter,
    deepMap,
    deepParseByPath,
    deepGetByType,
    fromPath,
    getGetterDescriptors,
    getOrInitProp,
    isObject,
    pushOrInitProp,
    smartGetter,
    switchIfDiffProp,
    setIf,
    shallowFilter,
    union,
    whichKeyIsSet,
    whichKeysAreSet
} from '../src/objects.mjs';

describe('Objects', function () {

    describe('fromPath', function () {
        
        it('should correctly parse path', function () {
            const output = fromPath({ path : "main/sub/prop" });
            expect(output).to.deep.equal({
                main : {
                    sub : {
                        prop : {

                        }
                    }
                }
            });
        });

        it('should correctly assign value to the deepest obj', function () {
            const output = fromPath({ path: "main/prop", value : true });
            expect(output).to.deep.equal({
                main : {
                    prop : true
                }
            });
        });

    });

    describe('deepAssign', function () {
        
        it('should copy non-obj values', function () {
            const source = {};

            deepAssign({ source, updates : [ { one : 1, two : 2 } ] });

            expect(source).to.have.property("one").equal(1);
            expect(source).to.have.property("two").equal(2);
        });

        it('should keep non-updated props', function () {
            const source = { keep : true };

            deepAssign({ source, updates : [ { renew : false } ] });

            expect(source).to.have.property("keep").equal(true);
            expect(source).to.have.property("renew").equal(false);
        });

        it('should correctly assign object properties', function () {
            const source = {};

            const updates = [{ nested: { prop: false } }];

            deepAssign({ source, updates });

            expect(source).to.deep.equal({
                ...updates[0]
            });
        });

        it('should keep nested properties', function () {
            const source = { nested : { prop : false } };

            const updates = [{ nested: { newest: "yes" } }];

            deepAssign({ source, updates });

            expect(source).to.deep.equal({
                nested : {
                    prop : false,
                    newest : "yes"
                }
            });
        });

        it('should process multiple updates', function () {
            const source = { main : 0, sub : 1, nested: { prop: 1, sub : 2 } };

            const updates = [{ main : 1, nested : { prop : 2 } }];

            deepAssign({ source, updates });

            expect(source).to.deep.equal({
                main : 1, sub : 1, 
                nested : { prop : 2, sub : 2 }
            });
        });

    });

    describe('deepCopy', function () {

        it('should copy with dereferencing', function () {
            
            const source = { name : "Andy", age : 42, children : [ "Amy", "Sonny" ] };

            const copy = deepCopy({ source });

            delete copy.children;

            expect(source).to.have.property("children");
            expect(copy).to.have.property("name").equal("Andy");
        });

        it('should deep skip properties in "skip" option', function () {
            
            const source = { name: "Andy", age: 42, children: ["Amy", "Sonny"] };

            const copy = deepCopy({ source, skip : [ "age" ] });
            
            expect(copy).to.not.have.property("age");
            expect(copy).to.have.property("children").deep.equal(source.children);
        });

    });

    describe('shallowFilter', function () {

        it('should return empty object for empty objects and arrays', function () {
            const obj = shallowFilter({ source: {} });
            expect(obj).to.be.empty;

            const arr = shallowFilter({ source: [] });
            expect(arr).to.be.empty;
        });

        describe('should filter values correctly', function () {
            it('on objects', function () {
                const obj = shallowFilter({
                    source: { one: 1, two: 2, three: 3 },
                    filter: (v) => v === 2
                });

                expect(obj).to.deep.equal({ two: 2 });
            });

            it('on arrays', function () {
                const source = [{ id: 1 }, { id: 2 }, { id: 3 }];

                const arr = shallowFilter({
                    source, filter: (v) => v.id > 2
                });

                expect(arr).to.deep.equal(source.slice(2));
            });
        });

        it('should filter keys with values correctly', function () {
            const obj = shallowFilter({
                source: { one: 1, two: 2, three: 3 },
                filter: (v, k) => k === "one" || v === 3
            });

            expect(obj).to.deep.equal({ one: 1, three: 3 });
        });

        it('should accumulate values if provided', function () {

            it('on arrays', function () {
                const source = [{ id: 1 }, { id: 2 }, { id: 3 }];

                const accumulator = [];

                shallowFilter({
                    source, filter: ({ id }) => [1, 3].includes(id), accumulator
                });

                expect(accumulator).to.deep.equal([source[0], source[2]]);
            });

        });

    });
});

describe('deepFilter', function () {

    it('should return empty object for empty objects', function () {
        const source = {};
        const output = deepFilter(source, (key, val) => val === true);
        expect(output).to.be.empty;
    });

    it('should apply filter to each key', function () {

        const source = {
            this: true,
            is: {
                an: true,
                apple: [{
                    not: false
                }],
                orange: false
            }
        };

        const output = deepFilter(source, (key, val) => val === true);

        expect(output).to.deep.equal({
            this: true,
            is: {
                an: true
            }
        });
    });

    it('should work on real data', function () {

        const source = {
            "add_to_organization": [],
            "create_organization": ["true"],
            "org.name": ["Gmail"],
            "org.visible_to": ["1"],
            "person.email[0].label": ["work"],
            "person.email[0].primary": ["true"],
            "person.email[0].value": ["example@example.com"],
            "person.name": ["John Doe"],
            "person.phone[0].label": ["work"],
            "person.phone[0].primary": ["true"],
            "person.phone[0].value": ["+6"],
            "person.visible_to": ["1"]
        };

        const output = deepFilter(source, (k, v) => v.length, { opaqueArrays: false });

        expect(output).to.deep.equal({
            "create_organization": ["true"],
            "org.name": ["Gmail"],
            "org.visible_to": ["1"],
            "person.email[0].label": ["work"],
            "person.email[0].primary": ["true"],
            "person.email[0].value": ["example@example.com"],
            "person.name": ["John Doe"],
            "person.phone[0].label": ["work"],
            "person.phone[0].primary": ["true"],
            "person.phone[0].value": ["+6"],
            "person.visible_to": ["1"]
        });
    });

    describe('deepFilter on arrays', function () {

        const source = [{ id: 1 }, { id: 2 }, { name: "Andy" }, { id: 3 }];

        it('should apply filter to each entry', function () {
            const output = deepFilter(source, (k, v) => v > 2);

            expect(output).to.be.deep.equal(source.slice(-1));
        });

        it('should accumulate correctly', function () {
            const accumulator = [];

            const output = deepFilter(
                source,
                (k) => k === "name",
                { accumulator }
            );

            expect(output).to.be.deep.equal(source.slice(2, 3));
            expect(accumulator).to.be.deep.equal([
                1, source[0],
                2, source[1],
                3, source[3]
            ]);
        });

    });

    describe('deepFilter options', function () {

        it('accumulator', function () {

            const source = { one: 1, two: "two", three: [1, 2, 3] };

            const accumulator = {};

            deepFilter(source, (k, v) => v === 1, { accumulator });

            // expect(accumulator).to.have.property("two").equal(source.two);

            // const nonOpaqueAccumulator = {};

            // deepFilter(source, (k, v) => !Array.isArray(v), {
            //     accumulator: nonOpaqueAccumulator,
            //     opaqueArrays: false
            // });

            // expect(nonOpaqueAccumulator).to.have.property("three").deep.equal(source.three);
        });

    });
});

describe('deepMap', function () {

    it('should return empty object for empty objects', function () {
        const source = {};
        const output = deepMap(source, () => true);
        expect(output).to.be.empty;
    });

    it('should apply map to each key', function () {

        const source = {
            one: 1,
            two: "2",
            three: {
                uno: 1,
                duo: 2
            },
            four: [1, 2, 3]
        };

        const testCallback = (key, val) => +val * 5;

        const output = deepMap(source, testCallback);

        expect(output).to.deep.equal({
            one: 5,
            two: 10,
            three: {
                uno: 5,
                duo: 10
            },
            four: [5, 10, 15]
        });
    });

    describe('deepMap options', function () {

        it('keyMapper', function () {
            const source = {
                some: "thing",
                one: {
                    two: [3, 4],
                    five: 5
                },
                six: false
            };

            const output = deepMap(source, (k, v) => v, {
                keyMapper: (k) => k + 1
            });

            expect(output).to.deep.equal({
                some1: "thing",
                one1: {
                    two1: [3, 4],
                    five1: 5
                },
                six1: false
            });
        });

        it('opaqueArrays', function () {
            const source = {
                one: 5,
                list: ["E", "C", "M", "A"]
            };

            const testCallback = (key, val) => Array.isArray(val) ?
                val.join("") :
                val * 2;

            const output = deepMap(source, testCallback, { opaqueArrays: false });

            expect(output).to.deep.equal({
                one: 10,
                list: "ECMA"
            });
        });

    });

});

describe('deepGetByPath', function () {

    it('should return empty object for no paths', function () {
        const source = {};
        expect(source).to.be.empty;
    });

    it('should create nested objects for dots until last dot', function () {

        const source = {
            "that.is.a.subpath": [1, 2, 3],
            "that.is.a.path": 42,
            "that.was.the.path": true
        };

        const output = deepParseByPath(source);

        expect(output).to.deep.equal({
            that: {
                is: {
                    a: {
                        path: 42,
                        subpath: [1, 2, 3]
                    }
                },
                was: {
                    the: {
                        path: true
                    }
                }
            }
        });
    });

    it('should create arrays for bracket accessors', function () {

        const source = {
            "top[0]": {
                "lvl1[0]": 1,
                "lvl2[1]": 2
            },
            "top[1]": {
                "lvl1[0]": 3,
                "lvl2[1]": 4
            },
            "top[2]": {
                "lvl[2]": {
                    "lvl[3]": true
                }
            },
            "top[3].sublvl": {
                "subsub": 42
            }
        };

        const output = deepParseByPath(source);

        expect(output).to.deep.equal({
            top: [{
                lvl1: [1],
                lvl2: [, 2]
            }, {
                lvl1: [3],
                lvl2: [, 4]
            }, {
                lvl: [, , { lvl: [, , , true] }]
            }, {
                sublvl: {
                    subsub: 42
                }
            }]
        });
    });

    it('should work on real data', function () {

        const source = {
            "create_organization": ["true"],
            "org.name": ["Gmail"],
            "org.visible_to": ["1"],
            "person.email[0].label": ["work"],
            "person.email[0].primary": ["true"],
            "person.email[0].value": ["example@example.com"],
            "person.name": ["Oleg Valter"],
            "person.phone[0].label": ["work"],
            "person.phone[0].primary": ["true"],
            "person.phone[0].value": [""],
            "person.visible_to": ["1"]
        };

        const output = deepParseByPath(source);
    });

});

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