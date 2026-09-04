import type { Frame } from '../frame';
import { GREEDY_PRIORITY, bestFirst } from './bestFirst';
import type { SearchInput } from './types';

export const greedy = (input: SearchInput): Generator<Frame, void, undefined> =>
  bestFirst({ ...input, weight: input.weight === 0 ? 1 : input.weight }, GREEDY_PRIORITY);
