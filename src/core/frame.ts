import type { PaintedCell, Point, Segment } from './types';

/**
 * One step of any algorithm. Frames are deltas: the renderer replays them up to
 * the playhead to rebuild the picture, so scrubbing is cheap and memory stays
 * linear in the number of touched cells.
 */
export interface Frame {
  /** Cell being expanded (search) or visited; null when the step has no focus cell. */
  readonly current: Point | null;
  readonly opened: readonly Point[];
  readonly closed: readonly Point[];
  readonly painted: readonly PaintedCell[];
  readonly segments: readonly Segment[];
  /** Set on the final frame of a search; null while searching or when no path exists. */
  readonly path: readonly Point[] | null;
  /** Cost so far: g of the current cell for searches, cells painted for fills, rows for dithers. */
  readonly cost: number;
  readonly done: boolean;
}

export const EMPTY_FRAME: Frame = {
  current: null,
  opened: [],
  closed: [],
  painted: [],
  segments: [],
  path: null,
  cost: 0,
  done: false,
};

export const frame = (partial: Partial<Frame>): Frame => ({ ...EMPTY_FRAME, ...partial });

export type Algorithm<Input> = (input: Input) => Generator<Frame, void, undefined>;

export function collectFrames(gen: Generator<Frame, void, undefined>, limit = 250_000): Frame[] {
  const frames: Frame[] = [];
  for (const f of gen) {
    frames.push(f);
    if (frames.length >= limit) break;
  }
  return frames;
}

export function lastFrame(frames: readonly Frame[]): Frame {
  const last = frames[frames.length - 1];
  if (!last) throw new Error('no frames');
  return last;
}
