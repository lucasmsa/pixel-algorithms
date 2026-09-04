import { frame, type Frame } from '../frame';
import type { GrayImage } from '../image/gray';
import type { PaintedCell } from '../types';

export type BayerMatrix = readonly (readonly number[])[];

export const BAYER_4: BayerMatrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export const BAYER_8: BayerMatrix = (() => {
  const m: number[][] = [];
  for (let y = 0; y < 8; y++) {
    m.push([]);
    for (let x = 0; x < 8; x++) m[y]!.push(BAYER_4[y % 4]![x % 4]! * 4 + BAYER_4[Math.floor(y / 4)]![Math.floor(x / 4)]!);
  }
  return m;
})();

export interface OrderedInput {
  readonly image: GrayImage;
  readonly matrix: BayerMatrix;
}

/** Ordered (Bayer) dithering: threshold each pixel against a tiled matrix. One frame per row. */
export function* orderedDither({ image, matrix }: OrderedInput): Generator<Frame, void, undefined> {
  const { width, height } = image;
  const n = matrix.length;
  const levels = n * n;
  for (let y = 0; y < height; y++) {
    const painted: PaintedCell[] = [];
    const row = matrix[y % n]!;
    for (let x = 0; x < width; x++) {
      const threshold = (row[x % n]! + 0.5) / levels;
      painted.push({ x, y, value: image.data[y * width + x]! < threshold ? 1 : 0 });
    }
    yield frame({ current: { x: 0, y }, painted, cost: y + 1, done: y === height - 1 });
  }
}
