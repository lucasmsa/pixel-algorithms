import { frame, type Frame } from '../frame';
import type { PaintedCell, Point } from '../types';

export interface CircleInput {
  readonly center: Point;
  readonly radius: number;
}

/** Midpoint circle. Each frame paints the up-to-eight symmetric cells of one octant step. */
export function* midpointCircle({ center, radius }: CircleInput): Generator<Frame, void, undefined> {
  if (radius <= 0) {
    yield frame({ current: center, painted: [{ ...center, value: 1 }], cost: 1, done: true });
    return;
  }
  let x = radius;
  let y = 0;
  let d = 1 - radius;
  let total = 0;
  while (x >= y) {
    const cells = octantCells(center, x, y);
    total += cells.length;
    const nextY = y + 1;
    const nextD = d < 0 ? d + 2 * nextY + 1 : d + 2 * (nextY - x) + 1;
    const nextX = d < 0 ? x : x - 1;
    const done = nextX < nextY;
    yield frame({ current: { x: center.x + x, y: center.y + y }, painted: cells, cost: total, done });
    y = nextY;
    d = nextD;
    x = nextX;
  }
}

function octantCells(c: Point, x: number, y: number): PaintedCell[] {
  const raw = [
    [x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y],
  ];
  const seen = new Set<string>();
  const cells: PaintedCell[] = [];
  for (const [dx, dy] of raw) {
    const key = `${dx},${dy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cells.push({ x: c.x + dx!, y: c.y + dy!, value: 1 });
  }
  return cells;
}
