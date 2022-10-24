import { Option } from ".";
import { Sentinel, U64_MAX_STR } from "./sentinel";

export interface UnparsedQueue<T> {
  head: Sentinel;
  tail: Sentinel;
  nodes: Array<UnparsedQueueNode<T>>;
  free_indices: Array<number>;
}

export interface UnparsedQueueNode<T> {
  next: Sentinel;
  value: Option<T>;
}

export class QueueNode<T> {
  next: number | null;
  value: T;

  public constructor(node: UnparsedQueueNode<T>) {
    if (node.value.vec.length === 0) {
      throw new Error("Value for queue node cannot be empty.");
    }
    const next =
      node.next.value !== U64_MAX_STR ? parseInt(node.next.value) : null;
    const value = node.value.vec[0];

    this.next = next;
    this.value = value;
  }
}

export class Queue<T> {
  values: Array<T>;

  public constructor(queue: UnparsedQueue<T>) {
    let idx = parseInt(queue.head.value);
    let node = new QueueNode(queue.nodes[idx]);

    const values: Array<T> = [];
    values.push(node.value);

    while (node.next != null) {
      idx = node.next;
      node = new QueueNode(queue.nodes[idx]);
      values.push(node.value);
    }

    this.values = values;
  }
}
