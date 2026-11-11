// Backward-compatible redirect to the pre-rendered, local narration masters.
// No external speech server or runtime API key is required.
export default function handler(req, res) {
  const { lang } = req.query || {};
  const raw = String(req.query?.idx ?? "");
  const idx = raw.endsWith(".mp3") ? raw.slice(0, -4) : raw;
  if (!/^(en|pt)$/.test(lang || "") || !/^(0|[1-9]|10)$/.test(idx)) {
    return res.status(404).json({ detail: "Unknown narration line" });
  }
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=604800");
  return res.redirect(307, `/reel/vo/${lang}/${idx}.mp3`);
}
