import type { Frame } from '../frame';
import { A_STAR_PRIORITY, bestFirst } from './bestFirst';
import type { SearchInput } from './types';

export const dijkstra = (input: SearchInput): Generator<Frame, void, undefined> =>
  bestFirst({ ...input, weight: 0 }, A_STAR_PRIORITY);
