import { describe, expect, it } from "vitest";
import { ammu } from "@/config/ammu";
import { heartCloud, heartPoint } from "@/lib/heart";
import { toggleIn } from "@/lib/store";

describe("config integrity", () => {
  it("keeps the proposal question exact", () => {
    expect(ammu.chapters.proposal.question).toEqual(["AMMU…", "WILL YOU BE MINE FOREVER? ❤️"]);
  });
  it("offers both response options and never auto-answers", () => {
    expect(ammu.chapters.proposal.yesLabel).toBe("Yes, Jaanu ❤️");
    expect(ammu.chapters.proposal.timeLabel).toBe("I Need a Little Time 💗");
  });
  it("has five memories, six wishes, five photo slots", () => {
    expect(ammu.chapters.little.memories).toHaveLength(5);
    expect(ammu.chapters.wishes.wishes).toHaveLength(6);
    expect(ammu.photos).toHaveLength(5);
  });
  it("ships with voice + photos disabled so no missing file is ever requested", () => {
    expect(ammu.voiceMessage.enabled).toBe(false);
    expect(ammu.voiceMessage.src).toBe("/audio/jaanu-message.mp3");
    expect(ammu.photos.every((p) => p.enabled === false)).toBe(true);
    expect(ammu.sparPhoto.enabled).toBe(false);
  });
  it("does not invent a meeting date", () => {
    expect(JSON.stringify(ammu.chapters.meeting)).not.toMatch(/\b(19|20)\d\d\b/);
  });
});

describe("heart geometry", () => {
  it("produces finite, bounded points", () => {
    const a = heartCloud(200, 2);
    expect(a).toHaveLength(600);
    expect([...a].every((v) => Number.isFinite(v) && Math.abs(v) < 3)).toBe(true);
  });
  it("is symmetric in x", () => {
    const [x1, y1] = heartPoint(0.7); const [x2, y2] = heartPoint(-0.7);
    expect(x1).toBeCloseTo(-x2); expect(y1).toBeCloseTo(y2);
  });
});

describe("store helpers", () => {
  it("toggleIn never duplicates", () => { expect(toggleIn([1, 2], 2)).toEqual([1, 2]); expect(toggleIn([1], 3)).toEqual([1, 3]); });
});
