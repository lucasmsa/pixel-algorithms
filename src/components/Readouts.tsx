import { useMemo } from 'react';
import { wallCount } from '../core/grid';
import { selectMeta, useStudioStore } from '../hooks/useStudioStore';
import { formatCost, formatInt } from '../utils/format';
import { replay } from '../utils/replay';

export function Readouts() {
  const grid = useStudioStore((s) => s.grid);
  const frames = useStudioStore((s) => s.frames);
  const playhead = useStudioStore((s) => s.playhead);
  const meta = useStudioStore(selectMeta);
  const picture = useMemo(() => replay(grid, frames, playhead, meta.group === 'dither'), [grid, frames, playhead, meta.group]);
  const walls = useMemo(() => wallCount(grid), [grid]);
  const finished = playhead >= frames.length && frames.length > 0;
  const isSearch = meta.group === 'search';

  return (
    <section>
      <h2>Readouts</h2>
      <dl className="readouts">
        <div className="readout">
          <dt>grid</dt>
          <dd className="muted" data-testid="grid-size">
            {grid.width}×{grid.height}
          </dd>
        </div>
        <div className="readout">
          <dt>walls</dt>
          <dd className="muted" data-testid="wall-count">
            {formatInt(walls)}
          </dd>
        </div>
        {isSearch && (
          <>
            <div className="readout">
              <dt>open</dt>
              <dd data-testid="open-count">{formatInt(picture.openCount)}</dd>
            </div>
            <div className="readout">
              <dt>expanded</dt>
              <dd className="accent" data-testid="closed-count">
                {formatInt(picture.closedCount)}
              </dd>
            </div>
            <div className="readout">
              <dt>{finished && picture.path ? 'path cost' : 'g so far'}</dt>
              <dd data-testid="cost">{formatCost(picture.cost)}</dd>
            </div>
            <div className="readout">
              <dt>path cells</dt>
              <dd data-testid="path-length">{picture.path ? formatInt(picture.path.length) : '–'}</dd>
            </div>
          </>
        )}
        {meta.group === 'fill' && (
          <div className="readout">
            <dt>filled</dt>
            <dd className="accent" data-testid="painted-count">{formatInt(picture.paintedCount)}</dd>
          </div>
        )}
        {meta.group === 'raster' && (
          <div className="readout">
            <dt>pixels</dt>
            <dd className="accent" data-testid="painted-count">{formatInt(picture.paintedCount)}</dd>
          </div>
        )}
        {meta.group === 'dither' && (
          <>
            <div className="readout">
              <dt>rows</dt>
              <dd data-testid="rows-done">{formatInt(Math.min(playhead, frames.length))}</dd>
            </div>
            <div className="readout">
              <dt>ink</dt>
              <dd className="accent" data-testid="painted-count">{formatInt(picture.paintedCount)}</dd>
            </div>
          </>
        )}
        {meta.group === 'contour' && (
          <div className="readout">
            <dt>segments</dt>
            <dd className="accent" data-testid="segment-count">{formatInt(picture.segments.length)}</dd>
          </div>
        )}
      </dl>
      {isSearch && finished && (
        <p className={`verdict${picture.path ? '' : ' no-path'}`} data-testid="verdict">
          {picture.path
            ? `Path found: ${picture.path.length} cells, cost ${formatCost(picture.cost)}, after expanding ${formatInt(picture.closedCount)} cells.`
            : `No path. Every reachable cell was expanded (${formatInt(picture.closedCount)}).`}
        </p>
      )}
      {meta.group === 'dither' && frames.length === 0 && <p className="verdict">Import an image first.</p>}
    </section>
  );
}
