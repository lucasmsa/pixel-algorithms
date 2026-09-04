import { frame, type Frame } from '../frame';
import { heuristics } from '../heuristics';
import { pointKey, samePoint, type Point } from '../types';
import { BinaryHeap } from './heap';
import { stepsFrom } from './neighbors';
import type { SearchInput } from './types';

interface Entry {
  readonly f: number;
  readonly h: number;
  readonly order: number;
  readonly point: Point;
}

/** Lexicographic (f, h, insertion order), which is what Python's heapq does with tuples. */
const compareEntries = (a: Entry, b: Entry): number =>
  a.f !== b.f ? a.f - b.f : a.h !== b.h ? a.h - b.h : a.order - b.order;

export interface Priority {
  /** How g and h combine into the queue key. */
  readonly f: (g: number, h: number) => number;
}

export const A_STAR_PRIORITY: Priority = { f: (g, h) => g + h };
export const GREEDY_PRIORITY: Priority = { f: (_g, h) => h };

/**
 * Shared best-first engine. A* is f = g + h, greedy is f = h, Dijkstra is A*
 * with weight 0. Expansion order is deterministic and matches the Python
 * reference for A*.
 */
export function* bestFirst(input: SearchInput, priority: Priority): Generator<Frame, void, undefined> {
  const { grid, start, goal, connectivity, heuristic, weight } = input;
  const hFn = heuristics[heuristic];
  const h = (p: Point) => weight * hFn(Math.abs(p.x - goal.x), Math.abs(p.y - goal.y));

  const g = new Map<number, number>([[pointKey(start), 0]]);
  const parent = new Map<number, Point>();
  const closed = new Set<number>();
  const heap = new BinaryHeap<Entry>(compareEntries);
  let order = 0;
  const h0 = h(start);
  heap.push({ f: priority.f(0, h0), h: h0, order, point: start });

  while (heap.size > 0) {
    const { point: current } = heap.pop()!;
    const key = pointKey(current);
    if (closed.has(key)) continue;
    closed.add(key);
    const gCurrent = g.get(key)!;

    if (samePoint(current, goal)) {
      yield frame({ current, closed: [current], path: reconstruct(parent, current), cost: gCurrent, done: true });
      return;
    }

    const opened: Point[] = [];
    for (const step of stepsFrom(grid, current, connectivity)) {
      const nKey = pointKey(step.point);
      if (closed.has(nKey)) continue;
      const tentative = gCurrent + step.cost;
      if (tentative < (g.get(nKey) ?? Infinity)) {
        g.set(nKey, tentative);
        parent.set(nKey, current);
        order += 1;
        const hn = h(step.point);
        heap.push({ f: priority.f(tentative, hn), h: hn, order, point: step.point });
        opened.push(step.point);
      }
    }
    yield frame({ current, opened, closed: [current], cost: gCurrent });
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
