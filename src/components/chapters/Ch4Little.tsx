"use client";
import { ammu } from "@/config/ammu";
import { useStory, toggleIn } from "@/lib/store";
import { music } from "@/lib/music";
import { NextButton, Reveal } from "../ui/kit";

const C = ammu.chapters.little;
export default function Ch4Little() {
  const s = useStory(); const a = s.activeMemory; const all = s.memoriesSeen.length === C.memories.length;
  const pick = (i: number) => { music?.chime(84 + i * 2); s.set({ activeMemory: i, memoriesSeen: toggleIn(s.memoriesSeen, i) }); };
  return (
    <div className="stage">
      <Reveal className="top"><h1 data-reveal className="title sm">{C.title} 🦋</h1>
        {a === null && <p data-reveal className="hint">Tap the glowing lights ({s.memoriesSeen.length}/5)</p>}</Reveal>
      <div className="bottom">
        {a !== null && (
          <article key={a} className={`card m-anim-${a}`} aria-live="polite">
            <h2 className="card-h">{C.memories[a].label}</h2><p className="body">{C.memories[a].text}</p>
          </article>
        )}
        <div className="chips" role="group" aria-label="Memories">
          {C.memories.map((m, i) => (<button key={i} type="button" className={`chip ${s.memoriesSeen.includes(i) ? "seen" : ""} ${a === i ? "cur" : ""}`} aria-pressed={a === i} onClick={() => pick(i)}>{m.label}</button>))}
        </div>
        {all && <NextButton label="Continue ✨" onClick={() => s.go(4)} />}
      </div>
    </div>
  );
}
