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
  return res.status(200).json({
    lang, voice: "onyx", model: "tts-1-hd",
    lines: LINES[lang].map((text, i) => ({ i, t: TIMES[i], text, url: `/api/reel/vo/${lang}/${i}.mp3` }))
  });
}
