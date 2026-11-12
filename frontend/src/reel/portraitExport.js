import {
  AudioBufferSource, BufferTarget, CanvasSource,
  Mp4OutputFormat, Output, Quality,
  Input, BlobSource, ALL_FORMATS,
  canEncodeVideo, canEncodeAudio,
} from "mediabunny";
import { Score } from "./audio";

export const EXPORT_PRESETS = Object.freeze({
  story: {width:1080,height:1920,bitrate:18_000_000,label:"Stories 9:16"},
  feed:  {width:1080,height:1350,bitrate:16_000_000,label:"Feed 4:5"},
});
export const EXPORT_FPS = 30;

export function exportPreset(key) {
  if (!Object.prototype.hasOwnProperty.call(EXPORT_PRESETS, key))
    throw new Error("Resolução MP4 inválida.");
  return EXPORT_PRESETS[key];
}

function ensureRenderingCapabilities(engine, preset) {
  const gl = engine.renderer.getContext();
  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxRender = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
  if (preset.width > Math.min(maxTexture, maxRender) ||
      preset.height > Math.min(maxTexture, maxRender)) {
    throw new Error("A placa gráfica não suporta renderização nativa a " +
      preset.width + " × " + preset.height + ". Escolha uma resolução inferior.");
  }
  if (!window.VideoEncoder || !window.VideoFrame)
    throw new Error("É necessário Chrome, Edge ou Safari com suporte WebCodecs H.264 para exportar MP4.");
}

async function renderInstrumental(engine, duration) {
  // The same Score graph is scheduled into an OfflineAudioContext.
  // We do NOT synthesize a substitute audio track and we NEVER load voices.
  const sr = 48_000;
  const offline = new OfflineAudioContext(2, Math.ceil(duration * sr), sr);
  const score = new Score({ context: offline });
  score.version = engine.version;
  score.vo = [];
  score.start(0);
  return offline.startRendering();
}

async function ensureAac() {
  if (!(await canEncodeAudio("aac", {
    numberOfChannels: 2, sampleRate: 48_000,
    quality: new Quality({ bitrate: 256_000 })
  }))) {
    const { registerAacEncoder } = await import("@mediabunny/aac-encoder");
    registerAacEncoder();
  }
  if (!(await canEncodeAudio("aac", {
    numberOfChannels: 2, sampleRate: 48_000,
    quality: new Quality({ bitrate: 256_000 })
  }))) {
    throw new Error("O codificador de áudio instrumental AAC não está disponível.");
  }
}

async function seekSourceVideos(engine, time) {
  // During frame-accurate export, video samples must match the requested
  // timeline time, even though the playback clock is deliberately stopped.
  const active = engine.scenes.find((s) => s.active);
  if (!active || !active.name.startsWith("category-video")) return;
  const timeWithin = time - active.start;
  const ids = [148, 149, 150, 151, 152, 153];
  const batch = Math.min(1, Math.floor(timeWithin / ((active.end - active.start) / 2)));
  await Promise.all(ids.slice(batch * 3, batch * 3 + 3).map((id) => {
    const video = engine.A.videos[id]?.el;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const target = timeWithin % video.duration;
    if (Math.abs(video.currentTime - target) < 0.02) return;
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        video.removeEventListener("seeked", finish);
        resolve();
      };
      video.addEventListener("seeked", finish, { once: true });
      try { video.currentTime = target; } catch { finish(); }
      setTimeout(finish, 1200);
    });
  }));
}

/**
 * Frame-accurate renderer, H.264 video + AAC instrumental in a genuine MP4.
 * Unlike MediaRecorder, an internal clock drives every frame, so frame loss
 * caused by slow GPUs is not silently encoded as a fast/slideshow film.
 */
export async function renderMp4(engine, key, onProgress, options = {}) {
  const preset = exportPreset(key);
  if (engine.format!==key)throw new Error("O formato não coincide com a composição vertical.");
  ensureRenderingCapabilities(engine, preset);
  const fps = options.fps || EXPORT_FPS;
  const duration = options.duration || engine.duration;
  const numberOfFrames = Math.round(duration * fps);
  if (numberOfFrames <= 0 || duration > engine.duration) throw Error("Duração de exportação inválida.");
  const quality = new Quality({ bitrate: preset.bitrate });
  const supported = await canEncodeVideo("avc", {
    width: preset.width, height: preset.height,
    frameRate: fps, quality
  });
  if (!supported) {
    throw new Error("O codificador H.264 deste dispositivo não suporta " +
      preset.width + " × " + preset.height + ". Experimente Chrome actualizado ou outro dispositivo.");
  }
  await ensureAac();

  const r = engine.renderer;
  const priorSize = r.getSize(new (await import("three")).Vector2());
  const rt = engine.rt;
  const prevSize = { w: priorSize.x, h: priorSize.y };
  engine.pause();
  engine.setMode("reel");
  engine.setParallax(0, 0);
  engine.par.x = engine.par.y = 0;
  engine.recording = true;

  let videoSource;
  let audioSource;
  try {
    r.setSize(preset.width, preset.height, false);
    rt.setSize(preset.width, preset.height);
    if (engine.canvas.width !== preset.width || engine.canvas.height !== preset.height) {
      throw new Error("O motor gráfico não aplicou a resolução solicitada.");
    }
    const target = new BufferTarget();
    const output = new Output({
      format: new Mp4OutputFormat(),
      target
    });
    videoSource = new CanvasSource(engine.canvas, {
      codec: "avc",
      quality,
      latencyMode: "quality",
      keyFrameInterval: 2,
    });
    audioSource = new AudioBufferSource({
      codec: "aac",
      quality: new Quality({ bitrate: 256_000 }),
    });
    output.addVideoTrack(videoSource);
    output.addAudioTrack(audioSource);
    output.setMetadataTags({
      title: "Edmundo Kutuzov — Showreel",
      artist: "Edmundo Kutuzov",
      comment: "Instrumental only • " + (engine.format === "story" ? "9:16" : "4:5") + " • " + preset.width + " × " + preset.height
    });
    await output.start();
    onProgress?.(0.01);
    const instrumental = await renderInstrumental(engine, duration);
    await audioSource.add(instrumental);
    audioSource.close();
    onProgress?.(0.07);

    for (let frame = 0; frame < numberOfFrames; frame++) {
      const t = frame / fps;
      engine.renderFrame(t);
      if (engine.scenes.some(s => s.active && s.name.startsWith("category-video"))) {
        await seekSourceVideos(engine, t);
        engine.renderFrame(t);
      }
      await videoSource.add(t, 1 / fps, { keyFrame: frame % (fps * 2) === 0 });
      if (frame % 3 === 0) onProgress?.(0.07 + (frame + 1) / numberOfFrames * 0.88);
      // Yield to the main thread without modifying the film clock.
      if (frame % 12 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    videoSource.close();
    await output.finalize();
    const blob = new Blob([target.buffer], { type: "video/mp4" });
    if (blob.size < 10_000) throw Error("O MP4 exportado ficou vazio.");
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(blob) });
    const track = await input.getPrimaryVideoTrack();
    const audioTrack = await input.getPrimaryAudioTrack();
    const actualWidth = await track?.getDisplayWidth();
    const actualHeight = await track?.getDisplayHeight();
    if (actualWidth !== preset.width || actualHeight !== preset.height || !audioTrack)
      throw Error("Verificação MP4 falhou: resolução real ou faixa instrumental incorrecta.");
    onProgress?.(1);
    return {
      blob, ext: "mp4", width: actualWidth, height: actualHeight,
      fps, instrumental: true
    };
  } finally {
    engine.recording = false;
    r.setSize(prevSize.w, prevSize.h, false);
    rt.setSize(prevSize.w, prevSize.h);
    engine.renderFrame(engine.t);
  }
}

