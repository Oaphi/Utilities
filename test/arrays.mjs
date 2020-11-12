import fs from "fs";

import chai from "chai";
const { expect } = chai;

import bench from "benchmark";

import {
    chunkify,
    closestValue,
    countObjects,
    deduplicate,
    indexGrid,
    filterMap,
    filterMapped,
    foldGrid,
    forAll,
    unionGrids,
    keyMap,
    last,
    mapUntil,
    mergeOnto,
    mixinColumn,
    reduceWithStep,
    removeElements,
    shiftToIndex,
    shrinkGrid,
    spliceInto,
    splitIntoConseq,
    transposeGrid,
    uniqify,
    validateGrid
} from "../src/arrays.mjs";

describe('Arrays', function () {

    const fillGrid = ({ val = "", rows = 1, cells = 1 }) =>
        new Array(rows).fill(val)
            .map((val) => new Array(cells).fill(val));

    describe("mixinColumn", function () {
        const grid = fillGrid({ rows: 5, cells: 5 });

        const values = [1, 2, 3, 4, 5];

        const mixed = mixinColumn({ col: 1, values, grid });

        console.log(mixed);

        expect(mixed.map((row) => row[1])).to.deep.equal([1, 2, 3, 4, 5]);
    });

    describe('shiftToIndex', function () {

        it('should correctly reorder array', function () {
            const source = [0, 1, 2, 3, 4];
            const output = shiftToIndex({ source, index: 2 });
            expect(output).to.deep.equal([2, 3, 4, 0, 1]);
        });

        it('should discard the rest if "keep" opt is false', function () {
            const source = ["active", "active", "deprecated", "deprecated"];
            const output = shiftToIndex({ source, index: 2, keep: false });
            expect(output).to.deep.equal(["deprecated", "deprecated"]);
        });

        it('should handle negative indices', function () {
            const source = [1, 2, 3, 4, 5];
            const output = shiftToIndex({ source, index: -2 });
            expect(output).to.deep.equal([4, 5, 1, 2, 3]);
        });

    });

    describe('indexGrid', function () {

        it('should index grid on column', function () {
            const keyCol = 1;
            const grid = fillGrid({ val: 42, rows: 2, cells: 2 });
            grid.forEach(row => row[keyCol] = 24);

            const indexed = indexGrid(grid, keyCol);

            expect(indexed).to.deep.equal({
                "24": [
                    [42, 24],
                    [42, 24]
                ]
            });
        });

    });

    describe('transposeGrid', function () {

        it('should correctly transpose', function () {

            const source = [[1, 2], [4, 5], [7, 8]];

            const output = transposeGrid({ source });

            expect(output).to.be.deep.equal([[1, 4, 7], [2, 5, 8]]);
        });

    });

    describe('mapUntil', function () {

        it('should return empty array by default', function () {
            const output = mapUntil();
            expect(output).to.be.an.instanceof(Array).and.be.empty;
        });

        it('should map to the same element by default', function () {
            const source = [1, 2, 3, 4];
            const output = mapUntil({ source });
            expect(output).to.deep.equal(source);
        });

        it('should stop upon reaching specified index', function () {
            const source = [0, 1, 2, 4, 8, 16, 32];
            const output = mapUntil({ source, upToIndex: 5 });
            expect(output).to.deep.equal([0, 1, 2, 4, 8]);
        });

        it('should stop upon reaching row matching condition', function () {
            const source = [0, 1, 2, 4, 8, 16, 32, 64, 128];
            const output = mapUntil({ source, upToMatching: (v) => v >= 32 });
            expect(output).to.deep.equal([0, 1, 2, 4, 8, 16]);
        });

    });

    describe('foldGrid', function () {
        it('should fold to 1 on no params', function () {
            const folded = foldGrid();
            expect(folded).to.equal(1);
        });

        it('should 1-increment on no callback', function () {
            const folded = foldGrid({ source: [[1], [2], [3]] });
            expect(folded).to.equal(3);
        });

        it('should correctly match condition', function () {
            const source = [[1], [2], [3], [4]];

            const folded = foldGrid({
                source,
                matching: (v) => v > 2
            });

            expect(folded).to.equal(2);
        });

        it('should correctly invoke callback', function () {
            const source = [[1], [2], [3], [4]];

            const folded = foldGrid({
                source,
                matching: (v) => v < 4,
                callback: (a, c) => a + c
            });

            expect(folded).to.equal(6);
        });

        it('should correctly determine column', function () {
            const source = [[1, 5], [2, 3], [8, 2]];
            const folded = foldGrid({
                source,
                accumulator: 1,
                overColumn: 1,
                callback: (a, c) => a * c
            });
            expect(folded).to.equal(30);
        });

        it('should expose full row to callback', function () {
            const source = [[1, 5], [2, 3], [8, 2]];
            const folded = foldGrid({
                source,
                callback: (a, __, r) => a + r.reduce((a, c) => a + c)
            });
            expect(folded).to.equal(21);
        });
    });

    describe('uniqify', function () {

        it('should default to empty array', function () {
            const output = uniqify();
            expect(output).to.be.an.instanceof(Array).and.be.empty;
        });

        it('should leave only unique elements', function () {
            const output = uniqify([2, 2, "menu", "menu", false, false]);
            expect(output).to.be.deep.equal([2, "menu", false]);
        });

    });

    describe('unionGrids', function () {

        it('should return empy grid by default', function () {
            const output = unionGrids();
            const [firstRow] = output;
            expect(output).to.be.of.length(1);
            expect(firstRow).to.be.empty;
        });

        it('should add only unique values', function () {
            const grid1 = [[1, 2, 3], [4, 5, 6]];
            const grid2 = [[4, 5, 6], [7, 8, 9]];

            const output = unionGrids({ sources: [grid1, grid2] });

            expect(output).to.deep.equal([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
        });

        it('should accept custom hash function', function () {
            const grid1 = [[2, 4], [6, 0]];
            const grid2 = [[3, 3], [5, 1]];

            const output = unionGrids({
                sources: [grid1, grid2],
                hasher: (v) => v.reduce((a, b) => a + b)
            });

            expect(output).to.deep.equal([grid1[0]]);
        });

        it('should work on string data', function () {

            const g1 = [["one", "two"]];
            const g2 = [["three", "four"], ["one", "two"]];

            const output = unionGrids({
                sources: [g1, g2]
            });

            expect(output).to.deep.equal([...g1, g2[0]]);
        });

    });

    describe('validateGrid', function () {

        it('should return true if no criteria', function () {
            const grid = fillGrid({ val: "", rows: 1, cells: 1 });
            const isValid = validateGrid({ grid });
            expect(isValid).to.be.true;
        });

        it('should throw RangeError on flat arrays', function () {
            const validateEmpty = () => validateGrid({ grid: [] });
            expect(validateEmpty).to.throw(RangeError);
        });

        it('should invalidate empty grid (one empty row) with "notEmpty" option', function () {
            const invalid = validateGrid({ grid: [[]], notEmpty: true });
            expect(invalid).to.be.false;

            const valid = validateGrid({ grid: [[]] });
            expect(valid).to.be.true;
        });

        it('should invalidate grids with non-blank value with "blank" option', function () {
            const grid = fillGrid({ val: "", rows: 20, cells: 10 });

            const valid = validateGrid({ grid, blank: true });
            expect(valid).to.be.true;

            grid[15][3] = "some value";

            const invalid = validateGrid({ grid, blank: true });
            expect(invalid).to.be.false;
        });

        it('should invalidate blank grids with "notBlank" option', function () {
            const grid = fillGrid({ val: "", rows: 20, cells: 10 });
            const isValid = validateGrid({ grid, notBlank: true });
            expect(isValid).to.be.false;
        });

        it('should invalidate filled grids with "notFilled" option', function () {
            const grid = fillGrid({ val: "value", rows: 5, cells: 5 });
            const invalid = validateGrid({ grid, notFilled: true });
            expect(invalid).to.be.false;

            grid[3][3] = "";

            const valid = validateGrid({ grid, notFilled: true });
            expect(valid).to.be.true;
        });

        it('should validate only non-blank non-full grids with "notBlank" & "notFilled"', function () {
            const grid = fillGrid({ val: "value", rows: 5, cells: 5 });
            grid[3][3] = "";

            const combined = validateGrid({ grid, notFilled: true, notBlank: true });
            expect(combined).to.be.true;
        });

        it('should invalidate grids without value with "has" option', function () {
            const tgtVal = "target", notVal = 42;

            const grid = fillGrid({ val: "", rows: 6, cells: 10 });
            grid[2][7] = tgtVal;

            const valid = validateGrid({ grid, has: tgtVal });
            expect(valid).to.be.true;

            const invalid = validateGrid({ grid, has: notVal });
            expect(invalid).to.be.false;
        });

        it('should invalidate grids with value with "without" option', function () {
            const tgtVal = null, notVal = true;

            const grid = fillGrid({ val: "true", rows: 6, cells: 10 });
            grid[2][7] = tgtVal;

            const invalid = validateGrid({ grid, without: tgtVal });
            expect(invalid).to.be.false;

            const valid = validateGrid({ grid, without: notVal });
            expect(valid).to.be.true;
        });

        it('should invalidate grids with num rows smaller than "minRows" option', function () {
            const minRows = 2;

            const grid = fillGrid({ val: "", rows: 2, cells: 3 });

            const valid = validateGrid({ grid, minRows });
            expect(valid).to.be.true;

            grid.pop();

            const invalid = validateGrid({ grid, minRows });
            expect(invalid).to.be.false;
        });

        it('should invalidate grids with num cols smaller than "minCols" option', function () {
            const minCols = 5;

            const grid = fillGrid({ val: "", rows: 2, cells: 3 });

            const invalid = validateGrid({ grid, minCols });
            expect(invalid).to.be.false;

            grid.forEach(row => row.push(...[1, 2, 3, 4]));

            const valid = validateGrid({ grid, minCols });
            expect(valid).to.be.true;
        });

    });

    describe('removeElements', function () {

        it('should remove correct elements', function () {
            const input = [1, 2, 3, 4];
            const output = removeElements(input, 2, 3);

            expect(input).to.deep.equal(input);
            expect(output).to.deep.equal([input[0], input[3]]);
        });

        it('should not remove anything if elements do not match', function () {
            const input = ["Andy", "Orwell"];

            const output = removeElements(input, "Amy");
            expect(output).to.deep.equal(input);
        });

    });

    describe('closestValue', function () {

        it('should return null on no value', function () {
            const closest = closestValue();
            expect(closest).to.be.null;
        });

        it('should return null on empty array', function () {
            const closest = closestValue({ value: 1 });
            expect(closest).to.be.null;
        });

        it('should find closest value', function () {
            const closest = closestValue({ value: 1, values: [7, 34, 18, 3, 15] });
            expect(closest).to.equal(3);
        });

    });

    describe('deduplicate', function () {

        it('should return empty array on no params', function () {
            const deduped = deduplicate();
            expect(deduped).to.be.instanceOf(Array).and.be.empty;
        });

        it('should not consider objects of diff key length dupes', function () {
            const original = [{ a: 1, b: 2, c: 3 }, { a: 1, c: 3 }];
            const deduped = deduplicate({ source: original });
            expect(deduped).to.deep.equal(original);
        });

        it('should dedupe on object entries by default', function () {
            const original = [{ id: 1, name: "Alex" }, { id: 2, name: "Aeris" }];
            original.push(original[0], original[1]);

            const deduped = deduplicate({ source: original });
            expect(deduped).to.deep.equal(original.slice(0, 2));
        });

        it('shoud dedupe on object values if type is set to "values"', function () {
            const original = [{ name: "Anry" }, { fullName: "Anry" }, { name: "Berta" }];

            const deduped = deduplicate({ source: original, type: "values" });
            expect(deduped).to.deep.equal([original[1], original[2]]);
        });

        it('should dedupe on object keys if type is set to "keys"', function () {
            const original = [{ name: "Anry" }, { fullName: "Anry" }, { name: "Berta" }, { name: "Claire" }];

            const deduped = deduplicate({ source: original, type: "keys" });
            expect(deduped).to.deep.equal([original[1], original[3]]);
        });

        describe('should ignore correctly if "ignore" option specified', function () {
            const original = [
                { name: "Carry", id: "123" },
                { name: "Carry", id: "456" },
                { name: "Berta" }, { name: "Claire" }
            ];

            it('keys if "keys" suboption provided', function () {
                const deduped = deduplicate({ source: original, ignore: { keys: ["id"] } });
                expect(deduped).to.deep.equal(original.slice(1));
            });

        });

        describe('should ignore correctly on arrays as objects to dedupe', function () {
            const original = [
                ["Carry", "123", "same"],
                ["Carry", "456", "same"],
                ["Berta", "789", "same"],
                ["Carry", "123", "same"]
            ];

            it('keys if "keys" suboption provided', function () {
                const deduped = deduplicate({ source: original, ignore: { keys: ["0"] } });
                expect(deduped).to.deep.equal(original.slice(1));
            });
        });

    });

    describe('countObjects', function () {

        it('should return an empty object on no params', function () {
            const counted = countObjects();
            expect(counted).to.be.instanceof(Object).and.be.empty;
        });

        it('should return empty object on empty array', function () {
            const counted = countObjects({ source: [] });
            expect(counted).to.be.instanceof(Object).and.be.empty;
        });

        it('defaults to first key in object', function () {
            const counted = countObjects({
                source: [
                    { test: 1, prop: 2 },
                    { test: 1, prop: 2 },
                    { prop: 3 }
                ]
            });

            expect(counted).to.be.deep.equal({ "1": 2 });
        });

        it('should count on key provided', function () {

            const counted = countObjects({
                source: [
                    { test: 1, prop: 2 },
                    { test: 1, prop: 2 },
                    { prop: 3 }
                ],
                onKey: "prop"
            });

            expect(counted).to.be.deep.equal({ "2": 2, "3": 1 });
        });

    });

    describe('reduceWithStep', function () {

        it('should copy reduce if no step', function () {

            const source = [1, 2, 3, 4, 5];

            const output = reduceWithStep({
                source, callback: (acc, cur) => acc + cur, initial: 100
            });

            expect(output).to.equal(115);
        });

        it('should behave like reduce while skipping items', function () {
            const source = [1, 2, 3, 4, 5];

            const output = reduceWithStep({
                source, callback: (acc, cur) => acc + cur, initial: 100, step: 2
            });

            expect(output).to.equal(109);
        });

    });

    describe('shrinkGrid', function () {

        it('should return empty array if passed empty array or nothing', function () {
            const [none] = shrinkGrid();
            expect(none).to.be.empty;

            const [empty] = shrinkGrid({ source: [] });
            expect(empty).to.be.empty;
        });

        describe('should correctly shrink', function () {

            it('to the top', function () {
                const source = [
                    [1, 2, 3, 4],
                    [5, 6, 7, 8]
                ];

                const output = shrinkGrid({ source, top: 1 });

                expect(output).to.have.length(1);
                expect(output[0]).to.deep.equal(source[1]);
            });

            it('to the top with leave', function () {
                const source = [
                    [1, 2, 3, 4],
                    [5, 6, 7, 8]
                ];

                const output = shrinkGrid({ source, leave: { top: 1 } });

                expect(output).to.have.length(1);
                expect(output[0]).to.deep.equal(source[0]);
            });

            it('to the right', function () {
                const source = [
                    [1, 2, 3],
                    [1, 2, 3],
                    [1, 2, 3]
                ];

                const output = shrinkGrid({ source, right: 2 });

                expect(output).to.have.length(3);
                expect(output[0]).to.deep.equal(source[0].slice(0, -2));
            });

            it('to the right with leave', function () {
                const source = [
                    [1, 2, 3],
                    [1, 2, 3],
                    [1, 2, 3]
                ];

                const output = shrinkGrid({ source, leave: { right: 2 } });

                expect(output).to.have.length(3);
                expect(output[0]).to.deep.equal([2, 3]);
            });

            it('to the bottom', function () {
                const source = [
                    [1, 2, 3, 4],
                    [5, 6, 7, 8]
                ];

                const output = shrinkGrid({ source, bottom: 1 });

                expect(output).to.have.length(1);
                expect(output[0]).to.deep.equal(source[0]);
            });

            it('to the bottom with leave', function () {
                const source = [
                    [1, 2, 3, 4],
                    [5, 6, 7, 8]
                ];

                const output = shrinkGrid({ source, leave: { bottom: 1 } });

                expect(output).to.have.length(1);
                expect(output[0]).to.deep.equal(source[1]);
            });

            it('to the left', function () {
                const source = [
                    [1, 2, 3],
                    [1, 2, 3],
                    [1, 2, 3]
                ];

                const output = shrinkGrid({ source, left: 2 });

                expect(output).to.have.length(3);
                expect(output[0]).to.deep.equal(source[0].slice(2));
            });

            it('to the left with leave', function () {
                const source = [
                    [1, 2, 3],
                    [1, 2, 3],
                    [1, 2, 3]
                ];

                const output = shrinkGrid({ source, leave: { left: 2 } });

                expect(output).to.have.length(3);

                output.forEach((row, i) => expect(row).to.deep.equal(source[i].slice(0, 2)));
            });

            it('horizontally', function () {
                const source = [
                    [1, 2, 3, 4, 5]
                ];

                const output = shrinkGrid({ source, horizontally: 2 });

                expect(output).to.have.length(1);
                expect(output[0]).to.deep.equal(source[0].slice(1, -1));
            });

            it('vertically', function () {
                const source = [
                    [1, 2],
                    [3, 4],
                    [5, 6]
                ];

                const output = shrinkGrid({ source, vertically: 2 });

                expect(output).to.have.length(1);
                expect(output[0]).to.deep.equal(source[1]);
            });

            it('all at once', function () {
                const source = [
                    [1, 1, 1],
                    [1, 42, 1],
                    [1, 1, 1]
                ];

                const output = shrinkGrid({ source, top: 1, right: 1, bottom: 1, left: 1 });

                expect(output[0]).to.contain(42);
                expect(output.length).to.equal(1);
                expect(output[0].length).to.equal(1);
            });

        });

    });

    describe('chunkify', function () {

        it('should return the same array wrapped on no chunks', function () {
            const source = [1, 2, 3];
            const output = chunkify(source);
            expect(output).to.deep.equal([source]);
        });

        it('should return the same array sliced and wrapped on 1 chunk', function () {
            const source = [1, 2, 3];
            const output = chunkify(source, { limits: [2] });
            expect(output[0]).to.deep.equal(source.slice(0, -1));
        });

        it('should correctly chunkify arrays', function () {
            const source = [1, 1, 2, 2, 2, 3];
            const output = chunkify(source, { limits: [2, 3, 1] });
            expect(output).to.deep.equal([
                [1, 1], [2, 2, 2], [3]
            ]);
        });

        it('should correctly append trailing chunk', function () {
            const source = [1, 1, 2, 2, 2, 3];
            const output = chunkify(source, { limits: [2, 1] });
            expect(output).to.deep.equal([
                [1, 1], [2], [2, 2, 3]
            ]);
        });

        it('should split in correctly sized chunks', function () {
            const source = ["ES5", "ES6", "ES7", "ES8", "ES9"];
            const output = chunkify(source, { size: 2 });
            expect(output).to.deep.equal([
                source.slice(0, 2),
                source.slice(2, 4),
                source.slice(4)
            ]);
        });

        it('should correctly split empty array', function () {
            const source = [];
            const output = chunkify(source, { size: 5 });
            expect(output).to.deep.equal([[]]);
        });

        it('should work on strings', function () {
            const source = "1234567890123";
            const output = chunkify(source, { size: 4 });
            expect(output).to.deep.equal(["1234", "5678", "9012", "3"]);
        });

    });

    describe('splitIntoConseq', function () {

        it('should return empty array on no args', function () {
            const output = splitIntoConseq();
            expect(output).to.be.empty;
        });

        it('should return an array of conseq. subsequences', function () {

            const input = [1, 2, 18, 14, 19, 20, 6, 5];

            const output = splitIntoConseq(input);

            expect(output).to.deep.equal([[1, 2], [5, 6], [14], [18, 19, 20]]);
        });

        it('should split in 1-elem subsequences if no-conseq', function () {

            const input = [5, 10, 7, 13];

            const output = splitIntoConseq(input);

            expect(output).to.deep.equal([[5], [7], [10], [13]]);
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

            expect(res).to.deep.equal([1, 2, 3]);
        });

        it('should map to undefined on no matching key', function () {
            const toMap = [{ b: 1 }, { c: 2 }, { d: 3 }, { e: 4 }];

            const res = keyMap(toMap)('a');

            expect(res).to.deep.equal([undefined, undefined, undefined, undefined]);
        });

        it('should not map at all if no key', function () {
            const toMap = [{ add: {} }, { remove: [] }, { delete: {} }];

            const res = keyMap(toMap)();

            expect(res).to.deep.equal(toMap);
        });

    });

    describe('last', function () {

        it('it should get last element', function () {
            const arr = [1, 2, 3, 4, 5];
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
            const target = [4, 1.5, 5, 2.5, 6];
            const out = mergeOnto(source, target);
            expect(out).to.deep.equal([1, 1.5, 2, 2.5, 3]);
        });

        it('should prefer last specified target', function () {
            const source = ["A", undefined, "B", undefined, "C"];
            const target1 = [null, "D", "F", "E", "G"];
            const target2 = ["M", 1, "B", 2, "N"];

            const out = mergeOnto(source, target1, target2);
            expect(out).to.deep.equal(["A", 1, "B", 2, "C"]);
        });

    });

    describe('spliceInto', function () {

        it('should insert target items at correct indices', function () {
            const source = ["A", "B", "C", "D"];
            const target = ["insert", undefined, "insert"];

            const out = spliceInto(source, target);

            expect(out[0]).to.equal("insert");
            expect(out[2]).to.equal("insert");
            expect(out).to.have.lengthOf(6);
        });

        it('should splice values in for multiple targets', function () {
            const source = ["A", "B", "C", "D"];
            const target1 = ["insert", undefined];
            const target2 = ["reinsert", "reinsert"];

            const out = spliceInto(source, target1, target2);

            expect(out).to.deep.equal(["reinsert", "reinsert", "insert", "A", "B", "C", "D"]);
        });

        it('should insert nothing if no target', function () {
            const source = ["A", "B", "C", "D"];
            const out = spliceInto(source);
            expect(out).to.deep.equal(source);
        });

    });
});