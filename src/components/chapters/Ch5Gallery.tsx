"use client";
import { useEffect, useRef } from "react";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { galleryDrag } from "../three/Scene";
import { GlowButton, NextButton, Reveal } from "../ui/kit";

const C = ammu.chapters.gallery;
export default function Ch5Gallery() {
  const s = useStory(); const n = ammu.photos.length; const drag = useRef<{ x: number } | null>(null);
  const step = (d: number) => s.set({ galleryIndex: (useStory.getState().galleryIndex + d + n) % n });
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "Escape") useStory.getState().set({ galleryZoom: false }); };
    window.addEventListener("keydown", k); return () => { window.removeEventListener("keydown", k); galleryDrag.x = 0; useStory.getState().set({ galleryZoom: false }); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const down = (e: React.PointerEvent) => { drag.current = { x: e.clientX }; (e.target as Element).setPointerCapture?.(e.pointerId); };
  const move = (e: React.PointerEvent) => { if (drag.current) galleryDrag.x = ((e.clientX - drag.current.x) / window.innerWidth) * -2; };
  const up = (e: React.PointerEvent) => {
    if (!drag.current) return; const dx = e.clientX - drag.current.x; drag.current = null; galleryDrag.x = 0;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  };
  return (
    <div className="stage">
      <div className="drag-layer" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-hidden />
      <Reveal className="top"><h1 data-reveal className="title sm">{C.title} 📸</h1></Reveal>
      <div className="bottom" role="region" aria-label="Photo gallery" aria-live="polite">
        <p className="caption" key={s.galleryIndex}>{ammu.photos[s.galleryIndex].caption}</p>
        <div className="actions row">
          <GlowButton variant="ghost" onClick={() => step(-1)} aria-label="Previous photo">←</GlowButton>
          <GlowButton variant="ghost" onClick={() => s.set({ galleryZoom: !s.galleryZoom })} aria-pressed={s.galleryZoom}>{s.galleryZoom ? "Zoom out" : "Enlarge"}</GlowButton>
          <GlowButton variant="ghost" onClick={() => step(1)} aria-label="Next photo">→</GlowButton>
        </div>
        <p className="hint">Swipe, drag or use ← → keys · {s.galleryIndex + 1}/{n}</p>
        <NextButton label="Continue ✨" onClick={() => s.go(5)} delay={0.5} />
      </div>
    </div>
  );
}
