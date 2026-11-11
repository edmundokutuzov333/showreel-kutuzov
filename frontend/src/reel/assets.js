import * as THREE from "three";
import { BASE_URL } from "./paths";

export const BASE = BASE_URL;

export const TITLES = {
  139: ["ICOR", "A Depressão é Real"],
  140: ["KIT KAT", "Para quem tu queres"],
  141: ["HORIZONTE SEGUROS", "#EstamosAquiParaTi"],
  142: ["PEMBE MOZ", "Cozinhar é Arte"],
  143: ["WEBMASTERS", "Digas Yes & Viva o Mundo Online"],
  144: ["FONTE FRESCA", "Água é vida"],
  145: ["SUPER MARÉS", "Viva a Experiência"],
  146: ["GIZ", "We Are GIZ"],
  147: ["JIMMYS KILLER", "A Cena que Domina as Ruas"],
};

export const SEL = {
  cinema: [127, 110, 101, 113],
  corridor: [139, 140, 141, 142, 143, 144, 145, 146, 147],
  corridorSide: [148, 151, 149, 152, 150, 153, 154, 89, 135],
  rush: [43, 44, 45, 46, 20, 36, 37, 66, 73, 94, 138, 123, 99, 105, 60, 7],
  videos: [148, 149, 150, 151, 152, 153, 154],
};

export const LOGOS = [
  "absa.webp", "toyota-mocambique.webp", "nissan-mocambique.webp", "hyundai-mocambique.webp", "galp.webp",
  "totalenergies.webp", "vodacom.png", "ronil-auto-mocambique.webp", "pernod-ricard-mocambique.webp", "giz.webp",
  "multichoice-dstv-gotv.webp", "kitkat.webp", "flying-fish.png", "brutal-fruit.webp", "joaquim-chaves-saude.webp",
  "ponta-apart-hotel.webp", "hotel-cardoso.webp", "emose.webp", "mocambique-companhia-de-seguros.webp", "promar.webp",
];

const pad3 = (n) => String(n).padStart(3, "0");

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function toTexture(source) {
  const t = new THREE.Texture(source);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function logoTexture(img) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 320;
  const g = c.getContext("2d");
  // Actual client logo art without fabricated badges or distorted aspect ratios.
  const scale = Math.min(555 / img.width, 210 / img.height);
  g.clearRect(0, 0, c.width, c.height);
  g.drawImage(img, (c.width - img.width * scale) / 2,
    (c.height - img.height * scale) / 2, img.width * scale, img.height * scale);
  const texture = toTexture(c);
  const px = g.getImageData(0,0,640,320).data;
  let sum=0, count=0;
  for(let i=0;i<px.length;i+=16){
    if(px[i+3] < 70) continue;
    sum += px[i]*.2126 + px[i+1]*.7152 + px[i+2]*.0722;
    count++;
  }
  texture.userData.needsDarkPanel = count > 0 && sum / count > 195;
  return texture;
}

function loadVideo(id) {
  return new Promise((res) => {
    const v = document.createElement("video");
    v.src = `${BASE}/vid/${id}.mp4`;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
    const done = () => res(v);
    v.addEventListener("loadeddata", done, { once: true });
    v.addEventListener("error", done, { once: true });
    v.load();
  });
}

export async function loadAssets(onProgress) {
  const catalog = await (await fetch(`${BASE}/catalog.json`)).json();
  const manifestRes = await fetch(BASE + "/campaigns/manifest.json");
  if(!manifestRes.ok)throw Error("Missing original campaign gallery manifest");
  const campaignManifest=await manifestRes.json();
  if(campaignManifest.campaigns.length!==6 ||
    campaignManifest.campaigns.reduce((n,c)=>n+c.frames.length,0)!==38)
    throw Error("Expected 38 approved campaign artworks");
  const frames=campaignManifest.campaigns.flatMap(c=>c.frames.map((src,index)=>({src,index,slug:c.slug})));
  const categoryIds=[21,23,26,29,37,43,50,54,57,59,96,99,101,105,110,113,117,123,127,71,72,73,77,80,87,89,90,94,95,132,134,135,137,138,141,144,147,139,140,142,143,145,146];
  const ids=[...new Set([...SEL.cinema,...SEL.corridor,...SEL.rush,89,135,...categoryIds])];
  const total = ids.length + LOGOS.length + SEL.videos.length + 3 + frames.length;
  let done = 0;
  const tick = () => onProgress && onProgress(++done / total);
  const tex = {};
  const videos = {};
  const logos = [];
  const atlases = [];
  const campaigns=Object.fromEntries(campaignManifest.campaigns.map(c=>[c.slug,Array(c.frames.length)]));
  await Promise.all([
    Promise.all(['800 100px "Syne"', '700 100px "Syne"', '600 100px "Syne"', '500 20px "JetBrains Mono"', '400 20px "JetBrains Mono"'].map((f) => document.fonts.load(f))).then(tick),
    ...[0, 1].map((a) => loadImage(`${BASE}/atlas${a}.webp`).then((img) => { atlases[a] = toTexture(img); tick(); })),
    ...frames.map(({src,index,slug})=>loadImage(src).then(img=>{
      campaigns[slug][index]=toTexture(img);tick();
    })),
    ...ids.map((id) => loadImage(`${BASE}/img/${pad3(id)}.webp`).then((img) => { tex[id] = toTexture(img); tick(); })),
    ...LOGOS.map((f, i) => loadImage(`${BASE}/logos/${f}`).then((img) => { logos[i] = logoTexture(img); tick(); })),
    ...SEL.videos.map((id) => loadVideo(id).then((v) => {
      const t = new THREE.VideoTexture(v);
      t.colorSpace = THREE.NoColorSpace;
      videos[id] = { el: v, tex: t };
      tick();
    })),
  ]);
  return { catalog, atlases, tex, videos, logos, campaigns, campaignManifest };
}

