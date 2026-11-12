import {
  AudioBufferSource, BufferTarget, CanvasSource, Mp4OutputFormat,
  Output, Quality, Input, BlobSource, ALL_FORMATS,
  canEncodeVideo, canEncodeAudio
} from "mediabunny";
import { Score } from "./audio";
import { verticalPreset, VERTICAL_FPS } from "./verticalFormats";

async function instrumentalAudio(duration) {
  const sampleRate = 48_000;
  const offline = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const score = new Score({ context: offline });
  // Exactly the original V3 music engine, never narration.
  score.version = "v3";
  score.vo = [];
  score.start(0);
  return offline.startRendering();
}
async function ensureAacEncoder() {
  const config = {
    numberOfChannels: 2, sampleRate: 48_000,
    quality: new Quality({ bitrate: 256_000 })
  };
  if (!(await canEncodeAudio("aac", config))) {
    const { registerAacEncoder } = await import("@mediabunny/aac-encoder");
    registerAacEncoder();
  }
  if (!(await canEncodeAudio("aac", config)))
    throw new Error("Codificação de áudio AAC indisponível.");
}
async function seekVideoElements(engine, time) {
  const scene = engine.scenes.find(s => s.active);
  if (!scene || !scene.name.startsWith("category-video")) return;
  const local = time - scene.start;
  const ids = [148, 149, 150, 151, 152, 153];
  const batch = Math.min(1, Math.floor(local / ((scene.end - scene.start) / 2)));
  await Promise.all(ids.slice(batch * 3, batch * 3 + 3).map(id => {
    const video = engine.A.videos[id]?.el;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const target = local % video.duration;
    if (Math.abs(video.currentTime - target) < .02) return;
    return new Promise(resolve => {
      let complete = false;
      const done = () => {
        if (complete) return;
        complete = true;
        video.removeEventListener("seeked", done);
        resolve();
      };
      video.addEventListener("seeked", done, { once: true });
      try { video.currentTime = target; } catch (_) { done(); }
      setTimeout(done, 1200);
    });
  }));
}
function validateOutputSize(canvas, width, height) {
  if (canvas.width !== width || canvas.height !== height)
    throw new Error("A área de exportação vertical não corresponde à resolução seleccionada.");
}
function preflight(engine, preset) {
  if (!window.VideoEncoder || !window.VideoFrame)
    throw new Error("Necessita de um navegador com WebCodecs H.264 (Chrome, Edge ou Safari recente).");
  const gl = engine.renderer.getContext();
  // Source V3 remains 1920x1080; the portrait output uses a 2D canvas.
  const maxSource = Math.min(
    gl.getParameter(gl.MAX_TEXTURE_SIZE),
    gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)
  );
  if (maxSource < 1920)
    throw new Error("A placa gráfica não consegue renderizar a base V3.");
  if (preset.width * preset.height > 8_294_400)
    throw new Error("Resolução vertical superior ao limite 4K.");
}
/**
 * Independent MP4 pipeline: no resize, mutation or imports of the official
 * landscape mp4Export; both share the same Mediabunny/Score technologies.
 */
export async function renderVerticalMp4(engine, key, onProgress, options = {}) {
  const preset = verticalPreset(engine.verticalFormat.id, key);
  preflight(engine, preset);
  const fps = options.fps || VERTICAL_FPS;
  const duration = options.duration || engine.duration;
  if (!(duration > 0) || duration > engine.duration)
    throw new Error("Duração de exportação inválida.");
  const frames = Math.round(duration * fps);
  const quality = new Quality({ bitrate: preset.bitrate });
  const avcSupported = await canEncodeVideo("avc", {
    width: preset.width, height: preset.height, frameRate: fps, quality
  });
  if (!avcSupported)
    throw new Error("O codificador H.264 deste dispositivo não suporta " +
      preset.width + " × " + preset.height + ". Escolha uma qualidade inferior.");
  await ensureAacEncoder();

  const outputCanvas = engine.outputCanvas;
  const previous = { width: outputCanvas.width, height: outputCanvas.height };
  engine.pause();
  engine.setMode("reel");
  engine.setParallax(0, 0);
  engine.par.x = engine.par.y = 0;
  engine.recording = true;
  let videoSource;
  let audioSource;
  try {
    outputCanvas.width = preset.width;
    outputCanvas.height = preset.height;
    validateOutputSize(outputCanvas, preset.width, preset.height);

    const target = new BufferTarget();
    const output = new Output({ format: new Mp4OutputFormat(), target });
    videoSource = new CanvasSource(outputCanvas, {
      codec: "avc", quality, latencyMode: "quality", keyFrameInterval: 2
    });
    audioSource = new AudioBufferSource({
      codec: "aac", quality: new Quality({ bitrate: 256_000 })
    });
    output.addVideoTrack(videoSource);
    output.addAudioTrack(audioSource);
    output.setMetadataTags({
      title: "Edmundo Kutuzov — V3 " + engine.verticalFormat.label,
      artist: "Edmundo Kutuzov",
      comment: "Instrumental only • " + preset.aspect +
        " • " + preset.width + " × " + preset.height
    });
    await output.start();
    onProgress?.(.01);
    const audioBuffer = await instrumentalAudio(duration);
    await audioSource.add(audioBuffer);
    audioSource.close();
    onProgress?.(.07);
    for (let i = 0; i < frames; i++) {
      const t = i / fps;
      engine.renderFrame(t);
      if (engine.scenes.some(s => s.active && s.name.startsWith("category-video"))) {
        await seekVideoElements(engine, t);
        engine.renderFrame(t);
      }
      await videoSource.add(t, 1 / fps, { keyFrame: i % (fps * 2) === 0 });
      if (i % 3 === 0) onProgress?.(.07 + (i + 1) / frames * .88);
      if (i % 12 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    videoSource.close();
    await output.finalize();
    const blob = new Blob([target.buffer], { type: "video/mp4" });
    if (blob.size < 10_000) throw new Error("O MP4 vertical ficou vazio.");
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(blob) });
    const videoTrack = await input.getPrimaryVideoTrack();
    const audioTrack = await input.getPrimaryAudioTrack();
    const actualWidth = await videoTrack?.getDisplayWidth();
    const actualHeight = await videoTrack?.getDisplayHeight();
    if (actualWidth !== preset.width || actualHeight !== preset.height || !audioTrack)
      throw new Error("MP4 vertical inválido: dimensões ou áudio não correspondem à exportação.");
    onProgress?.(1);
    return {
      blob, ext: "mp4", width: actualWidth, height: actualHeight,
      fps, instrumental: true, aspect: preset.aspect
    };
  } finally {
    engine.recording = false;
    outputCanvas.width = previous.width;
    outputCanvas.height = previous.height;
    engine.renderFrame(engine.t);
  }
}
