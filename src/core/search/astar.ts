import type { Frame } from '../frame';
import { A_STAR_PRIORITY, bestFirst } from './bestFirst';
import type { SearchInput } from './types';

export const astar = (input: SearchInput): Generator<Frame, void, undefined> => bestFirst(input, A_STAR_PRIORITY);
