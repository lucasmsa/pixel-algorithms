import type { AlgorithmId } from '../config/algorithms';
import { collectFrames, type Frame } from './frame';
import type { Grid } from './grid';
import type { GrayImage } from './image/gray';
import { resampleGray } from './image/gray';
import { floodFill } from './fill/floodFill';
import { bresenhamLine } from './raster/bresenham';
import { midpointCircle } from './raster/midpointCircle';
import { floydSteinberg } from './dither/floydSteinberg';
import { BAYER_4, BAYER_8, orderedDither } from './dither/ordered';
import { marchingSquares } from './contour/marchingSquares';
import { astar } from './search/astar';
import { dijkstra } from './search/dijkstra';
import { greedy } from './search/greedy';
import { bfs } from './search/bfs';
import type { Connectivity, HeuristicName, Point } from './types';

export interface RunInput {
  readonly algorithm: AlgorithmId;
  readonly grid: Grid;
  readonly start: Point;
  readonly goal: Point;
  readonly heuristic: HeuristicName;
  readonly connectivity: Connectivity;
  readonly weight: number;
  readonly radius: number;
  readonly bayer: 4 | 8;
  readonly image: GrayImage | null;
}

/** Pure dispatcher: state in, every frame out. */
export function runAlgorithm(input: RunInput): Frame[] {
  const search = { grid: input.grid, start: input.start, goal: input.goal, connectivity: input.connectivity, heuristic: input.heuristic, weight: input.weight };
  switch (input.algorithm) {
    case 'astar':
      return collectFrames(astar(search));
    case 'dijkstra':
      return collectFrames(dijkstra(search));
    case 'greedy':
      return collectFrames(greedy(search));
    case 'bfs':
      return collectFrames(bfs(search));
    case 'floodFill':
      return collectFrames(floodFill({ grid: input.grid, seed: input.start, connectivity: input.connectivity }));
    case 'bresenham':
      return collectFrames(bresenhamLine({ from: input.start, to: input.goal }));
    case 'midpointCircle':
      return collectFrames(midpointCircle({ center: input.start, radius: input.radius }));
    case 'floydSteinberg':
      return input.image ? collectFrames(floydSteinberg({ image: resampleGray(input.image, input.grid.width, input.grid.height) })) : [];
    case 'ordered':
      return input.image
        ? collectFrames(orderedDither({ image: resampleGray(input.image, input.grid.width, input.grid.height), matrix: input.bayer === 4 ? BAYER_4 : BAYER_8 }))
        : [];
    case 'marchingSquares':
      return collectFrames(marchingSquares({ grid: input.grid }));
  }
}
