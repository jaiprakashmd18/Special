"use client";
import { useEffect, useRef, useState } from "react";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { music } from "@/lib/music";
import { GlowButton, NextButton, Reveal, Sequence } from "../ui/kit";

const V = ammu.voiceMessage;
function fmt(t: number) { if (!isFinite(t)) return "0:00"; return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`; }

function Player({ onFail, onEnd }: { onFail: () => void; onEnd: () => void }) {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false); const [pos, setPos] = useState(0); const [dur, setDur] = useState(0); const [ready, setReady] = useState(false);
  useEffect(() => {
    const a = new Audio(); a.preload = "metadata"; el.current = a;
    a.addEventListener("loadedmetadata", () => { setDur(a.duration); setReady(true); });
    a.addEventListener("timeupdate", () => setPos(a.currentTime));
    a.addEventListener("play", () => { setPlaying(true); music?.duck(true); });
    a.addEventListener("pause", () => { setPlaying(false); music?.duck(false); });
    a.addEventListener("ended", () => { setPlaying(false); music?.duck(false); onEnd(); });
    a.addEventListener("error", () => { music?.duck(false); onFail(); });
    a.src = V.src;
    return () => { a.pause(); a.removeAttribute("src"); a.load(); music?.duck(false); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = () => { const a = el.current; if (!a) return; if (a.paused) void a.play().catch(onFail); else a.pause(); };
  const replay = () => { const a = el.current; if (!a) return; a.currentTime = 0; void a.play().catch(onFail); };
  const bars = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="glass-player" role="group" aria-label="Voice message from Jaanu">
      <div className={`pulse-heart ${playing ? "beat" : ""}`} aria-hidden>❤️</div>
      <div className={`waves ${playing ? "on" : ""}`} aria-hidden>{bars.map((b) => <i key={b} style={{ animationDelay: `${(b % 7) * 0.09}s`, height: `${20 + ((b * 37) % 60)}%` }} />)}</div>
      <input className="seek" type="range" min={0} max={dur || 1} step={0.1} value={pos} aria-label="Audio progress" onChange={(e) => { if (el.current) el.current.currentTime = Number(e.target.value); }} disabled={!ready} />
      <div className="time"><span>{fmt(pos)}</span><span>{fmt(dur)}</span></div>
      <div className="actions row">
        <GlowButton onClick={toggle} disabled={!ready} aria-label={playing ? "Pause voice message" : "Play voice message"}>{playing ? "❚❚ Pause" : "▶ Play"}</GlowButton>
        <GlowButton variant="ghost" onClick={replay} disabled={!ready} aria-label="Replay voice message">↺ Replay</GlowButton>
      </div>
    </div>
  );
}

export default function Ch9Voice() {
  const s = useStory();
  const [failed, setFailed] = useState(false); const [fbDone, setFbDone] = useState(false); const [ended, setEnded] = useState(false); const [readInstead, setReadInstead] = useState(false);
  const useAudio = V.enabled && !failed;
  return (
    <div className="stage">
      {useAudio ? (
        <>
          <Reveal className="top"><h1 data-reveal className="title sm">{V.title}</h1></Reveal>
          <div className="mid"><Player onFail={() => setFailed(true)} onEnd={() => setEnded(true)} /></div>
          <div className="bottom">
            {readInstead && <article className="card"><p className="body msg">{V.fallbackLines.join("\n")}</p></article>}
            <div className="actions row">
              <GlowButton variant="ghost" onClick={() => setReadInstead((r) => !r)} aria-expanded={readInstead}>{readInstead ? "Hide the words" : "Read it instead"}</GlowButton>
              <GlowButton variant={ended ? "primary" : "ghost"} onClick={() => s.go(9)}>{ended ? "Continue ❤️" : "Skip to the question"}</GlowButton>
            </div>
          </div>
        </>
      ) : (
        <>
          <Reveal className="top"><h1 data-reveal className="title sm">Ammu… This One Is From My Heart ❤️</h1></Reveal>
          <div className="mid"><Sequence lines={V.fallbackLines.slice(1)} onDone={() => setFbDone(true)} hold /></div>
          <div className="bottom">{fbDone ? <NextButton label="Continue ❤️" onClick={() => s.go(9)} /> : <GlowButton variant="ghost" onClick={() => s.go(9)}>Skip ahead</GlowButton>}</div>
        </>
      )}
    </div>
  );
}
