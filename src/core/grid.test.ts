import { describe, expect, it } from 'vitest';
import { createGrid, gridFromStrings, gridToStrings, inBounds, isWall, setWall, wallCount, cloneGrid } from './grid';

describe('grid', () => {
  it('round-trips string rows', () => {
    const rows = ['..#', '#..', '...'];
    const grid = gridFromStrings(rows);
    expect(grid.width).toBe(3);
    expect(grid.height).toBe(3);
    expect(isWall(grid, 2, 0)).toBe(true);
    expect(isWall(grid, 1, 1)).toBe(false);
    expect(gridToStrings(grid)).toEqual(rows);
  });

  it('rejects ragged rows', () => {
    expect(() => gridFromStrings(['..', '...'])).toThrow();
  });

  it('bounds, wall count and clone independence', () => {
    const grid = createGrid(4, 3);
    expect(inBounds(grid, -1, 0)).toBe(false);
    expect(inBounds(grid, 3, 2)).toBe(true);
    expect(inBounds(grid, 4, 2)).toBe(false);
    const copy = cloneGrid(grid);
    setWall(copy, 1, 1, true);
    expect(wallCount(copy)).toBe(1);
    expect(wallCount(grid)).toBe(0);
  });
});
