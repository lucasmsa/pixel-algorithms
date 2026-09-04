# 6. Visual idiom: lab notebook on an occupancy grid

Date: 2026-09-04

## Status

Accepted

## Decision

- Paper `#F4F1E8` with a faint graph-paper rule, ink `#1B1B1B`, one mono face for everything: Azeret Mono from Google Fonts (weights 300 to 900), fallback `ui-monospace, SFMono-Regular, Menlo, monospace`. Alternates considered: Martian Mono, IBM Plex Mono.
- Frontier `#E6007E` and path `#50C878` are the RGB values from the 2021 animation, `(230, 0, 126)` and `(80, 200, 120)`. Open cells use a tint of the frontier, the current cell is `#F2C230`, an invalid drop is `#C8102E`.
- Readouts are large tabular numerals with small uppercase labels, like an instrument panel. Copy under each algorithm says what a frame shows and what the input is.
- Every text colour pair is listed in `src/config/palette.ts` and checked by `contrast.test.ts` against WCAG AA (4.5:1, or 3:1 for large numerals). Frontier and path are cell and legend colours only, never body text: measured on paper they are 4.0:1 and 1.9:1.
- Cursors: crosshair on the canvas while painting, grab over S and G, grabbing while dragging, not-allowed over an invalid drop, pointer on buttons, ew-resize on sliders. A dragged marker follows the pointer and turns red where it cannot land; the drop is refused, the drag is not.

## Context

The subject is a robot's occupancy grid and a set of raster algorithms, so a technical idiom fits. A pixel-art or retro look would flatten the robotics half; a neutral light UI would have no character.

## Consequences

- Fonts load from Google Fonts; offline the fallback stack keeps the layout since all faces are mono.
- Adding a colour for text means adding it to `textPairs` or the test fails.
