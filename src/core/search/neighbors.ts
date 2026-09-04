import { inBounds, isWall, type Grid } from '../grid';
import { SQRT2 } from '../heuristics';
import type { Connectivity, Point } from '../types';

/** Up, down, left, right, then diagonals. Same order as the Python reference. */
export const NEIGHBOR_ORDER: readonly Point[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: -1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
];

export interface Step {
  readonly point: Point;
  readonly cost: number;
}

/** Free neighbours of p. Diagonal moves need both orthogonal neighbours free (no corner cutting). */
export function stepsFrom(grid: Grid, p: Point, connectivity: Connectivity): Step[] {
  const moves = connectivity === 4 ? NEIGHBOR_ORDER.slice(0, 4) : NEIGHBOR_ORDER;
  const steps: Step[] = [];
  for (const { x: dx, y: dy } of moves) {
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (!inBounds(grid, nx, ny) || isWall(grid, nx, ny)) continue;
    const diagonal = dx !== 0 && dy !== 0;
    if (diagonal && (isWall(grid, p.x + dx, p.y) || isWall(grid, p.x, p.y + dy))) continue;
    steps.push({ point: { x: nx, y: ny }, cost: diagonal ? SQRT2 : 1 });
  }
  return steps;
}
