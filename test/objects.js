const { expect } = require('chai');

const { isObject, smartGetter, switchIfDiffProp, setIf, union } = require('../src/objects.js');

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
        const out = setIf({},null,{ output: 42 });
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
        const out = union({ alpha: 1 }, { beta : 2 }, { gamma : 3 });
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