"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReduced } from "./kit";

/** Scrollable handwritten-style letter. Each line fades in as it is scrolled to, so reading is never rushed. */
export function LetterPanel({ paragraphs, children, label }: { paragraphs: readonly string[]; children?: ReactNode; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Set<number>>(() => new Set());
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const el = root.current; if (!el) return;
    el.focus({ preventScroll: true });
    if (prefersReduced() || !("IntersectionObserver" in window)) { setShown(new Set(paragraphs.map((_, i) => i))); setAtEnd(true); return; }
    const io = new IntersectionObserver((entries) => {
      setShown((prev) => { const n = new Set(prev); entries.forEach((e) => { if (e.isIntersecting) n.add(Number((e.target as HTMLElement).dataset.i)); }); return n; });
    }, { root: el, threshold: 0.6 });
    el.querySelectorAll("[data-i]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [paragraphs]);
  useEffect(() => { if (shown.has(paragraphs.length - 1)) setAtEnd(true); }, [shown, paragraphs.length]);
  return (
    <div className="letter-wrap">
      <div ref={root} className="letter" tabIndex={0} role="region" aria-label={label}>
        <div className="letter-inner">
          {paragraphs.map((p, i) => (<p key={i} data-i={i} className={`hand ${shown.has(i) ? "in" : ""} ${i === 0 || i >= paragraphs.length - 2 ? "hand-lg" : ""}`}>{p}</p>))}
          <div className="letter-end">{atEnd ? children : <span className="hint">Keep scrolling… ↓</span>}</div>
        </div>
      </div>
    </div>
  );
}
