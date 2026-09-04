export interface Point {
  readonly x: number;
  readonly y: number;
}

export type Connectivity = 4 | 8;

export type HeuristicName = 'manhattan' | 'euclidean' | 'chebyshev' | 'octile';

export interface PaintedCell extends Point {
  /** 1 = ink / filled, 0 = cleared. Fill and raster algorithms only ever paint 1. */
  readonly value: 0 | 1;
}

export interface Segment {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

export const pointKey = (p: Point): number => (p.y << 16) | p.x;
export const samePoint = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
