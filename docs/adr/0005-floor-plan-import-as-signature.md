# 5. Floor-plan import with robot inflation is the signature feature

Date: 2026-09-04

## Status

Accepted

## Decision

- Any image can be imported. Dark pixels (luma below 5/255, the same rule as the Python reference) are walls.
- Walls are grown by a robot radius in source pixels with a square kernel, then the plan is split into `floor(size / 50)` blocks per axis with a chosen number of cells per block. A cell is a wall if any source pixel inside it is. Defaults (radius 7, 8 cells per block) reproduce the 2021 run: `mapa_robotica.png` becomes 72x56 with 1,912 walls.
- The 2021 plan ships as the default map. It was converted from `data/mapa_robotica.bmp` (450x360, RGBA) in `a-star-visualizer` with Pillow, RGB, no resampling.
- The imported grayscale is kept so the dither algorithms can run on it, and "use as map" turns the dithered ink into walls.

## Context

Without the import this is one more pathfinding demo on a hand-painted grid. The erode-then-downsample pipeline is what the university project was about: the robot has a footprint, so the map, not the search, absorbs it.

## Consequences

- Changing robot radius or resolution rebuilds the grid from the stored plan; hand-painted walls on top of an imported plan are lost on rebuild. Start and goal snap to the nearest free cell.
- Import is capped at 1,200 px on the long side to bound the pipeline cost.
