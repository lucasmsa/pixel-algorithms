import type { Grid } from '../core/grid';
import { inBounds, isWall } from '../core/grid';
import type { Point } from '../core/types';

export const isFreeCell = (grid: Grid, p: Point): boolean => inBounds(grid, p.x, p.y) && !isWall(grid, p.x, p.y);

/** First free cell scanning from a preferred point outward in reading order; falls back to (0,0). */
export function nearestFreeCell(grid: Grid, preferred: Point): Point {
  if (isFreeCell(grid, preferred)) return preferred;
  for (let r = 1; r < Math.max(grid.width, grid.height); r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const p = { x: preferred.x + dx, y: preferred.y + dy };
        if (isFreeCell(grid, p)) return p;
      }
    }
  }
  return { x: 0, y: 0 };
}
