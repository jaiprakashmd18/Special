"use client";
import { ammu } from "@/config/ammu";
import { useStory } from "@/lib/store";
import { GlowButton, NextButton, Reveal } from "../ui/kit";
import { LetterPanel } from "../ui/LetterPanel";

const C = ammu.chapters.letter;
export default function Ch6Letter() {
  const s = useStory();
  if (s.letterOpen) return (<div className="stage"><LetterPanel paragraphs={C.paragraphs} label="A letter from Jaanu"><NextButton label="Continue ✨" onClick={() => s.go(6)} /></LetterPanel></div>);
  return (
    <div className="stage">
      <Reveal className="top"><h1 data-reveal className="title sm">{C.lead}</h1></Reveal>
      <Reveal className="bottom" delay={1.5}><div data-reveal className="actions"><GlowButton onClick={() => { s.set({ letterOpen: true }); }}>{C.button}</GlowButton></div></Reveal>
    </div>
  );
}
