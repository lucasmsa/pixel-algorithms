import { describe, expect, it } from 'vitest';
import { gridFromStrings } from '../grid';
import { collectFrames } from '../frame';
import { marchingSquares } from './marchingSquares';

describe('marchingSquares', () => {
  it('a single wall cell yields a closed diamond of 4 segments', () => {
    const grid = gridFromStrings(['...', '.#.', '...']);
    const segments = collectFrames(marchingSquares({ grid })).flatMap((f) => f.segments);
    expect(segments).toHaveLength(4);
    for (const s of segments) {
      expect(Math.hypot(s.x1 - s.x0, s.y1 - s.y0)).toBeCloseTo(Math.SQRT1_2 * 1, 9);
    }
  });

  it('a 2x2 wall block yields 8 segments and an empty grid none', () => {
    const block = gridFromStrings(['....', '.##.', '.##.', '....']);
    expect(collectFrames(marchingSquares({ grid: block })).flatMap((f) => f.segments)).toHaveLength(8);
    const empty = gridFromStrings(['...', '...']);
    expect(collectFrames(marchingSquares({ grid: empty })).flatMap((f) => f.segments)).toHaveLength(0);
  });

  it('the saddle window between two diagonal walls emits two segments', () => {
    const saddle = gridFromStrings(['#.', '.#']);
    const segments = collectFrames(marchingSquares({ grid: saddle })).flatMap((f) => f.segments);
    expect(segments).toHaveLength(8);
    const inWindow = (v: number) => v >= 0.5 && v <= 1.5;
    const saddleSegments = segments.filter((s) => [s.x0, s.x1, s.y0, s.y1].every(inWindow));
    expect(saddleSegments).toHaveLength(2);
  });
});
