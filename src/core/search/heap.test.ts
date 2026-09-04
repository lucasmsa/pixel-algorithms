import { describe, expect, it } from 'vitest';
import { BinaryHeap } from './heap';

describe('BinaryHeap', () => {
  it('pops in comparator order and handles duplicates', () => {
    const heap = new BinaryHeap<number>((a, b) => a - b);
    for (const n of [5, 3, 8, 1, 3, 9, 0]) heap.push(n);
    const out: number[] = [];
    while (heap.size > 0) out.push(heap.pop()!);
    expect(out).toEqual([0, 1, 3, 3, 5, 8, 9]);
    expect(heap.pop()).toBeUndefined();
  });
});
