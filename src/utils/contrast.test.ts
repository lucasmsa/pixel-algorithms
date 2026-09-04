import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { palette, textPairs } from '../config/palette';

describe('contrast', () => {
  it('computes the black on white ratio', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('every text token pair meets WCAG AA', () => {
    for (const pair of textPairs) {
      const ratio = contrastRatio(palette[pair.fg], palette[pair.bg]);
      expect(ratio, `${pair.fg} on ${pair.bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(pair.large ? 3 : 4.5);
    }
  });
});
