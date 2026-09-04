import { useCallback, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { inBounds } from '../core/grid';
import { samePoint, type Point } from '../core/types';
import { isFreeCell } from '../utils/cells';
import { selectMeta, useStudioStore } from './useStudioStore';

export type StageCursor = 'crosshair' | 'grab' | 'grabbing' | 'not-allowed' | 'default';

interface Painting {
  readonly cursor: StageCursor;
  readonly onPointerDown: (e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onPointerMove: (e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onPointerUp: (e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onPointerLeave: () => void;
}

/**
 * Pointer handling on the canvas. Pressing on a marker drags it: the ghost
 * follows the cursor and turns red over walls or outside the grid, and the
 * drop is refused there. Pressing elsewhere paints with the active tool.
 */
export function usePainting(canvasRef: RefObject<HTMLCanvasElement | null>, cellPx: number): Painting {
  const grid = useStudioStore((s) => s.grid);
  const start = useStudioStore((s) => s.start);
  const goal = useStudioStore((s) => s.goal);
  const tool = useStudioStore((s) => s.tool);
  const meta = useStudioStore(selectMeta);
  const paintCells = useStudioStore((s) => s.paintCells);
  const moveStart = useStudioStore((s) => s.moveStart);
  const moveGoal = useStudioStore((s) => s.moveGoal);

  const drag = useStudioStore((s) => s.drag);
  const setDrag = useStudioStore((s) => s.setDrag);
  const [hover, setHover] = useState<Point | null>(null);
  const painting = useRef(false);
  const stroke = useRef<Point[]>([]);
  const markersShown = meta.group !== 'dither' && meta.group !== 'contour';

  const cellAt = useCallback(
    (e: PointerEvent<HTMLCanvasElement>): Point => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: Math.floor((e.clientX - rect.left) / cellPx), y: Math.floor((e.clientY - rect.top) / cellPx) };
    },
    [canvasRef, cellPx],
  );

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return;
      const cell = cellAt(e);
      if (!inBounds(grid, cell.x, cell.y)) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      if (markersShown && samePoint(cell, start)) return setDrag({ which: 'start', at: cell, valid: true });
      if (markersShown && samePoint(cell, goal)) return setDrag({ which: 'goal', at: cell, valid: true });
      if (meta.group === 'dither') return;
      painting.current = true;
      stroke.current = [cell];
      paintCells([cell], tool === 'wall');
    },
    [cellAt, grid, markersShown, start, goal, meta.group, paintCells, tool],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      const cell = cellAt(e);
      setHover(inBounds(grid, cell.x, cell.y) ? cell : null);
      if (drag) {
        const other = drag.which === 'start' ? goal : start;
        setDrag({ ...drag, at: cell, valid: isFreeCell(grid, cell) && !samePoint(cell, other) });
        return;
      }
      if (!painting.current || !inBounds(grid, cell.x, cell.y)) return;
      const last = stroke.current[stroke.current.length - 1];
      if (last && samePoint(last, cell)) return;
      stroke.current.push(cell);
      paintCells([cell], tool === 'wall');
    },
    [cellAt, grid, drag, goal, start, paintCells, tool],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (drag) {
        if (drag.valid) (drag.which === 'start' ? moveStart : moveGoal)(drag.at);
        setDrag(null);
      }
      painting.current = false;
      stroke.current = [];
    },
    [drag, moveStart, moveGoal],
  );

  const onPointerLeave = useCallback(() => {
    setHover(null);
    if (!drag) painting.current = false;
  }, [drag]);

  const cursor: StageCursor = drag
    ? drag.valid
      ? 'grabbing'
      : 'not-allowed'
    : hover && markersShown && (samePoint(hover, start) || samePoint(hover, goal))
      ? 'grab'
      : meta.group === 'dither'
        ? 'default'
        : 'crosshair';

  return { cursor, onPointerDown, onPointerMove, onPointerUp, onPointerLeave };
}
