# Trees

Trees are hierarchical data structures used to represent linked nodes where each *root* node is linked to an N of *child* nodes. In order of increased complexity, most common tree types are:

<table>
    <thead>
        <tr>
            <th>Tree</th>
            <th>Children</th>
            <th>Leaves</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>LinkedList*</td>
            <td>1</td>
            <td>next</td>
        </tr>
        <tr>
            <td>Binary</td>
            <td>2</td>
            <td>left, right</td>
        </tr>
        <tr>
            <td>Ternary</td>
            <td>3</td>
            <td>left, center, right</td>
        </tr>
    </tbody>
</table>

<sup>*</sup> LinkedList is technically not a tree, but it is useful to think of it as a special case with only one branch since it shares generation and traversal patterns with proper trees.

## Linked Lists

Linked lists are simple data structures where all nodes are sequentially chained.

### Traversing

To get to the last node by visiting each, simply iterate over `next` property of each node in the list.

### Methods

#### Add( `value` )

`add()` method simply appends a new node at the end of the list. The algorithm is simple:

1. Traverse the list until last node is reached.
2. Create a node with `value` property set to argument.
3. Set last node `next` property to node created on step 2.
4. Increment `size` of the list.

#### At( `index` )

`at()` method allows us to lookup a specific node in insertion order:

1. Exit with `null` on no nodes in the list.
2. Exit with root node if `index` is `0`.
3. Exit with last node if index is equal to last.
4. Traverse list incrementing a counter on each iteration. When it reaches `index`, return current node.

#### Insert( `value`, `index` )

`insert()` method splices in a new node at index provided. The algorithm contains three use cases: if `index` is 0, is equal to last node index, or an arbitrary one:

1. If there are no nodes, behave as `add()`. 
2. Create a node with `value` property set to argument.
3. If `index` is `0`, store root, set new node `next` property to root and make new node root.
   If `index` is last node index, traverse the list with `at()` method, root changed to the output of traversal.
   If `index` is arbitrary, traverse the list until reached index, root changed to traversal output.
4. Increment `size` of the list.

Note that second and third case in step 3 you don't have to share logic, since `at()` will traverse to the last node if index is equal to last node index.

#### Pop()

`pop()` method removes last node found in the list. Therefore, the algorithm builds upon `at()` traversal method defined above:

1. If there are no nodes, do nothing.
If there is only one node, set root node to `null`.
2. Get the node before last with `at()` method.
3. Set `next` property of the found node to `null`.
4. Decrement `size` of the list.

#### Remove( `index` )

`remove()` method to `pop()` is what `insert()` is to `add()`, thus the algorithm will be similar to how `pop()` works:

1. If there are no nodes or `index` is out of bounds, do nothing.
   If there is only one node or no index, behave as `pop()`.
2. Get the node before last with `at()` method.
3. Set `next` property of the found node to its `next` property.
4. Decrement `size` of the list.

## Binary Trees

Binary trees are data structures where any given node at 0, 1, 2 child nodes (leaves).

### Traversal

Binary trees can be iterated upon using different algorithms, divided into two categories based on which dimension of a tree is explored first: *depth* or *level*.

#### Depth

Depth traversal iterates over subtrees first.

##### Inorder

**Node Pattern**: Left > Root > Right

##### Preorder

**Node Pattern**: Root > Left > Right

##### Postorder

**Post Order**: Left > Right -> Root

#### Level (breadth)

Level traversal iterates over nodes on the same level first.