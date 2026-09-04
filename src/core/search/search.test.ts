import { describe, expect, it } from 'vitest';
import { gridFromStrings, isWall } from '../grid';
import { collectFrames, lastFrame } from '../frame';
import { astar } from './astar';
import { dijkstra } from './dijkstra';
import { greedy } from './greedy';
import { bfs } from './bfs';
import { SQRT2 } from '../heuristics';
import openRoom from '../__fixtures__/open_room.json';
import corridors from '../__fixtures__/corridors.json';
import mapaRobotica from '../__fixtures__/mapa_robotica.json';

type Fixture = typeof openRoom;

const open = (w: number, h: number) => gridFromStrings(Array.from({ length: h }, () => '.'.repeat(w)));

function runFixture(fixture: Fixture) {
  const grid = gridFromStrings(fixture.grid);
  const frames = collectFrames(
    astar({
      grid,
      start: { x: fixture.start[0]!, y: fixture.start[1]! },
      goal: { x: fixture.goal[0]!, y: fixture.goal[1]! },
      connectivity: fixture.connectivity as 4 | 8,
      heuristic: fixture.heuristic as 'octile' | 'manhattan',
      weight: 1,
    }),
  );
  const expansionOrder = frames.filter((f) => f.current).map((f) => [f.current!.x, f.current!.y]);
  const last = lastFrame(frames);
  return { frames, expansionOrder, last };
}

describe('astar against the Python golden fixtures', () => {
  for (const fixture of [openRoom, corridors, mapaRobotica]) {
    it(`reproduces ${fixture.name}: path, expansion order and cost`, () => {
      const { expansionOrder, last } = runFixture(fixture);
      expect(expansionOrder).toEqual(fixture.expansionOrder);
      expect(last.path!.map((p) => [p.x, p.y])).toEqual(fixture.path);
      expect(last.path!.length).toBe(fixture.pathLength);
      expect(last.cost).toBeCloseTo(fixture.cost!, 9);
      expect(last.done).toBe(true);
    });
  }
});

describe('search family', () => {
  it('astar charges sqrt2 for diagonals and never cuts corners', () => {
    const result = lastFrame(collectFrames(astar({ grid: open(5, 5), start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, connectivity: 8, heuristic: 'octile', weight: 1 })));
    expect(result.cost).toBeCloseTo(4 * SQRT2, 12);
    const blocked = gridFromStrings(['.#', '#.']);
    const none = lastFrame(collectFrames(astar({ grid: blocked, start: { x: 0, y: 0 }, goal: { x: 1, y: 1 }, connectivity: 8, heuristic: 'octile', weight: 1 })));
    expect(none.path).toBeNull();
    expect(none.done).toBe(true);
  });

  it('dijkstra finds the same cost as astar', () => {
    const grid = gridFromStrings(corridors.grid);
    const input = { grid, start: { x: 0, y: 0 }, goal: { x: 19, y: 14 }, connectivity: 4 as const, heuristic: 'manhattan' as const, weight: 1 };
    const a = lastFrame(collectFrames(astar(input)));
    const d = lastFrame(collectFrames(dijkstra(input)));
    expect(d.cost).toBeCloseTo(a.cost, 9);
    expect(d.path!.length).toBe(a.path!.length);
  });

  it('greedy reaches the goal with a valid path, not necessarily optimal', () => {
    const grid = gridFromStrings(openRoom.grid);
    const g = lastFrame(collectFrames(greedy({ grid, start: { x: 1, y: 1 }, goal: { x: 8, y: 6 }, connectivity: 8, heuristic: 'octile', weight: 1 })));
    expect(g.path![0]).toEqual({ x: 1, y: 1 });
    expect(g.path!.at(-1)).toEqual({ x: 8, y: 6 });
    for (const p of g.path!) expect(isWall(grid, p.x, p.y)).toBe(false);
    expect(g.cost).toBeGreaterThanOrEqual(openRoom.cost!);
  });

  it('bfs counts steps and finds the shortest 4-connected path', () => {
    const grid = gridFromStrings(corridors.grid);
    const b = lastFrame(collectFrames(bfs({ grid, start: { x: 0, y: 0 }, goal: { x: 19, y: 14 }, connectivity: 4, heuristic: 'manhattan', weight: 1 })));
    expect(b.cost).toBe(corridors.cost);
    expect(b.path!.length).toBe(corridors.pathLength);
  });

  it('weight 0 makes astar behave like dijkstra', () => {
    const grid = gridFromStrings(openRoom.grid);
    const input = { grid, start: { x: 1, y: 1 }, goal: { x: 8, y: 6 }, connectivity: 8 as const, heuristic: 'octile' as const };
    const a0 = collectFrames(astar({ ...input, weight: 0 }));
    const d = collectFrames(dijkstra({ ...input, weight: 1 }));
    expect(a0.filter((f) => f.current).length).toBe(d.filter((f) => f.current).length);
  });
});
