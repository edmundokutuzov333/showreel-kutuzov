# Local narration audio masters
Pre-rendered, edited, and aligned EN/PT voice clips for the 2026 showreel.
Index 0-10 follows frontend/api/reel/narration.js. All tracks are MP3, 24kHz,
96kbps, mono. EN: Piper en_US-joe-medium. PT: Piper pt_PT-tugão-medium.
Source voice model cards list CC0 datasets; confirm final media usage and
voice model licensing before commercial redistribution. Voice and instrumental
are mixed at runtime in WebAudio; 'Sem voz' loads neither voice track.
Audio is pre-rendered to keep production independent of external API keys and
ephemeral speech services.
