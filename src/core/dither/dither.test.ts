import { describe, expect, it } from 'vitest';
import { collectFrames } from '../frame';
import { floydSteinberg } from './floydSteinberg';
import { orderedDither, BAYER_4 } from './ordered';
import type { GrayImage } from '../image/gray';

const gradient = (w: number, h: number): GrayImage => ({
  width: w,
  height: h,
  data: Float32Array.from({ length: w * h }, (_, i) => (i % w) / (w - 1)),
});

const ink = (frames: ReturnType<typeof collectFrames>) => frames.flatMap((f) => f.painted).filter((p) => p.value === 1).length;

describe('dithering', () => {
  it('floyd-steinberg keeps roughly half the ink on a 0..1 gradient and emits one frame per row', () => {
    const img = gradient(64, 16);
    const frames = collectFrames(floydSteinberg({ image: img }));
    expect(frames.filter((f) => f.painted.length > 0)).toHaveLength(16);
    const ratio = ink(frames) / (64 * 16);
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it('ordered dither is deterministic and uses the 4x4 Bayer matrix', () => {
    expect(BAYER_4[0]).toEqual([0, 8, 2, 10]);
    const img = gradient(64, 16);
    const a = ink(collectFrames(orderedDither({ image: img, matrix: BAYER_4 })));
    const b = ink(collectFrames(orderedDither({ image: img, matrix: BAYER_4 })));
    expect(a).toBe(b);
    expect(a / (64 * 16)).toBeGreaterThan(0.4);
    expect(a / (64 * 16)).toBeLessThan(0.6);
  });

  it('a solid white image produces no ink and a solid black image is all ink', () => {
    const white: GrayImage = { width: 4, height: 4, data: new Float32Array(16).fill(1) };
    const black: GrayImage = { width: 4, height: 4, data: new Float32Array(16) };
    expect(ink(collectFrames(floydSteinberg({ image: white })))).toBe(0);
    expect(ink(collectFrames(floydSteinberg({ image: black })))).toBe(16);
  });
});
