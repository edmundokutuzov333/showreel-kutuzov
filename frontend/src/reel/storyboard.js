export const BLOCKS = [
  { id: "hook", n: "01", name: "Breach", from: 0, to: 3.6, desc: "Escuridão total. O manifesto do site entra palavra a palavra, com eco 3D e glitch. Silêncio. A linha ember rasga o ecrã." },
  { id: "archive", n: "02", name: "O arquivo", from: 3.6, to: 21, desc: "Big bang das 155 obras. Formam uma galáxia em espiral e depois aterram como o índice /work, filtrado por categoria." },
  { id: "portfolio", n: "03", name: "Obras & autoridade", from: 21, to: 45, desc: "Manifesto em camadas e mosaico, corredor de campanhas com vídeos e reflexo, montagem ao beat com os números do site." },
  { id: "signature", n: "04", name: "Assinatura", from: 45, to: 60, desc: "Clientes e princípios. Vórtice que suga o arquivo para a linha, de onde nasce EDMUNDO KUTUZOV." },
];

export const SCENES = [
  { from: 0, to: 3.6, label: "Breach" },
  { from: 3.6, to: 13.7, label: "Galáxia" },
  { from: 13.7, to: 21, label: "Índice" },
  { from: 21, to: 29, label: "Manifesto" },
  { from: 29, to: 37, label: "Campanhas" },
  { from: 37, to: 45, label: "Ritmo" },
  { from: 45, to: 50, label: "Clientes" },
  { from: 50, to: 60, label: "Assinatura" },
];

export const FILTERS = ["ALL", "SOCIAL MEDIA", "IMAGE MANIPULATION", "DESIGN", "CAMPAIGN", "VIDEO"];

export const fmt = (t) => {
  const s = Math.floor(t);
  const f = Math.min(24, Math.floor((t - s) * 25));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
};

