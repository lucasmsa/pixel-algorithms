import { frame, type Frame } from '../frame';
import type { GrayImage } from '../image/gray';
import type { PaintedCell } from '../types';

export interface DitherInput {
  readonly image: GrayImage;
}

/**
 * Floyd-Steinberg error diffusion. Ink (value 1) where the pixel rounds to
 * black. One frame per row so a 256x256 image is 256 frames, not 65k.
 */
export function* floydSteinberg({ image }: DitherInput): Generator<Frame, void, undefined> {
  const { width, height } = image;
  const buffer = Float32Array.from(image.data);
  for (let y = 0; y < height; y++) {
    const painted: PaintedCell[] = [];
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = buffer[i]!;
      const quantised = old < 0.5 ? 0 : 1;
      const error = old - quantised;
      painted.push({ x, y, value: quantised === 0 ? 1 : 0 });
      if (x + 1 < width) buffer[i + 1]! += (error * 7) / 16;
      if (y + 1 < height) {
        if (x > 0) buffer[i + width - 1]! += (error * 3) / 16;
        buffer[i + width]! += (error * 5) / 16;
        if (x + 1 < width) buffer[i + width + 1]! += error / 16;
      }
    }
    yield frame({ current: { x: 0, y }, painted, cost: y + 1, done: y === height - 1 });
  }
}
