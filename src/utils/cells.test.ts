import { describe, expect, it } from 'vitest';
import { gridFromStrings } from '../core/grid';
import { centreThatFits } from './cells';

const openGrid = (width: number, height: number) => gridFromStrings(Array.from({ length: height }, () => '.'.repeat(width)));

describe('centreThatFits', () => {
  const open = openGrid(20, 20);

  it('leaves a centre that already fits where it is', () => {
    expect(centreThatFits(open, { x: 10, y: 10 }, 4)).toEqual({ x: 10, y: 10 });
  });

  it('pulls a corner centre in by the radius', () => {
    expect(centreThatFits(open, { x: 1, y: 1 }, 6)).toEqual({ x: 6, y: 6 });
    expect(centreThatFits(open, { x: 19, y: 19 }, 6)).toEqual({ x: 13, y: 13 });
  });

  it('centres the circle when the radius is too big to fit', () => {
    expect(centreThatFits(openGrid(16, 16), { x: 6, y: 6 }, 18)).toEqual({ x: 7, y: 7 });
  });

  it('centres only the axis the radius does not fit on', () => {
    expect(centreThatFits(openGrid(60, 20), { x: 6, y: 6 }, 15)).toEqual({ x: 15, y: 9 });
  });
});
