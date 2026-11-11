const ORIGIN = "https://kutuzov-showreel--50k9y81j.preview.emergentagent.com";

export default async function handler(req, res) {
  const { lang } = req.query || {};
  // Vercel's dynamic route binds "0.mp3" (not "0") when the URL
  // is /api/reel/vo/en/0.mp3. Strip only the known suffix.
  const raw = String(req.query?.idx ?? "");
  const idx = raw.endsWith(".mp3") ? raw.slice(0,-4) : raw;
  if (!/^(en|pt)$/.test(lang || "") || !/^(0|[1-9]|10)$/.test(idx)) {
    return res.status(404).json({detail:"Unknown narration line"});
  }
  try {
    const response = await fetch(`${ORIGIN}/api/reel/vo/${lang}/${idx}.mp3`, {
      headers: {accept:"audio/mpeg"}, signal:AbortSignal.timeout(25000)
    });
    if(!response.ok) return res.status(502).json({detail:"Narration provider unavailable"});
    const type=response.headers.get("content-type")||"";
    if(!type.includes("audio") && !type.includes("octet-stream"))
      return res.status(502).json({detail:"Narration provider returned an unexpected response"});
    res.setHeader("Content-Type","audio/mpeg");
    res.setHeader("Cache-Control","public, max-age=86400, stale-while-revalidate=604800");
    return res.status(200).send(Buffer.from(await response.arrayBuffer()));
  } catch(error) {
    return res.status(502).json({detail:"Narration provider temporarily unavailable"});
  }
}
