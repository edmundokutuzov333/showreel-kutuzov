# Showreel versions / production notes

Three playable experiences coexist at /:

- **V1 — Editorial reconstruction (52s)**: rebuild from surviving portfolio assets, not the exact historical 52-second MP4. The original 960×540 / 24fps MP4 with AAC soundtrack was recovered from the user's ChatGPT Library, but is **not** hosted in this repo. This distinction is shown in the UI. To distribute the original at a permanent on-site path, copy the historical file to object storage or `frontend/public/reel/archive/v1-original.mp4` in a separate managed asset upload.
- **V2 — Original interactive (60s)**: existing WebGL scene builders and their visual choreography are preserved unchanged.
- **V3 — A POINT OF VIEW (60s)**: original typographic opening, ICOR, KitKat, Pembe, Webmasters, GIZ, Super Marés, Jimmys Killer, design/OOH, 20 genuine clients in groups of four, then the extruded official EK 3D logo. Actual selected campaign credits are separate from collaboration clients. V1 and V2 remain preserved.

All versions render a 1920×1080, 16:9 WebGL canvas, with a dedicated synchronized WebAudio soundtrack. Recording is browser-side realtime, with MP4 or WebM chosen according to browser support.

## Reliable narration

- `frontend/api/reel/narration.js` provides the EN/PT lines and scene-accurate cue times; V3 uses lines at 8s, 54.5s and 57.4s.
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

## Curated V3 provenance

- Real campaigns: ICOR 139, KitKat 140, Pembe 142, Webmasters 143/21/50, GIZ 146, Super Marés 145, Jimmys Killer 147, OOH 80, Phantom 95, Mixshow 128, Concrete Rhymes 134.
- 20 real client logos from portfolio repo, not substitutes.
- The actual three-polygon EK outline from src/components/logo-paths.ts is extruded by brandMark.js.
- The browser recorder is not a frame-accurate offline cinematic master; QC on GPU is required.

## V3 / Campaign Cut — 2026-11-11

The current V3 is implemented in `frontend/src/reel/campaignFilm.js` and uses an exact, verified set of six original galleries: A Depressão é Real (14), Diga YES & Viva o Mundo Online (9), Cozinhar é Arte (1), Água é Vida (3), Viva a Experiência no Super Marés (7), We Are GIZ (6) — **40 published artworks** in total, all cached locally as optimized WebP at `frontend/public/reel/campaigns`. Source URLs and SHA-256 checksums are recorded in `scripts/campaign-sources.json` and `scripts/campaign-asset-checksums.json`. The 40 assets were imported via a temporary, controlled GitHub workflow. No artwork was fabricated.

Timeline: 0–3.8s official EK/portal inspired by the portfolio site opening; 3.8–23s six galleries in 3.2s dynamic multi-art bursts; 23–41s category-led Social Media, Manipulation, Some Dezaines+, Video, Campaign Design; 41–52.5s the 20 real logos in groups of four with explicit description **brands I've worked with / marcas com as quais já trabalhei**; 52.5–60s continuously animated original three-dimensional EK mark with no full-name text. The off-camera narration now uses three existing samples at 4.4/27/55s, with the spoken name removed from the outro. V1 and V2 scene code is unchanged.

Text planes are scaled to capped safe widths before placement. Validate edge clipping at actual canvas resolution and all timecodes; browser realtime video export remains distinct from a frame-accurate offline master.


### Final V3 revision (2026-11-11)
V3 now starts by calling the **literal original V2** buildVoid() at 0–3.6 s
and buildArchive(A, cloud) at 3.6–21 s (galaxy + filter index). V2 itself
is unchanged. From 21–34.2 s six published galleries use animated
editorial asymmetric layouts rather than a fixed grid. Two repeated ICOR
visuals in the published 14-file gallery are omitted (indices 11 and 13);
the full source gallery remains stored, and 38 unique campaign designs
are shown. From 34.2–45 s only Social Media, Manipulation, Some Dezaines+
and Video appear in complete sets of three unique artworks per shot.
From 45–53.5 s, all twenty original brand marks use an identical neutral
dark-navy background system. From 53.5–60 s the real EK extrusion moves
continuously with larger scale, faster 3D spin, animated light rigs, more
reactive rings, orbital camera movement and 72 kinetic particles.
No full-name text appears in the outro. Creative categories do not
repeat published campaign visual IDs or individual artwork slugs.


### Final copy and MP4 multi-quality exporter — 11 November 2026

Approved creative copy: index title STAY; subtitle
SEEN FOR A SECOND. FELT FOR LONGER.; filter subtitles
Every Angle / More Than a Post / Bend Reality / Outside the Lines /
Made to Matter / Never Just Frames. The published DESIGN works
remain filterable under the SOME DEZAINES* display label.
Development category SOME DEZAINES* contains exactly catalogue
IDs 132,71,72 / 87,90,89 / 138,137,135.
Cozinhar é Arte keeps its original piece and adds the explicitly
requested /reel/img/147.webp; no category repeats it.
EK finale effects and animation are unchanged; only
www.edmundokutuzov.art is added as a safe-zone title.

Export is instrumental-only (no narration or voice playback).
The MP4 exporter drives Three.js frame-by-frame at 30 fps through
Mediabunny/WebCodecs H.264 and mixes the existing score using
OfflineAudioContext into AAC (software fallback via
@mediabunny/aac-encoder). Native render sizes:
720p 1280x720, 1080p 1920x1080, 1440p 2560x1440, 4K 3840x2160.
MP4 video dimensions and AAC audio track are validated before
a Blob download is offered; clicking Descarregar agora starts an
immediate download. Encoding speed and support depend on available
CPU/GPU/codec; unsupported devices are told rather than receiving
an upscaled file or mislabeled WebM.


#### ICOR closing frame
The two rejected image files icor-depressao/10.webp and
icor-depressao/12.webp were removed from the repository and campaign
manifest. The alternate duplicates (11.webp and 13.webp) remain in
the source gallery but are not rendered. The ten approved works show
as 4 + 4 + 2. The last frame contains precisely 08.webp and 09.webp
in a unique larger editorial two-card composition.
No other campaign timing, assets or animations were changed.
