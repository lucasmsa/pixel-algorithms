import type { HeuristicName } from '../core/types';

export type AlgorithmId =
  | 'astar'
  | 'dijkstra'
  | 'greedy'
  | 'bfs'
  | 'floodFill'
  | 'bresenham'
  | 'midpointCircle'
  | 'floydSteinberg'
  | 'ordered'
  | 'marchingSquares';

export type AlgorithmGroup = 'search' | 'fill' | 'raster' | 'dither' | 'contour';

export interface AlgorithmMeta {
  readonly id: AlgorithmId;
  readonly group: AlgorithmGroup;
  readonly name: string;
  /** What the frames show, in one sentence. */
  readonly frames: string;
  /** What the input is. */
  readonly input: string;
  readonly params: readonly ParamId[];
}

export type ParamId = 'heuristic' | 'connectivity' | 'weight' | 'radius' | 'bayer';

export const GROUP_LABEL: Record<AlgorithmGroup, string> = {
  search: 'Search',
  fill: 'Fill',
  raster: 'Raster',
  dither: 'Dither',
  contour: 'Contour',
};

export const ALGORITHMS: readonly AlgorithmMeta[] = [
  {
    id: 'astar',
    group: 'search',
    name: 'A*',
    input: 'grid, start, goal',
    frames: 'Each frame expands the open cell with the lowest g + h. Magenta is the frontier, the path appears on the last frame.',
    params: ['heuristic', 'connectivity', 'weight'],
  },
  {
    id: 'dijkstra',
    group: 'search',
    name: 'Dijkstra',
    input: 'grid, start, goal',
    frames: 'A* with the heuristic switched off. The frontier grows as a circle around the start.',
    params: ['connectivity'],
  },
  {
    id: 'greedy',
    group: 'search',
    name: 'Greedy best-first',
    input: 'grid, start, goal',
    frames: 'Expands whatever looks closest to the goal. Fast, and happy to pick a longer path.',
    params: ['heuristic', 'connectivity'],
  },
  {
    id: 'bfs',
    group: 'search',
    name: 'Breadth-first',
    input: 'grid, start, goal',
    frames: 'Expands in rings of equal step count. Optimal when every step costs the same.',
    params: ['connectivity'],
  },
  {
    id: 'floodFill',
    group: 'fill',
    name: 'Flood fill',
    input: 'grid, seed (start)',
    frames: 'Paints the free region around the start, one cell per frame. 8-connected leaks through diagonal gaps.',
    params: ['connectivity'],
  },
  {
    id: 'bresenham',
    group: 'raster',
    name: 'Bresenham line',
    input: 'start, goal',
    frames: 'One pixel per frame from start to goal, integer arithmetic only.',
    params: [],
  },
  {
    id: 'midpointCircle',
    group: 'raster',
    name: 'Midpoint circle',
    input: 'start (centre), radius',
    frames: 'One octant step per frame, mirrored eight ways.',
    params: ['radius'],
  },
  {
    id: 'floydSteinberg',
    group: 'dither',
    name: 'Floyd-Steinberg',
    input: 'imported image',
    frames: 'One row per frame. Each pixel rounds to ink or paper and pushes its error to the neighbours below and to the right.',
    params: [],
  },
  {
    id: 'ordered',
    group: 'dither',
    name: 'Ordered (Bayer)',
    input: 'imported image',
    frames: 'One row per frame. Each pixel is compared against a tiled threshold matrix, so the pattern is regular.',
    params: ['bayer'],
  },
  {
    id: 'marchingSquares',
    group: 'contour',
    name: 'Marching squares',
    input: 'grid',
    frames: 'One row of 2x2 windows per frame. Each window with mixed corners emits a contour segment.',
    params: [],
  },
];

export const algorithmById = (id: AlgorithmId): AlgorithmMeta => ALGORITHMS.find((a) => a.id === id)!;

export const HEURISTIC_OPTIONS: readonly { value: HeuristicName; label: string; note: string }[] = [
  { value: 'octile', label: 'Octile', note: 'exact for 8-connected moves' },
  { value: 'manhattan', label: 'Manhattan', note: 'exact for 4-connected moves' },
  { value: 'euclidean', label: 'Euclidean', note: 'straight-line distance' },
  { value: 'chebyshev', label: 'Chebyshev', note: 'diagonals cost 1, underestimates' },
];
