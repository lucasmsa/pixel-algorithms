# 2. Every algorithm is a generator of delta frames over one grid type

Date: 2026-09-04

## Status

Accepted

## Decision

- `Grid` is `{ width, height, cells: Uint8Array }`, row-major, 0 free and 1 wall (`src/core/grid.ts`).
- Every algorithm is `(input) => Generator<Frame>` (`src/core/frame.ts`). A `Frame` is a delta: `current`, `opened`, `closed`, `painted` (cells with a 0/1 value), `segments`, `path` (final frame of a search only), `cost` and `done`.
- The UI collects all frames once per input change and replays `[0, playhead)` into a per-cell state buffer (`src/utils/replay.ts`). Scrubbing never re-runs the algorithm.
- Algorithms live in `src/core` with no DOM or React imports, so Vitest runs them in Node and the same functions drive the canvas.

## Context

Snapshots per frame cost O(cells) each; the 72x56 default map already produces 1,284 frames. Deltas keep memory linear in touched cells and make replay a few thousand array writes. Row-wise frames for dithering and marching squares keep a 256-row image at 256 frames instead of 65k.

## Consequences

- Backward scrubbing replays from frame 0. Measured on the default map this is a full replay of 1,284 frames per render, well under a frame budget; checkpoints can be added if larger grids need them.
- New algorithms only have to yield frames; the scrubber, readouts and legend come for free.
