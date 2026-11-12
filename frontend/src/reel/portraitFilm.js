/**
 * TWO ISOLATED PORTRAIT DUPLICATES OF THE APPROVED V3.
 *
 * buildCampaignFilm() constructs a fresh scene graph for each call; all
 * portrait changes below apply only to those fresh instances. This module
 * deliberately does not mutate campaignFilm.js, archive.js or intro.js.
 *
 * Timings, images, music, transitions, shader effects and the official EK
 * extrusion remain exactly the 60-second version-three cut.
 */
import * as THREE from "three";
import { buildCampaignFilm, CAMPAIGNS, CATEGORIES } from "./campaignFilm";
import { makeText, setOpacity, C } from "./core";
import { FILTERS, ARCHIVE_LABELS, ARCHIVE_LINES } from "./archive";

export const PORTRAIT_FORMATS = Object.freeze({
  story: Object.freeze({key:"story",name:"Stories",aspect:"9:16",width:1080,height:1920,
    preview:[540,960],maxViewX:2.65,fov:52}),
  feed: Object.freeze({key:"feed",name:"Feed vertical",aspect:"4:5",width:1080,height:1350,
    preview:[720,900],maxViewX:3.65,fov:47}),
});

const CAMPAIGN_TITLES = Object.freeze({
 "icor-depressao":"A DEPRESSÃO\nÉ REAL",
 "diga-yes":"DIGA YES & VIVA\nO MUNDO ONLINE",
 "cozinhar-arte":"COZINHAR\nÉ ARTE",
 "agua-e-vida":"ÁGUA É VIDA\nE VOCÊ É 100% ÁGUA",
 "super-mares":"VIVA A EXPERIÊNCIA\nNO SUPER MARÉS",
 "we-are-giz":"WE ARE GIZ"
});

const withPosition=(mesh,x,y,z)=>{
 mesh.position.set(x,y,z);return mesh;
};

function setTextFit(mesh,x,y,maxW,maxH,z=1.7){
 const size=mesh.userData.size||{w:10,h:1};
 const k=Math.min(1,maxW/Math.max(size.w,.01),maxH/Math.max(size.h,.01));
 mesh.scale.setScalar(k);
 withPosition(mesh,x,y,z);
}

function scaledCards(meshes,layouts){
 meshes.forEach((mesh,j)=>{
   const p=layouts[j];
   if(!p)throw new Error("Missing vertical artwork placement "+j);
   const old=mesh.userData.pose;
   if(!old)throw new Error("Original campaign artwork pose missing");
   mesh.position.x+=p.x-old.x;
   mesh.position.y+=p.y-old.y;
   mesh.position.z+=(p.z||0)-old.z;
   mesh.rotation.z+=(p.r||0)-old.r;
   const geo=mesh.geometry;
   if(!geo.boundingBox)geo.computeBoundingBox();
   const box=geo.boundingBox;
   const width=box.max.x-box.min.x,height=box.max.y-box.min.y;
   const scale=Math.min(p.w/Math.max(width,.01),p.h/Math.max(height,.01));
   mesh.scale.multiplyScalar(scale);
 });
}

function campaignLayout(n,format,chapter,beat){
 const swap=(chapter+beat)%2?1:-1;
 if(format==="story"){
   if(n===1)return [{x:0,y:-.48,w:4.65,h:5.65,r:-.025,z:.15}];
   if(n===2)return [
     {x:0,y:1.06,w:4.55,h:3.05,r:-.04,z:.20},
     {x:0,y:-2.13,w:4.55,h:3.05,r:.045,z:.16}
   ];
   if(n===3)return [
     {x:0,y:1.10,w:4.52,h:3.1,r:-.035,z:.14},
     {x:-1.21,y:-2.08,w:2.18,h:2.85,r:-.055,z:.12},
     {x:1.22,y:-2.12,w:2.18,h:2.85,r:.075,z:.22}
   ];
   return [
     {x:-1.08*swap,y:.02,w:2.52,h:4.64,r:-.045*swap,z:.18},
     {x:1.39*swap,y:1.91,w:2.05,h:1.93,r:.07*swap,z:.26},
     {x:1.33*swap,y:-.28,w:2.10,h:1.87,r:-.07*swap,z:.17},
     {x:.96*swap,y:-2.47,w:2.72,h:1.76,r:.035*swap,z:.28}
   ];
 }
 if(n===1)return [{x:0,y:-.42,w:6.4,h:5.45,r:.02,z:.15}];
 if(n===2)return [
   {x:-1.66,y:-.27,w:3.3,h:4.84,r:-.038,z:.18},
   {x:1.66,y:-.20,w:3.3,h:4.87,r:.041,z:.22}
 ];
 if(n===3)return [
   {x:-1.63,y:-.16,w:3.54,h:4.95,r:-.038,z:.20},
   {x:1.78,y:1.28,w:3.08,h:2.49,r:.061,z:.18},
   {x:1.70,y:-1.57,w:3.08,h:2.46,r:-.042,z:.22}
 ];
 return [
   {x:-1.8*swap,y:-.24,w:3.65,h:5.05,r:-.04*swap,z:.20},
   {x:1.82*swap,y:1.65,w:2.95,h:1.62,r:.06*swap,z:.24},
   {x:1.84*swap,y:-.11,w:2.94,h:1.65,r:-.05*swap,z:.18},
   {x:1.72*swap,y:-1.9,w:3.05,h:1.59,r:.05*swap,z:.25}
 ];
}

function decorateCampaign(scene,format){
 const slug=scene.name.replace("campaign-","");
 const chapter=CAMPAIGNS.findIndex(c=>c.slug===slug);
 if(chapter<0)throw new Error("Unknown chapter "+slug);
 const batches=scene.group.children.filter(child=>
   child.isGroup && child.children.length && child.children.every(m=>m.isMesh));
 const labels=scene.group.children.filter(c=>c.userData.safeText);
 if(labels.length!==4||!batches.length)throw Error("Campaign clone structure changed "+slug);
 const [originalTitle,step,client,count]=labels;
 originalTitle.visible=false;
 client.visible=false;count.visible=false;
 // New authored line breaks on the cloned chapter only; original V3 untouched.
 const title=makeText({text:CAMPAIGN_TITLES[slug],font:"Syne",weight:800,
   size:96,color:C.bone,anchor:"left",lineHeight:1.02});
 title.material.depthTest=false;title.renderOrder=5;
 title.userData.safeText=true;
 scene.group.add(title);
 const lines=batches.map((group,i)=>campaignLayout(group.children.length,format,chapter,i));
 const originalUpdate=scene.update.bind(scene);
 scene.update=(u,t,ctx)=>{
   originalUpdate(u,t,ctx);
   batches.forEach((b,i)=>{
     if(!b.visible)return;
     scaledCards(b.children,lines[i]);
   });
   const story=format==="story";
   setTextFit(step,story?-2.45:-3.05,story?3.48:3.20,story?4.8:6.1,.3);
   setTextFit(title,story?-2.45:-3.00,story?2.65:2.40,story?4.8:5.9,story?1.24:1.08);
   setOpacity(title,originalTitle.material.opacity);
   // The approved horizontal update re-enables its original labels each
   // frame. Hide only on this fresh portrait graph afterwards.
   originalTitle.visible=false;
   client.visible=false;
   count.visible=false;
   // Decorative rule/haze retain the original transient effects.
   ctx.camera.fov=story?52:47;ctx.camera.updateProjectionMatrix();
 };
}

function decorateCategory(scene,format){
 const data=CATEGORIES.find(c=>scene.name===
   "category-"+c.name.toLowerCase().replace(/[^a-z]+/g,"-"));
 if(!data)throw Error("Unrecognised category clone "+scene.name);
 const slots=scene.group.children.slice(0,data.ids.length);
 const labels=scene.group.children.filter(c=>c.userData.safeText);
 if(labels.length!==2)throw Error("Category title clone has changed");
 const [title,eyebrow]=labels;
 const story=format==="story";
 const originalUpdate=scene.update.bind(scene);
 scene.update=(u,t,ctx)=>{
   originalUpdate(u,t,ctx);
   slots.forEach((m,j)=>{
     if(!m.visible)return;
     const k=j%3;
     const layout=story?[
       {x:0,y:.78,w:4.45,h:3.36,r:-.025},
       {x:-1.22,y:-2.27,w:2.17,h:2.66,r:-.052},
       {x:1.22,y:-2.25,w:2.17,h:2.66,r:.056},
     ]:[
       {x:-1.67,y:-.35,w:3.65,h:4.95,r:-.037},
       {x:1.78,y:1.27,w:2.98,h:2.37,r:.046},
       {x:1.75,y:-1.44,w:2.98,h:2.37,r:-.041},
     ];
     const p=layout[k];
     const box=m.geometry.boundingBox||(m.geometry.computeBoundingBox(),m.geometry.boundingBox);
     const w=box.max.x-box.min.x,h=box.max.y-box.min.y;
     const scale=Math.min(p.w/w,p.h/h);
     // Preserve the original arrival/transition motion but replace its destination.
     const oldx=(k-1)*3.65;
     m.position.x+=p.x-oldx;
     m.position.y+=p.y-.22;
     m.scale.setScalar(scale);
     m.rotation.z=p.r;
   });
   setTextFit(title,story?-2.45:-3.05,story?2.89:2.66,story?4.85:6.10,story?1.10:.80);
   setTextFit(eyebrow,story?-2.45:-3.05,story?3.84:3.32,story?4.8:6.15,.28);
   ctx.camera.fov=story?52:47;ctx.camera.updateProjectionMatrix();
 };
}

function decorateBrands(scene,format){
 const cards=scene.group.children.filter(c=>c.isGroup).slice(0,20);
 const labels=scene.group.children.filter(c=>c.userData.safeText);
 if(cards.length!==20||labels.length!==2)throw Error("Brand-wall duplicate changed");
 const [heading,sub]=labels,story=format==="story";
 const originalUpdate=scene.update.bind(scene);
 scene.update=(u,t,ctx)=>{
   originalUpdate(u,t,ctx);
   cards.forEach((root,j)=>{
     if(!root.visible)return;
     const k=j%4;
     const positions=story?[
       [-1.19,1.0],[1.19,1.0],[-1.19,-1.12],[1.19,-1.12]
     ]:[
       [-1.66,1.06],[1.66,1.06],[-1.66,-1.22],[1.66,-1.22]
     ];
     const oldx=(k-1.5)*2.82;
     root.position.x+=positions[k][0]-oldx;
     root.position.y+=positions[k][1]+.2;
     root.scale.multiplyScalar(story?.88:1.18);
   });
   setTextFit(heading,story?-2.45:-3.12,story?2.9:2.50,story?4.85:6.3,.83);
   setTextFit(sub,story?-2.45:-3.12,story?3.75:3.16,story?4.7:6.1,.26);
   ctx.camera.fov=story?52:47;ctx.camera.updateProjectionMatrix();
 };
}

function decorateArchive(scene,format){
 const story=format==="story";
 const hud=scene.hud.children;
 if(hud.length<8)throw Error("Archive filter HUD changed");
 const labels=hud.slice(0,6),under=hud[6],count=hud[7];
 const title=scene.group.children.find(x=>x.isGroup);
 if(!title)throw Error("Galaxy wordmark missing");
 const labelRows=story?[1395,1260,1125]:[1060,950,840];
 const keys=["ALL","SOCIAL MEDIA","IMAGE MANIPULATION","DESIGN","CAMPAIGN","VIDEO"];
 const createHudText=(str,size,y,color,weight=800)=>{
   const mesh=makeText({text:str,font:weight===800?"Syne":"JetBrains Mono",
      weight,size,color,anchor:"center",unit:1});
   const maxW=860,fullW=mesh.userData.size.w;
   mesh.scale.setScalar(Math.min(1,maxW/Math.max(1,fullW)));
   mesh.position.set(540,y,2);
   mesh.material.depthTest=false;mesh.renderOrder=6;
   scene.hud.add(mesh);
   return mesh;
 };
 const plate=new THREE.Mesh(new THREE.PlaneGeometry(920,280),
    new THREE.MeshBasicMaterial({color:C.bg,transparent:true,opacity:0,
      depthTest:false,depthWrite:false}));
 plate.position.set(540,story?940:663,-1);
 plate.renderOrder=-10;scene.hud.add(plate);
 const activeNames=keys.map(k=>createHudText(ARCHIVE_LABELS[k],70,story?975:710,C.bone));
 const activeLines=keys.map(k=>createHudText(ARCHIVE_LINES[k],30,story?872:608,C.ember,500));
 count.visible=false;
 const originalUpdate=scene.update.bind(scene);
 scene.update=(u,t,ctx)=>{
   originalUpdate(u,t,ctx);
   title.scale.setScalar(story?.92:1.14);
   title.position.y=.75;
   labels.forEach((lab,i)=>{
     const col=i%2,row=Math.floor(i/2), x=col===0?105:570;
     lab.position.set(x,labelRows[row],0);
     const width=lab.userData.size?.w||200;
     lab.scale.setScalar(Math.min(1,405/width));
   });
   let n=0;FILTERS.forEach(([at],i)=>{if(t>=at)n=i});
   const index=["ALL","SOCIAL MEDIA","IMAGE MANIPULATION","DESIGN","CAMPAIGN","VIDEO"].indexOf(FILTERS[n][1]);
   const label=labels[index];
   const visibleWidth=(label.userData.size?.w||200)*label.scale.x;
   under.position.set(label.position.x+visibleWidth/2,label.position.y-29,0);
   under.scale.x=visibleWidth;
   count.position.set(540,story?950:695,0);
   count.scale.set(story?.76:.95,1,1);
   plate.material.opacity=(scene.hud.visible?0.50:0)*Math.min(1,labels[index].material.opacity*1.3);
   activeNames.forEach((m,i)=>{m.visible=i===index;setOpacity(m,scene.hud.visible?1:0);});
   activeLines.forEach((m,i)=>{m.visible=i===index;setOpacity(m,scene.hud.visible?1:0);});
   // Cinematic field of view: keep the 155-image galaxy, camera choreography and index.
   ctx.camera.fov=story?53:47;ctx.camera.updateProjectionMatrix();
 };
}

function decorateIntro(scene,format){
 // Existing V2 kinetic typography and breach remain; only the cloned
 // scene root is scaled to fit the new portrait camera.
 const originalUpdate=scene.update.bind(scene);
 scene.update=(u,t,ctx)=>{
   originalUpdate(u,t,ctx);
   scene.group.scale.setScalar(format==="story"?.59:.81);
   ctx.camera.fov=format==="story"?50:47;ctx.camera.updateProjectionMatrix();
 };
}
function decorateFinale(scene,format){
 const story=format==="story";
 const url=scene.group.children.find(c=>c.userData.safeText);
 const originalUpdate=scene.update.bind(scene);
 scene.update=(u,t,ctx)=>{
   originalUpdate(u,t,ctx);
   scene.group.scale.setScalar(story?.59:.77);
   if(url){
     // Keep the site outside social UI overlays without changing EK motion.
     url.position.y=-1.10;
     setTextFit(url,0,-1.10,story?4.8:6.8,.35);
   }
   ctx.camera.fov=story?59:51;ctx.camera.updateProjectionMatrix();
 };
}

export function buildPortraitFilm(A,cloud,format){
 if(!PORTRAIT_FORMATS[format])throw new Error("Unsupported portrait format "+format);
 // Fresh V3 scene graph from the APPROVED original construction function.
 const cloned=buildCampaignFilm(A,cloud);
 cloned.forEach(scene=>{
   if(scene.name==="void")decorateIntro(scene,format);
   else if(scene.name==="archive")decorateArchive(scene,format);
   else if(scene.name.startsWith("campaign-"))decorateCampaign(scene,format);
   else if(scene.name.startsWith("category-"))decorateCategory(scene,format);
   else if(scene.name==="brands-i-have-worked-with")decorateBrands(scene,format);
   else if(scene.name==="ek-3d-motion-signature")decorateFinale(scene,format);
   else throw Error("Missing portrait direction for "+scene.name);
 });
 return cloned;
}

