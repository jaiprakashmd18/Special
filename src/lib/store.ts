import { create } from "zustand";

export const CHAPTER_COUNT = 10;
export type GiftStage = "closed" | "opening" | "open";
export type Answer = "none" | "yes" | "time";

type State = {
  started: boolean;
  chapter: number;
  /** ch1 */ introStage: number; giftStage: GiftStage;
  /** ch2 */ candles: boolean[]; wished: boolean;
  /** ch4 */ memoriesSeen: number[]; activeMemory: number | null;
  /** ch5 */ galleryIndex: number; galleryZoom: boolean;
  /** ch6 */ letterOpen: boolean;
  /** ch7 */ wishesSeen: number[]; activeWish: number | null;
  /** ch10 */ proposalStage: number; answer: Answer;
  go: (n: number) => void;
  next: () => void;
  set: (p: Partial<State>) => void;
  reset: () => void;
};

const initial = {
  started: false, chapter: 0, introStage: 0, giftStage: "closed" as GiftStage,
  candles: [true, true, true, true, true], wished: false,
  memoriesSeen: [] as number[], activeMemory: null as number | null,
  galleryIndex: 0, galleryZoom: false, letterOpen: false,
  wishesSeen: [] as number[], activeWish: null as number | null,
  proposalStage: 0, answer: "none" as Answer,
};

export const useStory = create<State>((set) => ({
  ...initial,
  go: (n) => set({ chapter: Math.max(0, Math.min(CHAPTER_COUNT - 1, n)) }),
  next: () => set((s) => ({ chapter: Math.min(CHAPTER_COUNT - 1, s.chapter + 1) })),
  set: (p) => set(p),
  reset: () => set({ ...initial, started: true, chapter: 0, introStage: 3, giftStage: "closed" }),
}));

export const toggleIn = (arr: number[], i: number) => (arr.includes(i) ? arr : [...arr, i]);
