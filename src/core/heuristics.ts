import type { HeuristicName } from './types';

export const SQRT2 = Math.sqrt(2);

export type Heuristic = (dx: number, dy: number) => number;

export const heuristics: Record<HeuristicName, Heuristic> = {
  manhattan: (dx, dy) => dx + dy,
  euclidean: (dx, dy) => Math.sqrt(dx * dx + dy * dy),
  chebyshev: (dx, dy) => Math.max(dx, dy),
  // Same expression order as the Python reference so f values match bit for bit.
  octile: (dx, dy) => dx + dy + (SQRT2 - 2) * Math.min(dx, dy),
};
