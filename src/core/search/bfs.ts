import { frame, type Frame } from '../frame';
import { pointKey, samePoint, type Point } from '../types';
import { stepsFrom } from './neighbors';
import type { SearchInput } from './types';

/** Breadth-first search. Cost is the number of steps, diagonals included. */
export function* bfs(input: SearchInput): Generator<Frame, void, undefined> {
  const { grid, start, goal, connectivity } = input;
  const parent = new Map<number, Point>();
  const depth = new Map<number, number>([[pointKey(start), 0]]);
  const queue: Point[] = [start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++]!;
    const d = depth.get(pointKey(current))!;
    if (samePoint(current, goal)) {
      yield frame({ current, closed: [current], path: reconstruct(parent, current), cost: d, done: true });
      return;
    }
    const opened: Point[] = [];
    for (const { point } of stepsFrom(grid, current, connectivity)) {
      const key = pointKey(point);
      if (depth.has(key)) continue;
      depth.set(key, d + 1);
      parent.set(key, current);
      queue.push(point);
      opened.push(point);
    }
    yield frame({ current, opened, closed: [current], cost: d });
  }
  yield frame({ done: true, cost: Infinity });
}

function reconstruct(parent: ReadonlyMap<number, Point>, node: Point): Point[] {
  const path = [node];
  let p = parent.get(pointKey(node));
  while (p) {
    path.push(p);
    p = parent.get(pointKey(p));
  }
  return path.reverse();
}
