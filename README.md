# 💗 PROJECT AMMU

A cinematic 3D birthday experience that becomes a heartfelt "Will you be mine forever?" question.
Made by Jaanu for Ammu (Jayasri). Next.js (App Router) · React · TypeScript · Tailwind · Three.js / React Three Fiber · GSAP · Web Audio.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck && npm run lint && npm test && npm run build
```

Preview any chapter directly: `http://localhost:3000/?chapter=10` (turn off with `features.chapterJump` in the config).

## Everything personal lives in one file

[`src/config/ammu.ts`](src/config/ammu.ts) — names, every line of text, photos, voice message, music, feature flags and theme colours.

### Add your photos
1. Export up to 5 photos as WebP (about 1000 px on the long edge keeps phones fast).
2. Put them in `public/photos/` as `photo-1.webp` … `photo-5.webp`, plus `spar.webp` for the SPAR memory frame (optional).
3. In `ammu.ts` set `enabled: true` for each photo you added. Photos that are not enabled are never requested; a labelled placeholder is shown instead.
4. To use more than five, add entries to the `photos` array — the gallery ring adapts.

### Add your voice message
1. Record it (phone voice memo is fine) and export as **MP3**.
2. Save it as `public/audio/jaanu-message.mp3`.
3. In `ammu.ts` set `voiceMessage.enabled: true`.
4. Commit and push. Until then, chapter 9 shows your written message instead (no broken player, nothing blocks the story).

While the recording plays, the background music ducks to ~22 % and comes back when it pauses or ends. It never autoplays.

### Music
By default the soundtrack is **original generative piano/strings synthesised in the browser** (Web Audio), so there is nothing to license. It changes mood per chapter. To use your own legally-usable tracks, put MP3s in `public/audio/music/` and set `music.useFiles: true` (see the paths in the config). If a file fails to load, the built-in music keeps playing.

## Privacy
- No analytics, trackers, accounts, location, or network calls of any kind. Her answer is **never** stored or sent anywhere.
- The microphone is only used if she taps the optional "Use my breath" button, and the audio never leaves the device.
- **A hard-to-guess URL is not access control.** Anyone with the link can open it, and photos in `public/` are publicly downloadable. For real protection set the `SITE_PASSWORD` environment variable (below). Only upload photos you are comfortable hosting.

### Optional password (server-side)
`src/proxy.ts` is a Next.js proxy that asks for HTTP Basic auth when `SITE_PASSWORD` is set (any username, that password). It runs on the server; the password is never in frontend code. Leave it unset for an open link.

## Deploy (GitHub + Vercel)
```bash
git add -A
git commit -m "Project Ammu"
git branch -M main
git remote add origin https://github.com/<you>/project-ammu.git   # create an empty PRIVATE repo first
git push -u origin main
```
Then on vercel.com: **Add New → Project → import the repo**. Framework is auto-detected (Next.js); no build settings needed. Optional env var: `SITE_PASSWORD`. Send her the `*.vercel.app` URL (or add a custom domain) on December 8, 2026. Test the final link on her kind of phone first.

## Performance & accessibility
- Adaptive quality: low-power / low-memory devices and reduced-motion users get fewer particles, no bloom and lower resolution (`src/lib/perf.ts`).
- If WebGL is unavailable the story still works on a gradient background; WebGL context loss re-creates the canvas.
- Every interaction has a button equivalent (3D orbs and candles are also reachable via buttons/chips), keyboard arrows work in the gallery, and `prefers-reduced-motion` is respected.

## Structure
```
src/app            layout, page, global styles
src/proxy.ts       optional password gate
src/config/ammu.ts all personalisation
src/components     Story host, chapters/ (Ch1–Ch10), ui/ (kit, LetterPanel), three/ (Scene, fx, objects)
src/lib            store (zustand), music engine, perf, mic, heart geometry
tests/             vitest
```
