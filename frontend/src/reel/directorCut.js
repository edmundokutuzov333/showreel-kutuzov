import * as THREE from "three";
import {
  C, ease, seg, lerp, texAspect, makeText, makeSlab, makeBackdrop,
  makeLine, glowTexture, setOpacity, setCam, shake, makeTiles
} from "./core";
import { makeOfficialMark } from "./brandMark";

/**
 * EK / A POINT OF VIEW — 60-second cinematic cut.
 * Genuine projects and logos are sourced from edmundokutuzov.art.
 * Project credits are separate from the client's collaboration wall.
 * Every pose is a pure function of playhead time: scrubbing/replay works.
 * V1 and V2 are not modified.
 */
export const DIRECTOR_CUT_SCENES = [
  ["01 / THE MARK", 3.6, 7.7],
  ["02 / HUMAN STORIES", 7.7, 14.2],
  ["03 / BRAND WORLDS", 14.2, 22.0],
  ["04 / DIGITAL CULTURE", 22.0, 30.0],
  ["05 / CULTURE & IMPACT", 30.0, 38.0],
  ["06 / THE CRAFT", 38.0, 45.0],
  ["07 / COLLABORATIONS", 45.0, 54.0],
  ["08 / SIGNATURE", 54.0, 60.0],
];

/* Editorial copy is distinct from the names of the actual campaigns. */
export const SELECTED_WORKS = [
  {id:139, eyebrow:"01 / HUMAN STORIES", title:"A DEPRESSÃO\nÉ REAL.", credit:"ICOR", kind:"CAMPAIGN / ART DIRECTION"},
  {id:140, eyebrow:"02 / BRAND WORLDS", title:"PARA QUEM\nTU QUERES.", credit:"KITKAT", kind:"CAMPAIGN / KEY VISUAL"},
  {id:142, eyebrow:"02 / BRAND WORLDS", title:"COZINHAR\nÉ ARTE.", credit:"PEMBE MOZ", kind:"CAMPAIGN / KEY VISUAL"},
  {id:143, eyebrow:"03 / DIGITAL CULTURE", title:"DIGA YES.\nVIVA ONLINE.", credit:"WEBMASTERS", kind:"DIGITAL CAMPAIGN"},
  {id:21, eyebrow:"03 / DIGITAL CULTURE", title:"A FÍSICA\nNÃO MENTE.", credit:"WEBMASTERS", kind:"SOCIAL / ART DIRECTION"},
  {id:50, eyebrow:"03 / DIGITAL CULTURE", title:"GAME\nCHANGER.", credit:"WEBMASTERS", kind:"SOCIAL / GAMING"},
  {id:146, eyebrow:"04 / CULTURE & IMPACT", title:"WE ARE\nGIZ.", credit:"GIZ", kind:"CAMPAIGN / ART DIRECTION"},
  {id:145, eyebrow:"04 / CULTURE & IMPACT", title:"VIVA A\nEXPERIÊNCIA.", credit:"SUPER MARÉS", kind:"CAMPAIGN / KEY VISUAL"},
  {id:147, eyebrow:"04 / CULTURE & IMPACT", title:"STREET\nCULTURE.", credit:"JIMMYS KILLER", kind:"CAMPAIGN / ART DIRECTION"},
  {id:80, eyebrow:"05 / THE CRAFT", title:"BEYOND\nTHE SCREEN.", credit:"MOQ / OUTDOOR", kind:"OUT OF HOME"},
  {id:95, eyebrow:"05 / THE CRAFT", title:"DESIGNED\nTO EXIST.", credit:"PHANTOM", kind:"PACKAGING / DESIGN"},
  {id:128, eyebrow:"05 / THE CRAFT", title:"MAKE\nSOME NOISE.", credit:"MIXSHOW", kind:"KEY VISUAL / SOCIAL"},
  {id:134, eyebrow:"05 / THE CRAFT", title:"WEAR\nTHE IDEA.", credit:"CONCRETE RHYMES", kind:"MERCH / VISUAL DESIGN"}
];

const CLIENT_NAMES = [
  "ABSA","TOYOTA","NISSAN","HYUNDAI",
  "GALP","TOTALENERGIES","VODACOM","RONIL AUTO",
  "PERNOD RICARD","GIZ","MULTICHOICE","KITKAT",
  "FLYING FISH","BRUTAL FRUIT","JOAQUIM CHAVES","PONTA APART",
  "HOTEL CARDOSO","EMOSE","MCS","PROMAR"
];

const soft = (t,at,w=.12) => Math.exp(-Math.pow((t-at)/w,2));
const fade = (v,d) => seg(v,0,.34)*(1-seg(v,d-.35,d));
const pos = (m,x,y,z=0) => m.position.set(x,y,z);
const txt = (text,size=80,color=C.bone,opts={}) => makeText({
  text,font:opts.mono?"JetBrains Mono":"Syne",weight:opts.mono?500:800,
  size,color,tracking:opts.tracking??(opts.mono?.17:-.022),
  lineHeight:opts.lineHeight??1.04,anchor:opts.anchor||"left",
  align:opts.align||"left"
});

function cinemaCam(ctx,t,x=0,y=0,z=12.5,roll=0){
  const sh=shake(t,.22);
  setCam(ctx,[x+sh[0],y+sh[1],z],[0,0,0],roll,35);
  ctx.scene.fog.near=10;ctx.scene.fog.far=40;
  ctx.post.uVig.value=.34;
  ctx.post.uGrain.value=.035;
}

function projectedSlab(tex, maxH=4.7, maxW=7.4) {
  return makeSlab(tex,Math.min(maxH,maxW/texAspect(tex)),.095);
}

function anEdge(g,x,y,w=2.0){
  const line=makeLine(w,.022,C.ember,.85);
  pos(line,x,y,.28);g.add(line);return line;
}

function glowDisc(size=7) {
  const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),
    new THREE.MeshBasicMaterial({map:glowTexture(),transparent:true,
      depthWrite:false,blending:THREE.AdditiveBlending,opacity:.58,fog:false}));
  return m;
}

/** The actual portfolio monogram, revealed as a physical object. */
function openingMark() {
  const g=new THREE.Group();
  const mark=makeOfficialMark();g.add(mark);pos(mark,2.3,0,.2);
  const halo=glowDisc(8.0);g.add(halo);pos(halo,2.4,0,-2);
  const a=txt("NOT JUST\nDESIGN.",178);g.add(a);pos(a,-5.65,1.0,.45);
  const b=txt("A POINT OF VIEW",21,C.ember,{mono:true,tracking:.26});
  g.add(b);pos(b,-5.55,-1.28,.46);
  const c=txt("EDMUNDO KUTUZOV  /  MAPUTO",18,C.muted,{mono:true,tracking:.18});
  g.add(c);pos(c,-5.55,-2.82,.45);
  const rule=anEdge(g,-4.55,-1.71,2.0);
  const scan=makeLine(10,.02,C.ember,.32);g.add(scan);pos(scan,0,0,2);
  return {name:"the-official-mark",start:3.6,end:7.7,group:g,
    update(u,t,ctx){
      const arrive=ease.outExpo(seg(u,.02,1.75));
      const leave=ease.inExpo(seg(u,3.66,4.1));
      mark.rotation.set(-.22+.22*arrive,.95*(1-arrive)+.12*Math.sin(u*.54),-.14*(1-arrive));
      mark.scale.setScalar(.3+.7*arrive+.11*leave);
      mark.position.z=-3+3.2*arrive+4*leave;
      halo.material.opacity=.36*arrive*(1-leave);
      halo.scale.setScalar(.65+.4*arrive);
      setOpacity(a,arrive*(1-leave));
      setOpacity(b,seg(u,.9,1.5)*(1-leave));
      setOpacity(c,seg(u,1.35,1.9)*(1-leave));
      rule.scale.x=Math.max(.001,ease.outExpo(seg(u,1.0,1.8)));
      scan.position.y=2.8-5.6*seg(u,1.3,3.5);
      scan.material.opacity=.28*seg(u,1.2,1.6)*(1-leave);
      cinemaCam(ctx,t,.1,-.05,12.75);
      ctx.post.uSlitGlow.value=.15*soft(u,2.6,.4);
      ctx.post.uZoom.value+=.2*soft(u,.1,.22)+leave*.25;
      ctx.post.uFlash.value+=.18*soft(u,.1,.08);
    }
  };
}

/* The first six seconds of each project are editorial, not a revolving
   catalogue: large real art, controlled typography and camera blocking. */
function makeProject(A,info,number) {
  const group=new THREE.Group();
  const tex=A.tex[info.id];
  const backdrop=makeBackdrop(tex,19,11,{bias:6,dimK:.25});
  pos(backdrop,0,0,-7.0);group.add(backdrop);
  const wash=new THREE.Mesh(new THREE.PlaneGeometry(6.3,8.0),
    new THREE.MeshBasicMaterial({color:C.bg,transparent:true,opacity:.72,depthWrite:false}));
  pos(wash,3.7,0,-2);group.add(wash);
  const slab=projectedSlab(tex,5.1,7.2);group.add(slab);
  pos(slab,-1.85,0,-.55);
  const shadow=glowDisc(8);group.add(shadow);pos(shadow,-2.2,.15,-1.8);
  shadow.material.opacity=.12;
  const headline=txt(info.title,115,C.bone,{lineHeight:1.01});
  group.add(headline);pos(headline,2.0,1.1,.2);
  const kicker=txt(info.eyebrow,16,C.ember,{mono:true,tracking:.28});
  group.add(kicker);pos(kicker,2.05,2.75,.25);
  const credit=txt(info.credit,27,C.bone,{mono:true,tracking:.08});
  group.add(credit);pos(credit,2.05,-1.25,.28);
  const kind=txt(info.kind,17,C.muted,{mono:true,tracking:.12});
  group.add(kind);pos(kind,2.05,-1.71,.27);
  const numer=txt(String(number+1).padStart(2,"0")+" / "+String(SELECTED_WORKS.length).padStart(2,"0"),
    16,C.ember,{mono:true,tracking:.22});group.add(numer);pos(numer,-5.7,-3.18,.33);
  const line=anEdge(group,2.85,-2.25,1.6);
  return {group,slab,backdrop,shadow,headline,kicker,credit,kind,numer,line,info};
}

function projectChapter(A,name,start,end,work) {
  const group=new THREE.Group();
  const slides=work.map(id=>{
    const info=SELECTED_WORKS.find(x=>x.id===id);
    const slide=makeProject(A,info,SELECTED_WORKS.indexOf(info));
    group.add(slide.group);return slide;
  });
  const delta=(end-start)/slides.length;
  const isCraft=name==="the-craft";
  return {name,start,end,group,
    update(u,t,ctx) {
      const index=Math.min(slides.length-1,Math.floor(u/delta));
      const v=u-index*delta;
      slides.forEach((s,i)=>s.group.visible=i===index);
      const s=slides[index],enter=ease.outExpo(seg(v,0,Math.min(.73,delta*.4)));
      const leave=ease.inExpo(seg(v,delta-.45,delta));
      const f=fade(v,delta);
      s.slab.position.set(-2.1+(1-enter)*(index%2?-3.0:3.0)-leave*(index%2?1.8:-1.8),
        .05+.10*Math.sin(v*.8),-.55+1.1*leave);
      s.slab.rotation.set(-.027*Math.sin(v*1.1),(1-enter)*(index%2?-.65:.65)+leave*.42,(1-enter)*(index%2?-.09:.09));
      s.slab.scale.setScalar(.98+.032*enter+.035*Math.sin(v*.33));
      s.shadow.material.opacity=.19*enter*(1-leave);
      s.backdrop.material.uniforms.dimK.value=.13+.11*enter;
      const labels=[s.headline,s.kicker,s.credit,s.kind,s.numer];
      labels.forEach((m,j)=>setOpacity(m,f*([1,.8,.65,.70,.55][j])));
      s.headline.position.x=2.0+.52*(1-enter);
      s.credit.position.x=2.05+.18*(1-enter);
      s.line.scale.x=Math.max(.001,enter*(1-leave));
      const dolly=lerp(13.7,11.55,seg(v,0,delta));
      cinemaCam(ctx,t,(index%2?-.2:.18)+Math.sin(v*.25)*.12,0,dolly,(index%2?-.012:.012)*(1-enter));
      ctx.post.uWhip.value.x+=(index%2?.048:-.048)*(1-enter);
      ctx.post.uCA.value+=.002*(1-enter);
      ctx.post.uFlash.value+=.11*soft(v,.03,.10)+(isCraft?.07:0)*soft(v,delta-.3,.13);
      ctx.post.uZoom.value+=.12*(1-enter);
    }
  };
}

/** All twenty authenticated brand marks, four at a time, no fake labels.
 *  This is a collaboration list, not a claim that preceding campaigns
 *  were commissioned by any other client in this section.
 */
function clientWall(A) {
  const g=new THREE.Group();
  const entries=A.logos.map((tex,i)=>{
    const group=new THREE.Group();g.add(group);
    const panel=new THREE.Mesh(new THREE.BoxGeometry(2.42,1.46,.12),
      new THREE.MeshBasicMaterial({color:tex.userData.needsDarkPanel?0x17253e:0xecf0f6}));
    group.add(panel);
    const image=new THREE.Mesh(new THREE.PlaneGeometry(2.25,1.10),
      new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
    pos(image,0,0,.071);group.add(image);
    const name=txt(CLIENT_NAMES[i],16,C.bone,{mono:true,tracking:.06,anchor:"center"});
    pos(name,0,-1.12,.24);group.add(name);
    const bar=makeLine(2.1,.012,C.ember,.52);pos(bar,0,-1.47,.15);group.add(bar);
    return {group,name,bar};
  });
  const heading=txt("GOOD WORK.\nGREAT COMPANY.",137);g.add(heading);pos(heading,-5.4,2.52,.15);
  const eyebrow=txt("SELECTED COLLABORATIONS  /  20 MARKS",17,C.ember,{mono:true,tracking:.24});
  g.add(eyebrow);pos(eyebrow,-5.35,3.45,.17);
  const footer=txt("20 BRANDS  /  05 FRAMES  /  NO SHORTCUTS",15,C.muted,
    {mono:true,tracking:.18});g.add(footer);pos(footer,-5.35,-3.16,.2);
  const floor=makeLine(11.4,.023,C.ember,.18);g.add(floor);pos(floor,0,-2.57,-.3);
  const cardSpan=9/5;
  return {name:"collaborations-four-at-a-time",start:45,end:54,group:g,
    update(u,t,ctx) {
      const row=Math.min(4,Math.floor(u/cardSpan));
      const v=u-row*cardSpan;
      const enter=ease.outExpo(seg(v,0,.4));
      entries.forEach((entry,i)=>{
        const k=i%4,active=Math.floor(i/4)===row;
        entry.group.visible=active;
        if(!active)return;
        const e=ease.outExpo(seg(v,k*.065,k*.065+.42));
        const x=(k-1.5)*2.72;
        entry.group.position.set(x, -.22-(1-e)*1.95, -.2-1.5*(1-e));
        entry.group.rotation.y=(1-e)*(k%2?-.3:.3)+.015*Math.sin(v*.8+k);
        entry.group.scale.setScalar(.95+.05*e);
        setOpacity(entry.name,seg(v,.25+k*.05,.85+k*.05)*(1-seg(v,cardSpan-.24,cardSpan)));
        entry.bar.scale.x=e;
      });
      setOpacity(heading,.9);
      setOpacity(eyebrow,seg(u,0,.45));
      setOpacity(footer,seg(u,.8,1.6));
      cinemaCam(ctx,t,0,0,13.35,.005*Math.sin(u*.4));
      ctx.post.uFlash.value+=.09*soft(v,.035,.1);
      ctx.post.uWhip.value.x+=.032*(1-enter)*(row%2?1:-1);
    }
  };
}

/** A V2-inspired gallery of images transitions into the portfolio's actual
 *  extruded 3D mark. The final card remains readable for a full 3s. */
function finalSignature() {
  const g=new THREE.Group();
  const mark=makeOfficialMark();g.add(mark);pos(mark,0,1.30,.0);
  const halo=glowDisc(9);g.add(halo);pos(halo,0,1.1,-2);
  const a=txt("EDMUNDO KUTUZOV",153,C.bone,{anchor:"center"});
  g.add(a);pos(a,0,-1.03,.65);
  const b=txt("ART DIRECTOR  /  MAPUTO  /  MOZAMBIQUE",17,C.ember,
    {mono:true,anchor:"center",tracking:.16});g.add(b);pos(b,0,-2.02,.61);
  const c=txt("edmundokutuzov.art",39,C.bone,
    {mono:true,anchor:"center",tracking:.05});g.add(c);pos(c,0,-2.85,.64);
  const rule=makeLine(9,.025,C.ember,.9);g.add(rule);pos(rule,0,-1.55,.5);
  return {name:"official-3d-signature",start:54,end:60,group:g,
    update(u,t,ctx){
      const born=ease.outExpo(seg(u,0,1.45));
      const titleIn=ease.outExpo(seg(u,1,2.35));
      mark.rotation.set(-.2*(1-born), .65*(1-born)+.1*Math.sin(u*.3), 0);
      mark.position.z=-3+3*born;
      mark.scale.setScalar(.25+.75*born);
      halo.material.opacity=.42*born;
      setOpacity(a,titleIn);
      setOpacity(b,seg(u,2,2.7));
      setOpacity(c,seg(u,2.5,3.2));
      rule.scale.x=Math.max(.001,ease.outExpo(seg(u,1.8,2.9)));
      cinemaCam(ctx,t,0,.0,lerp(14,12.6,seg(u,0,4.3)));
      ctx.post.uFlash.value+=.21*soft(u,.3,.22);
      ctx.post.uSlitGlow.value=.18*soft(u,1.5,.6);
      ctx.post.uVig.value=.2;
    }
  };
}
export function buildDirectorCut(A) {
  return [
    openingMark(),
    projectChapter(A,"human-stories",7.7,14.2,[139]),
    projectChapter(A,"brand-worlds",14.2,22,[140,142]),
    projectChapter(A,"digital-culture",22,30,[143,21,50]),
    projectChapter(A,"culture-and-impact",30,38,[146,145,147]),
    projectChapter(A,"the-craft",38,45,[80,95,128,134]),
    clientWall(A),
    finalSignature()
  ];
}

