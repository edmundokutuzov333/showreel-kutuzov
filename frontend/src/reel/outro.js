import * as THREE from "three";
import { C, ease, seg, kf, lerp, makeText, makeLine, setOpacity, setCam, shake, DynText } from "./core";
import { makePoses, pose, vortexPose, galaxyPose, blendPose } from "./formations";

const PRINCIPLES = [
  ["CLARITY", "Every element must earn its place."],
  ["RHYTHM", "Pacing dictates attention."],
  ["PRECISION", "God is in the details."],
  ["MEMORY", "A distinct point of view."],
];

export function buildClients(A) {
  const group = new THREE.Group();
  const hud = new THREE.Group();
  const rig = new THREE.Group();
  rig.rotation.set(0.03, 0, -0.04);
  group.add(rig);
  const R = 6.3;
  const rings = [0, 1].map((ri) => {
    const ring = new THREE.Group();
    ring.position.y = ri ? -2.1 : 2.1;
    A.logos.slice(ri * 10, ri * 10 + 10).forEach((tex, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
      const th = (i / 10) * Math.PI * 2;
      m.position.set(Math.sin(th) * R, 0, Math.cos(th) * R);
      m.rotation.y = th;
      ring.add(m);
    });
    rig.add(ring);
    return ring;
  });
  const title = makeText({ text: "Brands and teams\nI have worked with.", font: "Syne", weight: 700, size: 118, color: C.bone, lineHeight: 1.04, anchor: "center", align: "center" });
  title.position.set(0, 0.05, -0.6);
  const eb = makeText({ text: "(04) CLIENTS — 30+ BRANDS", font: "JetBrains Mono", weight: 500, size: 20, color: C.ember, tracking: 0.25, anchor: "center" });
  eb.position.set(0, 0.95, -0.6);
  group.add(title, eb);
  const pw = new DynText({ font: "JetBrains Mono", weight: 500, size: 18, color: C.ember, tracking: 0.3, cw: 1400, align: "center" });
  pw.mesh.position.set(960, 330, 0);
  const pd = new DynText({ font: "Syne", weight: 600, size: 30, color: C.bone, tracking: 0, cw: 1400, align: "center" });
  pd.mesh.position.set(960, 290, 0);
  hud.add(pw.mesh, pd.mesh);
  return {
    name: "clients", start: 45, end: 50, group, hud,
    update(u, t, ctx) {
      rings[0].rotation.y = u * 0.34 + 0.2;
      rings[1].rotation.y = -u * 0.34 - 0.1;
      const intro = ease.outExpo(seg(u, 0, 1.0));
      setOpacity(title, intro);
      setOpacity(eb, intro);
      const pi = Math.min(3, Math.max(0, Math.floor((u - 0.4) / 1.1)));
      const lv = u - 0.4 - pi * 1.1;
      pw.set(`0${pi + 1} — ${PRINCIPLES[pi][0]}`);
      pd.set(PRINCIPLES[pi][1]);
      const o = u < 0.4 ? 0 : seg(lv, 0, 0.2) * (pi === 3 ? 1 - seg(u, 4.6, 4.9) : 1 - seg(lv, 0.95, 1.1));
      setOpacity(pw.mesh, o);
      setOpacity(pd.mesh, o);
      pd.mesh.position.y = 290 - 10 * (1 - ease.out(seg(lv, 0, 0.3)));
      hud.visible = true;
      const s = shake(t, 0.6);
      const pos = kf(u, [[0, [-1.4, 1.2, 18.5]], [5, [1.0, 0.1, 14.2], "out"]]).map((v, i) => v + s[i]);
      setCam(ctx, pos, [0, 0, 0], 0.01);
      ctx.scene.fog.near = 13;
      ctx.scene.fog.far = 26;
    },
  };
}

function letterRow(word, size, y, lineY, up) {
  const g = new THREE.Group();
  const cv = document.createElement("canvas").getContext("2d");
  cv.font = `800 ${size}px "Syne"`;
  cv.letterSpacing = `${-0.01 * size}px`;
  const total = cv.measureText(word).width;
  const plane = up ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -lineY - 4) : new THREE.Plane(new THREE.Vector3(0, -1, 0), lineY - 4);
  const letters = [...word].map((ch, i) => {
    const m = makeText({ text: ch, font: "Syne", weight: 800, size, color: C.bone, unit: 1, anchor: "left" });
    m.material.clippingPlanes = [plane];
    m.position.set(960 - total / 2 + cv.measureText(word.slice(0, i)).width, y, 0);
    g.add(m);
    return m;
  });
  return { g, letters };
}

const BACK = new THREE.Vector3(0, -1.5, -34);

export function buildFinale(A, cloud) {
  const group = new THREE.Group();
  const hud = new THREE.Group();
  const P = makePoses(A.catalog.items.length, 29);
  const a = pose();
  const b = pose();
  const o = pose();
  const camQ = new THREE.Quaternion();
  const lineY = 590;
  const top = letterRow("EDMUNDO", 158, lineY + 76, lineY, true);
  const bot = letterRow("KUTUZOV", 158, lineY - 76, lineY, false);
  const line = makeLine(1120, 2, C.ember, 1);
  line.position.set(960, lineY, 0);
  const tagline = makeText({ text: "JUST A CREATIVE GUY.", font: "Syne", weight: 700, size: 40, color: C.ember, tracking: 0.32, unit: 1, anchor: "center" });
  tagline.position.set(960, 300, 0);
  const url = makeText({ text: "edmundokutuzov.art", font: "JetBrains Mono", weight: 500, size: 36, color: C.bone, tracking: 0.08, unit: 1, anchor: "center" });
  url.position.set(960, 184, 0);
  const uline = makeLine(url.userData.size.w - 36 * 0.44, 2, C.primary, 1);
  uline.position.set(960, 152, 0);
  const meta = makeText({ text: "ART DIRECTOR · MAPUTO — MOÇAMBIQUE", font: "JetBrains Mono", weight: 400, size: 15, color: C.muted, tracking: 0.32, unit: 1, anchor: "center" });
  meta.position.set(960, 1000, 0);
  hud.add(top.g, bot.g, line, tagline, url, uline, meta);
  return {
    name: "finale", start: 50, end: 60, group, hud,
    update(u, t, ctx) {
      const after = seg(u, 2.3, 2.31);
      const back = ease.outQuart(seg(u, 2.3, 10));
      const s = shake(t, 0.5 * (1 - back));
      if (u < 2.3) setCam(ctx, [s[0], s[1], 8], [0, 0, -10], u * u * 0.18, 40);
      else setCam(ctx, [Math.sin(u * 0.15) * 0.8 + s[0], 0.2 + s[1], lerp(9, 13, back)], [0, 0, -12], 0, 35);
      camQ.copy(ctx.camera.quaternion);
      const gd = ease.inOut(seg(u, 2.5, 4.5)) * 0.3 * (1 - 0.5 * seg(u, 11.2, 12));
      A.catalog.items.forEach((it, i) => {
        if (after < 1) vortexPose(P[i], u, o);
        else { galaxyPose(P[i], t * 0.6, camQ, b, BACK, 1.7); a.p.copy(BACK); a.q.copy(camQ); a.s = 0.01; a.d = 0; blendPose(a, b, ease.outExpo(seg(u, 2.3, 5.5)), o); o.d *= gd / 0.92; }
        cloud.set(i, o.p, o.q, o.s, o.d);
      });
      cloud.group.visible = true;
      ctx.scene.fog.near = u < 2.3 ? 4 : 10;
      ctx.scene.fog.far = u < 2.3 ? 30 : 70;
      const Pp = ctx.post;
      Pp.uZoom.value += u < 2.3 ? 0.06 + 0.4 * ease.in(seg(u, 0.3, 2.3)) : 0.35 * (1 - ease.out(seg(u, 2.3, 3.0)));
      Pp.uCA.value = u < 2.3 ? Pp.uCA.value + 0.006 * seg(u, 1.0, 2.3) : 0.0006;
      Pp.uFlash.value += 0.32 * Math.pow(1 - seg(u, 2.3, 2.8), 2) * after;
      Pp.uVig.value = 0.62;
      line.scale.x = Math.max(0.001, kf(u, [[1.9, 0.02], [2.3, 0.15, "in"], [3.0, 1, "outExpo"]]));
      setOpacity(line, seg(u, 1.9, 2.0) * 0.95);
      [top, bot].forEach((row, ri) => row.letters.forEach((m, i) => {
        const p = ease.outExpo(seg(u, 2.6 + i * 0.055 + ri * 0.03, 3.6 + i * 0.055 + ri * 0.03));
        m.position.y = (ri ? lineY - 76 : lineY + 76) + (ri ? 1 : -1) * 160 * (1 - p);
      }));
      const tg = ease.outExpo(seg(u, 5.6, 6.6));
      setOpacity(tagline, tg);
      tagline.position.y = 300 - 18 * (1 - tg);
      const ug = ease.outExpo(seg(u, 7.2, 8.1));
      setOpacity(url, ug);
      url.position.y = 184 - 14 * (1 - ug);
      uline.scale.x = Math.max(0.001, ease.outExpo(seg(u, 7.6, 8.6)));
      setOpacity(uline, seg(u, 7.6, 7.7));
      setOpacity(meta, 0.8 * seg(u, 8.0, 9.0));
      hud.visible = true;
    },
  };
}

