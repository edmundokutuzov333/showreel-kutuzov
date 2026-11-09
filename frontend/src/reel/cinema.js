import * as THREE from "three";
import { C, ease, seg, kf, clamp, lerp, makeSlab, makeBackdrop, makeText, makeTiles, makeSweep, dim, setOpacity, setCam, shake, DynText } from "./core";
import { SEL, TITLES } from "./assets";

const catOf = (A, id) => (A.catalog.items.find((x) => x.id === id) || {}).cat || "";
const tagText = (A, id) => `№ ${String(id).padStart(3, "0")} — ${catOf(A, id)}`;

const MODES = [[1, 7], [5, 6], [7, 1], [4, 5]];
const WORDS = ["STOP", "NOTICE", "STAY", "ACT"];
const SERVICES = ["01 — VISUAL IDENTITY", "02 — ART DIRECTION", "04 — DIGITAL DESIGN", "05 — AI CREATIVE DIRECTION"];

export function buildCinema(A) {
  const group = new THREE.Group();
  const pieces = SEL.cinema.map((id, i) => {
    const g = new THREE.Group();
    const [nx, ny] = MODES[i];
    const tiles = makeTiles(A.tex[id], 5.4, nx, ny, 40 + i);
    const word = makeText({ text: WORDS[i], font: "Syne", weight: 800, size: 300, color: C.ember, stroke: 2.5, anchor: "center", opacity: 0.5 });
    word.position.set(i % 2 ? 3.4 : -3.6, 0.7, -3.4);
    const sv = makeText({ text: SERVICES[i], font: "JetBrains Mono", weight: 500, size: 20, color: C.bone, tracking: 0.22 });
    sv.position.set(tiles.userData.w / 2 + 0.35, -2.55, 0);
    const tg = makeText({ text: tagText(A, id), font: "JetBrains Mono", weight: 500, size: 17, color: C.ember, tracking: 0.2 });
    tg.position.set(tiles.userData.w / 2 + 0.35, -2.25, 0);
    g.add(word, tiles, sv, tg);
    group.add(g);
    return { g, tiles, word, sv, tg };
  });
  return {
    name: "cinema", start: 21, end: 29, group,
    update(u, t, ctx) {
      const idx = Math.min(3, Math.floor(u / 2));
      pieces.forEach((p, i) => { p.g.visible = i === idx; });
      const p = pieces[idx];
      const v = u - idx * 2;
      const asm = idx === 0 ? 1 : ease.outExpo(seg(v, 0, 0.95));
      const out = ease.inExpo(seg(v, 1.5, 2.0));
      const spread = (1 - asm) + out * 1.3;
      const dir = idx % 2 ? -1 : 1;
      p.tiles.children.forEach((m) => {
        const d = m.userData.dir;
        m.position.set(m.userData.base.x + d.x * spread * 3.2, m.userData.base.y + d.y * spread * 1.6, d.z * spread * 3.4);
        m.rotation.set(m.userData.spin.x * spread * 0.7, m.userData.spin.y * spread * 0.9, m.userData.spin.z * spread * 0.5);
      });
      p.tiles.userData.mat.opacity = (idx === 0 ? 1 : seg(v, 0, 0.15)) * (1 - seg(v, 1.85, 2.0));
      const tx = ease.out(seg(v, 0.6, 1.1)) * (1 - seg(v, 1.5, 1.8));
      setOpacity(p.sv, tx);
      setOpacity(p.tg, tx);
      setOpacity(p.word, 0.5 * ease.out(seg(v, 0.1, 0.9)) * (1 - seg(v, 1.7, 2)));
      p.word.position.x = (idx % 2 ? 3.4 : -3.6) - v * 0.3 * dir;
      const ang = idx === 0
        ? kf(v, [[0, -0.02], [1.5, 0.1], [2, 0.42, "inExpo"]])
        : kf(v, [[0, -0.7 * dir], [0.95, -0.1 * dir, "outExpo"], [1.5, 0.05 * dir], [2, 0.42 * dir, "inExpo"]]);
      const dist = idx === 0 ? kf(v, [[0, 8.6], [1.5, 10.2, "out"], [2, 9.2, "in"]]) : kf(v, [[0, 12.5], [0.95, 10.3, "outExpo"], [2, 9.2, "in"]]);
      const s = shake(t, 0.6);
      setCam(ctx, [Math.sin(ang) * dist + s[0], 0.15 + s[1], Math.cos(ang) * dist], [0.6, 0, 0]);
      ctx.scene.fog.near = 10;
      ctx.scene.fog.far = 26;
      if (idx > 0) ctx.post.uGlitch.value = Math.max(ctx.post.uGlitch.value, 0.45 * (1 - seg(v, 0, 0.14)));
    },
  };
}

function floorTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(10,13,21,0.78)";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(156,198,245,0.10)";
  g.lineWidth = 2;
  g.strokeRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(7, 35);
  t.anisotropy = 8;
  return t;
}

const FLOOR_Y = -1.9;
const STEP = 0.89;

export function buildCorridor(A) {
  const group = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 70), new THREE.MeshBasicMaterial({ map: floorTexture(), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR_Y, -20);
  floor.renderOrder = 2;
  const addMirrored = (mesh) => {
    group.add(mesh);
    const ref = mesh.clone();
    ref.material = mesh.material.map ? mesh.material : mesh.material;
    ref.scale.y = -1;
    ref.position.y = 2 * FLOOR_Y - mesh.position.y;
    ref.userData.isRef = true;
    group.add(ref);
    return ref;
  };
  const stops = SEL.corridor.map((id, i) => {
    const side = i % 2 ? 1 : -1;
    const z = -i * 5.5;
    const tex = A.tex[id];
    const a = tex.image.width / tex.image.height;
    const h = Math.min(2.9, 4.4 / a);
    const sl = makeSlab(tex, h, 0.07);
    sl.material = sl.material.map((m) => m.clone());
    sl.userData.front = sl.material[4];
    sl.position.set(side * 2.5, FLOOR_Y + 0.25 + h / 2, z);
    sl.rotation.y = -side * 0.6;
    const ref = addMirrored(sl);
    ref.material = sl.material.map((m) => { const c = m.clone(); c.color.setScalar(0.2); return c; });
    const sweep = makeSweep(sl.userData.w, h);
    sweep.position.copy(sl.position);
    sweep.rotation.copy(sl.rotation);
    sweep.translateZ(0.045);
    group.add(sweep);
    const [brand, line] = TITLES[id];
    const lb = new THREE.Group();
    const b = makeText({ text: brand, font: "JetBrains Mono", weight: 500, size: 15, color: C.ember, tracking: 0.28 });
    const l = makeText({ text: line, font: "Syne", weight: 700, size: 30, color: C.bone });
    b.position.y = 0.2;
    lb.add(b, l);
    lb.position.copy(sl.position);
    lb.rotation.copy(sl.rotation);
    lb.translateX(-sl.userData.w / 2);
    lb.translateY(h / 2 + 0.42);
    group.add(lb);
    const sid = SEL.corridorSide[i];
    const st = A.videos[sid] ? A.videos[sid].tex : A.tex[sid];
    const sh = 2.3;
    const side2 = makeSlab(st, sh, 0.06);
    if (A.videos[sid]) { side2.geometry.dispose(); side2.geometry = new THREE.BoxGeometry(sh * 0.8, sh, 0.06); }
    side2.material = side2.material.map((m) => m.clone());
    side2.userData.front = side2.material[4];
    side2.position.set(-side * 3.3, FLOOR_Y + 0.25 + sh / 2, z - 2.2);
    side2.rotation.y = side * 0.95;
    const ref2 = addMirrored(side2);
    ref2.material = side2.material.map((m) => { const c = m.clone(); c.color.setScalar(0.16); return c; });
    return { sl, sweep, lb, side, z, side2, sid };
  });
  group.add(floor);
  const camAt = (i) => {
    const s = stops[i];
    return [-s.side * 0.7, 0.35, s.z + 4.9, s.side * 1.7, 0.1, s.z - 0.6];
  };
  return {
    name: "corridor", start: 29, end: 37, group,
    preroll(t, ctx) {
      if (ctx.playing && t > 27.5 && t < 29) stops.forEach((s) => { const v = A.videos[s.sid]; if (v && v.el.paused) v.el.play().catch(() => {}); });
    },
    leave() { stops.forEach((s) => A.videos[s.sid] && A.videos[s.sid].el.pause()); },
    update(u, t, ctx) {
      const n = stops.length - 1;
      const steps = clamp(u / STEP - 0.15, 0, n);
      const i0 = Math.floor(steps);
      const f = steps - i0;
      const fe = 0.75 * ease.inOutExpo(f) + 0.25 * f;
      const ca = camAt(Math.min(i0, n));
      const cb = camAt(Math.min(i0 + 1, n));
      const k = ca.map((v, j) => lerp(v, cb[j], fe));
      const s = shake(t, 0.6);
      const push = ease.inExpo(seg(u, 7.5, 8));
      setCam(ctx, [k[0] + s[0], k[1] + s[1], k[2] - push * 3], [k[3], k[4], k[5] - push * 3], Math.sin(u * 0.9) * 0.012, 40);
      const cur = Math.round(steps);
      stops.forEach((st, i) => {
        const on = i === cur ? 1 : 0;
        dim(st.sl, 0.55 + 0.45 * on);
        dim(st.side2, 0.7);
        const arrive = (i + 0.15) * STEP + 0.35;
        st.sweep.material.uniforms.phase.value = -0.6 + 2.4 * seg(u, arrive, arrive + 0.75);
        setOpacity(st.lb, ease.out(seg(u, arrive - 0.2, arrive + 0.2)) * (i <= cur + 0 ? 1 : 0) * (i < cur ? 0.35 : 1));
        const v = A.videos[st.sid];
        if (v && !ctx.playing) { const d = v.el.duration || 7; const tt = u % d; if (Math.abs(v.el.currentTime - tt) > 0.25) v.el.currentTime = tt; }
        if (v && ctx.playing && v.el.paused) v.el.play().catch(() => {});
      });
      ctx.scene.fog.near = 7;
      ctx.scene.fog.far = 30;
    },
  };
}

const STATS = [[0.2, 150, "+", "PROJECTS DELIVERED"], [2.2, 30, "+", "BRANDS · NATIONAL & INTERNATIONAL"], [4.2, 3, "", "CONTINENTS"], [6.2, 360, "º", "CAPABILITY"]];

export function buildRush(A) {
  const group = new THREE.Group();
  const hud = new THREE.Group();
  const cuts = SEL.rush.map((id, i) => {
    const g = new THREE.Group();
    const bd = makeBackdrop(A.tex[id], 26, 15, { dimK: 0.34, bias: 6 });
    bd.position.z = -3;
    const type = i % 5;
    const sl = type === 3 ? makeTiles(A.tex[id], 5.6, 6, 1, 90 + i) : makeSlab(A.tex[id], 5.6, 0.07);
    g.add(bd, sl);
    group.add(g);
    return { g, sl, id, type };
  });
  const num = new DynText({ font: "Syne", weight: 800, size: 160, color: "#6a86ff", tracking: -0.02, cw: 700 });
  const lab = new DynText({ font: "JetBrains Mono", weight: 500, size: 18, color: C.bone, tracking: 0.3, cw: 700 });
  num.mesh.position.set(110, 600, 0);
  lab.mesh.position.set(118, 495, 0);
  const tg = new DynText({ font: "JetBrains Mono", weight: 500, size: 15, color: C.ember, tracking: 0.22, cw: 700, align: "right" });
  tg.mesh.position.set(1810, 120, 0);
  hud.add(num.mesh, lab.mesh, tg.mesh);
  return {
    name: "rush", start: 37, end: 45, group, hud,
    update(u, t, ctx) {
      const ci = Math.min(cuts.length - 1, Math.floor(u / 0.5));
      const v = u - ci * 0.5;
      cuts.forEach((c, i) => { c.g.visible = i === ci; });
      const c = cuts[ci];
      const e = ease.outExpo(seg(v, 0, 0.26));
      const P = ctx.post;
      c.sl.rotation.set(0, 0, 0);
      c.sl.position.set(0, 0, 0);
      c.sl.scale.setScalar(1);
      if (c.type === 0) P.uGlitch.value = Math.max(P.uGlitch.value, 1 - seg(v, 0, 0.15));
      if (c.type === 1) { c.sl.scale.setScalar(1.3 - 0.3 * e); P.uZoom.value += 0.4 * (1 - e); }
      if (c.type === 2) { c.sl.position.x = 3.5 * (1 - e); P.uWhip.value.x += 0.07 * (1 - e); }
      if (c.type === 3) c.sl.children.forEach((m, j) => {
        const ej = ease.outExpo(seg(v, j * 0.025, 0.22 + j * 0.025));
        m.position.set(m.userData.base.x, (j % 2 ? 7 : -7) * (1 - ej), 0);
      });
      if (c.type === 4) { c.sl.rotation.y = (Math.PI / 2) * (1 - e); P.uFlash.value += 0.12 * (1 - seg(v, 0, 0.12)); }
      const s = shake(t, 1);
      setCam(ctx, [s[0] - 1.5, s[1], 10.2 - v * 0.9], [-1.5, 0, 0]);
      P.uCA.value += 0.005 * (1 - e);
      ctx.scene.fog.near = 20;
      ctx.scene.fog.far = 60;
      let st = STATS[0];
      STATS.forEach((x) => { if (u >= x[0]) st = x; });
      const p = ease.outQuart(seg(u, st[0], st[0] + 0.7));
      num.set(`${Math.round(st[1] * p)}${st[2]}`);
      lab.set(st[3]);
      tg.set(tagText(A, c.id));
      const lv = u - st[0];
      const o = seg(lv, 0, 0.2) * (1 - seg(lv, 1.75, 1.95));
      setOpacity(num.mesh, o);
      setOpacity(lab.mesh, o);
      num.mesh.position.x = 110 - 30 * (1 - ease.outExpo(seg(lv, 0, 0.4)));
      setOpacity(tg.mesh, 0.85);
      hud.visible = true;
    },
  };
}

