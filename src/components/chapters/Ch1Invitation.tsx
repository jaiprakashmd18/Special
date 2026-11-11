"use client";
import { useEffect, useRef } from "react";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { GlowButton, Reveal, Sequence } from "../ui/kit";

const C = ammu.chapters.invitation;
export default function Ch1Invitation() {
  const s = useStory(); const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const open = () => {
    s.set({ giftStage: "opening" });
    timers.current.push(window.setTimeout(() => useStory.getState().set({ giftStage: "open" }), 3200));
    timers.current.push(window.setTimeout(() => useStory.getState().go(1), 6200));
  };
  const ready = s.introStage >= 3;
  return (
    <div className="stage end">
      {!ready && (<>
        <Sequence lines={C.lines} onDone={() => useStory.getState().set({ introStage: 3 })} />
        {ammu.features.skipIntro && (<div className="corner-bl"><GlowButton variant="ghost" onClick={() => s.set({ introStage: 3 })} aria-label="Skip intro">Skip intro</GlowButton></div>)}
      </>)}
      {ready && s.giftStage === "closed" && (
        <Reveal className="bottom">
          <h1 data-reveal className="title">{C.title}</h1>
          <div data-reveal className="actions"><GlowButton onClick={open}>{C.button}</GlowButton></div>
        </Reveal>
      )}
      {s.giftStage === "opening" && <p className="whisper" role="status">✨</p>}
    </div>
  );
}


