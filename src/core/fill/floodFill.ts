import { frame, type Frame } from '../frame';
import { inBounds, isWall, type Grid } from '../grid';
import { NEIGHBOR_ORDER } from '../search/neighbors';
import { pointKey, type Connectivity, type Point } from '../types';

export interface FloodFillInput {
  readonly grid: Grid;
  readonly seed: Point;
  readonly connectivity: Connectivity;
}

/** Breadth-first flood fill of the free region around the seed. One frame per painted cell. */
export function* floodFill({ grid, seed, connectivity }: FloodFillInput): Generator<Frame, void, undefined> {
  if (!inBounds(grid, seed.x, seed.y) || isWall(grid, seed.x, seed.y)) {
    yield frame({ done: true });
    return;
  }
  const moves = connectivity === 4 ? NEIGHBOR_ORDER.slice(0, 4) : NEIGHBOR_ORDER;
  const seen = new Set<number>([pointKey(seed)]);
  const queue: Point[] = [seed];
  let head = 0;
  while (head < queue.length) {
    const p = queue[head++]!;
    for (const { x: dx, y: dy } of moves) {
      const n = { x: p.x + dx, y: p.y + dy };
      const key = pointKey(n);
      if (!inBounds(grid, n.x, n.y) || isWall(grid, n.x, n.y) || seen.has(key)) continue;
      seen.add(key);
      queue.push(n);
    }
    yield frame({ current: p, painted: [{ ...p, value: 1 }], cost: head, done: head === queue.length });
  }
}
