import { create } from 'zustand';
import { ALGORITHMS, algorithmById, type AlgorithmId } from '../config/algorithms';
import { DEFAULT_CELLS_PER_BLOCK, DEFAULT_GOAL, DEFAULT_MAP_NAME, DEFAULT_ROBOT_RADIUS, DEFAULT_START, PLAN_RESOLUTION, SPEED_OPTIONS } from '../config/defaults';
import type { Frame } from '../core/frame';
import { cloneGrid, gridFromStrings, setWall, type Grid } from '../core/grid';
import { floorPlanToGrid } from '../core/image/floorPlan';
import type { GrayImage } from '../core/image/gray';
import { runAlgorithm } from '../core/run';
import type { Connectivity, HeuristicName, Point } from '../core/types';
import { centreThatFits, nearestFreeCell } from '../utils/cells';
import mapaRobotica from '../core/__fixtures__/mapa_robotica.json';

export type Tool = 'wall' | 'erase';

export interface DragPreview {
  readonly which: 'start' | 'goal';
  readonly at: Point;
  readonly valid: boolean;
}

export interface SourcePlan {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly walls: Uint8Array;
  readonly gray: GrayImage | null;
}

export interface StudioState {
  grid: Grid;
  start: Point;
  goal: Point;
  algorithm: AlgorithmId;
  heuristic: HeuristicName;
  connectivity: Connectivity;
  weight: number;
  radius: number;
  bayer: 4 | 8;
  robotRadius: number;
  cellsPerBlock: number;
  plan: SourcePlan | null;
  /** True while the only plan loaded is the one that ships with the app. */
  planIsDefault: boolean;
  tool: Tool;
  drag: DragPreview | null;
  frames: Frame[];
  playhead: number;
  playing: boolean;
  speed: (typeof SPEED_OPTIONS)[number];

  setAlgorithm(id: AlgorithmId): void;
  setHeuristic(h: HeuristicName): void;
  setConnectivity(c: Connectivity): void;
  setWeight(w: number): void;
  setRadius(r: number): void;
  setBayer(b: 4 | 8): void;
  setTool(t: Tool): void;
  setDrag(d: DragPreview | null): void;
  paintCells(cells: readonly Point[], wall: boolean): void;
  moveStart(p: Point): void;
  moveGoal(p: Point): void;
  loadPlan(plan: SourcePlan): void;
  setRobotRadius(r: number): void;
  setCellsPerBlock(n: number): void;
  useDitherAsMap(): void;
  clearWalls(): void;
  setPlayhead(n: number): void;
  togglePlaying(): void;
  step(delta: number): void;
  setSpeed(s: StudioState['speed']): void;
}

const initialGrid = gridFromStrings(mapaRobotica.grid);

type Inputs = Pick<StudioState, 'algorithm' | 'grid' | 'start' | 'goal' | 'heuristic' | 'connectivity' | 'weight' | 'radius' | 'bayer' | 'plan' | 'planIsDefault'>;

// The shipped floor plan is a map, not something anyone asked to dither. Passing
// it as the dither source turned the walls into scattered dots and read as a bug.
const compute = (s: Inputs): Frame[] =>
  runAlgorithm({ ...s, image: s.planIsDefault ? null : (s.plan?.gray ?? null) });

/**
 * Recompute frames and show the finished picture. Editing a wall or a parameter
 * is a comparison, so the result is what you want on screen straight away.
 */
const withFrames = (s: Inputs & Partial<StudioState>): Partial<StudioState> => {
  const frames = compute(s);
  return { ...s, frames, playhead: frames.length, playing: false };
};

/** Picking an algorithm is a request to watch it, so it rewinds and runs. */
const withRun = (s: Inputs & Partial<StudioState>): Partial<StudioState> => ({
  ...withFrames(s),
  playhead: 0,
  playing: true,
});

function rebuildFromPlan(plan: SourcePlan, robotRadius: number, cellsPerBlock: number, start: Point, goal: Point) {
  const grid = floorPlanToGrid(plan.walls, plan.width, plan.height, { robotRadius, resolution: PLAN_RESOLUTION, cellsPerBlock });
  return { grid, start: nearestFreeCell(grid, start), goal: nearestFreeCell(grid, goal) };
}

export const useStudioStore = create<StudioState>((set, get) => {
  const base = {
    grid: initialGrid,
    start: DEFAULT_START,
    goal: DEFAULT_GOAL,
    algorithm: 'astar' as AlgorithmId,
    heuristic: 'octile' as HeuristicName,
    connectivity: 8 as Connectivity,
    weight: 1,
    radius: 18,
    bayer: 4 as const,
    plan: null,
    planIsDefault: true,
  };
  const frames = compute(base);
  return {
    ...base,
    robotRadius: DEFAULT_ROBOT_RADIUS,
    cellsPerBlock: DEFAULT_CELLS_PER_BLOCK,
    tool: 'wall',
    drag: null,
    frames,
    // The page opens mid-run for the same reason picking an algorithm does: the
    // frames are the point, and a finished picture hides them.
    playhead: 0,
    playing: true,
    speed: SPEED_OPTIONS[2],

    setAlgorithm: (algorithm) => {
      const s = get();
      const start = algorithm === 'midpointCircle' ? centreThatFits(s.grid, s.start, s.radius) : s.start;
      set(withRun({ ...s, algorithm, start }));
    },
    setHeuristic: (heuristic) => set(withFrames({ ...get(), heuristic })),
    setConnectivity: (connectivity) => set(withFrames({ ...get(), connectivity })),
    setWeight: (weight) => set(withFrames({ ...get(), weight })),
    setRadius: (radius) => set(withFrames({ ...get(), radius })),
    setBayer: (bayer) => set(withFrames({ ...get(), bayer })),
    setTool: (tool) => set({ tool }),
    setDrag: (drag) => set({ drag }),
    paintCells: (cells, wall) => {
      const s = get();
      const grid = cloneGrid(s.grid);
      for (const c of cells) {
        if ((c.x === s.start.x && c.y === s.start.y) || (c.x === s.goal.x && c.y === s.goal.y)) continue;
        setWall(grid, c.x, c.y, wall);
      }
      set(withFrames({ ...s, grid }));
    },
    moveStart: (start) => set(withFrames({ ...get(), start })),
    moveGoal: (goal) => set(withFrames({ ...get(), goal })),
    loadPlan: (plan) => {
      const s = get();
      const isDefault = plan.name === DEFAULT_MAP_NAME;
      const preferredStart = isDefault ? DEFAULT_START : { x: 0, y: 0 };
      const rebuilt = rebuildFromPlan(plan, s.robotRadius, s.cellsPerBlock, preferredStart, isDefault ? DEFAULT_GOAL : { x: 1_000_000, y: 1_000_000 });
      const goal = isDefault ? rebuilt.goal : nearestFreeCell(rebuilt.grid, { x: rebuilt.grid.width - 1, y: rebuilt.grid.height - 1 });
      // The shipped plan arrives one fetch after boot, so it has to run rather
      // than settle, or the page lands on a finished picture every time.
      const next = { ...s, plan, planIsDefault: isDefault, grid: rebuilt.grid, start: rebuilt.start, goal };
      set(isDefault ? withRun(next) : withFrames(next));
    },
    setRobotRadius: (robotRadius) => {
      const s = get();
      if (!s.plan) return set({ robotRadius });
      set(withFrames({ ...s, robotRadius, ...rebuildFromPlan(s.plan, robotRadius, s.cellsPerBlock, s.start, s.goal) }));
    },
    setCellsPerBlock: (cellsPerBlock) => {
      const s = get();
      if (!s.plan) return set({ cellsPerBlock });
      const scale = cellsPerBlock / s.cellsPerBlock;
      const scaled = (p: Point) => ({ x: Math.round(p.x * scale), y: Math.round(p.y * scale) });
      set(withFrames({ ...s, cellsPerBlock, ...rebuildFromPlan(s.plan, s.robotRadius, cellsPerBlock, scaled(s.start), scaled(s.goal)) }));
    },
    useDitherAsMap: () => {
      const s = get();
      const meta = algorithmById(s.algorithm);
      if (meta.group !== 'dither') return;
      const grid = cloneGrid(s.grid);
      grid.cells.fill(0);
      for (const f of s.frames) for (const p of f.painted) if (p.value === 1) grid.cells[p.y * grid.width + p.x] = 1;
      set(withFrames({ ...s, algorithm: 'astar', grid, start: nearestFreeCell(grid, s.start), goal: nearestFreeCell(grid, s.goal) }));
    },
    clearWalls: () => {
      const s = get();
      const grid = cloneGrid(s.grid);
      grid.cells.fill(0);
      set(withFrames({ ...s, grid }));
    },
    setPlayhead: (playhead) => set({ playhead: Math.max(0, Math.min(playhead, get().frames.length)), playing: false }),
    togglePlaying: () => {
      const s = get();
      if (s.playing) return set({ playing: false });
      set({ playing: true, playhead: s.playhead >= s.frames.length ? 0 : s.playhead });
    },
    step: (delta) => set((s) => ({ playing: false, playhead: Math.max(0, Math.min(s.playhead + delta, s.frames.length)) })),
    setSpeed: (speed) => set({ speed }),
  };
});

export const selectMeta = (s: StudioState) => algorithmById(s.algorithm);
export const ALGORITHM_LIST = ALGORITHMS;
