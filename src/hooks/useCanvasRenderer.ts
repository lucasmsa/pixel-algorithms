import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { palette } from '../config/palette';
import { MIN_CELL_PX } from '../config/defaults';
import type { Point } from '../core/types';
import { CELL, replay, type Picture } from '../utils/replay';
import { selectMeta, useStudioStore, type DragPreview } from './useStudioStore';

const CELL_COLOR: Record<number, string> = {
  [CELL.free]: palette.paper,
  [CELL.wall]: palette.wall,
  [CELL.open]: palette.frontierSoft,
  [CELL.closed]: palette.frontier,
  [CELL.current]: palette.current,
  [CELL.path]: palette.path,
  [CELL.ink]: palette.ink,
  [CELL.paper]: palette.paper,
};

/**
 * A dither is a picture, so its ink is the ink colour. Everything else that
 * paints is drawing on top of a map, and `palette.ink` is `palette.wall`, so in
 * the ink colour a line, a circle or a fill was indistinguishable from walls.
 */
const inkColorFor = (group: string) => (group === 'dither' ? palette.ink : palette.frontier);

export interface RendererState {
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
  readonly stageRef: RefObject<HTMLDivElement | null>;
  readonly cellPx: number;
  readonly picture: Picture;
}

/** Owns the canvas: sizes it to the stage, replays frames to the playhead and paints. */
export function useCanvasRenderer(): RendererState {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const grid = useStudioStore((s) => s.grid);
  const frames = useStudioStore((s) => s.frames);
  const playhead = useStudioStore((s) => s.playhead);
  const start = useStudioStore((s) => s.start);
  const goal = useStudioStore((s) => s.goal);
  const meta = useStudioStore(selectMeta);
  const drag = useStudioStore((s) => s.drag);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const cellPx = useMemo(() => {
    if (!stageSize.width || !stageSize.height) return MIN_CELL_PX;
    return Math.max(MIN_CELL_PX, Math.floor(Math.min(stageSize.width / grid.width, stageSize.height / grid.height)));
  }, [stageSize, grid.width, grid.height]);

  const picture = useMemo(() => replay(grid, frames, playhead, meta.group === 'dither'), [grid, frames, playhead, meta.group]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = grid.width * cellPx;
    const h = grid.height * cellPx;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(ctx, grid.width, grid.height, cellPx, picture, start, goal, drag, meta.group !== 'dither' && meta.group !== 'contour' ? 'markers' : 'none', inkColorFor(meta.group));
  }, [grid.width, grid.height, cellPx, picture, start, goal, drag, meta.group]);

  return { canvasRef, stageRef, cellPx, picture };
}

function paint(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  cell: number,
  picture: Picture,
  start: Point,
  goal: Point,
  drag: DragPreview | null,
  markers: 'markers' | 'none',
  inkColor: string,
) {
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, cols * cell, rows * cell);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const state = picture.cells[y * cols + x]!;
      if (state === CELL.free || state === CELL.paper) continue;
      ctx.fillStyle = state === CELL.ink ? inkColor : (CELL_COLOR[state] ?? palette.ink);
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  if (cell >= 6) {
    ctx.strokeStyle = palette.rule;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= cols; x++) {
      ctx.moveTo(x * cell + 0.5, 0);
      ctx.lineTo(x * cell + 0.5, rows * cell);
    }
    for (let y = 0; y <= rows; y++) {
      ctx.moveTo(0, y * cell + 0.5);
      ctx.lineTo(cols * cell, y * cell + 0.5);
    }
    ctx.stroke();
  }
  if (picture.segments.length) {
    ctx.strokeStyle = palette.path;
    ctx.lineWidth = Math.max(1.5, cell * 0.35);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const s of picture.segments) {
      ctx.moveTo(s.x0 * cell, s.y0 * cell);
      ctx.lineTo(s.x1 * cell, s.y1 * cell);
    }
    ctx.stroke();
  }
  if (markers === 'markers') {
    drawMarker(ctx, start, cell, palette.start, 'S');
    drawMarker(ctx, goal, cell, palette.goal, 'G');
  }
  if (drag) {
    drawMarker(ctx, drag.at, cell, drag.valid ? (drag.which === 'start' ? palette.start : palette.goal) : palette.danger, drag.which === 'start' ? 'S' : 'G', true);
  }
}

function drawMarker(ctx: CanvasRenderingContext2D, p: Point, cell: number, color: string, label: string, ghost = false) {
  const pad = Math.max(0, cell * 0.08);
  ctx.save();
  if (ghost) ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;
  ctx.fillRect(p.x * cell - pad, p.y * cell - pad, cell + 2 * pad, cell + 2 * pad);
  if (cell >= 10) {
    ctx.fillStyle = palette.paper;
    ctx.font = `700 ${Math.floor(cell * 0.7)}px "Azeret Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, p.x * cell + cell / 2, p.y * cell + cell / 2 + 1);
  }
  ctx.restore();
}
