import type { Frame } from '../core/frame';
import type { Grid } from '../core/grid';
import type { Segment } from '../core/types';

export const CELL = {
  free: 0,
  wall: 1,
  open: 2,
  closed: 3,
  current: 4,
  path: 5,
  ink: 6,
  paper: 7,
} as const;

export type CellState = (typeof CELL)[keyof typeof CELL];

export interface Picture {
  readonly cells: Uint8Array;
  readonly segments: readonly Segment[];
  readonly openCount: number;
  readonly closedCount: number;
  readonly paintedCount: number;
  readonly path: readonly { x: number; y: number }[] | null;
  readonly cost: number;
  readonly done: boolean;
}

/** Replay frames [0, playhead) over the grid into a per-cell state buffer. */
export function replay(grid: Grid, frames: readonly Frame[], playhead: number, hideWalls = false): Picture {
  const cells = hideWalls ? new Uint8Array(grid.cells.length) : Uint8Array.from(grid.cells);
  const segments: Segment[] = [];
  let openCount = 0;
  let closedCount = 0;
  let paintedCount = 0;
  let cost = 0;
  let path: Picture['path'] = null;
  let done = false;
  const idx = (x: number, y: number) => y * grid.width + x;
  const upto = Math.min(playhead, frames.length);
  let previousCurrent: Frame['current'] = null;
  // What the cursor covered up. A search leaves a visited cell behind it, but a
  // dither has already painted the cell the cursor sits on, and demoting that to
  // visited drew a magenta stripe down the edge of the picture.
  let coveredByCurrent: number = CELL.free;
  for (let i = 0; i < upto; i++) {
    const f = frames[i]!;
    if (previousCurrent && cells[idx(previousCurrent.x, previousCurrent.y)] === CELL.current) {
      const painted = coveredByCurrent === CELL.ink || coveredByCurrent === CELL.paper;
      cells[idx(previousCurrent.x, previousCurrent.y)] = painted ? coveredByCurrent : CELL.closed;
    }
    for (const p of f.opened) {
      if (cells[idx(p.x, p.y)] === CELL.free) openCount++;
      cells[idx(p.x, p.y)] = CELL.open;
    }
    for (const p of f.closed) {
      const i = idx(p.x, p.y);
      if (cells[i] === CELL.open) openCount--;
      if (cells[i] !== CELL.closed) closedCount++;
      cells[i] = CELL.closed;
    }
    for (const p of f.painted) {
      cells[idx(p.x, p.y)] = p.value === 1 ? CELL.ink : CELL.paper;
      if (p.value === 1) paintedCount++;
    }
    if (f.segments.length) segments.push(...f.segments);
    if (f.current) {
      coveredByCurrent = cells[idx(f.current.x, f.current.y)]!;
      cells[idx(f.current.x, f.current.y)] = CELL.current;
      previousCurrent = f.current;
    }
    cost = f.cost;
    done = f.done;
    if (f.path) {
      path = f.path;
      for (const p of f.path) cells[idx(p.x, p.y)] = CELL.path;
    }
  }
  return { cells, segments, openCount, closedCount, paintedCount, path, cost, done };
}
