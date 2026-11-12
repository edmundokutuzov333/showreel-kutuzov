import { ReelEngine } from "./engine";
import { CAMPAIGNS, CATEGORIES, BRAND_NAMES } from "./campaignFilm";
import { verticalFormat, containRect } from "./verticalFormats";

const BG = "#0a0d15";
const PALE = "#e8eef6";
const ICE = "#9cc6f5";
const BLUE = "#4466ff";
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function imageSize(image) {
  return [
    image?.videoWidth || image?.naturalWidth || image?.width || 0,
    image?.videoHeight || image?.naturalHeight || image?.height || 0
  ];
}
function drawContain(ctx, image, x, y, w, h) {
  if (!image || (image.tagName === "VIDEO" && image.readyState < 2)) return;
  const [iw, ih] = imageSize(image);
  const rect = containRect(iw, ih, x, y, w, h);
  if (!rect) return;
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
}
function drawCover(ctx, image, x, y, w, h) {
  const [iw, ih] = imageSize(image);
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const cropW = w / scale, cropH = h / scale;
  ctx.drawImage(image, (iw - cropW) / 2, (ih - cropH) / 2,
    cropW, cropH, x, y, w, h);
}
function label(ctx, text, x, y, size, color = ICE, align = "left") {
  ctx.fillStyle = color;
  ctx.font = "500 " + Math.round(size) + 'px "JetBrains Mono", monospace';
  ctx.textBaseline = "top";
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}
function headline(ctx, words, x, y, maxW, size) {
  // Two-line word wrapping. Unlike a crop, every title remains inside frame.
  const pieces = String(words).split(" ");
  const lines = [];
  let row = "";
  ctx.font = "800 " + Math.round(size) + 'px "Syne", sans-serif';
  for (const word of pieces) {
    const candidate = row ? row + " " + word : word;
    if (row && ctx.measureText(candidate).width > maxW) {
      lines.push(row);
      row = word;
    } else row = candidate;
  }
  if (row) lines.push(row);
  // Keep long campaign titles legible without clipping the safe column.
  if (lines.length > 2) {
    size *= Math.max(0.64, 2 / lines.length);
    return headline(ctx, words, x, y, maxW, size);
  }
  ctx.fillStyle = PALE;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "800 " + Math.round(size) + 'px "Syne", sans-serif';
  for (let i = 0; i < lines.length; i++) {
    // Very long single words receive their own precise width fit.
    let font = size;
    while (font > size * 0.62 && ctx.measureText(lines[i]).width > maxW) {
      font -= 1;
      ctx.font = "800 " + Math.round(font) + 'px "Syne", sans-serif';
    }
    ctx.fillText(lines[i], x, y + i * size * 1.12);
    ctx.font = "800 " + Math.round(size) + 'px "Syne", sans-serif';
  }
}
function backdrop(ctx, source, width, height, time) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.globalAlpha = 0.26;
  drawCover(ctx, source, 0, 0, width, height);
  ctx.restore();
  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, "rgba(6,10,19,.83)");
  shade.addColorStop(.45, "rgba(6,10,19,.48)");
  shade.addColorStop(1, "rgba(6,10,19,.92)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
  const x = width * (.07 + .005 * Math.sin(time * .7));
  ctx.fillStyle = BLUE;
  ctx.globalAlpha = .6;
  ctx.fillRect(x, height * .11, Math.max(1, width * .0025), height * .76);
  ctx.globalAlpha = 1;
}
function marker(ctx, width, height, text, time) {
  label(ctx, "EK / THE FINAL CUT", width * .09, height * .148, width * .022);
  label(ctx, text, width * .91, height * .148, width * .019, PALE, "right");
  ctx.fillStyle = "rgba(156,198,245,.18)";
  ctx.fillRect(width * .08, height * .958, width * .84, Math.max(2, width * .002));
  ctx.fillStyle = ICE;
  ctx.fillRect(width * .08, height * .958,
    width * .84 * clamp(time / 60), Math.max(2, width * .002));
}
function framedArt(ctx, image, x, y, w, h, t, index) {
  const reveal = clamp(t / .24 - index * .12);
  if (reveal <= 0) return;
  ctx.save();
  ctx.globalAlpha = reveal;
  ctx.translate(0, (1 - reveal) * h * .12);
  ctx.fillStyle = "#121d30";
  ctx.fillRect(x, y, w, h);
  const pad = Math.min(w, h) * .052;
  drawContain(ctx, image, x + pad, y + pad, w - 2 * pad, h - 2 * pad);
  ctx.strokeStyle = "rgba(156,198,245,.48)";
  ctx.lineWidth = Math.max(1, w * .002);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}
function artSequence(ctx, images, width, height, time, sceneStart, sceneEnd, story) {
  if (!images.length) return;
  const numBatches = Math.ceil(images.length / 4);
  const beat = (sceneEnd - sceneStart) / numBatches;
  const absolute = clamp(time - sceneStart, 0, sceneEnd - sceneStart - .0001);
  const batch = Math.floor(absolute / beat);
  const local = absolute - batch * beat;
  const group = images.slice(batch * 4, batch * 4 + 4);
  const x = width * .092, cardW = width * .816;
  const startY = height * (story ? .305 : .31);
  const endY = height * (story ? .854 : .88);
  const available = endY - startY;
  if (group.length === 1) {
    framedArt(ctx, group[0], x, startY, cardW, available, local, 0);
    return;
  }
  if (group.length === 2) {
    const gap = height * .012;
    const h = (available - gap) / 2;
    group.forEach((image, i) => framedArt(ctx, image, x,
      startY + (h + gap) * i, cardW, h, local, i));
    return;
  }
  const gap = width * .014;
  const topHeight = available * .65;
  framedArt(ctx, group[0], x, startY, cardW, topHeight, local, 0);
  const n = group.length - 1;
  const smallW = (cardW - gap * (n - 1)) / n;
  const smallY = startY + topHeight + height * .012;
  const smallH = endY - smallY;
  for (let i = 1; i < group.length; i++)
    framedArt(ctx, group[i], x + (i - 1) * (smallW + gap),
      smallY, smallW, smallH, local, i);
}
function campaignImages(assets, campaign) {
  const images = (assets.campaigns[campaign.slug] || [])
    .filter((_, i) => !campaign.exclude.includes(i)).map(t => t.image);
  for (const id of campaign.extraIds || []) images.push(assets.tex[id]?.image);
  return images.filter(Boolean);
}
function categoryImages(assets, category) {
  return category.ids.map(id => category.video
    ? assets.videos[id]?.el : assets.tex[id]?.image).filter(Boolean);
}
function brandGrid(ctx, assets, width, height, time) {
  const duration = 8.5 / 5;
  const idx = Math.min(4, Math.floor((time - 45) / duration));
  const local = time - 45 - idx * duration;
  const pad = width * .094;
  const gap = width * .027;
  const cardW = (width - pad * 2 - gap) / 2;
  const cardH = height * .166;
  const top = height * .30;
  for (let i = 0; i < 4; i++) {
    const number = idx * 4 + i;
    const col = i % 2, row = Math.floor(i / 2);
    const x = pad + col * (cardW + gap);
    const y = top + row * (cardH + height * .018);
    const reveal = clamp((local - i * .08) / .34);
    if (!reveal) continue;
    ctx.save();
    ctx.globalAlpha = reveal;
    ctx.fillStyle = "#111d31";
    ctx.fillRect(x, y, cardW, cardH);
    const src = assets.logos[number]?.image;
    drawContain(ctx, src, x + cardW * .09, y + cardH * .12,
      cardW * .82, cardH * .64);
    label(ctx, BRAND_NAMES[number], x + cardW * .5, y + cardH * .83,
      Math.min(width * .018, cardW * .042), PALE, "center");
    ctx.strokeStyle = "rgba(156,198,245,.36)";
    ctx.strokeRect(x, y, cardW, cardH);
    ctx.restore();
  }
}
function originalFrame(ctx, source, width, height, story, time) {
  const frameW = width * .92;
  const frameH = frameW * 9 / 16;
  const x = (width - frameW) / 2;
  const y = height * (story ? .324 : .30);
  ctx.fillStyle = "#111a2b";
  ctx.fillRect(x - 3, y - 3, frameW + 6, frameH + 6);
  drawContain(ctx, source, x, y, frameW, frameH);
  ctx.strokeStyle = "rgba(156,198,245,.48)";
  ctx.lineWidth = Math.max(1, width * .002);
  ctx.strokeRect(x, y, frameW, frameH);
  // These stripes are deliberately decorative; the complete original frame
  // above remains visible, without cutting original camera work or typography.
  const fade = .12 + .10 * Math.sin(time * 2) ** 2;
  ctx.save();
  ctx.globalAlpha = fade;
  const stripY = y + frameH + height * .04;
  const stripH = height * (story ? .13 : .15);
  const stripW = (frameW - width * .018) / 2;
  drawCover(ctx, source, x, stripY, stripW, stripH);
  drawCover(ctx, source, x + stripW + width * .018, stripY, stripW, stripH);
  ctx.restore();
}
function signature(ctx, source, width, height, time) {
  // The real animated V3 three-dimensional monogram, enlarged from its
  // centre-safe square. No new text, re-created logo or fabricated animation.
  const sourceSide = Math.min(source.width, source.height);
  const dimension = width * .96;
  const x = (width - dimension) / 2;
  const y = (height - dimension) / 2;
  const glow = ctx.createRadialGradient(width / 2, height / 2, 0,
    width / 2, height / 2, width * .7);
  glow.addColorStop(0, "rgba(68,102,255,.17)");
  glow.addColorStop(1, "rgba(68,102,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, (source.width - sourceSide) / 2,
    (source.height - sourceSide) / 2, sourceSide, sourceSide,
    x, y, dimension, dimension);
}

/**
 * A separate V3-only compositor. Three.js keeps rendering the ORIGINAL V3
 * to a detached 16:9 WebGL canvas (same scene code, clock and soundtrack).
 * The visible 2D canvas reflows real artwork/logos for 9:16 or 4:5.
 * This never modifies the actual final cut or the existing MP4 renderer.
 */
export class VerticalReelEngine extends ReelEngine {
  constructor(outputCanvas, formatId) {
    super(document.createElement("canvas"), "v3");
    this.verticalFormat = verticalFormat(formatId);
    this.outputCanvas = outputCanvas;
    this.outputCanvas.width = this.verticalFormat.previewWidth;
    this.outputCanvas.height = this.verticalFormat.previewHeight;
    this.outputContext = this.outputCanvas.getContext("2d", { alpha: false });
    if (!this.outputContext) throw new Error("Canvas 2D não disponível para o formato vertical.");
  }

  renderFrame(time) {
    super.renderFrame(time);
    this.renderPortrait(time);
  }

  renderPortrait(time) {
    if (!this.A || !this.outputContext) return;
    const ctx = this.outputContext;
    const w = this.outputCanvas.width, h = this.outputCanvas.height;
    const source = this.canvas;
    const story = this.verticalFormat.id === "story";
    ctx.save();
    backdrop(ctx, source, w, h, time);
    if (time >= 53.5) {
      signature(ctx, source, w, h, time);
    } else if (time >= 45) {
      marker(ctx, w, h, "20 / BRANDS", time);
      headline(ctx, "BRANDS I'VE WORKED WITH", w * .092, h * .202, w * .83, w * .061);
      brandGrid(ctx, this.A, w, h, time);
    } else {
      const campaign = CAMPAIGNS.find(c => time >= c.start && time < c.end);
      const category = CATEGORIES.find(c => time >= c.start && time < c.end);
      if (campaign) {
        marker(ctx, w, h, "CAMPAIGN / " + String(CAMPAIGNS.indexOf(campaign) + 1).padStart(2, "0"), time);
        headline(ctx, campaign.title, w * .092, h * .198, w * .82, w * .062);
        artSequence(ctx, campaignImages(this.A, campaign), w, h,
          time, campaign.start, campaign.end, story);
      } else if (category) {
        marker(ctx, w, h, "CREATIVE PRACTICE", time);
        headline(ctx, category.name, w * .092, h * .202, w * .82, w * .076);
        artSequence(ctx, categoryImages(this.A, category), w, h,
          time, category.start, category.end, story);
      } else {
        marker(ctx, w, h, "V3 / 60 SEC", time);
        originalFrame(ctx, source, w, h, story, time);
      }
    }
    ctx.restore();
  }

  async recordMp4(preset, onProgress, options = {}) {
    const { renderVerticalMp4 } = await import("./verticalMp4Export");
    return renderVerticalMp4(this, preset, onProgress, options);
  }
}
