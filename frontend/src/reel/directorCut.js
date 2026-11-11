import * as THREE from "three";
import { C, ease, seg, lerp, makeText, makeSlab, makeTiles, makeLine, setOpacity, setCam, shake, clamp } from "./core";
import { SEL } from "./assets";
import { makePoses, galaxyPose, gridPose, vortexPose, pose } from "./formations";

/**
 * BREACH / Director's Cut, 60 seconds.
 * Every movement derives from original portfolio artwork. No stock art, no
 * synthetic campaigns, no arbitrary timeline randomness. Fully seekable.
 */
const FILM = [
  ["archive",3.6,7],["artwork",7,14],["materials",14,21],
  ["editorial",21,28],["machine",28,38],["overload",38,45],
  ["proof",45,50],["creator",50,56],["signature",56,60]
];
const HERO = [127,110,101,113,139,140,141,142,143,144,145,146,147,89,135];
const CUTS = [43,44,45,46,20,36,37,66,73,94,138,123,99,105,60,7];
const pos = (obj,x,y,z) => obj.position.set(x,y,z);
function cut(t,at,width=0.22){ return Math.exp(-Math.pow((t-at)/width,2)); }
function frame(group,tex,height=4.8,depth=0.06) {
  const mesh=makeSlab(tex,height,depth);
  group.add(mesh); return mesh;
}
function caption(group,text,x,y,clr=C.ember,size=18) {
  const m=makeText({text,font:"JetBrains Mono",weight:500,size,color:clr,tracking:0.20});
  pos(m,x,y,0.12); group.add(m); return m;
}
function title(group,text,size=170,color=C.bone) {
  const m=makeText({text,font:"Syne",weight:800,size,color,anchor:"center"});
  group.add(m); return m;
}
function baseScene(name,start,end,group,update,extras={}) { return {name,start,end,group,update,...extras}; }
function camera(ctx,t,x=0,y=0,z=11,roll=0,look=[0,0,0]) {
  const s=shake(t,0.25); setCam(ctx,[x+s[0],y+s[1],z],look,roll,35);
  ctx.scene.fog.near=9;ctx.scene.fog.far=38;
}
function pulse(ctx,t,at,power=0.16) {
  const v=cut(t,at,0.13);
  ctx.post.uZoom.value+=power*v;
  ctx.post.uCA.value+=0.004*v;
  ctx.post.uFlash.value+=0.12*v;
}

/** 03.6 — 07 : the archive becomes a gravitational fingerprint. */
function archive(A,cloud) {
  const g=new THREE.Group(), P=makePoses(A.catalog.items.length,71),o=pose();
  const q=new THREE.Quaternion(),center=new THREE.Vector3(0,0,-12);
  const ring=makeLine(10,0.014,C.ember,.9); g.add(ring);
  return baseScene("impossible-archive",3.6,7,g,(u,t,ctx)=>{
    const spread=ease.outExpo(seg(u,.15,2.3));
    camera(ctx,t,0,0,lerp(8.2,13.8,spread));
    q.copy(ctx.camera.quaternion);
    A.catalog.items.forEach((it,i)=>{
      galaxyPose(P[i],t*1.3,q,o,center,lerp(.08,1.18,spread));
      const a=1-ease.inOut(seg(u,2.65,3.4));
      cloud.set(i,o.p,o.q,o.s*(1-.85*seg(u,2.7,3.4)),o.d*a);
    });
    cloud.group.visible=true;
    ring.visible=u>2.45;ring.scale.x=Math.max(.001,ease.outExpo(seg(u,2.55,3.15)));
    ring.position.z=-5;
    ctx.post.uSlitGlow.value=.3*cut(t,6.45,.3);
    ctx.post.uZoom.value+=.22*(1-seg(u,0,.9));
    pulse(ctx,t,3.6,.3);
  });
}
/** 07 — 14 : 3D physical artworks are the camera's only stage. */
function artworks(A) {
  const g=new THREE.Group(), ids=[127,110,101,113], cards=ids.map((id,i)=>{
    const root=new THREE.Group();g.add(root);
    const m=frame(root,A.tex[id],5.7,.12);
    const split=makeTiles(A.tex[id],5.7,i%2?6:7,i%2?2:1,70+i);
    root.add(split);m.visible=false;
    const tag=caption(root,`№ ${String(id).padStart(3,"0")} — EDMUNDO KUTUZOV`, -2.8,-3.1);
    return {root,split,tag,id};
  });
  return baseScene("artwork-becomes-reality",7,14,g,(u,t,ctx)=>{
    const idx=Math.min(3,Math.floor(u/1.75)),v=u-idx*1.75;
    cards.forEach((p,i)=>{p.root.visible=i===idx;});
    const p=cards[idx],enter=ease.outExpo(seg(v,0,.75)),leave=ease.inExpo(seg(v,1.25,1.75));
    const spread=(1-enter)+leave;
    p.split.children.forEach((m,i)=>{
      const d=m.userData.dir||{x:Math.sin(i),y:Math.cos(i),z:0};
      m.position.set(m.userData.base.x+d.x*spread*3.8,m.userData.base.y+d.y*spread*2.6,d.z*spread*4.3);
      m.rotation.set(d.y*spread*.55,d.x*spread*.8,Math.sin(i)*spread*.12);
    });
    p.split.userData.mat.opacity=Math.min(1,seg(v,0,.1))*(1-seg(v,1.62,1.75));
    setOpacity(p.tag,ease.out(seg(v,.3,.8))*(1-seg(v,1.35,1.72)));
    camera(ctx,t,lerp(idx%2?2.5:-2.5,0,enter)+Math.sin(v*2)*.35,.05,lerp(12.7,10.2,enter),.06*Math.sin(v*3));
    ctx.post.uWhip.value.x+=.075*cut(v,1.7,.16)*(idx%2?-1:1);
    if(v<.2&&idx>0)pulse(ctx,t,7+idx*1.75,.22);
  });
}
/** 14 — 21 : the light of one campaign inherits the next scene. */
function materials(A) {
  const g=new THREE.Group(), ids=[139,144,140,141],cards=ids.map((id,i)=>{
    const m=frame(g,A.tex[id],5.35);
    m.position.z=-.2*i;return m;
  });
  const beam=makeLine(12,.025,C.ember,.8);g.add(beam);
  return baseScene("material-switch",14,21,g,(u,t,ctx)=>{
    const idx=Math.min(3,Math.floor(u/1.75)),v=u-idx*1.75;
    cards.forEach((m,i)=>{
      m.visible=i===idx;
      if(i!==idx)return;
      const come=ease.outExpo(seg(v,0,.85)),out=ease.inExpo(seg(v,1.23,1.75));
      m.rotation.y=(1-come)*(idx%2?-.85:.85)+out*(idx%2?.88:-.88);
      m.rotation.z=.06*Math.sin(v*1.7);
      m.position.set((1-come)*(idx%2?-1.5:1.5),.07*Math.sin(v*2),-out*2);
      m.scale.setScalar(lerp(.84,1.02,come)*(1+.12*out));
    });
    beam.rotation.z=Math.sin(u*1.2)*.16;
    beam.position.y=2.85-5.7*seg(v,1.19,1.75);
    beam.visible=v>1.19;
    ctx.post.uSlitGlow.value=.45*cut(v,1.46,.18);
    ctx.post.uWhip.value.y=.07*cut(v,1.55,.18);
    camera(ctx,t,Math.sin(u*.7)*.35,0,9.6+.35*Math.sin(u));
    pulse(ctx,t,17.5,.14);
  });
}
/** 21 — 28 : archival 2D editorial logic, not another galaxy. */
function editorial(A) {
  const g=new THREE.Group(),ids=[143,145,146,147,127,113],meshes=ids.map((id,i)=>{
    const m=frame(g,A.tex[id],i===0?4.3:2.7,.04);return m;
  });
  const mono=title(g,"NOT\nORDINARY.",175,C.bone);
  const cutline=makeLine(12,.014,C.ember,.95);g.add(cutline);
  caption(g,"EDMUNDO KUTUZOV   /   VISUAL ARCHIVE",-4.6,-3.3,C.ember,17);
  return baseScene("editorial-collision",21,28,g,(u,t,ctx)=>{
    const beat=Math.floor(u/.875),stage=beat%4;
    meshes.forEach((m,i)=>{
      const on=(i===((beat+Math.floor(beat/4))%meshes.length));
      m.visible=on;
      const k=(i*2+beat)%7;
      m.position.set(1.35+(k-3)*.22,.15+.1*Math.sin(u*2),0);
      m.rotation.z=Math.sin(u*.9+i)*.075;
      m.scale.setScalar(1+.16*cut(u%1.75,.05,.22));
    });
    mono.visible=stage===1||stage===3;
    mono.position.x=stage===3?1.55:-1.95;
    mono.position.y=stage===3?-1.7:1.75;
    mono.scale.setScalar(stage===3?.55:.72);
    cutline.position.y=lerp(-2.7,2.5,seg(u%1.75,0,1.75));
    camera(ctx,t,-.3,0,11.9,0);
    ctx.post.uFlash.value+=.18*cut(u,.04,.09);
    ctx.post.uGlitch.value+=.11*cut(u%1.75,0,.13);
    ctx.post.uWhip.value.x+=stage%2?.025:-.025;
    ctx.post.uVig.value=.25;
  });
}
/** 28 — 38 : a deterministic inheritance machine of real artwork. */
function machine(A){
  const g=new THREE.Group(),ids=[139,140,141,142,143,144,145,146,147,127,110,101],objs=ids.map((id,i)=>{
    const m=frame(g,A.tex[id],2.35+(i%4)*.19,.07);
    return m;
  });
  const stripe=makeLine(24,.02,C.ember,.8);g.add(stripe);
  return baseScene("creative-machine",28,38,g,(u,t,ctx)=>{
    const phase=u/10,cutN=Math.floor(u/.625);
    objs.forEach((m,i)=>{
      const a=i*2.399+phase*2;
      const r=1.5+(i%5)*1.2;
      const row=Math.floor(i/4),col=i%4;
      const layout=ease.inOut(seg(u,0,2.1))*(1-ease.inOut(seg(u,7.8,10)));
      m.position.set(lerp(Math.cos(a)*r,(col-1.5)*3.1,layout),lerp(Math.sin(a)*2.4,(row-1)*2.38,layout),lerp(-i*.5,-row*1.0,layout));
      m.rotation.y=lerp(Math.sin(a)*.65,0,layout);
      m.rotation.z=lerp(Math.sin(i+phase)*.15,0,layout);
      m.scale.setScalar(.8+.2*cut(u,Math.floor(u/.625)*.625,.14));
    });
    stripe.rotation.z=Math.sin(u*2)*.45;
    stripe.position.y=3.1-6.2*(u/10);
    const move=cut(u,cutN*.625,.12);
    ctx.post.uZoom.value+=move*.05;
    ctx.post.uCA.value+=move*.002;
    camera(ctx,t,Math.sin(u*.47)*1.9,Math.sin(u*.3)*.4,lerp(15.5,12.2,seg(u,0,6)),Math.sin(u*.2)*.02);
  });
}
/** 38 — 45 : choreography at the beat, one visual event at a time. */
function overload(A){
  const g=new THREE.Group(),cards=CUTS.map((id,i)=>frame(g,A.tex[id],5.8,.08));
  return baseScene("controlled-overload",38,45,g,(u,t,ctx)=>{
    const moment=Math.min(cards.length-1,Math.floor(u/(7/cards.length)));
    const v=(u/(7/cards.length))%1;
    cards.forEach((m,i)=>{m.visible=i===moment;});
    const m=cards[moment],out=ease.inExpo(seg(v,.70,1)),enter=ease.outExpo(seg(v,0,.35));
    m.position.set((1-enter)*(moment%2?-2:2)-out*(moment%2?2:-2),0,-out*3);
    m.rotation.y=(1-enter)*(moment%2?-.7:.7)+out*.7;
    m.rotation.z=(moment%4-1.5)*.045;
    m.scale.setScalar(lerp(.95,1.05,enter)+.13*out);
    camera(ctx,t,Math.sin(moment*2)*.3,Math.cos(moment*3)*.15,9.75);
    ctx.post.uGlitch.value+=.08*cut(v,0,.07);
    ctx.post.uWhip.value.x+=out*.10*(moment%2?1:-1);
    ctx.post.uZoom.value+=.08*cut(v,0,.07);
    ctx.post.uFlash.value+=.1*cut(v,0,.05);
    ctx.scene.fog.far=30;
  });
}
/** 45 — 50 : high-end proof, never a logo spinner. */
function proof(A){
  const g=new THREE.Group(),labels=["ABSA","TOYOTA","VODACOM","KITKAT","GIZ","TOTALENERGIES"];
  const ids=[0,1,6,11,9,5], cards=ids.map((n,i)=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(4.8,1.8),new THREE.MeshBasicMaterial({map:A.logos[n],transparent:true,depthWrite:false}));
    g.add(m);return m;
  });
  const line=makeLine(8,.014,C.ember,.7);g.add(line);
  return baseScene("the-proof",45,50,g,(u,t,ctx)=>{
    const idx=Math.min(5,Math.floor(u/(5/6))), v=(u/(5/6))%1;
    cards.forEach((m,i)=>m.visible=i===idx);
    const p=cards[idx];p.position.set(0,.15+1.0*(1-ease.outExpo(seg(v,0,.24))),0);
    p.scale.setScalar(.94+.06*ease.outExpo(seg(v,0,.35)));
    p.material.opacity=seg(v,0,.13)*(1-seg(v,.81,1));
    line.position.y=-1.45;
    line.scale.x=ease.outExpo(seg(v,0,.4));
    camera(ctx,t,0,0,10.7);
    ctx.post.uZoom.value+=.09*cut(v,0,.08);
  });
}
/** 50 — 56 : negative-space E/K assembled from the portfolio. */
function creator(A){
  const g=new THREE.Group(),ids=[127,110,101,113,139,140,141,142,143,144,145,146,147,89,135];
  const cards=ids.map(id=>frame(g,A.tex[id],1.2,.06));
  const letter=title(g,"E  K",320,C.bone);
  const rule=makeLine(11,.017,C.ember,.9);g.add(rule);
  return baseScene("creator-revealed",50,56,g,(u,t,ctx)=>{
    const join=ease.inOut(seg(u,.8,4.4)),exit=ease.inExpo(seg(u,5.0,6));
    cards.forEach((m,i)=>{
      const row=Math.floor(i/5),col=i%5;
      const a=i*2.399+u*.7,r=2.2+(i%4)*1.0;
      m.position.set(lerp(Math.cos(a)*r,(col-2)*1.65,join),lerp(Math.sin(a)*2.8,(row-1)*1.6,join),lerp(-i*.35,-2.1,join)-exit*10);
      m.rotation.y=lerp(Math.sin(a)*.85,0,join);
      m.rotation.z=lerp(Math.sin(i+u)*.4,0,join);
      m.scale.setScalar(lerp(1,.8,join)*(1-exit));
    });
    letter.position.z=-1.3;letter.scale.setScalar(.75+.3*join);
    setOpacity(letter,.85*seg(u,2.2,3.5)*(1-exit));
    rule.scale.x=Math.max(.001,ease.outExpo(seg(u,4.2,5.4)));
    rule.position.y=0;rule.position.z=-.8;
    camera(ctx,t,Math.sin(u*.8)*.5,0,lerp(14,12,join),.04*Math.sin(u));
    ctx.post.uZoom.value+=.27*exit;
    pulse(ctx,t,55.6,.25);
  });
}
/** 56 — 60 : the restrained, legible signature. */
function signature(){
  const g=new THREE.Group();
  const a=title(g,"EDMUNDO",220),b=title(g,"KUTUZOV",220);
  const line=makeLine(12,.021,C.ember,.95);g.add(line);
  const tagline=title(g,"JUST A CREATIVE GUY.",48,C.ember);
  const url=caption(g,"edmundokutuzov.art",-1.45,-2.35,C.bone,29);
  const meta=caption(g,"ART DIRECTOR  /  MAPUTO  /  2026",-2.6,-3.2,C.muted,16);
  return baseScene("the-signature",56,60,g,(u,t,ctx)=>{
    const l=ease.outExpo(seg(u,0,1.1)),show=ease.outExpo(seg(u,.45,1.55));
    a.position.y=lerp(3.5,1.32,l);b.position.y=lerp(-3.5,-.47,l);
    a.rotation.z=(1-l)*-.10;b.rotation.z=(1-l)*.10;
    a.scale.setScalar(.88+.12*l);b.scale.setScalar(.88+.12*l);
    line.position.y=.41;line.scale.x=Math.max(.001,l);
    tagline.position.y=-1.58;setOpacity(tagline,show);
    setOpacity(url,ease.outExpo(seg(u,1.3,2.3)));
    setOpacity(meta,ease.outExpo(seg(u,1.7,2.7))*.8);
    camera(ctx,t,0,0,12.6);
    ctx.post.uVig.value=.25;
    ctx.post.uSlitGlow.value=.6*cut(u,.1,.2);
  });
}
export function buildDirectorCut(A,cloud) {
  return [archive(A,cloud),artworks(A),materials(A),editorial(A),machine(A),
          overload(A),proof(A),creator(A),signature()];
}
export const DIRECTOR_CUT_SCENES=FILM;
