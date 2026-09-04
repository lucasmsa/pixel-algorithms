import { ALGORITHMS, GROUP_LABEL, type AlgorithmGroup } from '../config/algorithms';
import { selectMeta, useStudioStore } from '../hooks/useStudioStore';

const GROUPS: readonly AlgorithmGroup[] = ['search', 'fill', 'raster', 'dither', 'contour'];

export function AlgorithmPicker() {
  const algorithm = useStudioStore((s) => s.algorithm);
  const setAlgorithm = useStudioStore((s) => s.setAlgorithm);
  const meta = useStudioStore(selectMeta);

  return (
    <section>
      <h2>Algorithm</h2>
      <div className="algo-list">
        {GROUPS.map((group) => (
          <div className="algo-group" key={group}>
            <span className="algo-group-label">{GROUP_LABEL[group]}</span>
            <div className="algo-row" role="radiogroup" aria-label={GROUP_LABEL[group]}>
              {ALGORITHMS.filter((a) => a.group === group).map((a) => (
                <button
                  key={a.id}
                  className="btn"
                  role="radio"
                  aria-checked={a.id === algorithm}
                  aria-pressed={a.id === algorithm}
                  onClick={() => setAlgorithm(a.id)}
                  data-testid={`algo-${a.id}`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="algo-note">
        <strong>{meta.name}</strong> takes {meta.input}. {meta.frames}
      </p>
    </section>
  );
}
