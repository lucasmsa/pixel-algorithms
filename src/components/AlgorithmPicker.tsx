import { ALGORITHMS, GROUP_LABEL, type AlgorithmGroup } from '../config/algorithms';
import { selectMeta, useStudioStore } from '../hooks/useStudioStore';

const GROUPS: readonly AlgorithmGroup[] = ['search', 'fill', 'raster', 'dither', 'contour'];

export function AlgorithmPicker() {
  const algorithm = useStudioStore((s) => s.algorithm);
  const setAlgorithm = useStudioStore((s) => s.setAlgorithm);
  const meta = useStudioStore(selectMeta);
  const hasImage = useStudioStore((s) => !s.planIsDefault && s.plan?.gray != null);

  return (
    <section>
      <h2>Algorithm</h2>
      <div className="algo-list">
        {GROUPS.map((group) => (
          <div className="algo-group" key={group}>
            <span className="algo-group-label">{GROUP_LABEL[group]}</span>
            <div className="algo-row" role="radiogroup" aria-label={GROUP_LABEL[group]}>
              {ALGORITHMS.filter((a) => a.group === group).map((a) => {
                const locked = a.group === 'dither' && !hasImage;
                return (
                  <button
                    key={a.id}
                    className="btn"
                    role="radio"
                    aria-checked={a.id === algorithm}
                    aria-pressed={a.id === algorithm}
                    disabled={locked}
                    title={locked ? 'Import an image first' : undefined}
                    onClick={() => setAlgorithm(a.id)}
                    data-testid={`algo-${a.id}`}
                  >
                    {a.name}
                  </button>
                );
              })}
            </div>
            {group === 'dither' && !hasImage ? (
              <span className="algo-group-hint">Import an image to unlock</span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="algo-note">
        <strong>{meta.name}</strong> takes {meta.input}. {meta.frames}
      </p>
    </section>
  );
}
