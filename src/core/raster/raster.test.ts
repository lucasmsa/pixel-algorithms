import { describe, expect, it } from 'vitest';
import { collectFrames } from '../frame';
import { bresenhamLine } from './bresenham';
import { midpointCircle } from './midpointCircle';

const cells = (frames: ReturnType<typeof collectFrames>) => frames.flatMap((f) => f.painted).map((p) => [p.x, p.y]);

describe('bresenhamLine', () => {
  it('draws the classic shallow line', () => {
    expect(cells(collectFrames(bresenhamLine({ from: { x: 0, y: 0 }, to: { x: 5, y: 2 } })))).toEqual([
      [0, 0], [1, 0], [2, 1], [3, 1], [4, 2], [5, 2],
    ]);
  });
  it('is symmetric in direction and handles steep and degenerate lines', () => {
    const forward = cells(collectFrames(bresenhamLine({ from: { x: 0, y: 0 }, to: { x: 2, y: 7 } })));
    expect(forward).toHaveLength(8);
    expect(forward[0]).toEqual([0, 0]);
    expect(forward.at(-1)).toEqual([2, 7]);
    expect(cells(collectFrames(bresenhamLine({ from: { x: 3, y: 3 }, to: { x: 3, y: 3 } })))).toEqual([[3, 3]]);
  });
});

describe('midpointCircle', () => {
  it('radius 0 is the centre, radius 3 has 16 distinct cells', () => {
    expect(cells(collectFrames(midpointCircle({ center: { x: 4, y: 4 }, radius: 0 })))).toEqual([[4, 4]]);
    const set = new Set(cells(collectFrames(midpointCircle({ center: { x: 10, y: 10 }, radius: 3 }))).map((c) => c.join(',')));
    expect(set.size).toBe(16);
    expect(set.has('13,10')).toBe(true);
    expect(set.has('10,7')).toBe(true);
  });
});
