import * as THREE from "three";
import { W, H, DUR, C, bell } from "./core";
import { loadAssets } from "./assets";
import { createPost } from "./post";
import { Cloud } from "./cloud";
import { buildVoid } from "./intro";
import { buildArchive } from "./archive";
import { buildCinema, buildCorridor, buildRush } from "./cinema";
import { buildClients, buildFinale } from "./outro";
import { Explore } from "./explore";
import { Score } from "./audio";
import { buildCampaignFilm } from "./campaignFilm";
import { buildEditorialStudy } from "./editorialStudy";

const TRANS = [
  { t: 21.0, dir: [0, 0], amt: 0, w: 0.2, flash: 0.25 },
  { t: 23.0, dir: [1, 0], amt: 0.05, w: 0.18, flash: 0.04 },
  { t: 25.0, dir: [0, 1], amt: 0.05, w: 0.18, flash: 0.04 },
  { t: 27.0, dir: [-1, 0], amt: 0.05, w: 0.18, flash: 0.04 },
  { t: 29.0, dir: [1, 0.15], amt: 0.085, w: 0.25, flash: 0.1 },
  { t: 37.0, dir: [1, -0.2], amt: 0.09, w: 0.22, flash: 0.2 },
  { t: 45.0, dir: [0, -1], amt: 0.07, w: 0.25, flash: 0.12 },
  { t: 50.0, dir: [0.8, 0.4], amt: 0.06, w: 0.2, flash: 0.1 },
];

function makeDust() {
  const n = 600;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
    pos[i * 3 + 2] = -2.5 - Math.random() * 24;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: C.ember, size: 0.026, transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  return new THREE.Points(geo, mat);
}

export class ReelEngine {
  constructor(canvas, version = "v3") {
    this.version = version;
    this.duration = version === "v1" ? 52 : DUR;
    this.canvas = canvas;
    const r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    r.setPixelRatio(1);
    r.setSize(W, H, false);
    r.outputColorSpace = THREE.LinearSRGBColorSpace;
    r.localClippingEnabled = true;
    this.renderer = r;
    this.rt = new THREE.WebGLRenderTarget(W, H, { samples: 4 });
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(C.bg);
    this.scene.fog = new THREE.Fog(C.bg, 8, 40);
    this.camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 300);
    this.scene.add(this.camera);
    this.dust = makeDust();
    this.camera.add(this.dust);
    this.hud = new THREE.Scene();
    this.hudCam = new THREE.OrthographicCamera(0, W, H, 0, -10, 10);
    this.post = createPost();
    this.score = new Score();
    this.score.version = version;
    this.t = 0;
    this.playing = false;
    this.recording = false;
    this.mode = "reel";
    this.scenes = [];
    this.onTime = null;
    this.onEnd = null;
    this.raf = 0;
    this.par = { x: 0, y: 0, tx: 0, ty: 0 };
    this.dirty = false;
  }

  async load(onProgress) {
    this.A = await loadAssets(onProgress);
    if (this.disposed) return;
    const A = this.A;
    this.cloud = new Cloud(A.catalog, A.atlases);
    this.scene.add(this.cloud.group);
    this.scenes = this.version === "v3"
      ? buildCampaignFilm(A,this.cloud)
      : this.version === "v1"
        ? buildEditorialStudy(A)
        : [buildVoid(A), buildArchive(A, this.cloud), buildCinema(A), buildCorridor(A), buildRush(A), buildClients(A), buildFinale(A, this.cloud)];
    this.scenes.forEach((s) => {
      if (s.group) this.scene.add(s.group);
      if (s.hud) this.hud.add(s.hud);
      s.active = false;
    });
    this.explore = new Explore(this);
    this.renderFrame(0);
    let last = performance.now();
    const loop = (now) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = this.par;
      const k = 1 - Math.exp(-dt * 4);
      p.x += (p.tx - p.x) * k;
      p.y += (p.ty - p.y) * k;
      if (this.mode === "explore") return this.renderExplore(dt);
      if (!this.playing) {
        if (this.dirty || Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.002) { this.dirty = false; this.renderFrame(this.t); }
        return;
      }
      let t = this.score.time();
      if (t >= this.duration) {
        this.pause();
        this.t = this.duration;
        this.renderFrame(this.duration - 0.001);
        this.onTime && this.onTime(this.duration);
        this.onEnd && this.onEnd();
        return;
      }
      this.t = Math.max(0, t);
      this.renderFrame(this.t);
      this.onTime && this.onTime(this.t);
    };
    this.raf = requestAnimationFrame(loop);
  }

  async setNarration(lines, base) {
    if (!lines) return this.score.clearVO();
    return this.score.loadVO(lines, base);
  }

  setParallax(x, y) {
    this.par.tx = this.recording ? 0 : x;
    this.par.ty = this.recording ? 0 : y;
  }

  draw() {
    const r = this.renderer;
    const P = this.post.uniforms;
    r.setRenderTarget(this.rt);
    r.autoClear = true;
    r.render(this.scene, this.camera);
    r.autoClear = false;
    r.render(this.hud, this.hudCam);
    r.setRenderTarget(null);
    P.tDiffuse.value = this.rt.texture;
    r.autoClear = true;
    r.render(this.post.scene, this.post.camera);
  }

  renderFrame(t) {
    const ctx = { scene: this.scene, camera: this.camera, post: this.post.uniforms, playing: this.playing };
    this.post.reset();
    const P = this.post.uniforms;
    P.uTime.value = t;
    this.cloud.group.visible = false;
    this.scenes.forEach((s) => {
      const on = t >= s.start && (t < s.end || (s.end === this.duration && t <= this.duration));
      if (s.active && !on && s.leave) s.leave();
      s.active = on;
      if (s.group) s.group.visible = on;
      if (s.hud) s.hud.visible = on;
    });
    this.scenes.forEach((s) => s.preroll && s.preroll(t, ctx));
    this.scenes.forEach((s) => s.active && s.update(t - s.start, t, ctx));
    if (this.cloud.group.visible) this.cloud.commit(this.scene.fog);
    TRANS.forEach((tr) => {
      if (Math.abs(t - tr.t) > tr.w) return;
      const k = bell(t, tr.t - tr.w, tr.t + tr.w);
      P.uWhip.value.x += tr.dir[0] * tr.amt * k * k;
      P.uWhip.value.y += tr.dir[1] * tr.amt * k * k;
      P.uCA.value += 0.01 * k;
      P.uFlash.value += (tr.flash || 0) * Math.pow(k, 6);
    });
    this.camera.translateX(this.par.x * 0.32);
    this.camera.translateY(this.par.y * 0.18);
    this.dust.rotation.z = t * 0.012;
    this.dust.position.x = Math.sin(t * 0.21) * 0.4;
    this.draw();
  }

  renderExplore(dt) {
    this.post.reset();
    const P = this.post.uniforms;
    P.uTime.value = performance.now() / 1000;
    P.uVig.value = 0.55;
    this.scenes.forEach((s) => {
      if (s.group) s.group.visible = false;
      if (s.hud) s.hud.visible = false;
    });
    this.cloud.group.visible = true;
    this.explore.frame(dt);
    this.dust.rotation.z += dt * 0.01;
    this.draw();
  }

  setMode(mode) {
    if (mode === "explore") {
      if (this.playing) this.pause();
      this.scenes.forEach((s) => s.leave && s.leave());
    }
    this.mode = mode;
    if (mode === "reel") this.renderFrame(this.t);
  }

  async play() {
    if (this.mode !== "reel") this.setMode("reel");
    if (this.score.ctx.state !== "running") await this.score.ctx.resume();
    const from = this.t >= this.duration - 0.05 ? 0 : this.t;
    this.score.start(from);
    this.playing = true;
  }

  pause() {
    if (this.playing) this.t = Math.min(this.duration, Math.max(0, this.score.time()));
    this.score.stop();
    this.playing = false;
    this.renderFrame(this.t);
  }

  seek(t) {
    this.t = Math.min(this.duration, Math.max(0, t));
    if (this.playing) this.score.start(this.t);
    else this.renderFrame(this.t);
    this.onTime && this.onTime(this.t);
  }

  async recordMp4(preset, onProgress, options = {}) {
    const { renderMp4 } = await import("./mp4Export");
    return renderMp4(this, preset, onProgress, options);
  }

  async record(onProgress) {
    // Chrome may report generic MP4 support but encode VP9/Opus inside MP4.
    // Prefer WebM in Chromium; Safari uses a compatible H.264/AAC MP4 container.
    const safari = /Safari\//.test(navigator.userAgent) && !/(?:Chrome|Chromium|CriOS|Edg|OPR|Android)/.test(navigator.userAgent);
    const types = safari
      ? ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1.640028,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
      : ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4"];
    const mimeType = types.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
    if (!mimeType || typeof this.canvas.captureStream !== "function") throw new Error("Este browser não suporta a gravação de vídeo e áudio. Experimente Chrome, Edge ou Safari recente.");
    this.setMode("reel");
    this.setParallax(0, 0);
    this.par.x = this.par.y = 0;
    const stream = new MediaStream([...this.canvas.captureStream(60).getVideoTracks(), ...this.score.recDest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 24_000_000, audioBitsPerSecond: 256_000 });
    this.recording = true;
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    let failed = null;
    const finished = new Promise((resolve, reject) => {
      rec.onstop = resolve;
      rec.onerror = (event) => {
        failed = new Error(event?.error?.message || "O navegador interrompeu a gravação.");
        reject(failed);
      };
    });
    this.pause();
    this.seek(0);
    const prevEnd = this.onEnd;
    const ended = new Promise((res) => { this.onEnd = res; });
    const iv = setInterval(() => onProgress && onProgress(this.t / this.duration), 200);
    let watchdog = null;
    try {
      rec.start(500);
      await this.play();
      await Promise.race([
        ended,
        new Promise((_, reject) => {
          watchdog = setTimeout(() => reject(new Error("A gravação excedeu o tempo de segurança. Mantenha este separador visível e tente novamente.")), (this.duration + 25) * 1000);
        }),
      ]);
      await new Promise((r) => setTimeout(r, 300));
      if (rec.state !== "inactive") rec.stop();
      await finished;
      if (failed) throw failed;
      const blob = new Blob(chunks, { type: mimeType.split(";")[0] });
      if (blob.size < 1024) throw new Error("A gravação ficou vazia. Tente noutro navegador.");
      return { blob, ext: mimeType.includes("mp4") ? "mp4" : "webm" };
    } finally {
      clearInterval(iv);
      clearTimeout(watchdog);
      if (rec.state !== "inactive") rec.stop();
      this.recording = false;
      this.onEnd = prevEnd;
      if (this.playing) this.pause();
      prevEnd && prevEnd();
      // Never stop the shared Web Audio destination track; later exports need it.
      stream.getVideoTracks().forEach((tr) => tr.stop());
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.score.stop();
    this.score.ctx.close();
    this.rt.dispose();
    this.renderer.dispose();
  }
}

