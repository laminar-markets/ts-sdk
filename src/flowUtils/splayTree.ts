import { Sentinel, sentinelToNumber } from "./sentinel";

export interface UnparsedNode<T> {
  key: string;
  left: Sentinel;
  right: Sentinel;
  value: T;
}

export interface UnparsedTree<T> {
  root: Sentinel;
  nodes: Array<UnparsedNode<T>>;
  min: Sentinel;
  max: Sentinel;
  removed_nodes: Array<number>;
  single_splay: boolean;
}

export interface Node<T> {
  key: number;
  left: number | null;
  right: number | null;
  value: T;
}

export class SplayTree<T> {
  root: number | null;
  nodes: Array<Node<T>>;
  min: number | null;
  max: number | null;

  public constructor(tree: UnparsedTree<T>) {
    this.root = sentinelToNumber(tree.root);
    this.nodes = tree.nodes.map(
      (node: UnparsedNode<T>): Node<T> => ({
        key: parseInt(node.key),
        left: sentinelToNumber(node.left),
        right: sentinelToNumber(node.right),
        value: node.value,
      })
    );
    this.min = sentinelToNumber(tree.min);
    this.max = sentinelToNumber(tree.max);
  }

  public getNodeByIndex(idx: number): Node<T> {
    return this.nodes[idx];
  }
}
