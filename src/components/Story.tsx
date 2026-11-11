"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentType } from "react";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { music, type Mood } from "@/lib/music";
import { hasWebGL } from "@/lib/perf";
import { GlowButton, ProgressDots, SoundControl } from "./ui/kit";
import Ch1 from "./chapters/Ch1Invitation";
import Ch2 from "./chapters/Ch2Birthday";
import Ch3 from "./chapters/Ch3Meeting";
import Ch4 from "./chapters/Ch4Little";
import Ch5 from "./chapters/Ch5Gallery";
import Ch6 from "./chapters/Ch6Letter";
import Ch7 from "./chapters/Ch7Wishes";
import Ch8 from "./chapters/Ch8Quiet";
import Ch9 from "./chapters/Ch9Voice";
import Ch10 from "./chapters/Ch10Proposal";

const Scene = dynamic(() => import("./three/Scene"), { ssr: false });
const CHAPTERS: ComponentType[] = [Ch1, Ch2, Ch3, Ch4, Ch5, Ch6, Ch7, Ch8, Ch9, Ch10];
const NAMES = ["A Magical Invitation", "Happy Birthday", "The Day We Met", "The Little Things", "Memory Gallery", "A Letter", "Garden of Wishes", "The Quiet Moment", "A Message", "Forever"];
const MOODS: Mood[] = ["opening", "birthday", "memory", "tender", "gallery", "letter", "garden", "quiet", "quiet", "proposal"];

export default function Story() {
  const { started, chapter, set, go } = useStory(); const [gl, setGl] = useState(true);
  useEffect(() => { setGl(hasWebGL()); }, []);
  useEffect(() => {
    if (!ammu.features.chapterJump) return; const c = Number(new URLSearchParams(location.search).get("chapter"));
    if (c >= 1 && c <= 10) { set({ started: true, introStage: 3 }); go(c - 1); }
  }, [set, go]);
  useEffect(() => { if (started && music) music.setMood(MOODS[chapter]); }, [started, chapter]);
  useEffect(() => { document.getElementById("chapter-root")?.focus({ preventScroll: true }); }, [chapter, started]);
  useEffect(() => { if (chapter === 7) music?.setEnergy(0.7); else if (chapter !== 9) music?.setEnergy(1); }, [chapter]);

  const begin = async (withMusic: boolean) => { set({ started: true }); if (withMusic) { await music?.start(); music?.setMood(MOODS[useStory.getState().chapter]); } };
  const Chapter = CHAPTERS[chapter];
  return (
    <main className={`app ${gl ? "" : "no-gl"}`}>
      {gl && <Scene />}
      {!started ? (
        <div className="splash stage center" role="dialog" aria-label="Welcome">
          <p className="seq-line splash-line">A little world is waiting for someone special.</p>
          <div className="actions row">
            <GlowButton onClick={() => begin(true)}>Begin with music ✨</GlowButton>
            <GlowButton variant="ghost" onClick={() => begin(false)}>Begin quietly</GlowButton>
          </div>
          <p className="hint">Best with sound on, and your phone held upright or sideways — either works.</p>
        </div>
      ) : (
        <>
          <ProgressDots />
          <p className="sr-only" aria-live="polite">Chapter {chapter + 1}: {NAMES[chapter]}</p>
          <div id="chapter-root" tabIndex={-1} className="chapter" key={chapter}><Chapter /></div>
          <SoundControl />
        </>
      )}
    </main>
  );
}
