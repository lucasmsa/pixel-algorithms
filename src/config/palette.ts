/**
 * Lab-notebook palette. Frontier and path colours are the RGB values from the
 * 2021 Python animation: (230, 0, 126) and (80, 200, 120).
 */
export const palette = {
  paper: '#F4F1E8',
  paperDeep: '#EAE6D9',
  rule: '#CFC9B8',
  ink: '#1B1B1B',
  inkSoft: '#514E47',
  wall: '#1B1B1B',
  frontier: '#E6007E',
  frontierSoft: '#F7B8DA',
  path: '#50C878',
  fill: '#3D7BE0',
  start: '#2A1954',
  goal: '#451751',
  current: '#F2C230',
  danger: '#C8102E',
} as const;

export type PaletteToken = keyof typeof palette;

export interface TextPair {
  readonly fg: PaletteToken;
  readonly bg: PaletteToken;
  /** Large text or UI component: 3:1 instead of 4.5:1. */
  readonly large?: boolean;
}

/** Every combination used for text in the UI. Checked in contrast.test.ts. */
export const textPairs: readonly TextPair[] = [
  { fg: 'ink', bg: 'paper' },
  { fg: 'inkSoft', bg: 'paper' },
  { fg: 'ink', bg: 'paperDeep' },
  { fg: 'inkSoft', bg: 'paperDeep' },
  { fg: 'paper', bg: 'ink' },
  { fg: 'frontier', bg: 'paper', large: true },
  { fg: 'danger', bg: 'paper' },
  { fg: 'paper', bg: 'start' },
  { fg: 'paper', bg: 'goal' },
];
