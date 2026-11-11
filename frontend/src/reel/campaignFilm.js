import * as THREE from "three";
import {
  C, ease, seg, lerp, texAspect, makeText, makeSlab, makeLine,
  glowTexture, setOpacity, setCam, shake, makeTiles
} from "./core";
import { makeOfficialMark } from "./brandMark";
import { buildVoid } from "./intro";
import { buildArchive } from "./archive";

/**
 * THE CAMPAIGN CUT — exact gallery assets from the portfolio website.
 * Timings are absolute and seekable. No artificial stand-in campaign images.
 */
export const CAMPAIGNS=[
 {slug:"icor-depressao",title:"A DEPRESSÃO É REAL",client:"ICOR",count:14,exclude:[11,13],start:21,end:23.2},
 {slug:"diga-yes",title:"DIGA YES & VIVA O MUNDO ONLINE",client:"WEBMASTERS",count:9,exclude:[],start:23.2,end:25.4},
 {slug:"cozinhar-arte",title:"COZINHAR É ARTE",client:"PEMBE MOZ",count:1,exclude:[],start:25.4,end:27.6},
 {slug:"agua-e-vida",title:"ÁGUA É VIDA E VOCÊ É 100% ÁGUA",client:"FONTE FRESCA",count:3,exclude:[],start:27.6,end:29.8},
 {slug:"super-mares",title:"VIVA A EXPERIÊNCIA NO SUPER MARÉS",client:"SUPER MARÉS",count:7,exclude:[],start:29.8,end:32},
 {slug:"we-are-giz",title:"WE ARE GIZ",client:"GIZ",count:6,exclude:[],start:32,end:34.2}
];
export const CATEGORIES=[
 {name:"SOCIAL MEDIA",start:34.2,end:36.9,ids:[21,23,26,37,43,50,54,57,59]},
 {name:"MANIPULATION",start:36.9,end:39.6,ids:[96,99,101,105,110,113,117,123,127]},
 {name:"SOME DEZAINES+",start:39.6,end:42.3,ids:[71,72,73,77,80,89,94,132,134]},
 {name:"VIDEO",start:42.3,end:45,ids:[148,149,150,151,152,153],video:true}
];
export const BRAND_NAMES=[
 "ABSA","TOYOTA","NISSAN","HYUNDAI","GALP","TOTALENERGIES",
 "VODACOM","RONIL AUTO","PERNOD RICARD","GIZ","MULTICHOICE","KITKAT",
 "FLYING FISH","BRUTAL FRUIT","JOAQUIM CHAVES SAÚDE","PONTA APART",
 "HOTEL CARDOSO","EMOSE","MCS","PROMAR"
];
export const CAMPAIGN_FILM_SCENES=[
 ["V2 INTRO",0,3.6],["V2 GALAXY & INDEX",3.6,21],
 ...CAMPAIGNS.map(c=>[c.title,c.start,c.end]),
 ...CATEGORIES.map(c=>[c.name,c.start,c.end]),
 ["BRANDS I'VE WORKED WITH",45,53.5],["EK 3D",53.5,60]
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
/* Editorial compositions, never the previous rigid grid. */
function layout(n,style,beat){
  const mirror=style%2?-1:1;
  if(n===1)return [{x:0,y:-.1,h:5.0,w:9.2,r:0,z:.24}];
  if(n===2)return [
    {x:-2.28,y:.08,h:4.6,w:5.4,r:-.067,z:.22},
    {x:2.38,y:-.14,h:4.4,w:5.1,r:.072,z:-.16}];
  if(n===3){
    if((style+beat)%3===0)return [
      {x:-2.27*mirror,y:-.11,h:4.5,w:6.15,r:-.055*mirror,z:.3},
      {x:3.42*mirror,y:1.13,h:2.03,w:3.16,r:.095*mirror,z:-.16},
      {x:3.24*mirror,y:-1.24,h:2.08,w:3.25,r:-.075*mirror,z:-.06}];
    return [
      {x:-3.50,y:.11,h:3.62,w:3.39,r:-.1,z:-.20},
      {x:0,y:-.11,h:4.45,w:4.08,r:.047,z:.18},
      {x:3.48,y:.21,h:3.72,w:3.43,r:.09,z:-.10}];
  }
  return [
    {x:-2.22*mirror,y:-.08,h:4.65,w:6.25,r:-.042*mirror,z:.24},
    {x:3.39*mirror,y:1.47,h:1.29,w:3.02,r:.11*mirror,z:-.18},
    {x:3.51*mirror,y:.0,h:1.31,w:3.07,r:-.06*mirror,z:-.07},
    {x:3.35*mirror,y:-1.45,h:1.30,w:3.08,r:.085*mirror,z:.05}];
}
/** Gallery montage: 14 images -> 3 bursts; 9 -> 2; 1 -> one authentic artwork. */
function campaign(A,c,i){
 const all=A.campaigns[c.slug]||[];
 if(all.length!==c.count)throw Error("Original gallery missing "+c.slug);
 const textures=all.filter((_,index)=>!c.exclude.includes(index));
 const g=new THREE.Group(),batches=[];
 for(let offset=0;offset<textures.length;offset+=4){
   const group=new THREE.Group();
   const chunk=textures.slice(offset,offset+4);
   const poses=layout(chunk.length,i,Math.floor(offset/4));
   const objects=chunk.map((tex,j)=>{
      const p=poses[j],mesh=slab(tex,p.h,p.w);
      mesh.userData.pose=p;group.add(mesh);return mesh;
   });
   g.add(group);batches.push({group,objects});
 }
 const headline=text(g,c.title,78,{maxW:10.55,maxH:.70});
 P(headline,-5.32,2.41,1.48);
 const step=text(g,"CAMPAIGN "+String(i+1).padStart(2,"0")+" / 06",16,
   {mono:true,color:C.ember,maxW:8,maxH:.24});
 P(step,-5.32,2.77,1.48);
 const client=text(g,c.client,19,{mono:true,maxW:5,maxH:.30});
 P(client,-5.32,-2.80,1.48);
 const cnt=text(g,String(textures.length).padStart(2,"0")+" UNIQUE ARTWORKS",15,
   {mono:true,color:C.ember,anchor:"right",maxW:4.0,maxH:.24});
 P(cnt,5.32,-2.80,1.48);
 const rule=line(g,10.9,0,2.18,.30);
 const haze=glow(g,11);P(haze,0,0,-3.2);
 const total=c.end-c.start,beatDuration=total/batches.length;
 return {name:"campaign-"+c.slug,start:c.start,end:c.end,group:g,
  update(u,t,ctx){
    const beat=Math.min(batches.length-1,Math.floor(u/beatDuration));
    const v=u-beat*beatDuration;
    batches.forEach((b,j)=>b.group.visible=j===beat);
    batches[beat].objects.forEach((mesh,j)=>{
      const p=mesh.userData.pose,sign=j%2?-1:1;
      const arrive=easePop(seg(v,j*.03,.20+j*.03));
      const leave=ease.inExpo(seg(v,beatDuration-.12,beatDuration));
      P(mesh,p.x+(1-arrive)*sign*1.25+leave*sign*.35,
       p.y+(1-arrive)*sign*.88,p.z+1.45*(1-arrive)+leave*.34);
      mesh.rotation.y=(1-arrive)*sign*.35+leave*sign*.17;
      mesh.rotation.z=p.r+(1-arrive)*sign*.09;
      mesh.scale.setScalar(.97+.03*arrive);
    });
    if(textures.length===1){
      const hero=batches[0].objects[0];
      hero.rotation.y=.16*Math.sin(u*2.45);
      hero.rotation.z=.038*Math.sin(u*1.9);
      hero.scale.setScalar(1+.058*Math.sin(u*2.7));
    }
    const intro=seg(u,.035,.20),out=1-seg(u,total-.16,total);
    setOpacity(headline,intro*out);setOpacity(step,intro*out);
    setOpacity(client,seg(u,.08,.30)*out);
    setOpacity(cnt,seg(u,.08,.30)*out);
    rule.scale.x=.06+.94*seg(u,.12,.47);
    haze.material.opacity=.2+.15*Math.sin(t*3.8)**2;
    haze.rotation.z=.08*Math.sin(t*.9);
    camera(ctx,t,12.75-.25*seg(v,0,beatDuration),.08*Math.sin(t*1.3));
    ctx.post.uFlash.value+=.12*pulse(v,0,.08);
    ctx.post.uWhip.value.x+=(i%2?.018:-.018)*(1-seg(v,0,.22));
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
 P(title,-5.50,-2.55,1.25);
 const eyebrow=text(g,"SELECTED CREATIVE PRACTICE",16,
   {mono:true,color:C.ember,maxW:8.2,maxH:.25});
 P(eyebrow,-5.48,2.91,1.25);
 const progress=line(g,10.9,0,-3.48,.55);
 if(slots.length%3!==0)throw Error("Orphan category art: "+c.name);
 const batches=slots.length/3,span=d/batches;
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
       if(!item.mesh.visible){
         if(item.media&&!item.media.el.paused)item.media.el.pause();
         return;
       }
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
      new THREE.MeshBasicMaterial({color:0x101e33}));
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
 P(sub,-5.49,3.01,1.0);
 line(g,11.1,0,2.30,.22);
 const rowLength=8.5/5;
 return {name:"brands-i-have-worked-with",start:45,end:53.5,group:g,
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
 // Three-point studio light and a soft luminous-metal face keep the
 // official EK extrusion legible during full orbital motion.
 const mainMetal=mark.children.find(m=>m.isMesh);
 if(mainMetal){
   mainMetal.material=mainMetal.material.clone();
   mainMetal.material.metalness=.42;
   mainMetal.material.roughness=.20;
   mainMetal.material.emissive=new THREE.Color(0x234b7e);
   mainMetal.material.emissiveIntensity=.55;
 }
 const fill=new THREE.HemisphereLight(0xeaf5ff,0x425e9c,3.0);
 const frontal=new THREE.PointLight(0xf4f8ff,115,20);
 const blue=new THREE.PointLight(0x559fff,92,18);
 P(frontal,0,3.1,6.2);P(blue,-4.0,-1.4,4.7);
 g.add(fill,frontal,blue);
 const echo=makeOfficialMark();g.add(echo);
 echo.children.filter(c=>c.isLight).forEach(c=>echo.remove(c));
 echo.traverse(m=>{if(m.isMesh||m.isLineSegments){
   m.material=m.material.clone();m.material.transparent=true;
   m.material.opacity=.13;m.material.depthWrite=false;
 }});
 const aura=glow(g,12);P(aura,0,0,-3);
 const rings=Array.from({length:4},(_,i)=>{
   const m=new THREE.Mesh(new THREE.RingGeometry(3.1+i*.48,3.116+i*.48,128),
     new THREE.MeshBasicMaterial({color:i%2?0x4466ff:0x9cc6f5,transparent:true,
       opacity:.11,side:THREE.DoubleSide,depthWrite:false}));
   g.add(m);P(m,0,0,-1.7-i*.3);return m;
 });
 const sparks=Array.from({length:72},(_,i)=>{
   const m=makeLine(.23,.013,i%3?C.ember:C.primary,.28);
   g.add(m);return m;
 });
 return {name:"ek-3d-motion-signature",start:53.5,end:60,group:g,
   update(u,t,ctx){
     const enter=easePop(seg(u,0,.95));
     const yaw=-1.15+1.25*u+.28*Math.sin(u*1.7);
     const pitch=.17*Math.sin(u*1.9),roll=.09*Math.sin(u*1.35);
     const breathe=1.65+.15*Math.sin(u*3.7)+.10*Math.sin(u*1.8);
     mark.position.set(.14*Math.sin(u*.94),.13*Math.cos(u*1.2),-.18+enter*.4);
     mark.rotation.set(pitch,yaw,roll);
     mark.scale.setScalar((.39+.61*enter)*breathe);
     mark.userData.key.position.set(-3.9*Math.cos(u*2.35),3.4,4.1);
     mark.userData.rim.position.set(4.0*Math.sin(u*3.05),-2.2,2.7);
     frontal.position.set(2.5*Math.cos(u*2.6),2.6+1.1*Math.sin(u*1.4),6.3);
     frontal.intensity=108+25*Math.sin(u*3.6)**2;
     blue.position.set(-4.1*Math.sin(u*2.1),-2.0,4.6);
     blue.intensity=87+18*Math.cos(u*2.5)**2;
     echo.position.copy(mark.position);echo.position.z-=.83;echo.position.x-=.2;
     echo.rotation.set(pitch+.1,yaw-.2,roll-.09);
     echo.scale.setScalar((.39+.61*enter)*breathe*.92);
     echo.traverse(m=>{if(m.isMesh||m.isLineSegments)m.material.opacity=.08+.055*Math.sin(u*2.0)**2;});
     aura.material.opacity=.48+.18*Math.sin(u*2.9)**2;
     aura.rotation.z=u*.16;aura.scale.setScalar(.93+.18*Math.sin(u*1.1)**2);
     rings.forEach((r,i)=>{
       r.rotation.set(.23*Math.sin(u*.7+i),.19*Math.sin(u*.85+i),u*.21*(i%2?1:-1));
       r.scale.setScalar(.86+.20*Math.sin(u*1.4+i));
       r.material.opacity=.075+.045*Math.sin(u*3+i)**2;
     });
     sparks.forEach((sp,i)=>{
       const a=i*2.39996+u*(i%2?.6:-.48),r=2.6+(i%11)*.33;
       P(sp,r*Math.cos(a),r*Math.sin(a)*.62,-2.3+(i%5)*.16);
       sp.rotation.z=a+.43;
       sp.scale.x=.4+.9*Math.sin(u*2.5+i)**2;
       sp.material.opacity=(.11+.23*Math.sin(u*2.1+i*.4)**2)*enter;
     });
     const shakeCam=shake(t,.12);
     setCam(ctx,[.72*Math.sin(u*.85)+shakeCam[0],.36*Math.cos(u*.68)+shakeCam[1],
       11.9-.38*seg(u,0,3)+.22*Math.sin(u*1.5)],[0,0,0],
       .022*Math.sin(u*.9),36);
     ctx.scene.fog.near=9;ctx.scene.fog.far=43;ctx.post.uGrain.value=.03;
     ctx.post.uSlitGlow.value=.12+.1*Math.sin(u*1.2)**2;
     ctx.post.uZoom.value+=.17*(1-enter)+.031*Math.sin(u*5.2);
     ctx.post.uFlash.value+=.25*pulse(u,.08,.15)+.11*pulse(u,2.9,.17)+.09*pulse(u,5.5,.18);
     ctx.post.uVig.value=.22;
   }
 };
}
export function selectedDevelopmentAssets(manifest,catalog){
 const campaignImages=[];
 CAMPAIGNS.forEach(c=>{
   const item=manifest.campaigns.find(x=>x.slug===c.slug);
   if(!item||item.frames.length!==c.count)throw Error("Corrupt campaign manifest "+c.slug);
   item.frames.forEach((src,i)=>{if(!c.exclude.includes(i))campaignImages.push(src)});
 });
 const ids=CATEGORIES.flatMap(c=>c.ids);
 const slugs=ids.map(id=>catalog.items.find(x=>x.id===id)?.slug);
 if(campaignImages.length!==38||new Set(campaignImages).size!==38)
   throw Error("Repeated campaign art");
 if(ids.length!==33||new Set(ids).size!==ids.length||
    slugs.some(s=>!s)||new Set(slugs).size!==slugs.length)
   throw Error("Repeated category work or title");
 if(ids.some(id=>catalog.items.find(x=>x.id===id).cat==="CAMPAIGN"))
   throw Error("Campaign repeated in a category");
 if(CATEGORIES.some(c=>c.ids.length%3!==0))throw Error("Single-item category frame");
 return {campaignImages,categoryIds:ids,categorySlugs:slugs};
}
export function buildCampaignFilm(A,cloud){
 selectedDevelopmentAssets(A.campaignManifest,A.catalog);
 return [buildVoid(),buildArchive(A,cloud),...CAMPAIGNS.map((c,i)=>campaign(A,c,i)),
   ...CATEGORIES.map(c=>category(A,c)),brandWall(A),finale()];
}
