import { createGrid, type Grid } from '../grid';
import type { GrayImage } from './gray';

export interface PlanOptions {
  /** Wall inflation in source pixels; the robot is then treated as a point. */
  readonly robotRadius: number;
  /** Source pixels per block. */
  readonly resolution: number;
  /** Grid cells per block, per axis. */
  readonly cellsPerBlock: number;
}

export const DEFAULT_PLAN_OPTIONS: PlanOptions = { robotRadius: 7, resolution: 50, cellsPerBlock: 8 };

/** Wall mask from a string picture: '#' is wall. Row-major Uint8Array, 1 wall. */
export function wallsFromStrings(rows: readonly string[]): Uint8Array {
  const width = rows[0]?.length ?? 0;
  const walls = new Uint8Array(width * rows.length);
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x++) if (row[x] === '#') walls[y * width + x] = 1;
  });
  return walls;
}

export function wallsFromGray(image: GrayImage, threshold = 5 / 255): Uint8Array {
  const walls = new Uint8Array(image.width * image.height);
  for (let i = 0; i < walls.length; i++) if (image.data[i]! < threshold) walls[i] = 1;
  return walls;
}

/**
 * Grow walls by `radius` with a (2r+1)^2 square kernel. Equivalent to the
 * reference's cv2.erode on a grayscale plan followed by thresholding.
 * Two 1-D passes keep it O(pixels * radius) instead of O(pixels * radius^2).
 */
export function dilateWalls(walls: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius <= 0) return Uint8Array.from(walls);
  const horizontal = new Uint8Array(walls.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!walls[y * width + x]) continue;
      const from = Math.max(0, x - radius);
      const to = Math.min(width - 1, x + radius);
      horizontal.fill(1, y * width + from, y * width + to + 1);
    }
  }
  const out = new Uint8Array(walls.length);
  for (let y = 0; y < height; y++) {
    const from = Math.max(0, y - radius);
    const to = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      for (let yy = from; yy <= to; yy++) {
        if (horizontal[yy * width + x]) {
          out[y * width + x] = 1;
          break;
        }
      }
    }
  }
  return out;
}

/** Same rule as the Python reference: floor(size / resolution) blocks, cellsPerBlock cells each. */
export function planGridSize(width: number, height: number, options: Pick<PlanOptions, 'resolution' | 'cellsPerBlock'>) {
  return {
    width: Math.max(1, Math.floor(width / options.resolution) * options.cellsPerBlock),
    height: Math.max(1, Math.floor(height / options.resolution) * options.cellsPerBlock),
  };
}

/** A grid cell is a wall if any source pixel mapping to it is a wall. */
export function downsampleWalls(walls: Uint8Array, width: number, height: number, gridWidth: number, gridHeight: number): Grid {
  const grid = createGrid(gridWidth, gridHeight);
  for (let y = 0; y < height; y++) {
    const cy = Math.floor((y * gridHeight) / height);
    for (let x = 0; x < width; x++) {
      if (!walls[y * width + x]) continue;
      const cx = Math.floor((x * gridWidth) / width);
      grid.cells[cy * gridWidth + cx] = 1;
    }
  }
  return grid;
}

export function floorPlanToGrid(walls: Uint8Array, width: number, height: number, options: PlanOptions): Grid {
  const inflated = dilateWalls(walls, width, height, options.robotRadius);
  const size = planGridSize(width, height, options);
  return downsampleWalls(inflated, width, height, size.width, size.height);
}
