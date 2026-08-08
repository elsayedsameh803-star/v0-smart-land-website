# Smart Land — Intro Video Assets

This folder contains everything needed to produce a **real** narrated intro video for
Smart Land. It was NOT possible to generate a real audio+video file from inside this
codebase (no video-rendering pipeline / no voice-over assets exist here). Instead, we
provide the full production package:

| File                 | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `voiceover-ar.md`    | Arabic voice-over script (scene-by-scene, matches what is shown)|
| `voiceover-en.md`    | English voice-over script (same scenes)                        |
| `storyboard.json`    | Shot list: timings, on-screen actions, cursor/click directions |
| `README.md`          | This file — how to turn it into the actual MP4                 |

## How to publish the real video on the site

1. Record the demo by following `storyboard.json` against the **live** production site
   (prefer 1920×1080, 24–30 fps). Use screen recording + cursor highlight.
2. Record the voice-over using `voiceover-ar.md` (or EN) in a clear voice.
3. Edit: combine audio + footage, add captions/titles per shot, export `intro-demo.mp4`
   (H.264 + AAC, ~1080p, keep under ~15 MB for fast loading).
4. Drop the file at: `public/videos/intro-demo.mp4`
5. Set the environment variable `NEXT_PUBLIC_DEMO_VIDEO_URL=/videos/intro-demo.mp4`
   (Vercel: Project → Settings → Environment Variables) and redeploy.
   The `VideoSection` component will then render a real `<video>` player automatically.

Until the MP4 is added, the landing page honestly shows an animated poster + a
transcript toggle (no fake playback).

## Required external tools
- Screen recorder (OBS Studio is free) + cursor-highlight overlay.
- Audio recorder / mic for the voice-over.
- Video editor (CapCut, DaVinci Resolve, Adobe Premiere) to composite.
