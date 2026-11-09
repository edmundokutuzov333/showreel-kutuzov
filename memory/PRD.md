# PRD — Showreel edmundokutuzov.art

## Original problem
60s 16:9 award-level showreel for Edmundo Kutuzov (art director, Maputo), built from site assets (no uploads). Works first, motion serves works; heavy 3D spatial treatment; site recognisable but reinterpreted; closing name + URL; implicit CTA. User choices: in-browser 3D showreel + video export, 60s, in-app generated ambient score, closing "JUST A CREATIVE GUY.", narration added.

## Architecture
- Frontend: React + three.js (raw) engine `src/reel/*` rendering at 1920x1080 into MSAA RT + custom post shader (slit/ember line, whip blur, chromatic aberration, grain, vignette, flash). Deterministic timeline (seekable). WebAudio generative score (audio.js) is the master clock. MediaRecorder export (mp4 if supported else webm) with audio + VO.
- Backend: FastAPI `reel.py` — /api/reel/narration?lang=en|pt, /api/reel/vo/{lang}/{i}.mp3 (OpenAI TTS tts-1-hd voice onyx via Emergent LLM key, disk cache backend/vo_cache).
- Assets: 155 works scraped from edmundokutuzov.art/work → /frontend/public/reel/img (webp ≤1280), 3 motion videos (720p) /reel/vid, 20 client logos /reel/logos.

## Timeline (implemented 2026-06)
0–2 Breach (ember slit reveal) · 2–8 Tunnel (13 works, beat-stepped dolly, STOP/STAY/ACT) · 8–16 Fan (site carousel rebuilt 3D) · 16–25 Manifesto strips assembly · 25–34 Curved campaign wall + videos · 34–42 Beat montage + 150+/30+/3 stats · 42–48 Client logo rings + principles · 48–60 Signature EDMUNDO/KUTUZOV split reveal, JUST A CREATIVE GUY., edmundokutuzov.art.
Global frame HUD (name, coords, timecode, section, URL) 0–47.5s.

## Status
- Tested iteration_1: backend 100%, frontend 100%; full export produced 25MB mp4 in headless Chrome.

## Backlog
- P1: Swap in user's own hi-res assets/logo & priority works when available
- P1: 9:16 / 1:1 cutdowns for social ads; 15s/30s versions
- P2: Native-accent PT voice (ElevenLabs), custom music upload, frame-accurate offline render

