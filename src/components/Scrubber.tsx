import { SPEED_OPTIONS } from '../config/defaults';
import { useStudioStore } from '../hooks/useStudioStore';

export function Scrubber() {
  const frames = useStudioStore((s) => s.frames);
  const playhead = useStudioStore((s) => s.playhead);
  const playing = useStudioStore((s) => s.playing);
  const speed = useStudioStore((s) => s.speed);
  const setPlayhead = useStudioStore((s) => s.setPlayhead);
  const togglePlaying = useStudioStore((s) => s.togglePlaying);
  const step = useStudioStore((s) => s.step);
  const setSpeed = useStudioStore((s) => s.setSpeed);
  const total = frames.length;

  return (
    <div className="scrubber" role="group" aria-label="Playback">
      <button className="btn btn-icon" onClick={() => step(-1)} aria-label="Step back" disabled={playhead === 0}>
        ‹
      </button>
      <button className="btn" onClick={togglePlaying} aria-label={playing ? 'Pause' : 'Play'} disabled={total === 0} data-testid="play">
        {playing ? 'pause' : playhead >= total ? 'replay' : 'play'}
      </button>
      <button className="btn btn-icon" onClick={() => step(1)} aria-label="Step forward" disabled={playhead >= total}>
        ›
      </button>
      <input
        type="range"
        min={0}
        max={total}
        value={playhead}
        onChange={(e) => setPlayhead(Number(e.target.value))}
        aria-label="Frame"
        data-testid="scrubber"
      />
      <select value={speed} onChange={(e) => setSpeed(Number(e.target.value) as typeof speed)} aria-label="Speed, frames per second" className="btn">
        {SPEED_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s} fps
          </option>
        ))}
      </select>
      <span className="frame-counter" data-testid="frame-counter">
        frame {playhead} / {total}
      </span>
    </div>
  );
}
