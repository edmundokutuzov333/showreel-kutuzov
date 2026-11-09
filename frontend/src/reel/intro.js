import * as THREE from "three";
import { C, PX, ease, seg, kf, makeText, setOpacity, setCam, shake, glowTexture, DynText } from "./core";

const WORDS = [
  ["I MAKE", 1.0, 170],
  ["IDEAS", 1.5, 230],
  ["STOP.", 2.0, 320],
  ["TAKE NOTICE.", 2.5, 150],
  ["STAY IN MEMORY.", 2.75, 128],
  ["AND ACT.", 3.0, 200],
];
export const SLAMS = WORDS.map((w) => w[1]);

function wordStack(text, size) {
  const g = new THREE.Group();
  const fill = makeText({ text, font: "Syne", weight: 800, size, color: C.bone, anchor: "center" });
  const echoes = [1, 2, 3, 4, 5].map((i) => {
    const m = makeText({ text, font: "Syne", weight: 800, size, color: i % 2 ? C.ember : C.primary, stroke: 2.2, anchor: "center", opacity: 0.6 / i });
    g.add(m);
    return m;
  });
  g.add(fill);
  return { g, fill, echoes };
}

export function buildVoid() {
  const group = new THREE.Group();
  const glow = glowTexture();
  const dot = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const line = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.012), new THREE.MeshBasicMaterial({ color: C.ember, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: glow, color: C.primary, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const depth = new DynText({ font: "JetBrains Mono", weight: 500, size: 22, color: C.ember, tracking: 0.32, cw: 600, align: "center" });
  depth.mesh.scale.setScalar(PX);
  depth.mesh.position.set(0, -0.32, 0);
  const sub = makeText({ text: "EDMUNDO KUTUZOV — ART DIRECTOR · MAPUTO", font: "JetBrains Mono", weight: 400, size: 14, color: "#8a94ab", tracking: 0.34, anchor: "center" });
  sub.position.set(0, 0.3, 0);
  group.add(dot, halo, line, depth.mesh, sub);
  const stacks = WORDS.map(([w, , size]) => {
    const s = wordStack(w, size);
    group.add(s.g);
    return s;
  });
  return {
    name: "void", start: 0, end: 3.6, group,
    update(u, t, ctx) {
      const P = ctx.post;
      const beatA = Math.exp(-Math.pow((u - 0.45) * 9, 2)) + Math.exp(-Math.pow((u - 0.72) * 9, 2)) * 0.7;
      dot.visible = u > 0.25 && u < 1.0;
      dot.scale.setScalar(0.25 + beatA * 0.6 + seg(u, 0.25, 1.0) * 0.2);
      dot.material.opacity = seg(u, 0.25, 0.4) * (1 - seg(u, 0.9, 1.0));
      let active = -1;
      WORDS.forEach(([, wt], i) => { if (u >= wt && u < (WORDS[i + 1] ? WORDS[i + 1][1] : 3.22)) active = i; });
      stacks.forEach((s, i) => {
        s.g.visible = i === active;
        if (i !== active) return;
        const v = u - WORDS[i][1];
        const land = ease.outExpo(seg(v, 0, 0.26));
        s.fill.position.z = 5.5 * (1 - land);
        s.echoes.forEach((e, j) => {
          e.position.z = s.fill.position.z - (j + 1) * 0.55 * land;
          e.position.y = -(j + 1) * 0.04 * land;
        });
        s.g.rotation.z = (i % 2 ? 1 : -1) * 0.04 * (1 - land);
        P.uGlitch.value = Math.max(P.uGlitch.value, 0.9 * (1 - seg(v, 0, 0.16)));
        P.uZoom.value += 0.22 * (1 - seg(v, 0, 0.22));
        P.uFlash.value += (i === 2 ? 0.22 : 0.07) * (1 - seg(v, 0, 0.1));
      });
      const ls = ease.outExpo(seg(u, 3.18, 3.45));
      line.visible = halo.visible = u > 3.15;
      line.scale.x = Math.max(0.001, ls * 11);
      halo.scale.set(Math.max(0.001, ls * 13), 0.6 + 0.4 * ls, 1);
      halo.material.opacity = 0.7 * ls;
      line.material.opacity = 1;
      const dv = seg(u, 3.2, 3.5);
      depth.set(`DEPTH ${String(Math.round(155 * ease.out(dv))).padStart(3, "0")}`);
      setOpacity(depth.mesh, seg(u, 3.18, 3.25));
      setOpacity(sub, seg(u, 3.25, 3.4));
      const s = shake(t, 0.4 + u * 0.4);
      setCam(ctx, [s[0], s[1], 10], [0, 0, 0], 0);
      P.uVig.value = 0.7;
      P.uGrain.value = 0.07;
    },
  };
}

