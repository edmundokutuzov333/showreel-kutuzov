import * as THREE from "three";
import { C, ease, seg, lerp, makeText, makeSlab, makeLine, setCam, setOpacity, shake } from "./core";
import { SEL } from "./assets";

/**
 * V1 Editorial Study — motion reconstruction made from assets in this repo.
 * The 52-second historical MP4 is separately retained in the user's library;
 * this scene is NOT that original binary and is labelled accordingly in UI.
 */
const EDITS=[
  {a:0,b:5.5,id:127,word:"CREATIVE",mode:0},
  {a:5.5,b:11,id:110,word:"DIRECTION",mode:1},
  {a:11,b:16.5,id:101,word:"ART",mode:2},
  {a:16.5,b:22,id:113,word:"MATTERS.",mode:3},
  {a:22,b:27.5,id:139,word:"IMAGE",mode:0},
  {a:27.5,b:33,id:140,word:"IDEAS",mode:1},
  {a:33,b:38.5,id:141,word:"FORM",mode:2},
  {a:38.5,b:44,id:142,word:"IMPACT",mode:3},
  {a:44,b:48,id:143,word:"EDMUNDO",mode:0},
  {a:48,b:52,id:147,word:"KUTUZOV",mode:1},
];
export const VINTAGE_DURATION=52;
export function buildEditorialStudy(A) {
  const group=new THREE.Group(),editorial=EDITS.map(({id,word},i)=>{
    const stage=new THREE.Group();group.add(stage);
    const image=makeSlab(A.tex[id],4.45,.05);stage.add(image);
    const typography=makeText({text:word,font:"Syne",weight:800,size:i>=8?250:195,color:C.bone,anchor:"center"});
    stage.add(typography);
    const label=makeText({text:"EDMUNDO KUTUZOV    /    EDITORIAL ARCHIVE",font:"JetBrains Mono",weight:500,size:20,color:C.ember,tracking:.24,anchor:"center"});
    label.position.y=-3.1;stage.add(label);
    const bar=makeLine(11,.018,C.ember,.9);stage.add(bar);bar.position.y=3.05;
    return {stage,image,typography,label,bar};
  });
  return [{
    name:"v1-editorial-reconstruction",start:0,end:52,group,
    update(u,t,ctx) {
      const idx=Math.min(EDITS.length-1,EDITS.findIndex(x=>t>=x.a&&t<x.b)<0?EDITS.length-1:EDITS.findIndex(x=>t>=x.a&&t<x.b));
      editorial.forEach(({stage},i)=>stage.visible=i===idx);
      const it=EDITS[idx],p=editorial[idx],v=t-it.a,d=it.b-it.a;
      const inK=ease.outExpo(seg(v,0,.75)),outK=ease.inExpo(seg(v,d-.75,d));
      const mode=it.mode;
      p.image.position.set((mode%2?1.4:-1.4)*(1-inK)+(mode%2?-1.3:1.3)*outK,
        mode%3===0?.65:-.45,-.75);
      p.image.scale.setScalar(.90+.1*inK);
      p.image.rotation.y=(mode%2?-.7:.7)*(1-inK+outK);
      p.image.rotation.z=(mode%2?-.06:.06)*Math.sin(v*.8);
      p.typography.position.set(mode%2?-1.65:1.65,1.8-(1-inK)*1.7,.12);
      p.typography.scale.setScalar(mode%3===0?.7:.55);
      setOpacity(p.typography,.94*inK*(1-outK));
      p.bar.scale.x=Math.max(.001,inK*(1-outK));
      setOpacity(p.label,seg(v,.5,1.1)*(1-outK));
      const sh=shake(t,.12);
      setCam(ctx,[sh[0],sh[1],12],[0,0,0],0,35);
      ctx.scene.fog.near=9;ctx.scene.fog.far=32;
      ctx.post.uVig.value=.24;
      ctx.post.uCA.value=.0007;
      ctx.post.uWhip.value.x+=(mode%2?.05:-.05)*outK;
      ctx.post.uZoom.value+=.08*(1-inK)+.12*outK;
      ctx.post.uFlash.value+=.12*(1-seg(v,0,.11));
      // 2D editorial invert at thematic punctuation, remaining within identity palette.
      if(idx===2||idx===6)ctx.post.uFlash.value+=.055*seg(v,.2,.8)*(1-outK);
    }
  }];
}
