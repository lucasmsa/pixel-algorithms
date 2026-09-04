# 1. A new repo holds the web collection; a-star-visualizer stays as the reference

Date: 2026-09-04

## Status

Accepted

## Decision

- `pixel-algorithms` is a new repository. A* is its first entry, next to Dijkstra, greedy best-first, breadth-first, flood fill, Bresenham, midpoint circle, Floyd-Steinberg, ordered dithering and marching squares.
- `a-star-visualizer` keeps the Python implementation as the reference. Its README links here; this README links back.
- `pixel-forge` (a falling-sand prototype in vanilla ES modules) is left alone. It shares the grid substrate but is a game, not an algorithm shelf.

## Context

Three homes were possible: a `web/` folder inside `a-star-visualizer`, folding into `pixel-forge`, or a new repo. The robotics repo name would mislabel dithering and contours, and `pixel-forge` has no build, tests or package.json. A new repo gives the collection room without renaming either.

## Consequences

- Two repos to keep in sync on one thing only: the golden fixtures ([ADR-0003](0003-python-reference-and-golden-fixtures.md)).
- The Python project loses nothing; it gains tests and a headless CLI in the same change.
