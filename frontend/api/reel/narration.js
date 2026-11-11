const TIMES = [4.6, 7.2, 9.2, 14, 21.6, 29.6, 37.4, 41.6, 45.4, 52.8, 56];
const LINES = {
  en: [
    "Most work asks for attention.", "Mine takes it.", "Built in Maputo. Made for the world.",
    "Social media... image... design... campaigns... motion.",
    "Ideas that stop you. Stay in memory. And make you act.",
    "Brand systems for the names you know.", "A hundred and fifty projects. Thirty brands. One obsession:",
    "work that refuses to be ignored.", "Clarity. Rhythm. Precision. Memory.", "I'm Edmundo Kutuzov.", "Just a creative guy."
  ],
  pt: [
    "A maioria do trabalho pede atenção.", "O meu conquista-a.", "Feito em Maputo. Pensado para o mundo.",
    "Redes sociais... imagem... design... campanhas... motion.",
    "Ideias que fazem parar. Ficam na memória. E fazem agir.",
    "Sistemas de marca para os nomes que conhece.", "Cento e cinquenta projetos. Trinta marcas. Uma obsessão:",
    "trabalho que se recusa a ser ignorado.", "Clareza. Ritmo. Precisão. Memória.", "Eu sou Edmundo Kutuzov.", "Just a creative guy."
  ]
};

export default function handler(req, res) {
  const lang = req.query?.lang || "en";
  if (!LINES[lang]) return res.status(404).json({ detail: "Unknown language" });
  res.setHeader("Cache-Control", "public, max-age=3600");
  const version = ["v1","v2","v3"].includes(req.query?.version) ? req.query.version : "v2";
  // V3 keeps copy sparse. Selected samples are spoken by the original voice
  // recordings at their source indices, ensuring sound and captions agree.
  const indices = version === "v3" ? [2,8,10] : Array.from({length:11},(_,i)=>i);
  const cues = version === "v3" ? [3.7,35.0,55.1] : TIMES;
  return res.status(200).json({
    lang, version, voice:lang === "pt" ? "pt-PT/tugao" : "en-US/joe", model:"piper-medium/pre-rendered",
    lines: indices.map((idx,i)=>({
      i, t:cues[i], text:LINES[lang][idx],
      url:`/reel/vo/${lang}/${idx}.mp3`
    }))
  });
}
