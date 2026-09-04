export const FREE = 0;
export const WALL = 1;

export interface Grid {
  readonly width: number;
  readonly height: number;
  /** Row-major, cells[y * width + x]; 0 free, 1 wall. */
  readonly cells: Uint8Array;
}

export function createGrid(width: number, height: number): Grid {
  return { width, height, cells: new Uint8Array(width * height) };
}

export function cloneGrid(grid: Grid): Grid {
  return { width: grid.width, height: grid.height, cells: new Uint8Array(grid.cells) };
}

export function gridFromStrings(rows: readonly string[]): Grid {
  const first = rows[0];
  if (first === undefined) throw new Error('grid needs at least one row');
  const width = first.length;
  if (rows.some((row) => row.length !== width)) throw new Error('all rows must have the same length');
  const grid = createGrid(width, rows.length);
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x++) if (row[x] === '#') grid.cells[y * width + x] = WALL;
  });
  return grid;
}

export function gridToStrings(grid: Grid): string[] {
  const rows: string[] = [];
  for (let y = 0; y < grid.height; y++) {
    let row = '';
    for (let x = 0; x < grid.width; x++) row += grid.cells[y * grid.width + x] === WALL ? '#' : '.';
    rows.push(row);
  }
  return rows;
}

export const inBounds = (grid: Grid, x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x < grid.width && y < grid.height;

export const isWall = (grid: Grid, x: number, y: number): boolean =>
  grid.cells[y * grid.width + x] === WALL;

export function setWall(grid: Grid, x: number, y: number, wall: boolean): void {
  grid.cells[y * grid.width + x] = wall ? WALL : FREE;
}

export function wallCount(grid: Grid): number {
  let n = 0;
  for (const c of grid.cells) if (c === WALL) n++;
  return n;
}
