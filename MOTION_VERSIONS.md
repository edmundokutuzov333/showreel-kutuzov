# Showreel versions / production notes

Three playable experiences coexist at /:

- **V1 — Editorial reconstruction (52s)**: rebuild from surviving portfolio assets, not the exact historical 52-second MP4. The original 960×540 / 24fps MP4 with AAC soundtrack was recovered from the user's ChatGPT Library, but is **not** hosted in this repo. This distinction is shown in the UI. To distribute the original at a permanent on-site path, copy the historical file to object storage or `frontend/public/reel/archive/v1-original.mp4` in a separate managed asset upload.
- **V2 — Original interactive (60s)**: existing WebGL scene builders and their visual choreography are preserved unchanged.
- **V3 — BREACH Director's Cut (60s)**: original Breach intro 0–3.6s followed by nine original chapters (artworks, materials, editorial, machine, overload, proof, creator and signature).

All versions render a 1920×1080, 16:9 WebGL canvas, with a dedicated synchronized WebAudio soundtrack. Recording is browser-side realtime, with MP4 or WebM chosen according to browser support.

## Reliable narration

- `frontend/api/reel/narration.js` provides the EN/PT lines and scene-accurate cue times; V3 uses lines at 8s, 51s and 57.4s.
- **22 pre-rendered MP3 voice masters** reside under `frontend/public/reel/vo/{en,pt}/{0..10}.mp3`. These are local files and do not depend on an inaccessible preview TTS service, a runtime API key or synthesis while playing.
- EN voice was generated with Piper `en_US-joe-medium`. PT with Piper `pt_PT-tugão-medium`; source voice model cards report CC0 training datasets. Check the model-card terms before commercial distribution.
- `/api/reel/vo/{lang}/{idx}.mp3` redirects to the corresponding static file for compatibility with older links.
- Soundtrack is always available. **Sem voz** disables voice samples but retains instrumental/music and effects. Changing EN/PT reschedules playback at the current clock position.
- Audio loading uses partial recovery: if a single sample is inaccessible, it warns rather than silencing the entire track.

## Exporting and verifying downloads

Click **Preparar vídeo 1080p** and keep the foreground tab visible while the browser records. When recording is complete a clear **Descarregar agora** link appears. It is intentionally user-clickable: automatic browser downloads following a 60s recording may be blocked.

- Chrome/Edge often export WebM; some Safari implementations support MP4.
- The recording uses `canvas.captureStream(60)` and WebAudio's capture destination; browser resource limits can introduce dropped frames.
- An explicit timeout and empty-blob check prevent silent indefinite or invalid exports.
- For commercial distribution mastering, perform a separate verified deterministic render and inspect video, duration and audio using ffprobe, rather than treating browser MediaRecorder as a guaranteed frame-perfect cinematic render.

## Validation

Run `cd frontend && corepack yarn install --frozen-lockfile`, `CI=true corepack yarn test --watch=false --runInBand` and `CI=true corepack yarn build`.

Manual QA: V1 52s and V2/V3 60s; seek/pause/replay/explore; EN/PT/off; play each segment; record V3 in each language and one instrumental version; check the downloaded file's duration/video/audio tracks and watch for frame stutter. Test on multiple browsers / GPUs.
