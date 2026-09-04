import { useCanvasRenderer } from '../hooks/useCanvasRenderer';
import { usePainting } from '../hooks/usePainting';
import { selectMeta, useStudioStore } from '../hooks/useStudioStore';

const HINT: Record<string, string> = {
  search: 'Drag to paint walls. Drag S or G to move them. Red means you cannot drop there.',
  fill: 'S is the seed. Drag it into another region to fill that one.',
  raster: 'S and G are the endpoints. For the circle, S is the centre.',
  dither: 'Import an image to dither it. Use as map turns the ink into walls.',
  contour: 'Paint walls and watch the outline follow them.',
};

export function CanvasStage() {
  const { canvasRef, stageRef, cellPx } = useCanvasRenderer();
  const painting = usePainting(canvasRef, cellPx);
  const meta = useStudioStore(selectMeta);
  const grid = useStudioStore((s) => s.grid);

  return (
    <div className="stage" ref={stageRef}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${grid.width} by ${grid.height} occupancy grid`}
        data-testid="stage-canvas"
        style={{ cursor: painting.cursor }}
        onPointerDown={painting.onPointerDown}
        onPointerMove={painting.onPointerMove}
        onPointerUp={painting.onPointerUp}
        onPointerLeave={painting.onPointerLeave}
      />
      <p className="stage-hint">{HINT[meta.group]}</p>
    </div>
  );
}
