/** Deterministic point sets used by particle hearts. */
export function heartPoint(t: number, scale = 1): [number, number] {
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [(x / 17) * scale, (y / 17) * scale];
}

/** Filled heart positions (x,y,z) with seeded pseudo-random so it is stable between renders. */
export function heartCloud(count: number, scale = 1, depth = 0.35, seed = 7): Float32Array {
  const out = new Float32Array(count * 3);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const [x, y] = heartPoint(rnd() * Math.PI * 2, scale);
    const k = Math.sqrt(rnd()); // fill the interior
    out[i * 3] = x * k;
    out[i * 3 + 1] = y * k;
    out[i * 3 + 2] = (rnd() - 0.5) * depth * scale;
  }
  return out;
}

export function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
