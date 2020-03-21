/**
 * Node base class
 * @class
 */
class Node {

    /**
     * @param {*} value
     */
    constructor(value) {
        this.value = value;
        this.next = null;
    }

}

class BinaryNode extends Node {

    constructor(value) {
        super(value);

        this.left = this.right = null;
    }

}

class TernaryNode extends Node {

    constructor(value) {
        super(value);

        this.left = this.center = this.right = null;
    }

}

/**
 * LinkedList base class
 * @class
 */
class LinkedList {

    /**
     * @param {Node} root 
     */
    constructor(root) {
        this.root = root;

        /** @member {Number} size */
        this.size = root ? 1 : 0;
    }

    /**
     * Getter for last Node in List
     * @returns {Node}
     */
    get last() {
        const { root } = this;

        let current = root;

        while (current.next) {
            current = current.next;
        }

        return current || null;
    }

    /**
     * Getter for last index in List
     * @returns {Number}
     */
    get lastIndex() {
        const { size } = this;
        return size ? size - 1 : 0;
    }

    /**
     * 
     * @param {*} value 
     * @returns {LinkedList}
     */
    add(value) {
        const { root } = this;

        const node = new Node(value);

        !root && (this.root = node) || (this.last.next = node);

        this.size++;

        return this;
    }

    /**
     * 
     * @param {Number} [index]
     * @returns {?Node}
     */
    at(index = 0) {
        const { root } = this;

        if (!root) {
            return null;
        }

        if (index === 0) {
            return root;
        }

        let currNode = root;

        let pos = 0;

        while (currNode.next) {

            if (index === pos) {
                return currNode;
            }

            currNode = currNode.next;

            pos++;
        }

        return null;
    }

    /**
     * 
     * @param {*} value
     * @param {Number} [index]
     * @returns {LinkedList}
     */
    insert(value, index) {
        const { size } = this;

        if (!size || index === undefined) {
            return this.add(value);
        }

        const node = new Node(value);

        if (index === 0) {
            const { root } = this;
            node.next = root;
            this.root = node;

            this.size++;

            return this;
        }

        const parent = this.at(index - 1);

        if (parent) {
            node.next = parent.next;
            parent.next = node;
            this.size++;
        }

        return this;
    }

    /**
     * Generates a LinkedList from 
     * value sequence
     * @param {*[]} sequence 
     * @returns {Tree}
     */
    static generate(sequence = []) {
        const list = new LinkedList();

        for (const value of sequence) {
            list.add(value);
        }

        return list;
    }

    /**
     * 
     * @returns {LinkedList}
     */
    pop() {
        const { size } = this;

        if (!size) {
            return this;
        }

        if (size === 1) {
            this.root = null;

            this.size--;

            return this;
        }

        const beforeLast = this.at(size - 2);

        beforeLast.next = null;

        this.size--;

        return this;
    }

    /**
     * 
     * @param {*} [index] 
     * @returns {LinkedList}
     */
    remove(index) {
        const { size } = this;

        if (!size || index >= size) {
            return this;
        }

        if (size === 1 || index === undefined) {
            return this.pop();
        }

        const parent = this.at(index - 1);

        if (parent) {
            parent.next = parent.next.next;
            this.size--;
        }

        return this;
    }

}

class BinaryTree extends LinkedList {

    constructor(root) {
        super(root);
    }

}

class TernaryTree extends LinkedList {

    constructor(root) {
        super(root);
    }

}


module.exports = {
    Node,
    BinaryNode,
    TernaryNode,
    LinkedList,
    BinaryTree,
    TernaryTree
};