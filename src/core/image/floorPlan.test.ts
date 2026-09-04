import { describe, expect, it } from 'vitest';
import { gridToStrings, wallCount } from '../grid';
import { dilateWalls, downsampleWalls, wallsFromStrings, planGridSize, floorPlanToGrid } from './floorPlan';
import source from '../__fixtures__/mapa_robotica_source.json';
import mapaRobotica from '../__fixtures__/mapa_robotica.json';

describe('floor plan pipeline', () => {
  it('matches the Python grid size rule', () => {
    expect(planGridSize(450, 360, { resolution: 50, cellsPerBlock: 8 })).toEqual({ width: 72, height: 56 });
  });

  it('dilating by 0 is the identity and by 1 grows a lone wall to 3x3', () => {
    const walls = wallsFromStrings(['.....', '.....', '..#..', '.....', '.....']);
    expect(dilateWalls(walls, 5, 5, 0)).toEqual(walls);
    const grown = dilateWalls(walls, 5, 5, 1);
    expect(grown.reduce((n, w) => n + w, 0)).toBe(9);
  });

  it('downsampling marks a cell as wall when any source pixel in it is a wall', () => {
    const walls = wallsFromStrings(['#...', '....', '....', '...#']);
    const grid = downsampleWalls(walls, 4, 4, 2, 2);
    expect(gridToStrings(grid)).toEqual(['#.', '.#']);
  });

  it('reproduces the mapa_robotica fixture from the source plan with robot radius 7', () => {
    const walls = wallsFromStrings(source.rows);
    const grid = floorPlanToGrid(walls, source.width, source.height, { robotRadius: 7, resolution: 50, cellsPerBlock: 8 });
    expect(gridToStrings(grid)).toEqual(mapaRobotica.grid);
    expect(wallCount(grid)).toBe(1912);
  });

  it('radius 0 gives the thin-wall grid the Python reference reports', () => {
    const walls = wallsFromStrings(source.rows);
    const grid = floorPlanToGrid(walls, source.width, source.height, { robotRadius: 0, resolution: 50, cellsPerBlock: 8 });
    expect(wallCount(grid)).toBe(916);
  });
});
