import type { Grid } from '../grid';
import type { Connectivity, HeuristicName, Point } from '../types';

export interface SearchInput {
  readonly grid: Grid;
  readonly start: Point;
  readonly goal: Point;
  readonly connectivity: Connectivity;
  readonly heuristic: HeuristicName;
  /** Multiplies h. 1 is plain A*, 0 is Dijkstra, above 1 trades optimality for speed. */
  readonly weight: number;
}
