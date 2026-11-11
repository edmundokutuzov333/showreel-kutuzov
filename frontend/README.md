# Frontend · Edmundo Kutuzov Showreel

> **The work moves.** A React 19 + Three.js studio for a real-time, interactive 16:9 creative showreel.

The **complete and maintained project documentation** lives in the repository root:

### [→ Read the complete project README](../README.md)

It includes architecture, three production experiences, source assets and provenance, cinematic timeline, sound design and narration, export limitations, APIs, Vercel deployment, tests, troubleshooting, licensing and technical audit.

## Run locally

```bash
# From this frontend/ directory:
corepack enable
corepack yarn install --frozen-lockfile
corepack yarn start
```

The UI is available at [http://localhost:3000](http://localhost:3000). The Create React App development server **does not automatically expose the Vercel** `/api/reel/narration` **function**. To hear local EN/PT narration, run the optional FastAPI backend and set `REACT_APP_BACKEND_URL`, or use a local environment that supports the Vercel functions. Without narration, the generated instrumental remains usable.

## Verify

```bash
CI=true corepack yarn test --watch=false --runInBand
CI=true corepack yarn build
```

The production build is written to `frontend/build/` and the tests cover versions, editorial provenance and voice masters. Always perform manual GPU/browser and downloaded-video checks before a commercial release.

## Main entry points

| Responsibility | Source |
|---|---|
| Studio UI | [src/pages/ReelStudio.jsx](src/pages/ReelStudio.jsx) |
| State and controls | [src/hooks/useReel.js](src/hooks/useReel.js) |
| WebGL playback and recording | [src/reel/engine.js](src/reel/engine.js) |
| Active V3 scene choreography | [src/reel/campaignFilm.js](src/reel/campaignFilm.js) |
| Generative score and narration | [src/reel/audio.js](src/reel/audio.js) |
| Production narration API | [api/reel/narration.js](api/reel/narration.js) |
| Creative assets | [public/reel/](public/reel/) |

**Documentation reference:** 11 November 2026. For the authoritative scope, caveats and deployment snapshot, use the root README.
