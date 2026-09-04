/** Grayscale image, 0 = black, 1 = white, row-major. */
export interface GrayImage {
  readonly width: number;
  readonly height: number;
  readonly data: Float32Array;
}

/** Rec. 601 luma, the same weights OpenCV uses for COLOR_BGR2GRAY. */
export const luma = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;

export function grayFromRgba(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): GrayImage {
  const data = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    data[i] = luma(rgba[i * 4]!, rgba[i * 4 + 1]!, rgba[i * 4 + 2]!) / 255;
  }
  return { width, height, data };
}

/** Area-average resample to a smaller size; keeps the aspect the caller chose. */
export function resampleGray(image: GrayImage, width: number, height: number): GrayImage {
  const out = new Float32Array(width * height);
  const sx = image.width / width;
  const sy = image.height / height;
  for (let y = 0; y < height; y++) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy));
    for (let x = 0; x < width; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx));
      let sum = 0;
      let n = 0;
      for (let yy = y0; yy < y1 && yy < image.height; yy++) {
        for (let xx = x0; xx < x1 && xx < image.width; xx++) {
          sum += image.data[yy * image.width + xx]!;
          n++;
        }
      }
      out[y * width + x] = n ? sum / n : 1;
    }
  }
  return { width, height, data: out };
}
