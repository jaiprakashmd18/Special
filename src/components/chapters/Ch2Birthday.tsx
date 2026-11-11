"use client";
import { useEffect, useRef, useState } from "react";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { music } from "@/lib/music";
import { startMicBlow } from "@/lib/mic";
import { GlowButton, NextButton, Reveal } from "../ui/kit";

const C = ammu.chapters.birthday;
export default function Ch2Birthday() {
  const s = useStory(); const allOut = s.candles.every((c) => !c);
  const [micOn, setMicOn] = useState(false); const [micErr, setMicErr] = useState("");
  const stop = useRef<null | (() => void)>(null);
  const blowAll = () => { useStory.getState().set({ candles: [false, false, false, false, false] }); music?.chime(90); };
  useEffect(() => { if (allOut && !s.wished) { s.set({ wished: true }); [88, 91, 95].forEach((n, i) => setTimeout(() => music?.chime(n), i * 220)); } }, [allOut]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stop.current?.(), []);
  useEffect(() => { if (allOut) { stop.current?.(); stop.current = null; setMicOn(false); } }, [allOut]);
  const enableMic = async () => {
    setMicErr("");
    try { stop.current = await startMicBlow(blowAll); setMicOn(true); } catch { setMicErr("No problem — just tap the candles instead."); }
  };
  return (
    <div className="stage">
      <Reveal className="top">
        <h1 data-reveal className="title">{C.title}</h1>
        {!allOut && C.body.map((b, i) => <p data-reveal key={i} className="body">{b}</p>)}
      </Reveal>
      <div className="bottom">
        {!allOut ? (
          <Reveal delay={2}>
            <p data-reveal className="hint">Tap the candles to blow them out 🕯️</p>
            <div data-reveal className="actions row">
              <GlowButton onClick={blowAll}>Blow out the candles</GlowButton>
              {ammu.features.micBlowing && !micOn && <GlowButton variant="ghost" onClick={enableMic}>Use my breath 🎤 (optional)</GlowButton>}
            </div>
            {micOn && <p className="hint" role="status">Listening… blow gently. (Audio stays on your device.)</p>}
            {micErr && <p className="hint" role="status">{micErr}</p>}
          </Reveal>
        ) : (
          <Reveal>
            <h2 data-reveal className="title sm">{C.wish[0]}</h2>
            <p data-reveal className="body">{C.wish[1]}</p>
            <div data-reveal><NextButton label="Continue ✨" delay={0} onClick={() => s.go(2)} /></div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
