# 3. The Python A* is fixed first and its output becomes golden fixtures

Date: 2026-09-04

## Status

Accepted

## Decision

- The Python search in `a-star-visualizer` is corrected before anything is ported: octile step cost (1 orthogonal, √2 diagonal), octile heuristic, heap open list, ties broken on f, then h, then insertion order, no corner cutting, bounds checks.
- `scripts/make_fixtures.py` there writes three fixtures (`open_room` 10x8, `corridors` 20x15 4-connected manhattan, `mapa_robotica` 72x56 from the shipped plan) with grid, start, goal, path, expansion order and cost. They are copied verbatim into `src/core/__fixtures__/`.
- `search.test.ts` asserts the TypeScript A* reproduces path, expansion order and cost for all three. `floorPlan.test.ts` asserts the image pipeline reproduces the 72x56 grid from the raw 450x360 wall mask.

## Context

The 2021 code charged 1 for diagonals, scanned the open list linearly and let negative indices wrap. Fixturing it as-is would have pinned wrong behaviour into the port. Fixing it first keeps one truth; the deterministic tie-break makes expansion order comparable across languages. Python and JavaScript both use IEEE doubles, and the heuristic keeps the same expression order, so f values match exactly.

## Consequences

- Any change to neighbour order, tie-break or cost in either repo breaks a test in both.
- Dijkstra, greedy and BFS have no Python counterpart and are tested by properties (same cost as A*, valid path, ring order) instead.
