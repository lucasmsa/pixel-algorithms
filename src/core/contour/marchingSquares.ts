import { frame, type Frame } from '../frame';
import { inBounds, isWall, type Grid } from '../grid';
import type { Segment } from '../types';

export interface ContourInput {
  readonly grid: Grid;
}

/**
 * Marching squares over cell centres: walls are inside, free cells outside.
 * Each 2x2 window of cells gets a 4-bit case; segments join edge midpoints in
 * cell-centre coordinates (cell (x, y) has its centre at (x + 0.5, y + 0.5)).
 * One frame per row of windows.
 */
export function* marchingSquares({ grid }: ContourInput): Generator<Frame, void, undefined> {
  const inside = (x: number, y: number) => inBounds(grid, x, y) && isWall(grid, x, y);
  let total = 0;
  // windows run from -1 to height-1 so outer walls still get an outline
  for (let y = -1; y < grid.height; y++) {
    const segments: Segment[] = [];
    for (let x = -1; x < grid.width; x++) {
      const tl = inside(x, y) ? 8 : 0;
      const tr = inside(x + 1, y) ? 4 : 0;
      const br = inside(x + 1, y + 1) ? 2 : 0;
      const bl = inside(x, y + 1) ? 1 : 0;
      for (const edges of CASES[tl | tr | br | bl]!) {
        const a = MIDPOINTS[edges[0]]!;
        const b = MIDPOINTS[edges[1]]!;
        segments.push({ x0: x + 0.5 + a.x, y0: y + 0.5 + a.y, x1: x + 0.5 + b.x, y1: y + 0.5 + b.y });
      }
    }
    total += segments.length;
    yield frame({ current: { x: 0, y: Math.max(y, 0) }, segments, cost: total, done: y === grid.height - 1 });
  }
}

/** Edge midpoints relative to the top-left cell centre: 0 top, 1 right, 2 bottom, 3 left. */
const MIDPOINTS = [
  { x: 0.5, y: 0 },
  { x: 1, y: 0.5 },
  { x: 0.5, y: 1 },
  { x: 0, y: 0.5 },
] as const;

/** Case table indexed by bits tl=8 tr=4 br=2 bl=1; saddles (5, 10) emit two segments. */
const CASES: readonly (readonly (readonly [number, number])[])[] = [
  [],
  [[3, 2]],
  [[2, 1]],
  [[3, 1]],
  [[0, 1]],
  [[3, 0], [2, 1]],
  [[0, 2]],
  [[3, 0]],
  [[3, 0]],
  [[0, 2]],
  [[3, 2], [0, 1]],
  [[0, 1]],
  [[3, 1]],
  [[2, 1]],
  [[3, 2]],
  [],
];
