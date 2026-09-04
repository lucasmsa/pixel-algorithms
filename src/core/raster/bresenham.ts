import { frame, type Frame } from '../frame';
import type { Point } from '../types';

export interface LineInput {
  readonly from: Point;
  readonly to: Point;
}

/** Bresenham's line, one frame per pixel, always walking from `from` to `to`. */
export function* bresenhamLine({ from, to }: LineInput): Generator<Frame, void, undefined> {
  const dx = Math.abs(to.x - from.x);
  const dy = -Math.abs(to.y - from.y);
  const sx = from.x < to.x ? 1 : -1;
  const sy = from.y < to.y ? 1 : -1;
  let err = dx + dy;
  let x = from.x;
  let y = from.y;
  let n = 0;
  for (;;) {
    n += 1;
    const done = x === to.x && y === to.y;
    yield frame({ current: { x, y }, painted: [{ x, y, value: 1 }], cost: n, done });
    if (done) return;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}
