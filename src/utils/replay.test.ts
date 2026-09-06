import { describe, expect, it } from 'vitest';
import { gridFromStrings } from '../core/grid';
import { collectFrames, frame } from '../core/frame';
import { astar } from '../core/search/astar';
import { CELL, replay } from './replay';
import openRoom from '../core/__fixtures__/open_room.json';

describe('replay', () => {
  const grid = gridFromStrings(openRoom.grid);
  const frames = collectFrames(astar({ grid, start: { x: 1, y: 1 }, goal: { x: 8, y: 6 }, connectivity: 8, heuristic: 'octile', weight: 1 }));

  it('playhead 0 shows only the walls', () => {
    const pic = replay(grid, frames, 0);
    expect(pic.openCount).toBe(0);
    expect(pic.closedCount).toBe(0);
    expect(Array.from(pic.cells).filter((c) => c === CELL.wall)).toHaveLength(8);
  });

  it('the full replay closes every expansion and paints the path', () => {
    const pic = replay(grid, frames, frames.length);
    expect(pic.closedCount).toBe(openRoom.expansions);
    expect(pic.path).toHaveLength(openRoom.pathLength);
    expect(pic.done).toBe(true);
    expect(pic.cost).toBeCloseTo(openRoom.cost!, 9);
    expect(Array.from(pic.cells).filter((c) => c === CELL.path)).toHaveLength(openRoom.pathLength);
  });

  it('a partial replay has one current cell and a live open count', () => {
    const pic = replay(grid, frames, 5);
    expect(Array.from(pic.cells).filter((c) => c === CELL.current)).toHaveLength(1);
    expect(pic.openCount).toBeGreaterThan(0);
    expect(pic.closedCount).toBe(5);
  });

  it('leaves a painted cell painted after the cursor moves off it', () => {
    const blank = gridFromStrings(['....', '....']);
    const frames = [
      frame({ current: { x: 0, y: 0 }, painted: [{ x: 0, y: 0, value: 1 }] }),
      frame({ current: { x: 0, y: 1 }, painted: [{ x: 0, y: 1, value: 1 }], done: true }),
    ];
    const pic = replay(blank, frames, frames.length);
    expect(pic.cells[0]).toBe(CELL.ink);
    expect(pic.cells[4]).toBe(CELL.current);
  });

  it('still leaves a visited cell behind a search cursor', () => {
    const pic = replay(grid, frames, 5);
    expect(Array.from(pic.cells).filter((c) => c === CELL.closed).length).toBeGreaterThan(0);
  });
});
