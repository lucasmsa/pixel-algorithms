import { palette } from '../config/palette';

const ITEMS = [
  { color: palette.wall, label: 'wall' },
  { color: palette.frontierSoft, label: 'open (frontier)' },
  { color: palette.frontier, label: 'expanded' },
  { color: palette.current, label: 'current' },
  { color: palette.path, label: 'path / contour' },
  { color: palette.start, label: 'S start' },
  { color: palette.goal, label: 'G goal' },
  { color: palette.danger, label: 'invalid drop' },
];

export function Legend() {
  return (
    <section>
      <h2>Legend</h2>
      <div className="legend">
        <ul>
          {ITEMS.map((item) => (
            <li key={item.label}>
              <span className="swatch" style={{ background: item.color }} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
