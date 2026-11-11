"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { music } from "@/lib/music";
import { Glow, glowTexture, heartGeometry } from "./fx";
import { seeded } from "@/lib/heart";

const damp = THREE.MathUtils.damp;
const T = ammu.theme;

/* ───────────── Gift box (chapter 1) ───────────── */
export function GiftBox() {
  const stage = useStory((s) => s.giftStage);
  const lid = useRef<THREE.Group>(null); const ribbon = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null); const light = useRef<THREE.PointLight>(null); const aura = useRef<THREE.Sprite>(null);
  const t0 = useRef(0);
  useEffect(() => { t0.current = 0; }, [stage]);
  useFrame((s, dt) => {
    t0.current += dt; const t = s.clock.elapsedTime; const open = stage !== "closed";
    if (root.current) { root.current.position.y = Math.sin(t * 1.2) * 0.07; root.current.rotation.y = damp(root.current.rotation.y, open ? 0.2 : Math.sin(t * 0.4) * 0.25, 2, dt); }
    if (ribbon.current) { const k = stage === "closed" ? 1 : 0; ribbon.current.scale.setScalar(damp(ribbon.current.scale.x, k, 3, dt)); ribbon.current.position.y = damp(ribbon.current.position.y, k ? 0 : 1.2, 3, dt); ribbon.current.rotation.y += open ? dt * 3 : 0; }
    if (lid.current) { const k = t0.current > 0.9 && open ? 1 : 0; lid.current.position.y = damp(lid.current.position.y, 0.62 + k * 1.1, 3, dt); lid.current.rotation.z = damp(lid.current.rotation.z, k * 0.6, 3, dt); lid.current.position.x = damp(lid.current.position.x, k * 0.9, 3, dt); }
    if (light.current) light.current.intensity = damp(light.current.intensity, open && t0.current > 0.9 ? 30 : 4, 2.5, dt);
    if (aura.current) { const sc = (open ? 7 : 4) + Math.sin(t * 2) * 0.2; aura.current.scale.set(sc, sc, 1); }
  });
  return (
    <group position={[0, 0.9, 0]}><group ref={root}>
      <RoundedBox args={[1.4, 1.2, 1.4]} radius={0.05} smoothness={3} position={[0, 0, 0]}><meshStandardMaterial color={T.blushPink} roughness={0.45} metalness={0.05} /></RoundedBox>
      <group ref={lid} position={[0, 0.62, 0]}>
        <RoundedBox args={[1.55, 0.3, 1.55]} radius={0.04} smoothness={3}><meshStandardMaterial color="#f29ab9" roughness={0.4} emissive="#f29ab9" emissiveIntensity={0.15} /></RoundedBox>
      </group>
      <group ref={ribbon}>
        <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.22, 1.24, 1.44]} /><meshStandardMaterial color="#ffd6e6" roughness={0.3} emissive="#f8dfa5" emissiveIntensity={0.12} /></mesh>
        <mesh position={[0, 0.05, 0]}><boxGeometry args={[1.44, 1.24, 0.22]} /><meshStandardMaterial color="#ffd6e6" roughness={0.3} emissive="#f8dfa5" emissiveIntensity={0.12} /></mesh>
        <mesh position={[0, 0.85, 0]}><boxGeometry args={[0.24, 0.34, 1.64]} /><meshStandardMaterial color="#ffd6e6" roughness={0.3} /></mesh>
        {[-1, 1].map((s) => (<mesh key={s} position={[s * 0.3, 0.98, 0]} rotation={[0, 0, s * 0.5]} scale={[1, 0.65, 0.45]}><torusGeometry args={[0.26, 0.07, 10, 24]} /><meshStandardMaterial color={T.goldenGlow} metalness={0.7} roughness={0.25} emissive={T.goldenGlow} emissiveIntensity={0.2} /></mesh>))}
        <mesh position={[0, 0.97, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={T.goldenGlow} metalness={0.8} roughness={0.2} /></mesh>
      </group>
      <pointLight ref={light} position={[0, 0.3, 0]} color="#ffd6a8" intensity={4} distance={14} />
      <sprite ref={aura} position={[0, 0.3, -0.5]}><spriteMaterial map={glowTexture()} color="#ffb6d4" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
    </group></group>
  );
}

/* ───────────── Cake (chapter 2) ───────────── */
function nameBand(): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 128; const g = c.getContext("2d")!;
  g.fillStyle = "#fff7fa"; g.fillRect(0, 0, 1024, 128);
  g.fillStyle = "#e98aae"; g.font = "italic 600 78px Georgia, 'Times New Roman', serif"; g.textAlign = "center"; g.textBaseline = "middle";
  for (let i = 0; i < 2; i++) g.fillText("♥ AMMU ♥", 256 + i * 512, 66);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}

function Candle({ i, pos }: { i: number; pos: [number, number, number] }) {
  const lit = useStory((s) => s.candles[i]);
  const flame = useRef<THREE.Mesh>(null); const glow = useRef<THREE.Sprite>(null);
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); useStory.getState().set({ candles: useStory.getState().candles.map((v, k) => (k === i ? false : v)) }); music?.chime(88 + i); };
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime; const k = lit ? 1 : 0;
    if (flame.current) { const f = damp(flame.current.scale.x, k * (0.9 + Math.sin(t * 12 + i * 3) * 0.12), 6, dt); flame.current.scale.set(f, Math.max(0.0001, f * (1.3 + Math.sin(t * 9 + i) * 0.15)), f); }
    if (glow.current) { const m = glow.current.material as THREE.SpriteMaterial; m.opacity = damp(m.opacity, k * 0.75, 5, dt); }
  });
  return (
    <group position={pos} onClick={click} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.045, 0.045, 0.4, 12]} /><meshStandardMaterial color={i % 2 ? T.lavender : T.softWhite} roughness={0.5} /></mesh>
      <mesh ref={flame} position={[0, 0.5, 0]}><sphereGeometry args={[0.055, 10, 10]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>
      <sprite ref={glow} position={[0, 0.5, 0]} scale={[0.7, 0.7, 1]}><spriteMaterial map={glowTexture()} color="#ffc46b" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
      <mesh position={[0, 0.35, 0]} visible={false}><boxGeometry args={[0.5, 0.9, 0.5]} /></mesh>
    </group>
  );
}

function Blossom({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (<group position={pos}>{[0, 1, 2, 3, 4].map((k) => (<mesh key={k} position={[Math.cos((k / 5) * 6.283) * 0.05, 0, Math.sin((k / 5) * 6.283) * 0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>))}<mesh><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color={T.goldenGlow} emissive={T.goldenGlow} emissiveIntensity={0.5} /></mesh></group>);
}

export function Cake({ lowQuality }: { lowQuality: boolean }) {
  const band = useMemo(() => (typeof document === "undefined" ? null : nameBand()), []);
  const g = useRef<THREE.Group>(null);
  const tiers: [number, number, string][] = [[1.55, 0.55, T.softWhite], [1.1, 0.5, T.blushPink], [0.72, 0.45, T.softWhite]];
  const ys = [0.3, 0.85, 1.35];
  const candles = useMemo<[number, number, number][]>(() => Array.from({ length: 5 }, (_, i) => [Math.cos((i / 5) * 6.283) * 0.42, 1.58, Math.sin((i / 5) * 6.283) * 0.42]), []);
  const seg = lowQuality ? 14 : 28;
  useFrame((s) => { if (g.current) g.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.25) * 0.15; });
  return (
    <group ref={g} position={[0, 0.1, 0]}>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[2.1, 2.1, 0.06, 40]} /><meshStandardMaterial color={T.roseGold} metalness={0.7} roughness={0.28} /></mesh>
      {tiers.map(([r, h, c], i) => (
        <group key={i} position={[0, ys[i], 0]}>
          <mesh><cylinderGeometry args={[r, r, h, seg]} /><meshStandardMaterial color={c} roughness={0.55} map={i === 0 && band ? band : null} /></mesh>
          <mesh position={[0, h / 2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r * 0.98, 0.05, 8, seg * 2]} /><meshStandardMaterial color={T.romanticRose} roughness={0.4} /></mesh>
          <mesh position={[0, -h / 2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r, 0.045, 8, seg * 2]} /><meshStandardMaterial color={T.softWhite} roughness={0.4} /></mesh>
          {Array.from({ length: Math.round(r * 9) }, (_, k) => { const a = (k / Math.round(r * 9)) * 6.283; return (<mesh key={k} position={[Math.cos(a) * r, h / 2 - 0.02, Math.sin(a) * r]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial color={T.softWhite} roughness={0.25} /></mesh>); })}
          {Array.from({ length: 6 + i * 2 }, (_, k) => { const n = 6 + i * 2; const a = (k / n) * 6.283 + i; return <Blossom key={k} pos={[Math.cos(a) * (r + 0.02), 0, Math.sin(a) * (r + 0.02)]} color={k % 2 ? T.romanticRose : T.lavender} />; })}
        </group>
      ))}
      {candles.map((p, i) => <Candle key={i} i={i} pos={p} />)}
      <pointLight position={[0, 2.2, 0]} color="#ffcf8a" intensity={6} distance={7} />
    </group>
  );
}

/* ───────────── Rose (chapters 6, 7, 10) ───────────── */
export function Rose({ bloom = 1, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], stem = true, color = "#e5557f", inner }: { bloom?: number; scale?: number; position?: [number, number, number]; rotation?: [number, number, number]; stem?: boolean; color?: string; inner?: boolean }) {
  const rings = useRef<THREE.Group[]>([]); const cur = useRef(0);
  const petal = useMemo(() => new THREE.SphereGeometry(0.5, 14, 10, 0, Math.PI * 1.1, 0, Math.PI * 0.55), []);
  const innerHeart = useMemo(() => heartGeometry(0.15), []);
  useFrame((_, dt) => {
    cur.current = damp(cur.current, bloom, 1.6, dt);
    rings.current.forEach((r, i) => { if (!r) return; const b = THREE.MathUtils.clamp(cur.current * 1.3 - i * 0.12, 0, 1); r.scale.setScalar(0.35 + b * 0.65); r.children.forEach((p) => { p.rotation.x = -0.35 - (0.25 + i * 0.28) * b; }); });
  });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {stem && (<mesh position={[0, -0.9, 0]}><cylinderGeometry args={[0.03, 0.045, 1.8, 8]} /><meshStandardMaterial color="#2f6b4a" roughness={0.7} /></mesh>)}
      {[0, 1, 2, 3].map((i) => {
        const n = 3 + i * 2; const rad = 0.05 + i * 0.075;
        return (
          <group key={i} ref={(el) => { if (el) rings.current[i] = el; }} rotation={[0, i * 0.6, 0]}>
            {Array.from({ length: n }, (_, k) => { const a = (k / n) * 6.283; return (
              <group key={k} rotation={[0, a, 0]}><mesh geometry={petal} position={[0, 0.12 - i * 0.02, rad]} scale={[0.34 + i * 0.1, 0.5 + i * 0.1, 0.22]}>
                <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0, 0, i * 0.035)} roughness={0.5} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.12} /></mesh></group>); })}
          </group>
        );
      })}
      {inner && (<mesh geometry={innerHeart} position={[0, 0.2, 0]} scale={0.14}><meshStandardMaterial color="#ffd6e6" emissive="#ff9fc2" emissiveIntensity={1.2} /></mesh>)}
    </group>
  );
}

export function Moon({ position = [0, 6, -14] as [number, number, number], size = 2.4 }) {
  return (<group position={position}><mesh><sphereGeometry args={[size, 32, 32]} /><meshBasicMaterial color="#fff4d6" toneMapped={false} /></mesh><Glow position={[0, 0, -0.2]} color="#ffe6b0" scale={size * 6} opacity={0.5} /></group>);
}

/* ───────────── Garden pieces ───────────── */
export function Ground({ color = "#2a1a3d" }: { color?: string }) {
  return (<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><circleGeometry args={[40, 40]} /><meshStandardMaterial color={color} roughness={1} /></mesh>);
}

export function GlowFlowers({ count, radius = [2.8, 12], keepClear = 1.5 }: { count: number; radius?: number[]; keepClear?: number }) {
  const heads = useRef<THREE.InstancedMesh>(null); const stems = useRef<THREE.InstancedMesh>(null);
  const cols = useMemo(() => [T.blushPink, T.lavender, T.romanticRose, T.goldenGlow].map((c) => new THREE.Color(c)), []);
  const d = useMemo(() => { const r = seeded(77); return Array.from({ length: count }, (_, i) => { const a = r() * 6.283; const rad = radius[0] + r() * (radius[1] - radius[0]); return { x: Math.cos(a) * rad, z: Math.sin(a) * rad - 1, h: 0.3 + r() * 0.5, c: i % 4, ph: r() * 6 }; }).filter((p) => Math.hypot(p.x, p.z) > keepClear); }, [count, radius, keepClear]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const h = heads.current, s = stems.current; if (!h || !s) return;
    d.forEach((p, i) => { o.position.set(p.x, p.h, p.z); o.scale.set(1, 0.7, 1); o.rotation.set(0, 0, 0); o.updateMatrix(); h.setMatrixAt(i, o.matrix); h.setColorAt(i, cols[p.c]);
      o.position.set(p.x, p.h / 2, p.z); o.scale.set(1, p.h, 1); o.updateMatrix(); s.setMatrixAt(i, o.matrix); });
    h.instanceMatrix.needsUpdate = true; if (h.instanceColor) h.instanceColor.needsUpdate = true; s.instanceMatrix.needsUpdate = true;
  }, [d, o, cols]);
  return (<group>
    <instancedMesh ref={heads} args={[undefined, undefined, d.length]} frustumCulled={false}><icosahedronGeometry args={[0.12, 1]} /><meshStandardMaterial emissive="#ffffff" emissiveIntensity={0.45} roughness={0.5} /></instancedMesh>
    <instancedMesh ref={stems} args={[undefined, undefined, d.length]} frustumCulled={false}><cylinderGeometry args={[0.012, 0.015, 1, 5]} /><meshStandardMaterial color="#2f6b4a" /></instancedMesh>
  </group>);
}

export function Lanterns({ count, spread = 8, height = [1.5, 5] }: { count: number; spread?: number; height?: number[] }) {
  const g = useRef<THREE.Group>(null);
  const d = useMemo(() => { const r = seeded(91); return Array.from({ length: count }, () => ({ x: (r() - 0.5) * spread * 2, y: height[0] + r() * (height[1] - height[0]), z: -2 - r() * 8, ph: r() * 6 })); }, [count, spread, height]);
  useFrame((s) => { const t = s.clock.elapsedTime; g.current?.children.forEach((c, i) => { c.position.y = d[i].y + Math.sin(t * 0.6 + d[i].ph) * 0.3; }); });
  return (<group ref={g}>{d.map((p, i) => (<group key={i} position={[p.x, p.y, p.z]}><mesh><capsuleGeometry args={[0.13, 0.22, 4, 10]} /><meshBasicMaterial color="#ffd9a0" toneMapped={false} /></mesh><Glow position={[0, 0, 0]} scale={1.3} opacity={0.5} /></group>))}</group>);
}

export function Mist({ count }: { count: number }) {
  const d = useMemo(() => { const r = seeded(5); return Array.from({ length: count }, () => ({ x: (r() - 0.5) * 16, z: -6 + r() * 8, s: 5 + r() * 4 })); }, [count]);
  return (<group>{d.map((p, i) => (<sprite key={i} position={[p.x, 0.5, p.z]} scale={[p.s, 1.6, 1]}><spriteMaterial map={glowTexture()} color="#cdb4f6" transparent opacity={0.16} depthWrite={false} /></sprite>))}</group>);
}

/* ───────────── Interactive orb ───────────── */
export type OrbShape = "heart" | "star" | "ring" | "crystal" | "flower" | "sphere";
function starGeometry() {
  const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.22 : 0.5; const a = (i / 10) * 6.283 + Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 }); g.center(); return g;
}
export function Orb({ position, color, shape = "sphere", seen, onPick, label, size = 0.5 }: { position: [number, number, number]; color: string; shape?: OrbShape; seen: boolean; onPick: () => void; label: string; size?: number }) {
  const g = useRef<THREE.Group>(null); const [hover, setHover] = useState(false);
  const geo = useMemo(() => (shape === "heart" ? heartGeometry(0.3) : shape === "star" ? starGeometry() : null), [shape]);
  const phase = useMemo(() => position[0] * 1.7 + position[1], [position]);
  useFrame((s, dt) => { const t = s.clock.elapsedTime; if (!g.current) return; g.current.position.y = position[1] + Math.sin(t * 1.1 + phase) * 0.15; g.current.rotation.y += dt * 0.6; const k = size * (hover ? 1.25 : 1) * (seen ? 0.85 : 1); g.current.scale.setScalar(damp(g.current.scale.x, k, 6, dt)); });
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={seen ? 0.35 : 1.3} roughness={0.2} metalness={0.1} transparent opacity={seen ? 0.7 : 0.95} />;
  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={g} position={[0, position[1], 0]} onClick={(e) => { e.stopPropagation(); onPick(); }} onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }} onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }} userData={{ label }}>
        {geo ? <mesh geometry={geo}>{mat}</mesh> : shape === "ring" ? <mesh><torusGeometry args={[0.5, 0.14, 14, 32]} />{mat}</mesh> : shape === "crystal" ? <mesh scale={[0.8, 1.2, 0.8]}><octahedronGeometry args={[0.55]} />{mat}</mesh> : shape === "flower" ? <group>{[0, 1, 2, 3, 4, 5].map((k) => <mesh key={k} position={[Math.cos(k * 1.047) * 0.28, Math.sin(k * 1.047) * 0.28, 0]} scale={[1, 1, 0.5]}><sphereGeometry args={[0.2, 12, 12]} />{mat}</mesh>)}<mesh><sphereGeometry args={[0.16, 12, 12]} /><meshBasicMaterial color={T.goldenGlow} toneMapped={false} /></mesh></group> : <mesh><sphereGeometry args={[0.55, 24, 24]} />{mat}</mesh>}
        <mesh visible={false}><sphereGeometry args={[1.1, 8, 8]} /></mesh>
        <Glow position={[0, 0, -0.1]} color={color} scale={seen ? 2.2 : 3.4} opacity={seen ? 0.25 : 0.55} />
      </group>
    </group>
  );
}

/* ───────────── Envelope (chapter 6) ───────────── */
export function Envelope() {
  const sealHeart = useMemo(() => heartGeometry(0.15), []);
  const open = useStory((s) => s.letterOpen);
  const flap = useRef<THREE.Group>(null); const letter = useRef<THREE.Mesh>(null); const root = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    if (root.current) root.current.position.y = 0.95 + Math.sin(t * 1.2) * 0.06;
    if (flap.current) flap.current.rotation.x = damp(flap.current.rotation.x, open ? Math.PI * 0.92 : 0, 2.5, dt);
    if (letter.current) letter.current.position.y = damp(letter.current.position.y, open ? 0.55 : 0.02, 2, dt);
  });
  return (
    <group>
      <mesh position={[0, 0, 0]}><cylinderGeometry args={[3.2, 3.4, 0.2, 48]} /><meshStandardMaterial color="#5a3a55" roughness={0.7} /></mesh>
      <group ref={root} position={[0, 0.95, 0]} rotation={[-0.25, 0, 0]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[2.4, 1.5, 0.05]} /><meshStandardMaterial color="#fff0f4" roughness={0.7} /></mesh>
        <mesh ref={letter} position={[0, 0.02, 0.035]}><boxGeometry args={[2.2, 1.3, 0.02]} /><meshStandardMaterial color="#fffaf0" roughness={0.9} emissive="#ffe9c9" emissiveIntensity={0.2} /></mesh>
        <mesh position={[0, -0.2, 0.06]} rotation={[0, 0, Math.PI]}><shapeGeometry args={[(() => { const s = new THREE.Shape(); s.moveTo(-1.2, 0.75); s.lineTo(1.2, 0.75); s.lineTo(0, -0.1); s.closePath(); return s; })()]} /><meshStandardMaterial color="#f8d3e0" roughness={0.6} side={THREE.DoubleSide} /></mesh>
        <group ref={flap} position={[0, 0.75, 0.065]}>
          <mesh position={[0, -0.45, 0]}><shapeGeometry args={[(() => { const s = new THREE.Shape(); s.moveTo(-1.2, 0.45); s.lineTo(1.2, 0.45); s.lineTo(0, -0.45); s.closePath(); return s; })()]} /><meshStandardMaterial color="#f4b9cf" roughness={0.55} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.82, 0.04]} geometry={sealHeart} scale={0.28}><meshStandardMaterial color="#d03a66" emissive="#d03a66" emissiveIntensity={0.5} /></mesh>
        </group>
        <Glow position={[0, 0, -0.3]} color="#ffc9dd" scale={5} opacity={0.35} />
      </group>
      <Rose position={[2.1, 0.35, 0.9]} rotation={[Math.PI / 2 - 0.2, 0, 0.7]} scale={0.5} bloom={1} />
      <pointLight position={[0, 3, 2]} intensity={14} color="#ffd9c4" distance={10} />
    </group>
  );
}

/* ───────────── Photo frames (chapters 3 & 5) ───────────── */
function placeholderTexture(label: string, i: number) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 560; const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 512, 560); gr.addColorStop(0, i % 2 ? "#cdb4f6" : "#f8c8dc"); gr.addColorStop(1, i % 2 ? "#f8c8dc" : "#cdb4f6");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 560);
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.moveTo(256, 330); g.bezierCurveTo(120, 240, 170, 130, 256, 190); g.bezierCurveTo(342, 130, 392, 240, 256, 330); g.fill();
  g.fillStyle = "#23152f"; g.textAlign = "center"; g.font = "600 30px Georgia, serif"; g.fillText(label, 256, 410);
  g.font = "22px Georgia, serif"; g.fillStyle = "rgba(35,21,47,0.75)"; g.fillText("placeholder — add your photo", 256, 452); g.fillText("in public/photos", 256, 484);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Loads a real photo only when enabled; otherwise (or on error) uses a labelled placeholder. */
export function usePhotoTexture(src: string, enabled: boolean, label: string, i: number) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let dead = false; let made: THREE.Texture | null = null;
    const fallback = () => { made = placeholderTexture(label, i); if (!dead) setTex(made); };
    if (!enabled) { fallback(); return () => { dead = true; made?.dispose(); }; }
    new THREE.TextureLoader().load(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; made = t; if (!dead) setTex(t); }, undefined, fallback);
    return () => { dead = true; made?.dispose(); };
  }, [src, enabled, label, i]);
  return tex;
}

export function PhotoFrame({ src, enabled, label, i, position = [0, 0, 0], rotation = [0, 0, 0], active = false, onClick }: { src: string; enabled: boolean; label: string; i: number; position?: [number, number, number]; rotation?: [number, number, number]; active?: boolean; onClick?: () => void }) {
  const tex = usePhotoTexture(src, enabled, label, i);
  const g = useRef<THREE.Group>(null);
  useFrame((s, dt) => { if (g.current) { g.current.position.y = Math.sin(s.clock.elapsedTime + i) * 0.06; g.current.scale.setScalar(damp(g.current.scale.x, active ? 1.12 : 0.95, 4, dt)); } });
  return (
    <group position={position} rotation={rotation}>
      <group ref={g} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
        <mesh position={[0, 0, -0.03]}><boxGeometry args={[1.5, 1.8, 0.04]} /><meshStandardMaterial color="#fff7fa" roughness={0.8} emissive="#e9d9e4" emissiveIntensity={0.18} /></mesh>
        {tex && <mesh position={[0, 0.14, 0]}><planeGeometry args={[1.28, 1.4]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>}
        <mesh position={[0, 0, 0.06]}><boxGeometry args={[1.66, 1.96, 0.02]} /><meshPhysicalMaterial color="#f4ecff" transparent opacity={0.07} roughness={0.05} metalness={0} clearcoat={1} /></mesh>
        <Glow position={[0, 0, -0.1]} color={active ? "#ffd6e6" : "#cdb4f6"} scale={active ? 3.6 : 2.6} opacity={active ? 0.5 : 0.25} />
      </group>
    </group>
  );
}

