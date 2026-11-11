"use client";
/**
 * Original generative ambient music (Web Audio). No copyrighted material, no files needed.
 * Soft piano-like plucks + string pad through a synthetic reverb. Moods change per chapter.
 */
import { ammu } from "@/config/ammu";

export type Mood = keyof typeof ammu.music.files;

type MoodDef = { chords: number[][]; step: number; pad: boolean; bright: number; arp: number[] };
const m = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

const MOODS: Record<Mood, MoodDef> = {
  opening: { chords: [[57, 64, 72], [53, 60, 69], [48, 55, 64], [55, 62, 71]], step: 3.4, pad: true, bright: 0.5, arp: [0, 1, 2, 1] },
  birthday: { chords: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], step: 2.2, pad: true, bright: 0.9, arp: [0, 1, 2, 1, 2, 1] },
  memory: { chords: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], step: 3.2, pad: false, bright: 0.45, arp: [0, 2, 1] },
  tender: { chords: [[62, 65, 69], [58, 62, 65], [55, 58, 62], [57, 61, 64]], step: 3.0, pad: true, bright: 0.55, arp: [0, 1, 2, 1] },
  gallery: { chords: [[64, 67, 71], [60, 64, 67], [62, 66, 69], [59, 63, 66]], step: 2.8, pad: true, bright: 0.7, arp: [0, 1, 2, 1] },
  letter: { chords: [[57, 60, 64], [60, 64, 67], [53, 57, 60], [55, 59, 62]], step: 3.8, pad: false, bright: 0.4, arp: [0, 2, 1, 2] },
  garden: { chords: [[62, 69, 74], [58, 65, 74], [60, 67, 72], [57, 64, 72]], step: 3.6, pad: true, bright: 0.6, arp: [0, 1, 2, 1, 2] },
  quiet: { chords: [[57, 64], [53, 60], [48, 55]], step: 5, pad: false, bright: 0.3, arp: [0, 1] },
  proposal: { chords: [[53, 57, 60, 65], [55, 59, 62, 67], [57, 60, 64, 69], [52, 59, 64]], step: 3.0, pad: true, bright: 0.75, arp: [0, 1, 2, 3, 2, 1] },
};

class MusicEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private duckGain!: GainNode;
  private wet!: GainNode;
  private timer: number | null = null;
  private mood: Mood = "opening";
  private chordIdx = 0;
  private nextTime = 0;
  private arpIdx = 0;
  private volume: number = ammu.music.defaultVolume;
  private muted = false;
  private ducked = false;
  private energy = 1;
  private fileEl: HTMLAudioElement | null = null;
  failed = false;
  listeners = new Set<() => void>();

  get started() { return !!this.ctx; }
  get isMuted() { return this.muted; }
  get vol() { return this.volume; }
  private emit() { this.listeners.forEach((l) => l()); }

  async start() {
    if (this.ctx) { if (this.ctx.state === "suspended") await this.ctx.resume().catch(() => {}); return; }
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.duckGain = this.ctx.createGain();
      this.wet = this.ctx.createGain();
      this.wet.gain.value = 0.55;
      const conv = this.ctx.createConvolver();
      conv.buffer = this.impulse(2.8);
      this.duckGain.connect(this.master);
      this.duckGain.connect(conv); conv.connect(this.wet); this.wet.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyGain(0.01);
      this.nextTime = this.ctx.currentTime + 0.2;
      this.timer = window.setInterval(() => this.schedule(), 250);
      this.emit();
    } catch { this.failed = true; this.emit(); }
  }

  private impulse(sec: number) {
    const ctx = this.ctx!; const len = ctx.sampleRate * sec;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return buf;
  }

  private applyGain(time = 0.8) {
    if (!this.ctx) return;
    const target = this.muted ? 0 : this.volume * 0.5 * (this.ducked ? 0.22 : 1) * this.energy;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, time / 3);
    if (this.fileEl) this.fileEl.volume = Math.min(1, this.muted ? 0 : this.volume * (this.ducked ? 0.22 : 1));
  }

  setMood(mood: Mood) {
    if (mood === this.mood && this.ctx) return;
    this.mood = mood; this.chordIdx = 0; this.arpIdx = 0;
    if (ammu.music.useFiles) this.playFile(mood);
  }

  private playFile(mood: Mood) {
    const src = ammu.music.files[mood];
    this.fileEl?.pause();
    const el = new Audio(src); el.loop = true; el.volume = 0;
    el.addEventListener("error", () => { this.fileEl = null; }); // synth keeps playing as fallback
    el.play().then(() => { this.fileEl = el; this.applyGain(); }).catch(() => { this.fileEl = null; });
  }

  setEnergy(e: number) { this.energy = e; this.applyGain(1.5); }
  setVolume(v: number) { this.volume = v; this.applyGain(0.2); this.emit(); }
  setMuted(b: boolean) { this.muted = b; this.applyGain(0.3); this.emit(); }
  duck(on: boolean) { this.ducked = on; this.applyGain(0.9); }
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }

  private schedule() {
    if (!this.ctx || this.ctx.state !== "running") return;
    const def = MOODS[this.mood];
    while (this.nextTime < this.ctx.currentTime + 1.2) {
      const chord = def.chords[this.chordIdx % def.chords.length];
      const sub = def.step / def.arp.length;
      for (let i = 0; i < def.arp.length; i++) {
        const note = chord[def.arp[i] % chord.length] + (i % 5 === 4 ? 12 : 0);
        this.pluck(m(note + 12), this.nextTime + i * sub, def.bright);
      }
      this.pluck(m(chord[0] - 12), this.nextTime, 0.3, 4);
      if (def.pad) chord.forEach((n) => this.pad(m(n), this.nextTime, def.step));
      this.nextTime += def.step; this.chordIdx++;
    }
  }

  private pluck(f: number, t: number, bright: number, dur = 2.4) {
    const ctx = this.ctx!;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900 + bright * 3500;
    for (const [mult, type, amp] of [[1, "sine", 1], [2, "triangle", 0.25 * bright]] as const) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f * mult;
      const og = ctx.createGain(); og.gain.value = amp; o.connect(og); og.connect(lp);
      o.start(t); o.stop(t + dur + 0.1);
    }
    lp.connect(g); g.connect(this.duckGain);
  }

  private pad(f: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + dur * 0.45); g.gain.linearRampToValueAtTime(0, t + dur + 0.8);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200;
    for (const d of [-6, 6]) { const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 1); }
    lp.connect(g); g.connect(this.duckGain);
  }

  /** Short sparkle used for UI feedback. */
  chime(note = 84) { if (this.ctx && !this.muted) this.pluck(m(note), this.ctx.currentTime, 1, 1.4); }
}

export const music = typeof window !== "undefined" ? new MusicEngine() : (null as unknown as MusicEngine);

