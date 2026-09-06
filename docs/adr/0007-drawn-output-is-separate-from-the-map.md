# 7. What an algorithm draws is kept separate from the map it draws on

Date: 2026-09-06

## Status

Accepted

## Decision

- `CELL.ink` is painted in the frontier colour `#E6007E` for every group except dither, which keeps `#1B1B1B`. `inkColorFor` in `useCanvasRenderer` resolves it. The three groups that paint are fill, raster and dither.
- The dither algorithms are disabled while the shipped floor plan is the only plan loaded. The store tracks `planIsDefault`, passes no image to `runAlgorithm` until an import replaces it, and the two buttons carry an "Import an image to unlock" hint.

## Context

`palette.ink` and `palette.wall` are the same value, `#1B1B1B`. A Bresenham line or a midpoint circle drawn over the floor plan was therefore painted in the wall colour, so the output was not separable from the 1,912 walls it crossed and read as the map deforming rather than as a circle. Flood fill reaches the same buffer: its cursor sits on the cell it has just painted, so once the replayer stopped demoting that cell to visited, the fill inherited the same collision.

The shipped `mapa_robotica.png` was passed to the dithers as their source image, so Floyd-Steinberg opened on a correct dither of the wrong picture: a floor plan whose walls come out as scattered dots. The dither group has no meaningful input until the user imports one.

## Consequences

- Magenta means expanded for a search and drawn for a fill or a raster. The legend carries one entry for both, the way `path / contour` already covers two.
- The dither group is unreachable on a first visit. `Readouts` already printed "Import an image first" once a dither produced no frames; the hint moves that in front of the click instead of after it.
- An imported file named `mapa_robotica.png` is taken for the shipped plan, so its dithers stay locked. The name check predates this and also drives the start and goal defaults in `loadPlan`.
- Raster output over an imported photograph used as a map is now distinguishable from the walls; over a dither used as a map it is distinguishable from the ink.
