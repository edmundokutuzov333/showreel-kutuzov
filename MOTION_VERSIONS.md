# Showreel versions / production notes

The current production contains three user-facing selectors:

- **V1 — Editorial reconstruction**: a source-code recreation of the 52-second Motion V1 aesthetic, using the artwork included with this repository. **It is not the archived 52s MP4 binary.** The historical MP4 remains in the original user-provided files, not in this Git repository.
- **V2 — Original interactive**: the pre-existing 60s interactive Three.js reel, unchanged visual scene builders.
- **V3 — Director's Cut**: original Breach introduction, then the new ten-beat creative treatment and signature.

All versions use the same portfolio assets, audio graph, and WebGL renderer.
The voice API keeps the historical narration for V1/V2. V3 uses three lines drawn from the existing spoken phrases at 8s, 51s, and 57.4s.

## Production limitations

- The API proxy `/api/reel/vo/{en|pt}/{idx}.mp3` relies on an upstream service and must be monitored; any failure is reported in the user interface.
- Browser MediaRecorder is a **realtime capture**, not a deterministic/offline film render. Frame delivery and container support depend on the user's browser, GPU, and system resources.
- Final distribution masters should be rendered and QC'd independently before commercial publication.
- An original MP4 of V1 must be explicitly added to object storage (or `frontend/public/reel/archive/v1.mp4`) before the exact original can be offered online. Do not mislabel the reconstructed study as the original video.

## Code map

- `src/reel/intro.js`: original Breach, preserved.
- `src/reel/directorCut.js`: V3 scene choreography and keyframes.
- `src/reel/editorialStudy.js`: V1 editorial reconstruction.
- `src/reel/engine.js`: version selection, playback, export, exploration.
- `src/reel/audio.js`: music timing and synchronized cues.
- `src/hooks/useReel.js`: UI playback controller, narration.
- `api/reel/`: version-aware narrative metadata and voice proxy.

## Checks

Run `yarn test --watch=false` and `yarn build` from `frontend/`, then verify:

1. V1 selection starts a 52s timeline; V2 and V3 are 60s.
2. V2 matches the previous interactive film; V3 retains Breach 0-3.6s.
3. EN/PT narration endpoints return relevant cues and audio; no-voice disables voice.
4. Fullscreen, seek, pause, replay, explore mode and export in Chrome/Edge.
5. Browser's downloaded recording has the expected number of frames and complete audio.

