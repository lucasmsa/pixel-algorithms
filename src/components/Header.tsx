export function Header() {
  return (
    <header className="header">
      <div>
        <h1>
          pixel<span>·</span>algorithms
        </h1>
        <p>
          Grid algorithms you can scrub through. Paint walls, drag S and G, pick an algorithm, then step through every frame. The default map is a robot floor plan with walls inflated by the robot radius.
        </p>
      </div>
      <nav>
        <a href="https://lucasmsa.com" rel="author">by lucasmsa</a>
        <a href="https://github.com/lucasmsa/pixel-algorithms">source</a>
        <a href="https://github.com/lucasmsa/a-star-visualizer">python reference</a>
      </nav>
    </header>
  );
}
