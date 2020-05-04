const { expect } = require('chai');

const Trees = require('../src/trees/trees.js');

describe('Trees', function () {
    
    describe('Node', function () {
        const { Node } = Trees;
        
        it('should have value and next props', function () {
            const node = new Node();
            expect(node).to.have.property('value');
            expect(node).to.have.property('next');
        });

        it('leaf should be initialized at null', function () {
            const node = new Node();
            expect(node.next).to.be.null;
        });

    });
    
    describe('LinkedList', function () {
        const { LinkedList, Node } = Trees;

        it('should have root and size props', function () {
            const list = new LinkedList();
            expect(list).to.have.property('root');
            expect(list).to.have.property('size');
        });

        it('should initialize size to 0', function () {
            const list = new LinkedList();
            expect(list.size).to.equal(0);
        });

        describe('#at()', function () {
            
            it('should get first node if no index', function () {
                const list = new LinkedList();

                list.add('bread').add('butter').add('cheese').add('ham');

                const node = list.at();

                expect(node.value).to.equal('bread');
            });

            it('should return correct node', function () {
                const list = new LinkedList();

                list.add('Edward III').add('George IV').add('Elizabeth II');

                const node = list.at(1);

                expect(node.value).to.equal('George IV');
            });

            it('should return null on index overflow / underflow', function () {
                const list = new LinkedList();

                list.add('Morning').add('Day').add('Night');

                const [ underflow, overflow ] = [ list.at(-3), list.at(5) ];

                expect(underflow).to.equal(null);
                expect(overflow).to.equal(null);

            });

        });

        describe('#last()', function () {

            it('should get last node', function () {
                const root = new Node(1);
                const child = new Node(2);

                root.next = child;

                const list = new LinkedList(root);

                expect(list.last.value).to.equal(2);              
            });


        });

        describe('#add()', function () {

            it('should be chainable', function () {
                const list = new LinkedList();
                const same = list.add('Picard');
                expect(same).to.be.an.instanceOf(LinkedList);
            });
            
            it('should add root node correctly', function () {
                const list = new LinkedList();
                list.add(20);
                expect(list.root.value).to.equal(20);
            });

            it('should extend list correctly', function () {
                const list = new LinkedList();
                list.add(20).add(30);
                expect(list.root.next.value).to.equal(30);
            });

        });

        describe('#insert()', function () {
            
            it('should be chainable', function () {
                const list = new LinkedList();
                const same = list.insert('Kirk');
                expect(same).to.be.an.instanceOf(LinkedList);
            });

            it('should behave as #add() on no index', function () {
                const list = new LinkedList();
                list.add('Cisco').insert('Kirk');
                expect(list.last.value).to.equal('Kirk');
            });

            it('should insert at the start of tree', function () {
                const list = new LinkedList();
                list.insert('Pike',0);
                expect(list.root.value).to.equal('Pike');
            });

            it('should insert at the end of tree', function () {
                const list = new LinkedList();
                list.insert('Pike',0).insert('Kirk',1);
                expect(list.last.value).to.equal('Kirk');
            });

            it('should insert at an arbitrary index', function () {
                const list = new LinkedList();
                list.add('Pike').add('Kirk').add('Picard');
                list.insert('Janeway',1);
                expect(list.root.next.value).to.equal('Janeway');
            });

        });

        describe('#generate()', function () {

            it('should return a LinkedList', function () {
                const list = LinkedList.generate();
                expect(list).to.be.instanceOf(LinkedList);
            });
            
            it('should generate correct linked list', function () {
                const list = LinkedList.generate([1,4,9,0,1]);
                const { size } = list;
                expect(size).to.equal(5);
            });

        });

        describe('#pop()', function () {

            it('should be chainable', function () {
                const list = new LinkedList();
                list.add('child').add('teen').add('man');
                const popped = list.pop().pop();
                expect(popped).to.be.an.instanceof(LinkedList);
            });
            
            it('should do nothing on no nodes', function () {
                const list = new LinkedList();
                list.pop();
                expect(list.size).to.equal(0);
            });

            it('should remove last node', function () {
                const list = new LinkedList();
                list.add('foo').add('bar').pop();
                expect(list.last.value).to.equal('foo');
            });

        });

        describe('#remove()', function () {
            
            it('should be chainable', function () {
                const list = new LinkedList();
                const removed = list.add('John').add('Connor').remove();
                expect(removed).to.be.an.instanceof(LinkedList);
            });

            it('should do nothing on no nodes', function () {
                const list = new LinkedList();
                list.remove();
                expect(list.size).to.equal(0);
            });

            it('should do nothing on underflow', function () {
                const list = new LinkedList();
                list.add('Ariadne').add('Teseus').remove(-2);
                expect(list.root.value).to.equal('Ariadne');
                expect(list.size).to.equal(2);
            });

            it('it should do nothing on overflow', function () {
                const list = new LinkedList();
                list.add('wall').remove(20);
                expect(list.root.value).to.equal('wall');
                expect(list.size).to.equal(1);
            });

            it('should behave as pop on no index', function () {
                const list = new LinkedList();
                list.add('Meg').add('Jo').add('Amy').add('Beth').remove();
                expect(list.last.value).to.equal('Amy');
            });

            it('should correctly remove nodes', function () {
                const list = new LinkedList();
                list.add('Kant').add('Fichte').add('Shelling').add('Hegel').remove(1);
                expect(list.at(1).value).to.equal('Shelling');
            });

        });

    });

});