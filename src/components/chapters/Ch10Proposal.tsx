"use client";
import { useEffect, useState } from "react";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { music } from "@/lib/music";
import { GlowButton, NextButton, Reveal, Sequence } from "../ui/kit";
import { LetterPanel } from "../ui/LetterPanel";

const C = ammu.chapters.proposal;
type Phase = "intro" | "letter" | "question";

function saveMoment() {
  const c = document.createElement("canvas"); c.width = 1080; c.height = 1350; const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 1350); gr.addColorStop(0, "#1d0f3a"); gr.addColorStop(1, "#a04a86"); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = "#ffd9a0"; for (let i = 0; i < 90; i++) { g.globalAlpha = 0.3 + ((i * 37) % 70) / 100; g.beginPath(); g.arc((i * 211) % 1080, (i * 389) % 900, 1 + (i % 3), 0, 7); g.fill(); }
  g.globalAlpha = 1; g.fillStyle = "#ff8fbd"; g.shadowColor = "#ff8fbd"; g.shadowBlur = 60;
  g.beginPath(); g.moveTo(540, 700); g.bezierCurveTo(240, 480, 330, 240, 540, 360); g.bezierCurveTo(750, 240, 840, 480, 540, 700); g.fill(); g.shadowBlur = 0;
  g.textAlign = "center"; g.fillStyle = "#fff7fa"; g.font = "italic 96px Georgia, serif"; g.fillText(C.yes.names, 540, 900);
  g.font = "italic 48px Georgia, serif"; g.fillStyle = "#f8dfa5"; g.fillText(C.yes.tagline, 540, 990);
  g.font = "34px Georgia, serif"; g.fillStyle = "#f8c8dc"; g.fillText(`December ${ammu.birthday.day}, ${ammu.birthday.celebrationYear}`, 540, 1200);
  const a = document.createElement("a"); a.download = "jaanu-and-ammu.png"; a.href = c.toDataURL("image/png"); a.click();
}

export default function Ch10Proposal() {
  const s = useStory(); const [phase, setPhase] = useState<Phase>("intro"); const [yesDone, setYesDone] = useState(false); const [timeDone, setTimeDone] = useState(false);
  useEffect(() => { music?.setEnergy(1); return () => { s.set({ proposalStage: 0, answer: "none" }); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const yes = () => { s.set({ answer: "yes" }); music?.setMood("birthday"); [84, 88, 91, 96].forEach((n, i) => setTimeout(() => music?.chime(n), i * 250)); };
  const time = () => s.set({ answer: "time" });
  if (s.answer === "yes") return (
    <div className="stage center">
      <div className="top"><Sequence lines={C.yes.lines} onDone={() => setYesDone(true)} /></div>
      {yesDone && (<Reveal className="bottom"><h1 data-reveal className="names glow">{C.yes.names}</h1><p data-reveal className="title sm">{C.yes.tagline}</p>
        <div data-reveal className="actions row"><GlowButton onClick={saveMoment}>Save the moment 📸</GlowButton><GlowButton variant="ghost" onClick={() => { s.reset(); }}>Replay our story ↺</GlowButton></div></Reveal>)}
    </div>
  );
  if (s.answer === "time") return (
    <div className="stage center">
      <div className="top"><Sequence lines={C.time.lines} onDone={() => setTimeDone(true)} /></div>
      <div className="bottom">{timeDone && <NextButton label={C.time.returnLabel} onClick={() => { s.set({ answer: "none", proposalStage: 0, wished: false, candles: [true, true, true, true, true] }); s.go(1); }} />}</div>
    </div>
  );
  if (phase === "intro") return (<div className="stage center"><div className="top"><Sequence lines={C.intro} big onLine={(i) => s.set({ proposalStage: i })} onDone={() => { s.set({ proposalStage: 6 }); setPhase("letter"); }} /></div></div>);
  if (phase === "letter") return (<div className="stage"><LetterPanel paragraphs={C.letter} label="A letter from Jaanu"><NextButton label="Continue ❤️" onClick={() => setPhase("question")} /></LetterPanel></div>);
  return (
    <div className="stage center">
      <Reveal className="top question" delay={0.3}>
        <h1 data-reveal className="q1 glow">{C.question[0]}</h1>
        <h2 data-reveal className="q2 glow">{C.question[1]}</h2>
        <p data-reveal className="sign">{C.signoff[0]}<br />{C.signoff[1]}</p>
      </Reveal>
      <Reveal className="bottom" delay={3.2}><div data-reveal className="actions row">
        <GlowButton onClick={yes}>{C.yesLabel}</GlowButton><GlowButton variant="ghost" onClick={time}>{C.timeLabel}</GlowButton></div></Reveal>
    </div>
  );
}
