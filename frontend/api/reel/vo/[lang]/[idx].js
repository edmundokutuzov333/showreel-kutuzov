const ORIGIN = "https://kutuzov-showreel--50k9y81j.preview.emergentagent.com";

export default async function handler(req, res) {
  const { lang, idx } = req.query || {};
  if (!/^(en|pt)$/.test(lang || "") || !/^\d+$/.test(idx || "") || Number(idx) > 10) {
    return res.status(404).json({ detail: "Unknown narration line" });
  }
  const upstream = await fetch(`${ORIGIN}/api/reel/vo/${lang}/${idx}.mp3`);
  if (!upstream.ok) return res.status(upstream.status).json({ detail: "Voice generation failed" });
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.status(200).send(Buffer.from(await upstream.arrayBuffer()));
}
