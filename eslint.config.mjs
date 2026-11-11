import next from "eslint-config-next";
const config = [
  ...next,
  { ignores: [".next/**", "node_modules/**"] },
  // R3F idiom: refs/buffers/camera are intentionally mutated inside useFrame.
  { files: ["src/components/three/**"], rules: { "react-hooks/immutability": "off" } },
  // SSR-safe client-only initialisation (WebGL/matchMedia detection) legitimately sets state after mount.
  { rules: { "react-hooks/set-state-in-effect": "off" } },
];
export default config;
