import { describe, expect, it } from 'vitest';
import { gridFromStrings } from '../grid';
import { collectFrames } from '../frame';
import { floodFill } from './floodFill';

describe('floodFill', () => {
  const grid = gridFromStrings(['..#..', '..#..', '##...', '.....']);

  it('4-connected fill stays inside the enclosed region', () => {
    const frames = collectFrames(floodFill({ grid, seed: { x: 0, y: 0 }, connectivity: 4 }));
    const painted = frames.flatMap((f) => f.painted);
    expect(painted.length).toBe(4);
    expect(painted.map((p) => `${p.x},${p.y}`).sort()).toEqual(['0,0', '0,1', '1,0', '1,1']);
  });

  it('8-connected fill leaks through the diagonal gap', () => {
    const frames = collectFrames(floodFill({ grid, seed: { x: 0, y: 0 }, connectivity: 8 }));
    const painted = frames.flatMap((f) => f.painted);
    expect(painted.length).toBe(20 - 4);
  });

  it('seed on a wall paints nothing', () => {
    const frames = collectFrames(floodFill({ grid, seed: { x: 2, y: 0 }, connectivity: 4 }));
    expect(frames.flatMap((f) => f.painted)).toHaveLength(0);
    expect(frames.at(-1)!.done).toBe(true);
  });
});
