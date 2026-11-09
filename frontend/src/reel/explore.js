import * as THREE from "three";
import { makePoses, pose, galaxyPose } from "./formations";

const ORIGIN = new THREE.Vector3();

export class Explore {
  constructor(engine) {
    this.e = engine;
    this.items = engine.A.catalog.items;
    this.P = makePoses(this.items.length, 11);
    this.o = pose();
    this.yaw = 0.6;
    this.pitch = 1.0;
    this.dist = 24;
    this.tYaw = 0.6;
    this.tPitch = 0.72;
    this.tDist = 19;
    this.filter = "ALL";
    this.hover = -1;
    this.ndc = new THREE.Vector2(9, 9);
    this.ray = new THREE.Raycaster();
    this.scales = new Float32Array(this.items.length).fill(1);
    this.dims = new Float32Array(this.items.length).fill(0.9);
    this.drag = null;
    this.idle = 0;
    this.time = 0;
    this.onHover = null;
  }

  pointer(nx, ny) { this.ndc.set(nx * 2 - 1, -(ny * 2 - 1)); }

  down(x, y) { this.drag = { x, y, yaw: this.tYaw, pitch: this.tPitch, moved: false }; }

  move(x, y) {
    if (!this.drag) return;
    const dx = x - this.drag.x;
    const dy = y - this.drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 0.004) this.drag.moved = true;
    this.tYaw = this.drag.yaw - dx * 4;
    this.tPitch = Math.max(-1.2, Math.min(1.35, this.drag.pitch + dy * 3));
    this.idle = 0;
  }

  up() {
    const clicked = this.drag && !this.drag.moved;
    this.drag = null;
    return clicked && this.hover >= 0 ? this.items[this.hover] : null;
  }

  wheel(d) {
    this.tDist = Math.max(5, Math.min(34, this.tDist * (1 + d * 0.0012)));
    this.idle = 0;
  }

  frame(dt) {
    const e = this.e;
    this.time += dt;
    this.idle += dt;
    if (this.idle > 2.5 && !this.drag) this.tYaw += dt * 0.06;
    const k = 1 - Math.exp(-dt * 5);
    this.yaw += (this.tYaw - this.yaw) * k;
    this.pitch += (this.tPitch - this.pitch) * k;
    this.dist += (this.tDist - this.dist) * k;
    const cam = e.camera;
    const cp = Math.cos(this.pitch);
    cam.position.set(Math.sin(this.yaw) * cp * this.dist, Math.sin(this.pitch) * this.dist, Math.cos(this.yaw) * cp * this.dist);
    cam.lookAt(0, 0, 0);
    if (cam.fov !== 42) { cam.fov = 42; cam.updateProjectionMatrix(); }
    e.scene.fog.near = 8;
    e.scene.fog.far = 70;
    const cloud = e.cloud;
    this.items.forEach((it, i) => {
      galaxyPose(this.P[i], this.time * 0.5, cam.quaternion, this.o, ORIGIN);
      const match = this.filter === "ALL" || it.cat === this.filter;
      const ts = (i === this.hover ? 1.9 : match ? 1 : 0.55);
      const td = i === this.hover ? 1.08 : match ? 0.92 : 0.16;
      this.scales[i] += (ts - this.scales[i]) * (1 - Math.exp(-dt * 10));
      this.dims[i] += (td - this.dims[i]) * (1 - Math.exp(-dt * 8));
      if (i === this.hover) this.o.p.addScaledVector(cam.getWorldDirection(new THREE.Vector3()), -0.6);
      cloud.set(i, this.o.p, this.o.q, this.o.s * this.scales[i], this.dims[i]);
    });
    cloud.commit(e.scene.fog);
    cloud.meshes.forEach((m) => { m.boundingSphere = null; });
    cam.updateMatrixWorld();
    this.ray.setFromCamera(this.ndc, cam);
    const hits = this.ray.intersectObjects(cloud.meshes, false);
    let h = -1;
    for (const hit of hits) {
      const idx = cloud.indexFromHit(hit.object, hit.instanceId);
      const it = this.items[idx];
      if (this.filter === "ALL" || it.cat === this.filter) { h = idx; break; }
    }
    if (h !== this.hover) {
      this.hover = h;
      this.onHover && this.onHover(h >= 0 ? this.items[h] : null);
    }
  }
}

