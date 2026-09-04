import { PLAN_RESOLUTION } from '../config/defaults';
import { useImageImport } from '../hooks/useImageImport';
import { useStudioStore } from '../hooks/useStudioStore';

export function ImportPanel() {
  const { inputRef, onFile, open, error, busy } = useImageImport();
  const plan = useStudioStore((s) => s.plan);
  const grid = useStudioStore((s) => s.grid);
  const robotRadius = useStudioStore((s) => s.robotRadius);
  const cellsPerBlock = useStudioStore((s) => s.cellsPerBlock);
  const setRobotRadius = useStudioStore((s) => s.setRobotRadius);
  const setCellsPerBlock = useStudioStore((s) => s.setCellsPerBlock);

  return (
    <section>
      <h2>Floor plan</h2>
      <div className="import-row">
        <button className="btn" onClick={open} disabled={busy} data-testid="import">
          {busy ? 'reading…' : 'import image'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={onFile} hidden data-testid="file-input" />
        <span className="file-name" data-testid="plan-name">
          {plan ? `${plan.name} · ${plan.width}×${plan.height} px` : 'loading default map…'}
        </span>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="field" style={{ marginTop: 14 }}>
        <label className="field-label" htmlFor="robot-radius">
          robot radius <output>{robotRadius} px</output>
        </label>
        <input id="robot-radius" type="range" min={0} max={20} step={1} value={robotRadius} onChange={(e) => setRobotRadius(Number(e.target.value))} data-testid="robot-radius" />
        <small>Dark pixels are walls. Walls grow by this many source pixels so the robot can be treated as a point.</small>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="cells-per-block">
          cells per {PLAN_RESOLUTION} px block <output>{cellsPerBlock}</output>
        </label>
        <input id="cells-per-block" type="range" min={2} max={16} step={1} value={cellsPerBlock} onChange={(e) => setCellsPerBlock(Number(e.target.value))} />
        <small>
          Grid is {grid.width} × {grid.height}. A cell is a wall if any source pixel inside it is.
        </small>
      </div>
    </section>
  );
}
