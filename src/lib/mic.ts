"use client";
/** Optional, permission-gated "blow out the candles" detection. Audio never leaves the device. */
export async function startMicBlow(onBlow: () => void): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC(); const src = ctx.createMediaStreamSource(stream); const an = ctx.createAnalyser(); an.fftSize = 512; src.connect(an);
  const data = new Uint8Array(an.fftSize); let loud = 0; let raf = 0; let done = false;
  const tick = () => {
    an.getByteTimeDomainData(data); let sum = 0; for (const v of data) { const x = (v - 128) / 128; sum += x * x; }
    const rms = Math.sqrt(sum / data.length); loud = rms > 0.12 ? loud + 1 : Math.max(0, loud - 1);
    if (loud > 14 && !done) { done = true; onBlow(); }
    raf = requestAnimationFrame(tick);
  };
  tick();
  return () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); void ctx.close(); };
}
