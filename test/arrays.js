const fs = require('fs');

const { expect } = require('chai');

const { 
    filterMap, 
    filterMapped, 
    forAll, 
    keyMap, 
    last,
    mergeOnto, 
    spliceInto,
    splitIntoConseq
} = require('../src/arrays.js');

const bench = require('benchmark');

describe('splitIntoConseq', function () {
    
    it('should return empty array on no args', function () {
        const output = splitIntoConseq();
        expect(output).to.be.empty;
    });

    it('should return an array of conseq. subsequences', function () {
        
        const input = [1,2,18,14,19,20,6,5];

        const output = splitIntoConseq(input);

        expect(output).to.deep.equal([[1,2],[5,6],[14],[18,19,20]]);
    });

    it('should split in 1-elem subsequences if no-conseq', function () {
        
        const input = [5,10,7,13];

        const output = splitIntoConseq(input);

        expect(output).to.deep.equal([[5],[7],[10],[13]]);
    });

});

describe('filterMap()', function () {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];

    it('should corectly filter values', function () {
        const filter = (elem) => elem > 4;

        const res = filterMap(arr)(filter)();

        expect(res).to.deep.equal([5, 6, 7, 8]);
    });

    it('should correctly map values', function () {
        const mapper = (elem) => elem * 2;

        const res = filterMap(arr)()(mapper);

        expect(res).to.deep.equal([2, 4, 6, 8, 10, 12, 14, 16]);
    });

    it('should expose indices', function () {
        let filterTrack = 0, mapTrack = 0;

        const filter = (elem, i) => {
            expect(i).to.equal(filterTrack);
            filterTrack++;
            return elem !== 3;
        };

        const mapper = (elem, i) => {
            expect(i).to.equal(mapTrack);
            mapTrack++; 2;
            return elem >> 1;
        };

        filterMap(arr)(filter)(mapper);
    });

    it('should correctly integrate filter() and map()', function () {
        const filter = (elem) => elem % 2;
        const mapper = (elem) => -elem;

        const res = filterMap(arr)(filter)(mapper);

        expect(res).to.deep.equal([-1, -3, -5, -7]);
    });

    it('should be faster than fiter() -> map()', function () {

        this.timeout(5000);

        this.retries(2);

        const filter = elem => {
            fs.readFileSync('./test/test.js');
            return elem;
        };
        const mapper = elem => -elem;

        const filterThenMap = (arr) => arr.filter(filter).map(mapper);
        const filterWithMap = (arr) => filterMap(arr)(filter)(mapper);

        const arr = new Array(1e3).fill(2);

        const suite = new bench.Suite('filterMap');

        suite
            .add('filterThanMap', () => filterThenMap(arr), {
                maxTime: .1
            })
            .add('filterWithMap', () => filterWithMap(arr), {
                maxTime: .1
            })
            .on('complete', () => {
                const times = suite.map('times');
                expect(times[0].elapsed >= times[1].elapsed);
            })
            .run();
    });

});

describe('filterMapped()', function () {
    const arr = ['Beth', 'Charles', 'William', 'George'];

    it('should correctly filter values', function () {
        const filter = name => name === 'Beth';
        const res = filterMapped(arr)()(filter);
        expect(res).to.deep.equal(arr.slice(0, 1));
    });

    it('should correctly map values', function () {
        const mapper = name => name === 'Beth' ? 'queen' : 'successor';
        const res = filterMapped(arr)(mapper)();
        expect(res).to.deep.equal(['queen', 'successor', 'successor', 'successor']);
    });

    it('should correctly combine', function () {
        const filter = name => name.length > 5;
        const mapper = name => name.length > 4 ? name : 'Queen';
        const res = filterMapped(arr)(mapper)(filter);
        expect(res).to.deep.equal(['Charles', 'William', 'George']);
    });

    it.skip('should expose indices', function () {

    });

});

describe('forAll()', function () {

    it('should return void', function () {
        const res = forAll([1, 2, 3, 4])(() => true);
        expect(res).to.be.undefined;
    });

    it('should execute callback on each elem', function () {
        let count = 0;
        forAll([1, 2, 3, 4, 5])(() => count++);
        expect(count).to.equal(5);
    });

    it('should provide reference to index', function () {
        let refIdx = 0;

        forAll([5, 6, 7, 8])((elem, idx) => {
            expect(refIdx).to.equal(idx);
            refIdx++;
        });
    });

});

describe('keyMap()', function () {

    it('should return empty array on no args', function () {
        expect(keyMap()()).to.be.empty;
    });

    it('should not throw on empty array', function () {
        expect(() => keyMap([])()).to.not.throw();
        expect(keyMap([])()).to.be.empty;
    });

    it('should map to key', function () {
        const toMap = [{ a: 1 }, { a: 2 }, { a: 3 }];

        const res = keyMap(toMap)('a');

        expect(res).to.deep.equal([1,2,3]);
    });

    it('should map to undefined on no matching key', function () {
        const toMap = [{ b: 1 }, { c: 2 }, { d: 3 }, { e: 4 }];

        const res = keyMap(toMap)('a');

        expect(res).to.deep.equal([undefined, undefined, undefined, undefined]);
    });

    it('should not map at all if no key', function () {
        const toMap = [{add:{}},{remove:[]},{delete:{}}];

        const res = keyMap(toMap)();

        expect(res).to.deep.equal(toMap);
    });

});

describe('last', function () {
    
    it('it should get last element', function () {
        const arr = [1,2,3,4,5];
        expect(last(arr)).to.equal(5);
    });

    it('should return undefined if no elems', function () {
        expect(last([])).to.be.undefined;
    });

});

describe('mergeOnto', function () {
    
    it('should return original if no targets', function () {
        const source = [1, , 2, , 3];
        const out = mergeOnto(source);
        expect(out).to.deep.equal(source);
    });

    it('should replace undefined indices from target', function () {
        const source = [1, , 2, , 3];
        const target = [4,1.5,5,2.5,6];
        const out = mergeOnto(source,target);
        expect(out).to.deep.equal([1,1.5,2,2.5,3]);
    });

    it('should prefer last specified target', function () {
        const source  = ["A", undefined, "B", undefined, "C"];
        const target1 = [null,"D","F","E","G"];
        const target2 = [ "M", 1, "B", 2, "N" ];

        const out = mergeOnto(source,target1,target2);
        expect(out).to.deep.equal(["A",1,"B",2,"C"]);
    });

});

describe('spliceInto', function () {
    
    it('should insert target items at correct indices', function () {
        const source = ["A","B","C","D"];
        const target = ["insert",undefined,"insert"];

        const out = spliceInto(source,target);

        expect(out[0]).to.equal("insert");
        expect(out[2]).to.equal("insert");
        expect(out).to.have.lengthOf(6);
    });

    it('should splice values in for multiple targets', function () {
        const source = ["A", "B", "C", "D"];
        const target1 = ["insert",undefined];
        const target2 = ["reinsert","reinsert"];

        const out = spliceInto(source,target1, target2);

        expect(out).to.deep.equal(["reinsert","reinsert","insert","A","B","C","D"]);
    });

    it('should insert nothing if no target', function () {
        const source = ["A", "B", "C", "D"];
        const out = spliceInto(source);
        expect(out).to.deep.equal(source);
    });

});