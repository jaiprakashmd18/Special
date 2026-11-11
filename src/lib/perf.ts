"use client";
import { useEffect, useState } from "react";

export type Quality = { tier: "low" | "high"; dpr: [number, number]; particles: number; bloom: boolean; reduceMotion: boolean };

export function detectQuality(): Quality {
  if (typeof window === "undefined") return { tier: "low", dpr: [1, 1.5], particles: 0.5, bloom: false, reduceMotion: false };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const low = reduceMotion || cores <= 4 || mem <= 2;
  const mobile = coarse || small;
  const tier = low ? "low" : "high";
  return {
    tier,
    reduceMotion,
    dpr: mobile ? [1, low ? 1.25 : 1.75] : [1, 2],
    particles: low ? 0.35 : mobile ? 0.6 : 1,
    bloom: !low,
  };
}

export function useQuality() {
  const [q, setQ] = useState<Quality>(() => detectQuality());
  useEffect(() => { setQ(detectQuality()); }, []);
  return q;
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}
