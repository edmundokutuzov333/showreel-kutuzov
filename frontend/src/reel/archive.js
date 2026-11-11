import * as THREE from "three";
import { C, ease, seg, kf, lerp, makeText, makeLine, setOpacity, setCam, shake, DynText } from "./core";
import { makePoses, pose, bangPose, galaxyPose, gridPose, gridCell, blendPose } from "./formations";

export const FILTERS = [
  [13.8, "ALL"],
  [14.6, "SOCIAL MEDIA"],
  [15.6, "IMAGE MANIPULATION"],
  [16.6, "DESIGN"],
  [17.6, "CAMPAIGN"],
  [18.6, "VIDEO"],
  [19.6, "ALL"],
];
const LABELS = ["ALL", "SOCIAL MEDIA", "IMAGE MANIPULATION", "DESIGN", "CAMPAIGN", "VIDEO"];
export const ARCHIVE_LABELS = {ALL:"ALL","SOCIAL MEDIA":"SOCIAL MEDIA",
 "IMAGE MANIPULATION":"IMAGE MANIPULATION",DESIGN:"SOME DEZAINES*",
 CAMPAIGN:"CAMPAIGN",VIDEO:"VIDEO"};
export const ARCHIVE_LINES = {ALL:"EVERY ANGLE","SOCIAL MEDIA":"MORE THAN A POST",
 "IMAGE MANIPULATION":"BEND REALITY",DESIGN:"OUTSIDE THE LINES",
 CAMPAIGN:"MADE TO MATTER",VIDEO:"NEVER JUST FRAMES"};
const ORIGIN = new THREE.Vector3(0, 0, 0);

const match = (f, cat) => (f === "ALL" ? 0 : cat === f ? 1 : -1);

function filterBar(items) {
  const hud = new THREE.Group();
  const labels = LABELS.map((l) => makeText({ text: ARCHIVE_LABELS[l], font: "JetBrains Mono", weight: 500, size: 17, color: C.bone, tracking: 0.26, unit: 1 }));
  const gap = 54;
  const widths = labels.map((m) => m.userData.size.w - 17 * 0.44);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
  let x = 960 - total / 2;
  const xs = labels.map((m, i) => {
    m.position.set(x, 960, 0);
    const mid = x + widths[i] / 2;
    x += widths[i] + gap;
    hud.add(m);
    return mid;
  });
  const under = makeLine(1, 2, C.primary, 1);
  under.position.y = 938;
  const count = new DynText({ font: "Syne", weight: 700, size: 30, color: C.bone, tracking: 0, cw: 900, align: "center" });
  count.mesh.position.set(960, 885, 0);
  hud.add(under, count.mesh);

  return { hud, labels, widths, xs, under, count };
}

export function buildArchive(A, cloud) {
  const group = new THREE.Group();
  const items = A.catalog.items;
  const P = makePoses(items.length);
  const k127 = items.findIndex((it) => it.id === 127);
  const cell127 = gridCell(P[k127]);
  const a = pose();
  const b = pose();
  const c = pose();
  const o = pose();
  const tmp = pose();
  const big = makeText({ text: "STAY", font: "Syne", weight: 800, size: 320, color: C.bone, anchor: "center" });
  const cap = makeText({ text: "SEEN FOR A SECOND. FELT FOR LONGER.", font: "JetBrains Mono", weight: 500, size: 20, color: C.ember, tracking: 0.32, anchor: "center" });
  const title = new THREE.Group();
  cap.position.y = -1.55;
  title.add(big, cap);
  title.scale.setScalar(1.6);
  [big, cap].forEach((m) => { m.material.depthTest = false; m.renderOrder = 10; });
  group.add(title);
  const bar = filterBar(items);
  const camKeys = [
    [3.6, [0, 0, 10, 0, 0, 0]],
    [5.6, [0, 0.4, 5.2, 0, 0, -2], "out"],
    [7.8, [0, 4.8, 17.5, 0, 0, 0]],
    [10.2, [12.5, 6.5, 7.5, 0, 0, 0]],
    [12.4, [6, 2.2, -7, 0, 0, 0]],
    [13.7, [-9.5, 3.9, 9.5, -3, 0, -1]],
    [20.1, [7.5, 3.0, 3.5, 3, 0, -2.5], "inOut"],
    [21.0, [cell127.x, 1.25, cell127.z + 0.25, cell127.x, 0, cell127.z], "inExpo"],
  ];
  return {
    name: "archive", start: 3.6, end: 21, group, hud: bar.hud,
    update(u, t, ctx) {
      const k = kf(t, camKeys);
      const s = shake(t, 0.6);
      setCam(ctx, [k[0] + s[0], k[1] + s[1], k[2]], [k[3], k[4], k[5]], Math.sin(t * 0.4) * 0.02 * (t < 13 ? 1 : 0.3), 38);
      const camQ = ctx.camera.quaternion;
      const e = ease.outExpo(seg(t, 3.6, 6.4));
      let fi = 0;
      FILTERS.forEach(([ft], i) => { if (t >= ft) fi = i; });
      const fp = ease.inOut(seg(t, FILTERS[fi][0], FILTERS[fi][0] + 0.4));
      const prev = FILTERS[Math.max(0, fi - 1)][1];
      const cur = FILTERS[fi][1];
      const dive = seg(t, 20.2, 21);
      items.forEach((it, i) => {
        const Pi = P[i];
        const m1 = ease.inOut(seg(t, 5.3 + Pi.rnd * 0.9, 7.3 + Pi.rnd * 0.9));
        const m2 = ease.inOutExpo(seg(t, 12.3 + Pi.rnd2 * 0.7, 13.9 + Pi.rnd2 * 0.7));
        bangPose(Pi, e, a);
        if (m1 > 0) { galaxyPose(Pi, t, camQ, b, ORIGIN); blendPose(a, b, m1, o); } else blendPose(a, a, 0, o);
        if (m2 > 0) {
          const L = t < FILTERS[0][0] ? 0 : lerp(match(prev, it.cat), match(cur, it.cat), fp);
          gridPose(Pi, i === k127 ? Math.max(0, L) : L, c);
          c.d *= i === k127 ? 1 : 1 - 0.5 * dive;
          blendPose(o, o, 0, tmp);
          blendPose(tmp, c, m2, o);
        }
        cloud.set(i, o.p, o.q, o.s, o.d);
      });
      cloud.group.visible = true;
      ctx.scene.fog.near = t < 13 ? 8 : 6;
      ctx.scene.fog.far = t < 13 ? 42 : 22;
      title.quaternion.copy(camQ);
      setOpacity(title, ease.out(seg(t, 8.0, 8.8)) * (1 - seg(t, 11.4, 12.0)));
      const hudO = seg(t, 13.6, 14.0) * (1 - seg(t, 20.0, 20.3));
      bar.labels.forEach((m, i) => setOpacity(m, hudO * (LABELS[i] === cur ? 1 : 0.38)));
      const ci = LABELS.indexOf(cur);
      const pi = LABELS.indexOf(prev);
      bar.under.position.x = lerp(bar.xs[pi], bar.xs[ci], fp);
      bar.under.scale.x = lerp(bar.widths[pi], bar.widths[ci], fp);
      setOpacity(bar.under, hudO);
      bar.count.set(ARCHIVE_LINES[cur]);
      setOpacity(bar.count.mesh, hudO * fp);
      bar.hud.visible = hudO > 0.001;
      const Pp = ctx.post;
      Pp.uFlash.value += 0.75 * (1 - seg(t, 3.6, 3.95));
      Pp.uZoom.value += 0.55 * (1 - ease.out(seg(t, 3.6, 5.2))) + 0.32 * ease.in(seg(t, 20.6, 21));
      Pp.uCA.value += 0.01 * (1 - seg(t, 3.6, 4.6));
      Pp.uVig.value = 0.55;
    },
  };
}


