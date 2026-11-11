import * as THREE from "three";
import {
  C, ease, seg, lerp, texAspect, makeText, makeSlab, makeLine,
  glowTexture, setOpacity, setCam, shake, makeTiles
} from "./core";
import { makeOfficialMark } from "./brandMark";

/**
 * THE CAMPAIGN CUT — exact gallery assets from the portfolio website.
 * Timings are absolute and seekable. No artificial stand-in campaign images.
 */
export const CAMPAIGNS=[
  {slug:"icor-depressao",title:"A DEPRESSÃO É REAL",client:"ICOR",count:14,start:3.8,end:7},
  {slug:"diga-yes",title:"DIGA YES & VIVA O MUNDO ONLINE",client:"WEBMASTERS",count:9,start:7,end:10.2},
  {slug:"cozinhar-arte",title:"COZINHAR É ARTE",client:"PEMBE MOZ",count:1,start:10.2,end:13.4},
  {slug:"agua-e-vida",title:"ÁGUA É VIDA E VOCÊ É 100% ÁGUA",client:"FONTE FRESCA",count:3,start:13.4,end:16.6},
  {slug:"super-mares",title:"VIVA A EXPERIÊNCIA NO SUPER MARÉS",client:"SUPER MARÉS",count:7,start:16.6,end:19.8},
  {slug:"we-are-giz",title:"WE ARE GIZ",client:"GIZ",count:6,start:19.8,end:23}
];
export const CATEGORIES=[
  {name:"SOCIAL MEDIA",start:23,end:26.6,ids:[21,23,26,29,37,43,50,54,57,59]},
  {name:"MANIPULATION",start:26.6,end:30.2,ids:[96,99,101,105,110,113,117,123,127]},
  {name:"SOME DEZAINES+",start:30.2,end:33.8,ids:[71,72,73,77,80,89,94,95,132,134]},
  {name:"VIDEO",start:33.8,end:37.4,ids:[148,149,150,151,152,153,154],video:true},
  {name:"CAMPAIGN DESIGN",start:37.4,end:41,ids:[141,144,147,139,140,142,143,145,146]}
];
export const BRAND_NAMES=[
 "ABSA","TOYOTA","NISSAN","HYUNDAI","GALP","TOTALENERGIES",
 "VODACOM","RONIL AUTO","PERNOD RICARD","GIZ","MULTICHOICE","KITKAT",
 "FLYING FISH","BRUTAL FRUIT","JOAQUIM CHAVES","PONTA APART",
 "HOTEL CARDOSO","EMOSE","MCS","PROMAR"
];
export const CAMPAIGN_FILM_SCENES=[
  ["THE PORTAL",0,3.8],
  ...CAMPAIGNS.map(c=>[c.title,c.start,c.end]),
  ...CATEGORIES.map(c=>[c.name,c.start,c.end]),
  ["BRANDS I HAVE WORKED WITH",41,52.5],
  ["EK 3D SIGNATURE",52.5,60]
];
const easePop=ease.outExpo;
const pulse=(v,a,w=.13)=>Math.exp(-Math.pow((v-a)/w,2));
const P=(m,x,y,z=0)=>(m.position.set(x,y,z),m);
const slab=(t,h,w)=>makeSlab(t,Math.min(h,w/texAspect(t)),.072);
function text(g,str,size,opts={}){
 const mesh=makeText({text:str,font:opts.mono?"JetBrains Mono":"Syne",weight:opts.mono?500:800,
   size,color:opts.color||C.bone,anchor:opts.anchor||"left",align:opts.align||"left",
   tracking:opts.tracking??(opts.mono?.15:-.022),lineHeight:opts.lineHeight||1.01});
 const w=mesh.userData.size.w||1,h=mesh.userData.size.h||1;
 mesh.scale.setScalar(Math.min(1,(opts.maxW||11)/w,(opts.maxH||1)/h));
 mesh.userData.safeText=true;
 g.add(mesh);return mesh;
}
function line(g,w,x,y,opacity=.7){
 const m=makeLine(w,.022,C.ember,opacity);P(m,x,y,.25);g.add(m);return m;
}
function glow(g,size=8){
 const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),
   new THREE.MeshBasicMaterial({map:glowTexture(),transparent:true,opacity:.55,
     depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
 g.add(m);return m;
}
function camera(ctx,t,z=12.65,x=0,y=0){
 const s=shake(t,.14);
 setCam(ctx,[x+s[0],y+s[1],z],[0,0,0],0,35);
 ctx.scene.fog.near=9;ctx.scene.fog.far=38;
 ctx.post.uVig.value=.3;ctx.post.uGrain.value=.03;
}
/**
 * Portfolio-inspired abyss portal, energy slit, warp trails and a true
 * 3D extrusion of the three original EK logo paths.
 */
function opening(){
 const g=new THREE.Group(),mark=makeOfficialMark();g.add(mark);
 const aura=glow(g,11);P(aura,0,0,-3);
 const slit=line(g,.035,0,0,.95);slit.scale.y=200;
 const upper=new THREE.Mesh(new THREE.PlaneGeometry(20,7),
   new THREE.MeshBasicMaterial({color:C.bg,depthWrite:false}));
 const lower=upper.clone();g.add(upper,lower);
 const title=text(g,"A POINT OF VIEW",118,{anchor:"center",maxW:9.6,maxH:.9});
 P(title,0,-2.2,1.6);
 const subtitle=text(g,"CAMPAIGN DESIGN  /  CULTURE  /  MOTION",16,
   {mono:true,anchor:"center",color:C.ember,maxW:9,maxH:.26});
 P(subtitle,0,-2.85,1.7);
 const trails=Array.from({length:72},(_,i)=>{
   const m=makeLine(.72,.014,i%4?C.ember:C.primary,.27);
   m.rotation.z=i*2.39996;g.add(m);return m;
 });
 return {name:"official-logo-portal",start:0,end:3.8,group:g,
   update(u,t,ctx){
     const enter=easePop(seg(u,.3,2.4)),breach=ease.inExpo(seg(u,2.95,3.77));
     upper.position.y=5.4+3.6*enter;lower.position.y=-5.4-3.6*enter;
     mark.position.set(.26*breach,.11*Math.sin(u*2.0),-3.1+4.6*enter+7.1*breach);
     mark.rotation.set(.11*Math.sin(u*1.9),.95*(1-enter)+.21*Math.sin(u*2.15),.04*Math.cos(u*1.5));
     mark.scale.setScalar(.28+.85*enter+1.45*breach);
     mark.userData.key.position.set(-4*Math.cos(u*1.6),3.2,4.0);
     mark.userData.rim.position.set(4*Math.sin(u*1.7),-2.2,2.0);
     aura.material.opacity=.35+.25*enter+.35*breach;
     aura.scale.setScalar(.65+enter*.42+breach*2.5);
     slit.scale.x=.1+enter*13+breach*24;slit.material.opacity=.76*(1-breach);
     trails.forEach((m,i)=>{
       const a=i*2.39996,r=1.2+(i%11)*.48;
       P(m,r*Math.cos(a)*(.7+breach*2),r*Math.sin(a)*(.6+breach*2),-.7+(i%9)*.1);
       m.scale.x=.32+breach*6;m.material.opacity=.08+.4*breach;
     });
     setOpacity(title,seg(u,1.0,1.5)*(1-seg(u,2.8,3.3)));
     setOpacity(subtitle,seg(u,1.4,1.9)*(1-seg(u,2.8,3.3)));
     camera(ctx,t,12.8);
     ctx.post.uZoom.value+=.12*breach;
     ctx.post.uSlitGlow.value=.3*enter;
     ctx.post.uFlash.value+=.80*pulse(u,3.74,.16);
   }
 };
}
const GRID=[
 [0,-.18,4.25,5.45],[-4.45,1.02,2.12,2.55],
 [4.45,1.02,2.12,2.55],[-4.45,-1.40,2.10,2.55],[4.45,-1.40,2.10,2.55]
];
/** Gallery montage: 14 images -> 3 bursts; 9 -> 2; 1 -> one authentic artwork. */
function campaign(A,c,i){
 const tex=A.campaigns?.[c.slug]||[];
 if(tex.length!==c.count)throw Error("Original gallery missing for "+c.slug);
 const group=new THREE.Group(),batches=[];
 for(let k=0;k<tex.length;k+=5){
   const sub=new THREE.Group(),pieces=tex.slice(k,k+5).map((texture,j)=>{
     const [x,y,h,w]=GRID[j],mesh=slab(texture,h,w);
     mesh.userData.target=[x,y];sub.add(mesh);return mesh;
   });
   group.add(sub);batches.push({sub,pieces});
 }
 const title=text(group,c.title,78,{maxW:10.7,maxH:.76});
 P(title,-5.48,2.62,1.3);
 const eyebrow=text(group,"CAMPAIGN DESIGN   /   "+String(i+1).padStart(2,"0")+" OF 06",
   16,{mono:true,color:C.ember,maxW:8,maxH:.24});
 P(eyebrow,-5.48,3.17,1.3);
 const credit=text(group,c.client,21,{mono:true,maxW:5,maxH:.37});
 P(credit,-5.48,-3.12,1.3);
 const counter=text(group,String(c.count).padStart(2,"0")+" ARTWORKS",16,
   {mono:true,color:C.ember,anchor:"right",maxW:3.8,maxH:.26});
 P(counter,5.48,-3.12,1.3);
 const rule=line(group,11.1,0,2.25,.25);
 const dur=c.end-c.start,span=dur/batches.length;
 return {name:"campaign-"+c.slug,start:c.start,end:c.end,group,
  update(u,t,ctx){
    const batch=Math.min(batches.length-1,Math.floor(u/span));
    const v=u-batch*span;
    batches.forEach((b,j)=>b.sub.visible=j===batch);
    const current=batches[batch];
    const show=easePop(seg(v,0,.26));
    current.pieces.forEach((m,j)=>{
      const [x,y]=m.userData.target;
      const enter=easePop(seg(v,j*.035,j*.035+.31));
      const leave=ease.inExpo(seg(v,span-.20,span));
      P(m,x+(1-enter)*(j%2?.75:-.75)+leave*(j%2?1:-1),
        y+(1-enter)*(j%2?-.65:.65),-.1+j*.075+leave*.8);
      m.rotation.y=(1-enter)*(j%2?-.35:.35)+leave*(j%2?.25:-.25);
      m.rotation.z=.015*Math.sin(v*1.7+j);
      m.scale.setScalar(.96+.04*enter);
    });
    if(c.count===1){
      const one=current.pieces[0];
      one.rotation.y=.16*Math.sin(u*2.4);one.rotation.z=.035*Math.sin(u*2.0);
      one.scale.setScalar(1+.065*Math.sin(u*2.9));
    }
    const fadeIn=seg(u,.05,.28),fadeOut=1-seg(u,dur-.32,dur);
    setOpacity(title,fadeIn*fadeOut);
    setOpacity(eyebrow,fadeIn*fadeOut);
    setOpacity(credit,seg(u,.18,.42)*fadeOut);
    setOpacity(counter,seg(u,.18,.42)*fadeOut);
    rule.scale.x=.03+.97*seg(u,.15,.6);
    camera(ctx,t,12.8-.38*seg(v,0,span),.1*Math.sin(u*1.1));
    ctx.post.uFlash.value+=.10*pulse(v,0,.07);
    ctx.post.uWhip.value.x+=(batch%2?.015:-.015)*(1-show);
    ctx.post.uCA.value+=.0008*(1-show);
  }
 };
}
/** Everything outside the six campaigns is labeled only as a discipline. */
function category(A,c){
 const g=new THREE.Group(),d=c.end-c.start;
 const slots=c.ids.map((id,j)=>{
   const media=c.video?A.videos[id]:null;
   const tex=media?.tex||A.tex[id];
   if(!tex)throw Error("Missing "+c.name+" item "+id);
   const mesh=slab(tex,3.85,3.55);g.add(mesh);
   return {mesh,media,id};
 });
 const bar=new THREE.Mesh(new THREE.PlaneGeometry(12.4,1.02),
   new THREE.MeshBasicMaterial({color:C.bg,transparent:true,opacity:.82,depthWrite:false}));
 P(bar,0,-2.88,.3);g.add(bar);
 const title=text(g,c.name,129,{maxW:10.9,maxH:.88});
 P(title,-5.50,-2.85,1.25);
 const eyebrow=text(g,"SELECTED CREATIVE PRACTICE",16,
   {mono:true,color:C.ember,maxW:8.2,maxH:.25});
 P(eyebrow,-5.48,3.10,1.25);
 const progress=line(g,10.9,0,-3.48,.55);
 const batches=Math.ceil(slots.length/3),span=d/batches;
 return {name:"category-"+c.name.toLowerCase().replace(/[^a-z]+/g,"-"),
   start:c.start,end:c.end,group:g,
   leave(){if(c.video)slots.forEach(({media})=>media?.el?.pause())},
   update(u,t,ctx){
     if(c.video)slots.forEach(({media})=>{
       if(!media)return;
       const el=media.el;
       if(ctx.playing&&el.paused)el.play().catch(()=>{});
       if(!ctx.playing){
         el.pause();
         if(el.readyState>=1&&el.duration>0){
           const target=u%el.duration;
           if(Math.abs(el.currentTime-target)>.45)el.currentTime=target;
         }
       }
     });
     const phase=Math.min(batches-1,Math.floor(u/span)),v=u-phase*span;
     const arrive=easePop(seg(v,0,.30));
     slots.forEach((item,j)=>{
       item.mesh.visible=Math.floor(j/3)===phase;
       if(!item.mesh.visible)return;
       const k=j%3,x=(k-1)*3.65;
       P(item.mesh,x+(1-arrive)*(k%2?-.8:.8),.22+Math.sin(t*.9+k)*.04,-.2+k*.1);
       item.mesh.rotation.y=(1-arrive)*(k%2?-.4:.4);
       item.mesh.rotation.z=(k-1)*.028;
     });
     setOpacity(title,seg(u,.08,.30)*(1-seg(u,d-.20,d)));
     setOpacity(eyebrow,seg(u,.18,.55));
     progress.scale.x=.01+.99*seg(u,0,d);
     camera(ctx,t,12.8,.07*Math.sin(t*.6));
     ctx.post.uWhip.value.x+=.015*(1-arrive);
     ctx.post.uFlash.value+=.07*pulse(v,.0,.08);
   }
 };
}
/** Five groups of four real logotypes. These are BRANDS, not named campaigns. */
function brandWall(A){
 const g=new THREE.Group();
 if(A.logos.length!==20)throw Error("All 20 brand logos are required");
 const slots=A.logos.map((texture,i)=>{
   const root=new THREE.Group();
   const panel=new THREE.Mesh(new THREE.BoxGeometry(2.48,1.43,.08),
      new THREE.MeshBasicMaterial({color:texture.userData.needsDarkPanel?0x17233c:0xeaf0f6}));
   root.add(panel);
   const art=new THREE.Mesh(new THREE.PlaneGeometry(2.27,1.13),
     new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
   P(art,0,0,.052);root.add(art);
   const name=text(root,BRAND_NAMES[i],15,{mono:true,anchor:"center",maxW:2.3,maxH:.24});
   P(name,0,-.96,.17);g.add(root);
   return {root,name};
 });
 const heading=text(g,"BRANDS I'VE WORKED WITH",99,{maxW:10.6,maxH:.78});
 P(heading,-5.49,2.70,1.0);
 const sub=text(g,"MARCAS COM AS QUAIS JÁ TRABALHEI",17,
   {mono:true,color:C.ember,maxW:9,maxH:.25});
 P(sub,-5.49,3.26,1.0);
 line(g,11.1,0,2.30,.22);
 const rowLength=11.5/5;
 return {name:"brands-i-have-worked-with",start:41,end:52.5,group:g,
  update(u,t,ctx){
    const row=Math.min(4,Math.floor(u/rowLength)),v=u-row*rowLength;
    slots.forEach(({root,name},i)=>{
      const j=i%4;root.visible=Math.floor(i/4)===row;
      if(!root.visible)return;
      const e=easePop(seg(v,j*.07,j*.07+.54));
      const leave=ease.inExpo(seg(v,rowLength-.29,rowLength));
      P(root,(j-1.5)*2.82+(1-e)*(j%2?.7:-.7),-.2-(1-e)*.85,-.3+(1-e)*1.05);
      root.rotation.y=(1-e)*(j%2?-.35:.35)+leave*(j%2?.25:-.25);
      root.rotation.z=.012*Math.sin(u*1.6+j);
      root.scale.setScalar(.92+.08*e);
      setOpacity(name,seg(v,.25,.65)*(1-leave));
    });
    setOpacity(heading,seg(u,.04,.50));
    setOpacity(sub,seg(u,.2,.70));
    camera(ctx,t,13.1,.05*Math.sin(t*.7));
    ctx.post.uFlash.value+=.07*pulse(v,.04,.10);
  }
 };
}
/** EK three-dimensional monogram continuously moving until 60.0s. */
function finale(){
 const g=new THREE.Group(),mark=makeOfficialMark();g.add(mark);
 const echo=makeOfficialMark();g.add(echo);
 echo.children.filter(c=>c.isLight).forEach(c=>echo.remove(c));
 echo.traverse(m=>{if(m.isMesh||m.isLineSegments){
   m.material=m.material.clone();m.material.transparent=true;
   m.material.opacity=.13;m.material.depthWrite=false;
 }});
 const aura=glow(g,12);P(aura,0,0,-3);
 const rings=Array.from({length:3},(_,i)=>{
   const m=new THREE.Mesh(new THREE.RingGeometry(3.1+i*.48,3.116+i*.48,128),
     new THREE.MeshBasicMaterial({color:i%2?0x4466ff:0x9cc6f5,transparent:true,
       opacity:.11,side:THREE.DoubleSide,depthWrite:false}));
   g.add(m);P(m,0,0,-1.7-i*.3);return m;
 });
 const url=text(g,"edmundokutuzov.art",38,{mono:true,anchor:"center",maxW:6.1,maxH:.48});
 P(url,0,-2.91,1.5);
 const bar=line(g,10.8,0,-3.29,.65);
 return {name:"ek-3d-motion-signature",start:52.5,end:60,group:g,
   update(u,t,ctx){
     const enter=easePop(seg(u,0,.95));
     const yaw=-.75+1.33*(u/7.5)+.23*Math.sin(u*1.6);
     const pitch=.17*Math.sin(u*1.9),roll=.09*Math.sin(u*1.35);
     const breathe=1.19+.12*Math.sin(u*2.7)+.07*Math.sin(u*5.1);
     mark.position.set(.14*Math.sin(u*.94),.13*Math.cos(u*1.2),-.18+enter*.4);
     mark.rotation.set(pitch,yaw,roll);
     mark.scale.setScalar((.67+.33*enter)*breathe);
     mark.userData.key.position.set(-3.7*Math.sin(u*1.9),3.5,4.1);
     mark.userData.rim.position.set(3.7*Math.cos(u*2.3),-1.7,2.6);
     echo.position.copy(mark.position);echo.position.z-=.83;echo.position.x-=.2;
     echo.rotation.set(pitch+.1,yaw-.2,roll-.09);
     echo.scale.setScalar(breathe*.97);
     echo.traverse(m=>{if(m.isMesh||m.isLineSegments)m.material.opacity=.08+.055*Math.sin(u*2.0)**2;});
     aura.material.opacity=.43+.15*Math.sin(u*2.2)**2;
     aura.rotation.z=u*.16;aura.scale.setScalar(.93+.18*Math.sin(u*1.1)**2);
     rings.forEach((r,i)=>{
       r.rotation.set(.23*Math.sin(u*.7+i),.19*Math.sin(u*.85+i),u*.21*(i%2?1:-1));
       r.scale.setScalar(.86+.20*Math.sin(u*1.4+i));
       r.material.opacity=.075+.045*Math.sin(u*3+i)**2;
     });
     setOpacity(url,seg(u,2.5,3.4));
     url.position.y=-2.90+.05*Math.sin(u*1.9);
     bar.scale.x=.06+.94*seg(u,1.6,3.1);
     camera(ctx,t,12.5-.45*seg(u,0,3)+.27*Math.sin(u*.65));
     ctx.post.uSlitGlow.value=.12+.1*Math.sin(u*1.2)**2;
     ctx.post.uZoom.value+=.12*(1-enter)+.015*Math.sin(u*4.6);
     ctx.post.uFlash.value+=.21*pulse(u,.08,.15)+.08*pulse(u,3.1,.19);
     ctx.post.uVig.value=.22;
   }
 };
}
export function buildCampaignFilm(A){
 return [opening(),...CAMPAIGNS.map((c,i)=>campaign(A,c,i)),
   ...CATEGORIES.map(c=>category(A,c)),brandWall(A),finale()];
}

