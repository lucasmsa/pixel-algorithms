import { useEffect } from 'react';
import { useStudioStore } from './useStudioStore';

/** Advances the playhead with requestAnimationFrame while playing, `speed` frames per second. */
export function usePlayback(): void {
  const playing = useStudioStore((s) => s.playing);
  const speed = useStudioStore((s) => s.speed);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      carry += dt * speed;
      const advance = Math.floor(carry);
      if (advance > 0) {
        carry -= advance;
        const { playhead, frames } = useStudioStore.getState();
        const next = Math.min(playhead + advance, frames.length);
        useStudioStore.setState(next >= frames.length ? { playhead: frames.length, playing: false } : { playhead: next });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);
}
