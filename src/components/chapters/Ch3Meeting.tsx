"use client";
import { useState } from "react";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { NextButton, Reveal, Sequence } from "../ui/kit";

const C = ammu.chapters.meeting;
export default function Ch3Meeting() {
  const s = useStory(); const [line, setLine] = useState(0); const [done, setDone] = useState(false);
  return (
    <div className="stage">
      <div className="top"><Sequence lines={C.lines} onLine={setLine} onDone={() => setDone(true)} /></div>
      <div className="bottom">
        {line >= 1 && (<Reveal key="card"><p data-reveal className="memory-card" role="note">{C.card}</p></Reveal>)}
        {done && <NextButton label="Continue ✨" onClick={() => s.go(3)} />}
      </div>
    </div>
  );
}
