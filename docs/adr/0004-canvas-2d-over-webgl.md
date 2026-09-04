# 4. Canvas 2D, no WebGL

Date: 2026-09-04

## Status

Accepted

## Decision

Rendering is a single 2D canvas painted from the replayed cell buffer in `useCanvasRenderer`. Cells are `fillRect`, the graph-paper rule is one stroked path, contours are one stroked path, markers are squares with a letter.

## Context

The default grid is 72x56 (4,032 cells); the resolution slider tops out at 16 cells per 50 px block, so a 1200 px import gives 384 cells across, about 150k cells. A full repaint at that size is a few milliseconds. WebGL would add a shader pipeline and texture uploads for a case the app does not have.

## Consequences

- Playback is limited by requestAnimationFrame at 60 Hz; the speed control advances several frames per tick to reach 1,000 fps.
- If grids ever grow past roughly 1M cells, move the cell buffer to a texture and keep the rest.
