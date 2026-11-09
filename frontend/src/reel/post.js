import * as THREE from "three";
import { C } from "./core";

export function createPost() {
  const uniforms = {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uCA: { value: 0.0015 },
    uWhip: { value: new THREE.Vector2() },
    uZoom: { value: 0 },
    uGlitch: { value: 0 },
    uGrain: { value: 0.055 },
    uFade: { value: 0 },
    uSlit: { value: 1 },
    uSlitGlow: { value: 0 },
    uSlitDir: { value: 0 },
    uFlash: { value: 0 },
    uFlashCol: { value: new THREE.Color(C.ember) },
    uEmber: { value: new THREE.Color(C.ember) },
    uPrimary: { value: new THREE.Color(C.primary) },
    uVig: { value: 0.5 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse; uniform float uTime, uCA, uGrain, uFade, uSlit, uSlitGlow, uSlitDir, uFlash, uVig, uZoom, uGlitch;
      uniform vec2 uWhip; uniform vec3 uFlashCol, uEmber, uPrimary;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      vec3 samp(vec2 uv, float ca){
        vec2 d = uv - 0.5; float r = dot(d, d);
        vec2 off = d * ca * (0.5 + r * 2.5) + vec2(uGlitch * 0.012, 0.0);
        return vec3(texture2D(tDiffuse, uv + off).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - off).b);
      }
      void main(){
        vec2 uv = vUv;
        if (uGlitch > 0.001) {
          float fr = floor(uTime * 24.0);
          float band = floor(uv.y * 18.0 + hash(vec2(fr, 3.1)) * 6.0);
          float h = hash(vec2(band, fr));
          if (h < uGlitch * 0.55) uv.x += (hash(vec2(band, fr + 7.0)) - 0.5) * 0.16 * uGlitch;
          float blk = hash(floor(uv * vec2(24.0, 14.0)) + fr);
          if (blk < uGlitch * 0.08) uv = floor(uv * vec2(48.0, 27.0)) / vec2(48.0, 27.0);
        }
        vec3 col = vec3(0.0);
        bool blur = length(uWhip) > 0.0005 || uZoom > 0.0005;
        if (blur) {
          for (int i = 0; i < 16; i++) {
            float k = float(i) / 15.0;
            vec2 o = uWhip * (k - 0.5) - (uv - 0.5) * uZoom * k;
            col += samp(uv + o, uCA);
          }
          col /= 16.0;
        } else { col = samp(uv, uCA); }
        float c = mix(uv.x, uv.y, uSlitDir);
        float dx = abs(c - 0.5);
        float hw = uSlit * 0.5;
        col *= smoothstep(hw + 0.0015, hw - 0.0015, dx);
        float line = exp(-abs(dx - hw) * 260.0);
        float halo = exp(-abs(dx - hw) * 22.0) * 0.35;
        col += (uEmber * line + uPrimary * halo) * uSlitGlow;
        float v = smoothstep(1.05, 0.2, length((vUv - 0.5) * vec2(1.0, 0.9)));
        col *= mix(1.0 - uVig, 1.0, v);
        col += uFlashCol * uFlash;
        float n = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime * 7.13) * 91.7) - 0.5;
        col += n * uGrain;
        col *= (1.0 - uFade);
        gl_FragColor = vec4(col, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const reset = () => {
    uniforms.uCA.value = 0.0015;
    uniforms.uWhip.value.set(0, 0);
    uniforms.uZoom.value = 0;
    uniforms.uGlitch.value = 0;
    uniforms.uGrain.value = 0.055;
    uniforms.uFade.value = 0;
    uniforms.uSlit.value = 1;
    uniforms.uSlitGlow.value = 0;
    uniforms.uSlitDir.value = 0;
    uniforms.uFlash.value = 0;
    uniforms.uVig.value = 0.5;
  };
  return { scene, camera, uniforms, reset };
}

