import { SplayTree, Node } from "./splayTree";
export class Iterator<T> {
  tree: SplayTree<T>;
  stack: Array<number>;
  isDone: boolean;
  reverse: boolean;

  public constructor(tree: SplayTree<T>, reverse: boolean) {
    this.tree = tree;
    this.stack = [];
    this.isDone = tree.root == null;
    this.reverse = reverse;
  }

  traverseLeft(parentIdx: number | null) {
    let idx = parentIdx;
    while (idx != null) {
      this.stack.push(idx);
      idx = this.tree.getNodeByIndex(idx).left;
    }
  }

  traverseRight(parentIdx: number | null) {
    let idx = parentIdx;
    while (idx != null) {
      this.stack.push(idx);
      idx = this.tree.getNodeByIndex(idx).right;
    }
  }

  private checkIsDone(idx: number) {
    if (this.tree.min == null || this.tree.max == null) {
      throw new Error("Tree is in invalid state");
    }

    if (!this.reverse) {
      const maxKey = this.tree.getNodeByIndex(this.tree.max);
      const nodeKey = this.tree.getNodeByIndex(idx);

      if (nodeKey == maxKey) {
        this.isDone = true;
      }
    } else {
      const minKey = this.tree.getNodeByIndex(this.tree.min);
      const nodeKey = this.tree.getNodeByIndex(idx);

      if (nodeKey == minKey) {
        this.isDone = true;
      }
    }
  }

  private nextNodeIdx(): number {
    if (this.tree.root == null) {
      throw new Error("Tree is empty");
    }
    if (this.isDone) {
      throw new Error("Iterator is already done!");
    }

    if (this.stack.length === 0) {
      this.traverseLeft(this.tree.root);
      return this.stack[this.stack.length - 1];
    }
    let current = this.stack[this.stack.length - 1];
    const right = this.tree.getNodeByIndex(current).right;
    if (right != null) {
      this.traverseLeft(right);
      return this.stack[this.stack.length - 1];
    } else {
      current = this.stack.pop() as number;
      let parent = this.stack[this.stack.length - 1];

      while (current !== this.tree.root) {
        const parentLeft = this.tree.getNodeByIndex(parent).left;
        const parentRight = this.tree.getNodeByIndex(parent).right;

        if (parentLeft != null && parentLeft === current) {
          return parent;
        } else if (parentRight != null && parentRight == current) {
          current = this.stack.pop() as number;
          parent = this.stack[this.stack.length - 1];
        } else {
          throw new Error("Parent child mismatch");
        }
      }
      throw new Error("Iterator is already done");
    }
  }

  private prevNodeIdx(): number {
    if (this.tree.root == null) {
      throw new Error("Tree is empty");
    }
    if (this.isDone) {
      throw new Error("Iterator is already done!");
    }

    if (this.stack.length === 0) {
      this.traverseRight(this.tree.root);
      return this.stack[this.stack.length - 1];
    }
    let current = this.stack[this.stack.length - 1];
    const left = this.tree.getNodeByIndex(current).left;
    if (left != null) {
      this.traverseRight(left);
      return this.stack[this.stack.length - 1];
    } else {
      current = this.stack.pop() as number;
      let parent = this.stack[this.stack.length - 1];

      while (current !== this.tree.root) {
        const parentLeft = this.tree.getNodeByIndex(parent).left;
        const parentRight = this.tree.getNodeByIndex(parent).right;

        if (parentRight != null && parentRight === current) {
          return parent;
        } else if (parentLeft != null && parentLeft == current) {
          current = this.stack.pop() as number;
          parent = this.stack[this.stack.length - 1];
        } else {
          throw new Error("Parent child mismatch");
        }
      }
      throw new Error("Iterator is already done");
    }
  }

  next(): Node<T> {
    if (!this.reverse) {
      const nextIdx = this.nextNodeIdx();
      this.checkIsDone(nextIdx);
      return this.tree.getNodeByIndex(nextIdx);
    } else {
      const prevIdx = this.prevNodeIdx();
      this.checkIsDone(prevIdx);
      return this.tree.getNodeByIndex(prevIdx);
    }
  }
}
