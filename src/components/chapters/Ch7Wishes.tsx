"use client";
import { ammu } from "@/config/ammu";
import { useStory, toggleIn } from "@/lib/store";
import { music } from "@/lib/music";
import { GlowButton, Reveal } from "../ui/kit";

const C = ammu.chapters.wishes;
export default function Ch7Wishes() {
  const s = useStory(); const a = s.activeWish; const all = s.wishesSeen.length === C.wishes.length;
  return (
    <div className="stage">
      <Reveal className="top"><h1 data-reveal className="title sm">{C.title} 🌸</h1>
        {a === null && <p data-reveal className="hint">Tap the glowing orbs to read each wish ({s.wishesSeen.length}/6)</p>}</Reveal>
      <div className="bottom">
        {a !== null && !(all && a === null) && (<article key={a} className="card m-anim-1" aria-live="polite"><p className="body wish">{C.wishes[a]}</p></article>)}
        <div className="chips" role="group" aria-label="Wishes">
          {C.wishes.map((_, i) => (<button key={i} type="button" className={`chip ${s.wishesSeen.includes(i) ? "seen" : ""} ${a === i ? "cur" : ""}`} aria-pressed={a === i} aria-label={`Wish ${i + 1}`} onClick={() => { music?.chime(80 + i * 2); s.set({ activeWish: i, wishesSeen: toggleIn(s.wishesSeen, i) }); }}>{i + 1}</button>))}
        </div>
        {all && (<Reveal><h2 data-reveal className="title sm">{C.final}</h2><div data-reveal className="actions"><GlowButton onClick={() => s.go(7)}>{C.button}</GlowButton></div></Reveal>)}
      </div>
    </div>
  );
}
