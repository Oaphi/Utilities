import chai from "chai";
const { expect } = chai;

import assert from "assert";
const { strictEqual, throws } = assert;

import jsdom from "jsdom";
const { JSDOM } = jsdom;

import utils from "../src/utilities.js";
const { jsonToDOMString, jsonToFormatString } = utils;

import { getSelectVals } from "../src/DOM/forms/inputs.mjs";

import {
    emphasizeSelectedText,
    elementsLeftUntil,
    elementsRightUntil,
    listContainsSome
} from "../src/DOM/elements.mjs";

function getMockDom(html) {
    const dom = new JSDOM(html);
    return {
        dom,
        window: dom.window,
        document: dom.window.document,
        body: dom.window.document.body
    };
}

describe('DOM Utilities', function () {

    describe('getSelectVals', function () {

        it('should find all options', function () {
            const { document } = getMockDom();

            const sel = document.createElement("select");
            sel.innerHTML = [
                `<option value="1">1</option>`,
                `<option value="2">2</option>`,
                `<option value="3">3</option>`
            ].join("");

            const vals = getSelectVals(sel);

            expect(vals).to.deep.equal(["1", "2", "3"]);
        });

    });

    describe('emphasizeSelectedText', function () {

        const { document, body } = getMockDom();

        it('should italicize by default', function () {

            const elem = document.createElement("input");
            elem.value = "Some emphasized text";
            body.append(elem);

            elem.focus();

            elem.setSelectionRange(5, 15);

            emphasizeSelectedText({ element: elem });

            expect(elem.value).to.equal("Some <em>emphasized</em> text");
        });

        it('should boldify on "bold" type', function () {
            const elem = document.createElement("textarea");
            elem.value = "Some emphasized text";
            body.append(elem);

            elem.focus();

            elem.setSelectionRange(5, 15);

            emphasizeSelectedText({ element: elem, type: "bold" });

            expect(elem.value).to.equal("Some <strong>emphasized</strong> text");
        });

        it('should strike out on "strike" type', function () {
            const testText = "Some emphasized text";

            const elem = document.createElement("input");
            elem.value = testText;
            body.append(elem);

            elem.focus();

            elem.setSelectionRange(testText.length - 4, testText.length);

            emphasizeSelectedText({ element: elem, type: "strike" });

            expect(elem.value).to.equal("Some emphasized <s>text</s>");
        });

        it('should underline on "underline" type', function () {
            const elem = document.createElement("textarea");
            elem.value = "Some emphasized text";
            body.append(elem);

            elem.focus();

            elem.setSelectionRange(0, 4);

            emphasizeSelectedText({ element: elem, type: "underline" });

            expect(elem.value).to.equal("<u>Some</u> emphasized text");
        });

        it('should set a link on "link" type', function () {
            const testText = "check example.com for info";

            const elem = document.createElement("input");
            elem.value = testText;
            body.append(elem);

            elem.focus();

            const { length } = testText;

            elem.setSelectionRange(6, length - 9);

            emphasizeSelectedText({
                element: elem,
                type: "link",
                target: "_top",
                link: "https://example.com"
            });

            expect(elem.value).to.equal(
                "check <a target=\"_top\" href=\"https://example.com\">example.com</a> for info"
            );
        });

    });

    describe('elementsRightUntil', function () {

        const { document, body } = getMockDom();

        const elem1 = document.createElement("div");
        const child1 = elem1.cloneNode();
        const child2 = elem1.cloneNode();
        const child3 = elem1.cloneNode();

        elem1.append(child1, child2, child3);

        body.append(elem1);

        it('should traverse all children on comparator never true', function () {
            const lchild = elementsRightUntil(elem1, () => false, (elem) => elem);
            expect(lchild).to.be.equal(child3);
        });

        it('should stop at first child on comparator always true', function () {
            const lchild = elementsRightUntil(elem1, () => true, (elem) => elem);
            expect(lchild).to.equal(child1);
        });

        it('should stop when comparator is true', function () {
            const child = elementsRightUntil(elem1, c => c === elem1.children[1], elem => elem);
            expect(child).to.equal(child2);
        });

        it('edge: should stop correctly if one child', function () {
            const root = document.createElement("div");
            const child = document.createElement("p");
            root.append(child);

            const fchild = elementsRightUntil(root, c => c === child, elem => root);
            expect(fchild).to.equal(root);
        });

        it('should use root if no children', function () {
            const elem2 = document.createElement("div");
            const root = elementsRightUntil(elem2, () => false, elem => elem);
            expect(root).to.equal(elem2);
        });

        it('should offset correctly', function () {
            const lchild = elementsRightUntil(elem1, 2, () => true, elem => elem);
            expect(lchild).to.equal(child3);
        });

        describe('callback', function () {

            it('should execute callback provided', function () {
                let counter = 0;
                elementsRightUntil(elem1, () => true, elem => counter++);
                expect(counter).to.equal(1);
            });

            it('should expose index correctly', function () {
                const times = ["4 AM", "12 PM", "4 PM"];
                const time = elementsRightUntil(elem1, elem => elem === elem1.children[1], (elem, i) => times[i]);
                expect(time).to.equal(times[1]);
            });

        });

        it('should execute fallback provided', function () {
            let counter = 1;
            elementsRightUntil(elem1, () => false, elem => elem, elem => counter--);
            expect(counter).to.equal(0);
        });

        it('should return the child / root if no callback', function () {
            const child = elementsRightUntil(elem1, () => false);
            expect(child).to.equal(elem1.lastElementChild);
        });

        describe('strict mode', function () {
            let counter = 0;

            const child = elementsRightUntil(elem1, () => false, () => counter++, true);

            it('should not default to root in strict mode', function () {
                expect(child).to.not.equal(elem1).and.to.be.null;
            });

            it('should not run callback if strict mode and no elem found', function () {
                expect(counter).to.equal(0);
            });

        });

    });

    describe('elementsLeftUntil', function () {

        const { document, body } = getMockDom();

        const elem1 = document.createElement("div");
        const child1 = elem1.cloneNode();
        const child2 = elem1.cloneNode();
        const child3 = elem1.cloneNode();

        elem1.append(child1, child2, child3);

        body.append(elem1);

        it('should traverse all children on comparator never true', function () {
            const fchild = elementsLeftUntil(elem1, () => false, (elem) => elem);
            expect(fchild).to.be.equal(child1);
        });

        it('should stop at last child on comparator always true', function () {
            const fchild = elementsLeftUntil(elem1, () => true, (elem) => elem);
            expect(fchild).to.equal(child3);
        });

        it('should stop when comparator is true', function () {
            const child = elementsLeftUntil(elem1, c => c === elem1.children[1], elem => elem);
            expect(child).to.equal(child2);
        });

        it('edge: should stop correctly if one child', function () {
            const root = document.createElement("div");
            const child = document.createElement("p");
            root.append(child);

            const fchild = elementsLeftUntil(root, c => c === child, elem => root);
            expect(fchild).to.equal(root);
        });

        it('should use root if no children', function () {
            const elem2 = document.createElement("div");
            const root = elementsLeftUntil(elem2, () => false, elem => elem);
            expect(root).to.equal(elem2);
        });

        it('should offset correctly', function () {
            const fchild = elementsLeftUntil(elem1, 2, () => true, elem => elem);
            expect(fchild).to.equal(child1);
        });

        describe('callback', function () {

            it('should execute callback provided', function () {
                let counter = 0;
                elementsLeftUntil(elem1, () => true, elem => counter++);
                expect(counter).to.equal(1);
            });

            it('should expose index correctly', function () {
                const times = ["4 AM", "12 PM", "4 PM"];
                const time = elementsLeftUntil(elem1, elem => elem === elem1.children[1], (elem, i) => times[i]);
                expect(time).to.equal(times[1]);
            });

        });



        it('should execute fallback provided', function () {
            let counter = 1;
            elementsLeftUntil(elem1, () => false, elem => elem, elem => counter--);
            expect(counter).to.equal(0);
        });

        it('should return the child / root if no callback', function () {
            const child = elementsLeftUntil(elem1, () => false);
            expect(child).to.equal(elem1.firstElementChild);
        });

        describe('strict mode', function () {
            let counter = 0;

            const child = elementsLeftUntil(elem1, () => false, () => counter++, true);

            it('should not default to root in strict mode', function () {
                expect(child).to.not.equal(elem1).and.to.be.null;
            });

            it('should not run callback if strict mode and no elem found', function () {
                expect(counter).to.equal(0);
            });

        });

    });

    describe('jsonToFormatString()', function () {

        it('should return empty string on no params', function () {
            const empty = jsonToFormatString();
            strictEqual(empty, '');
        });

        it('should return correct format string', function () {
            const valid = jsonToFormatString({
                "color": 'magenta',
                "line-height": '3em'
            });
            strictEqual(valid, 'color: magenta; line-height: 3em');
        });

    });

    describe('jsonToDOMString()', function () {

        it('should return empty string on no params', function () {
            const empty = jsonToDOMString();
            strictEqual(empty, '');
        });

        it('should return correct DOMString with params', function () {
            const valid = jsonToDOMString({
                "left": 10,
                "top": 20,
                "height": 50,
                "width": 101,
                "menubar": "yes"
            });
            const check = "left=10,top=20,height=50,width=101,menubar=yes";
            strictEqual(valid, check);
        });

        it('should throw on malformed DOM params', function () {
            throws(() => jsonToDOMString({
                "": "no_key",
                "no_val": ""
            }));
        });

    });

    describe('listContainsSome', function () {

        const { document } = getMockDom();

        it('should return true if some tokens contained', function () {
            const img = document.createElement("img");

            img.classList.add("A", "B", "C");

            const checked = listContainsSome(img.classList)("B", "D");
            expect(checked).to.be.true;
        });

        it('should return false if no tokens contained', function () {
            const par = document.createElement("p");
            const checked = listContainsSome(par.classList)("A", "N");
            expect(checked).to.be.false;
        });

        it('should return false on no tokens', function () {
            const label = document.createElement("label");
            const checked = listContainsSome(label.classList)();
            expect(checked).to.be.false;
        });

    });

});