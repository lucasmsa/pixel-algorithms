import { HEURISTIC_OPTIONS } from '../config/algorithms';
import { selectMeta, useStudioStore } from '../hooks/useStudioStore';
import type { HeuristicName } from '../core/types';

export function ParamsPanel() {
  const meta = useStudioStore(selectMeta);
  const heuristic = useStudioStore((s) => s.heuristic);
  const connectivity = useStudioStore((s) => s.connectivity);
  const weight = useStudioStore((s) => s.weight);
  const radius = useStudioStore((s) => s.radius);
  const bayer = useStudioStore((s) => s.bayer);
  const tool = useStudioStore((s) => s.tool);
  const setHeuristic = useStudioStore((s) => s.setHeuristic);
  const setConnectivity = useStudioStore((s) => s.setConnectivity);
  const setWeight = useStudioStore((s) => s.setWeight);
  const setRadius = useStudioStore((s) => s.setRadius);
  const setBayer = useStudioStore((s) => s.setBayer);
  const setTool = useStudioStore((s) => s.setTool);
  const clearWalls = useStudioStore((s) => s.clearWalls);
  const useDitherAsMap = useStudioStore((s) => s.useDitherAsMap);
  const has = (p: (typeof meta.params)[number]) => meta.params.includes(p);
  const paints = meta.group !== 'dither';

  return (
    <section>
      <h2>Parameters</h2>
      {has('heuristic') && (
        <div className="field">
          <label className="field-label" htmlFor="heuristic">
            heuristic
          </label>
          <select id="heuristic" value={heuristic} onChange={(e) => setHeuristic(e.target.value as HeuristicName)}>
            {HEURISTIC_OPTIONS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
          <small>{HEURISTIC_OPTIONS.find((h) => h.value === heuristic)?.note}</small>
        </div>
      )}
      {has('connectivity') && (
        <div className="field">
          <span className="field-label">moves</span>
          <div className="segmented" role="radiogroup" aria-label="Connectivity">
            <button role="radio" aria-checked={connectivity === 4} aria-pressed={connectivity === 4} onClick={() => setConnectivity(4)}>
              4-connected
            </button>
            <button role="radio" aria-checked={connectivity === 8} aria-pressed={connectivity === 8} onClick={() => setConnectivity(8)}>
              8-connected
            </button>
          </div>
          <small>Diagonals cost √2 and never cut a wall corner.</small>
        </div>
      )}
      {has('weight') && (
        <div className="field">
          <label className="field-label" htmlFor="weight">
            heuristic weight <output>{weight.toFixed(1)}</output>
          </label>
          <input id="weight" type="range" min={0} max={3} step={0.1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          <small>0 is Dijkstra, 1 is A*, above 1 expands fewer cells and may miss the shortest path.</small>
        </div>
      )}
      {has('radius') && (
        <div className="field">
          <label className="field-label" htmlFor="radius">
            radius <output>{radius}</output>
          </label>
          <input id="radius" type="range" min={0} max={40} step={1} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
        </div>
      )}
      {has('bayer') && (
        <div className="field">
          <span className="field-label">matrix</span>
          <div className="segmented" role="radiogroup" aria-label="Bayer matrix">
            <button role="radio" aria-checked={bayer === 4} aria-pressed={bayer === 4} onClick={() => setBayer(4)}>
              4 × 4
            </button>
            <button role="radio" aria-checked={bayer === 8} aria-pressed={bayer === 8} onClick={() => setBayer(8)}>
              8 × 8
            </button>
          </div>
        </div>
      )}
      {paints && (
        <div className="field">
          <span className="field-label">brush</span>
          <div className="import-row">
            <div className="segmented" role="radiogroup" aria-label="Brush">
              <button role="radio" aria-checked={tool === 'wall'} aria-pressed={tool === 'wall'} onClick={() => setTool('wall')}>
                wall
              </button>
              <button role="radio" aria-checked={tool === 'erase'} aria-pressed={tool === 'erase'} onClick={() => setTool('erase')}>
                erase
              </button>
            </div>
            <button className="btn" onClick={clearWalls}>
              clear walls
            </button>
          </div>
        </div>
      )}
      {meta.group === 'dither' && (
        <div className="field">
          <button className="btn" onClick={useDitherAsMap} data-testid="use-as-map">
            use as map
          </button>
          <small>Ink becomes walls, then A* runs on it.</small>
        </div>
      )}
    </section>
  );
}
