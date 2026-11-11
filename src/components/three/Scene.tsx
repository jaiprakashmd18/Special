"use client";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { useQuality, type Quality } from "@/lib/perf";
import { Butterflies, Fireworks, Glow, HeartCloud, Petals, RisingHearts, SkyDome, Sparkles3D, Starfield, palette } from "./fx";
import { Cake, Envelope, GiftBox, GlowFlowers, Ground, Lanterns, Mist, Moon, Orb, PhotoFrame, Rose, type OrbShape } from "./objects";

export const galleryDrag = { x: 0 };
const damp = THREE.MathUtils.damp;

/* ───── camera rig: each chapter sets a target; the camera glides there ───── */
function useCameraTarget() {
  const s = useStory();
  const t = (x: number, y: number, z: number, lx: number, ly: number, lz: number) => ({ p: [x, y, z], l: [lx, ly, lz] });
  switch (s.chapter) {
    case 0: return s.giftStage === "closed" ? t(0, 0.9, 8, 0, 0.3, 0) : s.giftStage === "opening" ? t(0, 0.7, 2.6, 0, 0.5, 0) : t(0, 1.6, 1.4, 0, 1.4, -4);
    case 1: return t(0, 2.4, 7.2, 0, 1.2, 0);
    case 2: return t(0, 1.4, 4.8, 0, 1.3, 0);
    case 3: return t(0, 1.6, 7 - s.memoriesSeen.length * 0.5, 0, 1.4, 0);
    case 4: return s.galleryZoom ? t(0, 0.9, 6.2, 0, 0.9, 3.2) : t(0, 1.2, 10.5, 0, -0.2, 0);
    case 5: return s.letterOpen ? t(0, 2.1, 4.8, 0, 1.2, 0) : t(0, 2.2, 5.6, 0, 1.2, 0);
    case 6: return t(0, 1.2, 7.5, 0, 2.4, -5);
    case 7: return t(0, 0.8, 7, 0, 3.2, -10);
    case 8: return t(0, 1.2, 7.5, 0, 1.4, 0);
    default: return t(0, 1.6 + Math.min(s.proposalStage, 6) * 0.35, 8 - Math.min(s.proposalStage, 6) * 0.2, 0, 3 + Math.min(s.proposalStage, 6) * 0.2, -6);
  }
}

function CameraRig({ reduce }: { reduce: boolean }) {
  const target = useCameraTarget(); const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((_, dt) => {
    const k = reduce ? 6 : 1.4; const px = reduce ? 0 : pointer.x * 0.35; const py = reduce ? 0 : pointer.y * 0.18;
    camera.position.x = damp(camera.position.x, target.p[0] + px, k, dt);
    camera.position.y = damp(camera.position.y, target.p[1] + py, k, dt);
    camera.position.z = damp(camera.position.z, target.p[2], k, dt);
    look.current.set(damp(look.current.x, target.l[0], k, dt), damp(look.current.y, target.l[1], k, dt), damp(look.current.z, target.l[2], k, dt));
    camera.lookAt(look.current);
  });
  return null;
}

const ORBS: { shape: OrbShape; color: string; pos: [number, number, number] }[] = [
  { shape: "heart", color: "#ff8fb8", pos: [-3.4, 1.6, -0.5] }, { shape: "ring", color: "#cdb4f6", pos: [-1.7, 2.3, -2] },
  { shape: "star", color: "#f8dfa5", pos: [0, 1.5, -3.2] }, { shape: "flower", color: "#f8c8dc", pos: [1.8, 2.3, -2] }, { shape: "crystal", color: "#b4a0ff", pos: [3.4, 1.6, -0.5] },
];
const WISH_POS: [number, number, number][] = [[-3.6, 1.4, 0], [-2.2, 2.4, -1.8], [-0.8, 1.6, -3], [0.9, 2.5, -3], [2.4, 1.5, -1.8], [3.7, 2.3, 0]];
const WISH_COL = ["#ffe6a8", "#f8c8dc", "#cdb4f6", "#ffd1a8", "#ff9fc2", "#bfe3ff"];

function Content({ q }: { q: Quality }) {
  const s = useStory(); const ch = s.chapter; const n = (x: number) => Math.max(8, Math.round(x * q.particles));
  const t0 = useRef(0); const stageT = useRef(0);
  useEffect(() => { t0.current = performance.now(); }, [ch]);
  useEffect(() => { stageT.current = performance.now(); }, [s.introStage, s.started]);
  const sinceChapter = () => (performance.now() - t0.current) / 1000;
  const allOut = s.candles.every((c) => !c);
  const garden = ch === 1 || ch === 3 || ch === 6;
  const frames = ammu.photos;
  const ringRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ringRef.current) return; const step = (Math.PI * 2) / frames.length;
    ringRef.current.rotation.y = damp(ringRef.current.rotation.y, s.galleryIndex * step + galleryDrag.x, 4, dt);
  });
  const heartProg = () => {
    if (ch === 0) return s.giftStage === "closed" ? Math.min(1, Math.max(0, (performance.now() - stageT.current) / 3500)) : 0;
    if (ch === 7) return Math.min(1, sinceChapter() / 14);
    if (ch === 9) return Math.min(1, s.proposalStage / 6);
    return 0;
  };
  return (
    <>
      <ambientLight intensity={ch === 0 ? 0.6 : 0.7} color="#ffe4f0" />
      <directionalLight position={[4, 6, 5]} intensity={ch === 0 ? 0.6 : 1.1} color="#fff0e0" />
      <hemisphereLight args={["#cdb4f6", "#3a2050", 0.5]} />

      <Starfield count={n(900)} opacity={ch === 1 ? 0.15 : ch === 0 ? (s.introStage >= 0 ? 0.9 : 0) : ch === 7 ? 1.4 : 0.9} />
      <Petals count={n(70)} active={ch >= 1 || s.giftStage !== "closed"} spread={ch === 9 ? 6 : 9} />

      {ch === 0 && (<>
        {s.introStage >= 3 && <GiftBox />}
        {s.introStage < 3 && <HeartCloud count={n(900)} scale={2.2} position={[0, 0.6, 0]} progress={heartProg} />}
        <Sparkles3D count={n(160)} active={s.giftStage !== "closed"} origin={[0, 0.5, 0]} mode="burst" />
        <Glow position={[0, 1, -3]} scale={s.giftStage === "open" ? 40 : 0.01} opacity={0.6} color="#ffd9b8" />
      </>)}

      {garden && <Ground color={ch === 1 ? "#6d4f86" : "#251636"} />}
      {(ch === 1 || ch === 3 || ch === 6 || ch === 2) && <GlowFlowers count={n(ch === 6 ? 70 : 90)} />}
      {(ch === 1 || ch === 3 || ch === 6) && <Lanterns count={n(ch === 6 ? 12 : 14)} />}
      {(ch === 1 || ch === 3 || ch === 6) && <Butterflies count={Math.max(3, Math.round(8 * q.particles))} area={[5, 1.8, 3]} center={[0, 1.8, -1]} />}

      {ch === 1 && (<>
        <Cake lowQuality={q.tier === "low"} />
        <Sparkles3D count={n(260)} active={allOut} mode="shower" origin={[0, 1, -1]} area={7} />
        <Glow position={[0, 1.6, -1]} scale={8} color="#ffc9dd" opacity={0.25} />
      </>)}

      {ch === 2 && (<>
        <Mist count={4} />
        <group position={[0, 1.3, 0]}>
          <Glow position={[0, 0, -0.4]} scale={6} color="#ffd6e6" opacity={0.45} />
          <PhotoFrame src={ammu.sparPhoto.src} enabled={ammu.sparPhoto.enabled} label="Our First Meet — SPAR" i={0} active onClick={() => {}} />
        </group>
        <Sparkles3D count={n(120)} active mode="shower" origin={[0, 1, -1]} area={5} color="#ffe0f0" size={0.08} />
      </>)}

      {ch === 3 && ORBS.map((o, i) => (
        <Orb key={i} position={o.pos} color={o.color} shape={o.shape} seen={s.memoriesSeen.includes(i)} label={ammu.chapters.little.memories[i].label}
          onPick={() => s.set({ activeMemory: i, memoriesSeen: s.memoriesSeen.includes(i) ? s.memoriesSeen : [...s.memoriesSeen, i] })} />
      ))}
      {ch === 3 && <Moon position={[6, 7, -16]} size={1.6} />}

      {ch === 4 && (<>
        <group ref={ringRef} position={[0, 0.9, 0]}>
          {frames.map((p, i) => { const a = (i / frames.length) * Math.PI * 2; return (<PhotoFrame key={i} src={p.src} enabled={p.enabled} label={`Photo ${i + 1}`} i={i} active={i === s.galleryIndex} position={[Math.sin(a) * 3.2, 0, Math.cos(a) * 3.2]} rotation={[0, a, 0]} onClick={() => s.set({ galleryIndex: i, galleryZoom: !s.galleryZoom })} />); })}
        </group>
        <HeartCloud count={n(500)} scale={5.5} position={[0, 1.2, -4]} progress={() => 1} color="#ffb3d1" size={0.05} opacity={0.5} />
        <Glow position={[0, 1, -3]} scale={14} color="#cdb4f6" opacity={0.3} />
      </>)}

      {ch === 5 && (<>
        <Envelope />
        <Sparkles3D count={n(90)} active={s.letterOpen} mode="shower" origin={[0, 0.5, 0]} area={4} color="#ffd9a8" size={0.07} />
      </>)}

      {ch === 6 && (<>
        <Moon />
        <Mist count={n(6)} />
        {[[-4.5, 0, 1], [4.4, 0, 0.5], [-2.5, 0, -3.5], [2.6, 0, -4], [0, 0, -5.5]].map((p, i) => <Rose key={i} position={[p[0], 0.85, p[2]]} scale={0.55} bloom={1} color={i % 2 ? "#e5557f" : "#f49ab5"} />)}
        {WISH_POS.map((p, i) => (<Orb key={i} position={p} color={WISH_COL[i]} shape="sphere" size={0.38} seen={s.wishesSeen.includes(i)} label={`Wish ${i + 1}`}
          onPick={() => s.set({ activeWish: i, wishesSeen: s.wishesSeen.includes(i) ? s.wishesSeen : [...s.wishesSeen, i] })} />))}
        {s.wishesSeen.length === 6 && Array.from({ length: 14 }, (_, i) => <Glow key={i} position={[0, 0.05 + 0.002 * i, 3 - i * 0.9]} scale={0.8 + i * 0.12} color="#ffe6a8" opacity={0.5} />)}
      </>)}

      {ch === 7 && (<>
        <Moon position={[0, 4.2, -12]} size={3.4} />
        <HeartCloud count={n(900)} scale={2.4} position={[0, 3.4, -9]} progress={heartProg} color="#ffb0cf" />
        <Starfield count={n(500)} opacity={1.2} size={0.2} />
      </>)}

      {ch === 8 && (<>
        <Mist count={3} />
        <Glow position={[0, 1.4, -2]} scale={8} color="#ff9fc2" opacity={0.25} />
        <Sparkles3D count={n(160)} active mode="shower" origin={[0, 0, -2]} area={6} color="#ffc9e4" size={0.09} />
      </>)}

      {ch === 9 && <Proposal q={q} n={n} />}

      {q.bloom && ammu.features.bloom && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={ch === 0 || ch === 7 || ch === 9 ? 1.1 : 0.7} luminanceThreshold={0.72} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

function Proposal({ q, n }: { q: Quality; n: (x: number) => number }) {
  const s = useStory(); const yes = s.answer === "yes";
  const bloom = s.proposalStage >= 2 ? 1 : 0;
  return (<>
    <HeartCloud count={n(1500)} scale={yes ? 5 : 4.2} position={[0, yes ? 3.5 : 4.4, -10]} progress={() => Math.min(1, s.proposalStage / 3)} color={yes ? "#ffd1a8" : "#ff9fc2"} />
    <Moon position={[-8, 8, -22]} size={1.4} />
    <Rose position={[0, 0.3, 2.4]} scale={1.5} bloom={bloom} stem inner />
    <Glow position={[0, 1, 2]} scale={4} color="#ff9fc2" opacity={0.35 * bloom} />
    <RisingHearts count={n(26)} active={yes} />
    <Fireworks active={yes} count={q.tier === "low" ? 420 : 840} />
    <Sparkles3D count={n(120)} active mode="shower" origin={[0, 0, -2]} area={7} color="#ffd9e8" size={0.08} />
    {yes && <pointLight position={[0, 4, 4]} intensity={30} color="#ffd9a0" />}
    <GlowFlowers count={yes ? n(80) : 0} radius={[3, 12]} />
    <Ground color={yes ? "#4a2a52" : "#2a1636"} />
  </>);
}

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

export default function Scene() {
  const q = useQuality(); const ch = useStory((s) => s.chapter);
  const pal = palette(ch); const [key, setKey] = useState(0);
  return (
    <Boundary fallback={null}>
      <Canvas key={key} dpr={q.dpr} gl={{ antialias: q.tier === "high" && !q.bloom, powerPreference: "high-performance", alpha: false }}
        camera={{ fov: 50, position: [0, 0.3, 6.2], near: 0.1, far: 200 }} style={{ position: "fixed", inset: 0 }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setTimeout(() => setKey((k) => k + 1), 400); }); }}>
        <SkyDome top={pal[0]} bottom={pal[1]} />
        <fog attach="fog" args={[pal[1], 14, 42]} />
        <CameraRig reduce={q.reduceMotion} />
        <Content q={q} />
      </Canvas>
    </Boundary>
  );
}


