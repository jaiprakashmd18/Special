"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useStory, CHAPTER_COUNT } from "@/lib/store";
import { music } from "@/lib/music";

export const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function GlowButton({ children, onClick, variant = "primary", className = "", disabled, ...rest }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; className?: string; disabled?: boolean } & React.AriaAttributes) {
  return (<button type="button" disabled={disabled} onClick={() => { music?.chime(86); onClick?.(); }} className={`btn ${variant === "ghost" ? "btn-ghost" : "btn-primary"} ${className}`} {...rest}>{children}</button>);
}

/** Reveals lines one after another. Tap the text to move on early. Never blocks: `onDone` fires after the last line. */
export function Sequence({ lines, onDone, onLine, big = false, pauseMs = 0, hold = true }: { lines: readonly string[]; onDone?: () => void; onLine?: (i: number) => void; big?: boolean; pauseMs?: number; hold?: boolean }) {
  const [i, setI] = useState(0); const ref = useRef<HTMLParagraphElement>(null);
  const done = useRef(false); const advance = useCallback(() => setI((v) => Math.min(lines.length, v + 1)), [lines.length]);
  useEffect(() => { onLine?.(Math.min(i, lines.length - 1)); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (i >= lines.length) { if (!done.current) { done.current = true; onDone?.(); } return; }
    const el = ref.current; const reduced = prefersReduced(); const len = lines[i].length;
    const dwell = (lines[i] === "…" ? 2400 : Math.max(2300, 1300 + len * 55)) + pauseMs;
    if (el && !reduced) gsap.fromTo(el, { opacity: 0, y: 16, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power2.out" });
    else if (el) el.style.opacity = "1";
    const last = i === lines.length - 1;
    const out = el && !reduced && !(last && hold) ? gsap.to(el, { opacity: 0, y: -8, duration: 0.8, delay: dwell / 1000 - 0.8 }) : null;
    const id = window.setTimeout(advance, last && hold ? dwell : dwell);
    return () => { window.clearTimeout(id); out?.kill(); };
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = Math.min(i, lines.length - 1);
  return (
    <div className="seq" onClick={advance} role="status" aria-live="polite">
      <p ref={ref} key={cur} className={big ? "seq-big" : "seq-line"} style={{ opacity: 0 }}>{lines[cur]}</p>
      <span className="sr-only">{lines.join(" ")}</span>
    </div>
  );
}

/** Staggered entrance for children marked data-reveal. */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return; const kids = el.querySelectorAll("[data-reveal]");
    if (prefersReduced()) { gsap.set(kids, { opacity: 1 }); return; }
    const tw = gsap.fromTo(kids, { opacity: 0, y: 22, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, stagger: 0.35, delay, ease: "power2.out" });
    return () => { tw.kill(); };
  }, [delay]);
  return <Tag ref={ref as never} className={className}>{children}</Tag>;
}

export function ProgressDots() {
  const ch = useStory((s) => s.chapter);
  return (
    <nav className="dots" aria-label={`Chapter ${ch + 1} of ${CHAPTER_COUNT}`}>
      {Array.from({ length: CHAPTER_COUNT }, (_, i) => (<span key={i} className={i === ch ? "dot on" : i < ch ? "dot past" : "dot"} aria-hidden />))}
      <span className="sr-only">Chapter {ch + 1} of {CHAPTER_COUNT}</span>
    </nav>
  );
}

export function SoundControl() {
  const [, force] = useState(0); const [open, setOpen] = useState(false);
  useEffect(() => music?.subscribe(() => force((n) => n + 1)), []);
  if (!music) return null;
  const muted = music.isMuted || !music.started;
  return (
    <div className="sound">
      {open && (<label className="vol"><span className="sr-only">Music volume</span>
        <input type="range" min={0} max={1} step={0.05} value={music.vol} onChange={(e) => { void music.start(); music.setVolume(Number(e.target.value)); }} aria-label="Music volume" /></label>)}
      <button type="button" className="icon-btn" aria-pressed={!muted} aria-label={muted ? "Turn music on" : "Mute music"}
        onClick={() => { if (!music.started) { void music.start(); music.setMuted(false); } else music.setMuted(!music.isMuted); }}>{muted ? "🔇" : "🎵"}</button>
      <button type="button" className="icon-btn" aria-expanded={open} aria-label="Volume control" onClick={() => setOpen((o) => !o)}>🎚️</button>
    </div>
  );
}

export function NextButton({ label, onClick, delay = 0 }: { label: string; onClick: () => void; delay?: number }) {
  return (<Reveal delay={delay} className="actions"><div data-reveal><GlowButton onClick={onClick}>{label}</GlowButton></div></Reveal>);
}
