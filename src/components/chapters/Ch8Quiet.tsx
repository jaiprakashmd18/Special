"use client";
import { useState } from "react";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { NextButton, Sequence } from "../ui/kit";

const C = ammu.chapters.quiet;
export default function Ch8Quiet() {
  const s = useStory(); const [done, setDone] = useState(false);
  return (
    <div className="stage">
      <div className="top"><Sequence lines={C.lines} onDone={() => setDone(true)} /></div>
      <div className="bottom">{done && <NextButton label={C.button} onClick={() => s.go(8)} />}</div>
    </div>
  );
}
