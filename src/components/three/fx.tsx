"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heartCloud, seeded } from "@/lib/heart";

let _glow: THREE.CanvasTexture | null = null;
export function glowTexture() {
  if (_glow) return _glow;
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,0.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
}

export function heartShape(s = 1) {
  const sh = new THREE.Shape();
  sh.moveTo(0, -0.5 * s);
  sh.bezierCurveTo(-0.9 * s, 0.1 * s, -0.55 * s, 0.75 * s, 0, 0.4 * s);
  sh.bezierCurveTo(0.55 * s, 0.75 * s, 0.9 * s, 0.1 * s, 0, -0.5 * s);
  return sh;
}
export function heartGeometry(depth = 0.25) {
  const g = new THREE.ExtrudeGeometry(heartShape(1), { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 16 });
  g.center(); return g;
}

const PALETTE: Record<number, [string, string]> = {
  0: ["#04020a", "#0d0716"], 1: ["#b79ae8", "#f8c8dc"], 2: ["#4a3b7c", "#e6adc6"], 3: ["#1a0e36", "#52306b"],
  4: ["#3a2763", "#d99bb8"], 5: ["#23152f", "#6b3a55"], 6: ["#0f0824", "#3b2152"], 7: ["#07040f", "#1d1040"],
  8: ["#0e0820", "#3a1a4a"], 9: ["#1d0f3a", "#a04a86"],
};
export const palette = (i: number) => PALETTE[i] ?? PALETTE[0];

export function SkyDome({ top, bottom }: { top: string; bottom: string }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const tt = useMemo(() => new THREE.Color(), []); const bb = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    tt.set(top); bb.set(bottom);
    const k = 1 - Math.exp(-dt * 1.4);
    uniforms.top.value.lerp(tt, k); uniforms.bottom.value.lerp(bb, k);
  });
  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[80, 24, 16]} />
      <shaderMaterial ref={mat} side={THREE.BackSide} depthWrite={false} uniforms={uniforms}
        vertexShader={`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `}
        fragmentShader={`uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = smoothstep(-0.25,0.85,vP.y); gl_FragColor = vec4(mix(bottom,top,h),1.0);} `} />
    </mesh>
  );
}

export function Starfield({ count, opacity = 1, color = "#fff1c9", size = 0.16 }: { count: number; opacity?: number; color?: string; size?: number }) {
  const ref = useRef<THREE.Points>(null);
  const pos = useMemo(() => {
    const r = seeded(11); const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = r() * Math.PI * 2; const ph = Math.acos(r() * 1.5 - 0.5); const d = 30 + r() * 30;
      a[i * 3] = d * Math.sin(ph) * Math.cos(th); a[i * 3 + 1] = Math.abs(d * Math.cos(ph)) * 0.8 - 2; a[i * 3 + 2] = -Math.abs(d * Math.sin(ph) * Math.sin(th)) - 5;
    }
    return a;
  }, [count]);
  useFrame((s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.004;
    const m = ref.current.material as THREE.PointsMaterial;
    m.opacity = THREE.MathUtils.damp(m.opacity, opacity * (0.85 + Math.sin(s.clock.elapsedTime * 1.3) * 0.15), 2, dt);
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial map={glowTexture()} color={color} size={size * 6} sizeAttenuation transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Falling rose petals (instanced). */
export function Petals({ count, active = true, color = "#f6a6c4", spread = 9, height = 8 }: { count: number; active?: boolean; color?: string; spread?: number; height?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const d = useMemo(() => {
    const r = seeded(3);
    return Array.from({ length: count }, () => ({ x: (r() - 0.5) * spread * 2, y: r() * height, z: (r() - 0.5) * spread - 1, sp: 0.25 + r() * 0.4, ph: r() * 6.28, sc: 0.6 + r() * 0.8 }));
  }, [count, spread, height]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => { const g = new THREE.CircleGeometry(0.1, 8); g.scale(0.7, 1.1, 1); return g; }, []);
  useFrame((s, dt) => {
    const m = ref.current; if (!m) return;
    const t = s.clock.elapsedTime;
    d.forEach((p, i) => {
      if (active) p.y -= p.sp * dt; if (p.y < -1.5) p.y = height;
      o.position.set(p.x + Math.sin(t * 0.7 + p.ph) * 0.6, p.y, p.z + Math.cos(t * 0.5 + p.ph) * 0.4);
      o.rotation.set(t * 0.8 + p.ph, t * 0.6 + p.ph, t * 0.5);
      const sc = active ? p.sc : 0; o.scale.setScalar(sc); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} side={THREE.DoubleSide} roughness={0.6} />
    </instancedMesh>
  );
}

/** Glowing butterflies that wander. */
export function Butterflies({ count, area = [6, 2.5, 3], center = [0, 1.5, 0], color = "#cdb4f6" }: { count: number; area?: number[]; center?: number[]; color?: string }) {
  const groups = useRef<THREE.Group[]>([]);
  const seeds = useMemo(() => { const r = seeded(21); return Array.from({ length: count }, () => ({ a: r() * 6, b: r() * 6, c: r() * 6, s: 0.3 + r() * 0.3 })); }, [count]);
  const wing = useMemo(() => { const g = new THREE.CircleGeometry(0.16, 14); g.scale(1, 1.3, 1); g.translate(0.16, 0, 0); return g; }, []);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    groups.current.forEach((g, i) => {
      if (!g) return; const s = seeds[i];
      g.position.set(center[0] + Math.sin(t * s.s + s.a) * area[0], center[1] + Math.sin(t * s.s * 1.3 + s.b) * area[1], center[2] + Math.cos(t * s.s * 0.8 + s.c) * area[2]);
      g.rotation.y = Math.cos(t * s.s + s.a) > 0 ? 0.6 : Math.PI - 0.6;
      const f = Math.sin(t * 14 + i) * 0.9;
      (g.children[0] as THREE.Object3D).rotation.y = f; (g.children[1] as THREE.Object3D).rotation.y = Math.PI - f;
    });
  });
  return (
    <group>
      {seeds.map((_, i) => (
        <group key={i} ref={(el) => { if (el) groups.current[i] = el; }} scale={0.9}>
          {[0, 1].map((k) => (
            <mesh key={k} geometry={wing}><meshBasicMaterial color={i % 2 ? color : "#f8c8dc"} side={THREE.DoubleSide} transparent opacity={0.85} toneMapped={false} /></mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * Particles that gather from darkness into a heart. `progress` is a function (0..1) so callers
 * can drive it from any state. `scatter` pushes them out again (used for gentle breathing).
 */
export function HeartCloud({ count, scale = 1.6, position = [0, 0, 0], progress, color = "#ff9fc2", size = 0.07, opacity = 1 }: { count: number; scale?: number; position?: [number, number, number]; progress: () => number; color?: string; size?: number; opacity?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { target, start, buf } = useMemo(() => {
    const target = heartCloud(count, scale); const r = seeded(5); const start = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { start[i * 3] = (r() - 0.5) * 14; start[i * 3 + 1] = (r() - 0.5) * 9; start[i * 3 + 2] = (r() - 0.5) * 6; }
    return { target, start, buf: new Float32Array(count * 3) };
  }, [count, scale]);
  useFrame((s) => {
    const p = ref.current; if (!p) return;
    const t = s.clock.elapsedTime; const k = progress(); const e = k * k * (3 - 2 * k);
    const beat = 1 + Math.sin(t * 2.2) * 0.025 * e;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      buf[j] = (start[j] + (target[j] * beat - start[j]) * e) + Math.sin(t + i) * 0.01;
      buf[j + 1] = (start[j + 1] + (target[j + 1] * beat - start[j + 1]) * e) + Math.cos(t * 1.1 + i) * 0.01;
      buf[j + 2] = start[j + 2] + (target[j + 2] - start[j + 2]) * e;
    }
    const a = p.geometry.getAttribute("position") as THREE.BufferAttribute; (a.array as Float32Array).set(buf); a.needsUpdate = true;
    (p.material as THREE.PointsMaterial).opacity = opacity * Math.min(1, k * 3 + 0.35);
  });
  return (
    <points ref={ref} position={position} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[buf, 3]} /></bufferGeometry>
      <pointsMaterial map={glowTexture()} color={color} size={size * 5} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

/** Generic upward/outward sparkle burst or shower. */
export function Sparkles3D({ count, active, mode = "burst", origin = [0, 0, 0], color = "#ffe6a8", size = 0.12, area = 6 }: { count: number; active: boolean; mode?: "burst" | "shower"; origin?: [number, number, number]; color?: string; size?: number; area?: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const r = seeded(mode === "burst" ? 31 : 41);
    return Array.from({ length: count }, () => ({ v: new THREE.Vector3((r() - 0.5) * 2, r() * 1.6 + 0.2, (r() - 0.5) * 2).multiplyScalar(1 + r() * 2.5), o: r() * 6, px: (r() - 0.5) * area }));
  }, [count, mode, area]);
  const buf = useMemo(() => new Float32Array(count * 3), [count]);
  const clock = useRef(0);
  useEffect(() => { if (active) clock.current = 0; }, [active]);
  useFrame((_, dt) => {
    const p = ref.current; if (!p) return;
    if (active) clock.current += dt;
    const t = clock.current; const mat = p.material as THREE.PointsMaterial;
    mat.opacity = active ? (mode === "burst" ? Math.max(0, 1 - t / 4) : 1) : Math.max(0, mat.opacity - dt);
    if (!active && mat.opacity <= 0) return;
    data.forEach((d, i) => {
      const j = i * 3;
      if (mode === "burst") { buf[j] = origin[0] + d.v.x * t; buf[j + 1] = origin[1] + d.v.y * t - 0.4 * t * t; buf[j + 2] = origin[2] + d.v.z * t; }
      else { const y = 7 - ((t * (0.8 + (i % 5) * 0.25) + d.o) % 9); buf[j] = origin[0] + d.px + Math.sin(t + d.o) * 0.3; buf[j + 1] = origin[1] + y; buf[j + 2] = origin[2] + d.v.z; }
    });
    const a = p.geometry.getAttribute("position") as THREE.BufferAttribute; a.needsUpdate = true;
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[buf, 3]} /></bufferGeometry>
      <pointsMaterial map={glowTexture()} color={color} size={size * 6} sizeAttenuation transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

/** Looping fireworks in a single point buffer. */
export function Fireworks({ active, count = 700 }: { active: boolean; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const COLORS = useMemo(() => ["#ffd98a", "#ff8fbd", "#cdb4f6", "#fff1c9", "#ff6f9c"].map((c) => new THREE.Color(c)), []);
  const st = useMemo(() => ({ pos: new Float32Array(count * 3), col: new Float32Array(count * 3), vel: new Float32Array(count * 3), born: new Float32Array(count).fill(-99), next: 0, t: 0, idx: 0 }), [count]);
  useFrame((_, dt) => {
    const p = ref.current; if (!p) return; st.t += dt;
    const PER = 70;
    if (active && st.t > st.next) {
      st.next = st.t + 0.55 + Math.random() * 0.7;
      const cx = (Math.random() - 0.5) * 9, cy = 1.5 + Math.random() * 3.5, cz = -4 - Math.random() * 3;
      const c = COLORS[(Math.random() * COLORS.length) | 0];
      for (let n = 0; n < PER; n++) {
        const i = st.idx++ % count; const j = i * 3;
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), sp = 1.6 + Math.random() * 1.2;
        st.pos[j] = cx; st.pos[j + 1] = cy; st.pos[j + 2] = cz;
        st.vel[j] = Math.sin(ph) * Math.cos(th) * sp; st.vel[j + 1] = Math.cos(ph) * sp; st.vel[j + 2] = Math.sin(ph) * Math.sin(th) * sp;
        st.col[j] = c.r; st.col[j + 1] = c.g; st.col[j + 2] = c.b; st.born[i] = st.t;
      }
    }
    for (let i = 0; i < count; i++) {
      const j = i * 3; const age = st.t - st.born[i];
      if (age > 2.2) { st.pos[j + 1] = -50; continue; }
      st.pos[j] += st.vel[j] * dt; st.pos[j + 1] += st.vel[j + 1] * dt; st.pos[j + 2] += st.vel[j + 2] * dt;
      st.vel[j] *= 0.985; st.vel[j + 1] = st.vel[j + 1] * 0.985 - 0.9 * dt; st.vel[j + 2] *= 0.985;
    }
    (p.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (p.geometry.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[st.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[st.col, 3]} />
      </bufferGeometry>
      <pointsMaterial map={glowTexture()} vertexColors size={0.5} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

/** Instanced floating hearts rising upward. */
export function RisingHearts({ count, active, area = 6 }: { count: number; active: boolean; area?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => heartGeometry(0.2), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const d = useMemo(() => { const r = seeded(17); return Array.from({ length: count }, () => ({ x: (r() - 0.5) * area * 2, y: r() * 8 - 2, z: (r() - 0.5) * 6 - 1, sp: 0.35 + r() * 0.5, sc: 0.07 + r() * 0.12, ph: r() * 6 })); }, [count, area]);
  useFrame((s, dt) => {
    const m = ref.current; if (!m) return; const t = s.clock.elapsedTime;
    d.forEach((p, i) => {
      if (active) { p.y += p.sp * dt; if (p.y > 7) p.y = -2; }
      o.position.set(p.x + Math.sin(t + p.ph) * 0.3, p.y, p.z); o.rotation.set(0, Math.sin(t * 0.8 + p.ph) * 0.7, Math.sin(t + p.ph) * 0.2);
      o.scale.setScalar(active ? p.sc : 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (<instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}><meshStandardMaterial color="#ff7fae" emissive="#ff4f8f" emissiveIntensity={0.7} roughness={0.35} /></instancedMesh>);
}

export function Glow({ position, color = "#ffd9a0", scale = 3, opacity = 0.6 }: { position: [number, number, number]; color?: string; scale?: number; opacity?: number }) {
  return (<sprite position={position} scale={[scale, scale, 1]}><spriteMaterial map={glowTexture()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>);
}
