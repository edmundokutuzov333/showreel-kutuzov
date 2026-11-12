import {useEffect,useRef,useState} from "react";
import * as THREE from "three";

/**
 * Standalone realtime procedural 3D cranial-reconstruction proof.
 * No imports from /reel/engine or /reel/campaignFilm: the official V1–V3
 * showreels remain independent. All geometry is constructed at runtime.
 */
const APPS=["Ps","Ai","Ae","Pr","CapCut","Figma","AI","Blender","DaVinci"];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=(a,b,t)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p)};
const PRIMARY=0x4466ff, ICE=0x9cc6f5, NAVY=0x0a0d15;

function makeBrain(){
  const group=new THREE.Group();
  const g=new THREE.IcosahedronGeometry(1,4);
  const base=g.attributes.position;
  // Organic gyri are physically displaced mesh vertices, not flat bitmaps.
  for(let i=0;i<base.count;i++){
    const x=base.getX(i),y=base.getY(i),z=base.getZ(i);
    const fold=.065*Math.sin(18*x+8*Math.sin(4*y))*Math.cos(12*y+5*z)
      +.027*Math.sin(30*z+8*x)*Math.cos(23*y);
    const k=1+fold;
    base.setXYZ(i,x*k,y*k,z*k);
  }
  g.computeVertexNormals();
  for(const side of [-1,1]){
    const half=new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({
      color:0xb3a1bd,roughness:.42,metalness:.05,
      clearcoat:.55,emissive:0x090915,emissiveIntensity:.19,
      side:THREE.DoubleSide
    }));
    half.scale.set(.49,.63,.65);
    half.position.x=side*.38;group.add(half);
  }
  const stem=new THREE.Mesh(new THREE.CapsuleGeometry(.17,.58,8,12),
    new THREE.MeshStandardMaterial({color:0x6c637b,roughness:.5}));
  stem.position.set(0,-.67,0);group.add(stem);
  const cerebellum=new THREE.Mesh(new THREE.SphereGeometry(.38,22,14),
    new THREE.MeshStandardMaterial({color:0x8b7f9b,roughness:.48}));
  cerebellum.scale.set(1,.47,.66);cerebellum.position.set(0,-.53,-.43);
  group.add(cerebellum);
  return group;
}
function vaultPanels(){
  const result=[];
  const sectors=8, rings=13, steps=14;
  for(let i=0;i<sectors;i++){
    const pos=[],indices=[];
    const a0=-Math.PI/2+i*2*Math.PI/sectors;
    for(let r=0;r<=rings;r++){
      const phi=.035+(Math.PI/2-.035)*r/rings;
      for(let j=0;j<=steps;j++){
        const a=a0+j/steps*2*Math.PI/sectors;
        pos.push(.93*Math.sin(phi)*Math.cos(a),.79*Math.cos(phi),
          .76*Math.sin(phi)*Math.sin(a));
      }
    }
    for(let r=0;r<rings;r++)for(let j=0;j<steps;j++){
      const x=r*(steps+1)+j,y=x+steps+1;
      indices.push(x,y,x+1,x+1,y,y+1);
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
    geo.setIndex(indices);geo.computeVertexNormals();
    const pivot=new THREE.Group();
    const mesh=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({
      color:0x24354d,metalness:.64,roughness:.25,side:THREE.DoubleSide,
      emissive:0x092444,emissiveIntensity:.24,transparent:true
    }));
    pivot.add(mesh);result.push({pivot,mesh,i});
  }
  return result;
}
function makeTechBrain(){
  const root=new THREE.Group();
  const ico=new THREE.IcosahedronGeometry(1,3);
  const material=new THREE.MeshPhysicalMaterial({color:ICE,wireframe:true,
    emissive:PRIMARY,emissiveIntensity:.94,metalness:.3,roughness:.28,
    transparent:true,opacity:.83});
  for(const side of [-1,1]){
    const m=new THREE.Mesh(ico,material);
    m.scale.set(.49,.63,.65);m.position.x=side*.38;root.add(m);
  }
  for(let i=0;i<38;i++){
    const a=i*2.3999, latitude=Math.asin((i/38)*2-1);
    const p=new THREE.Mesh(new THREE.BoxGeometry(.07,.034,.055),
      new THREE.MeshBasicMaterial({color:i%3?ICE:0xffffff}));
    p.position.set(.57*Math.cos(a)*Math.cos(latitude),
      .65*Math.sin(latitude),.58*Math.sin(a)*Math.cos(latitude));
    p.rotation.set(a,a*.4,a*.2);root.add(p);
  }
  return root;
}
function makeAppCard(text){
  const canvas=document.createElement("canvas");canvas.width=256;canvas.height=136;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="rgba(7,17,40,.95)";ctx.fillRect(0,0,256,136);
  ctx.strokeStyle="#9cc6f5";ctx.lineWidth=5;ctx.strokeRect(4,4,248,128);
  ctx.fillStyle="#e8eef6";ctx.font=(text.length>4?"bold 29px":"bold 61px")+" Arial";
  ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,128,69);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(.62,.34),
    new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,
      side:THREE.DoubleSide}));
}
function createWorld(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,
    powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);
  camera.position.set(0,.48,7.8);
  const root=new THREE.Group();root.position.y=1.25;scene.add(root);
  const light=new THREE.AmbientLight(0x8ab9f9,1.2);scene.add(light);
  const left=new THREE.PointLight(0x2876ff,82,18);left.position.set(-3,2.6,3);scene.add(left);
  const right=new THREE.PointLight(0x9cc6f5,74,18);right.position.set(3,2.1,1);scene.add(right);
  const scalp=new THREE.Mesh(new THREE.SphereGeometry(.95,32,24),
    new THREE.MeshBasicMaterial({color:0x070d19,transparent:true,opacity:.0}));
  scalp.scale.set(1,.50,.83);scalp.position.y=-1.22;root.add(scalp);
  const segments=vaultPanels();
  segments.forEach(x=>root.add(x.pivot));
  const organic=makeBrain();root.add(organic);
  const tech=makeTechBrain();root.add(tech);
  const shreds=[];
  const shredGeo=new THREE.TetrahedronGeometry(.035);
  const shardMaterial=new THREE.MeshBasicMaterial({color:ICE,transparent:true});
  for(let i=0;i<320;i++){
    const m=new THREE.Mesh(shredGeo,shardMaterial.clone());
    const r=Math.cbrt((i+.5)/320);
    const a=i*2.39996,phi=Math.acos(1-2*((i+.5)/320));
    const base=new THREE.Vector3(r*Math.sin(phi)*Math.cos(a)*.81,
      r*Math.cos(phi)*.61,r*Math.sin(phi)*Math.sin(a)*.63);
    const velocity=base.clone().normalize().multiplyScalar(.85+1.4*((i*29)%73)/73);
    m.userData={base,velocity,a};root.add(m);shreds.push(m);
  }
  const orbit=APPS.map((name,i)=>{
    const mesh=makeAppCard(name);root.add(mesh);return {mesh,i};
  });
  const halo=new THREE.Mesh(new THREE.TorusGeometry(1.42,.012,8,150),
    new THREE.MeshBasicMaterial({color:ICE,transparent:true,opacity:.48}));
  halo.rotation.x=1.2;root.add(halo);
  const starPositions=new Float32Array(800*3);
  for(let i=0;i<800;i++){
    const a=i*2.39996,r=.6+((i*37)%100)/100*3.2;
    starPositions[i*3]=Math.cos(a)*r;
    starPositions[i*3+1]=((i*79)%100)/100*5-1.0;
    starPositions[i*3+2]=Math.sin(a)*r;
  }
  const sg=new THREE.BufferGeometry();
  sg.setAttribute("position",new THREE.BufferAttribute(starPositions,3));
  const stars=new THREE.Points(sg,new THREE.PointsMaterial({
    color:ICE,size:.012,transparent:true,opacity:.7}));
  root.add(stars);
  return {renderer,scene,camera,root,segments,organic,tech,shreds,orbit,halo,
    stars,left,right,scalp};
}
function animate(w,t){
  const opening=ease(.65,1.57,t),out=ease(1.12,2.12,t);
  const crumble=ease(2.08,3.06,t),construct=ease(3.1,4.33,t);
  const pulse=.68+.32*Math.sin(t*6.3)**2;
  w.left.intensity=66*pulse;w.right.intensity=69*(.8+.2*Math.sin(t*5.1)**2);
  w.root.rotation.y=.055*Math.sin(t*.7);
  w.segments.forEach(({pivot,mesh,i})=>{
    const angle=(i+.5)*2*Math.PI/8-Math.PI/2;
    pivot.position.set(Math.cos(angle)*opening*.95,
      opening*.06,Math.sin(angle)*opening*.48);
    pivot.rotation.set(opening*.12,
      opening*Math.sin(angle)*.84,opening*Math.cos(angle)*.91);
    mesh.material.opacity=1-ease(2.5,3.24,t);
    mesh.visible=t>.6&&t<3.24;
  });
  w.scalp.visible=opening>.02&&t<3.0;
  w.scalp.material.opacity=opening*.95*(1-ease(2.64,3.0,t));
  w.organic.position.y=-.82+1.28*out+.055*Math.sin(t*3.1);
  w.organic.scale.setScalar(.75+.25*out);
  w.organic.visible=t>1&&t<3.06;
  w.organic.traverse(x=>{if(x.isMesh){
    x.material.transparent=true;
    x.material.opacity=1-crumble;
  }});
  w.tech.position.copy(w.organic.position);w.tech.position.y=.47+.05*Math.sin(t*3.1);
  w.tech.scale.setScalar(.12+construct*.88);
  w.tech.rotation.y=t*.23;
  w.tech.visible=construct>.02;
  for(const m of w.shreds){
    const {base,velocity,a}=m.userData;
    const fraction=ease(2.05,2.42,t)*(1-ease(3.62,4.25,t));
    m.visible=fraction>.01;
    m.position.copy(base).addScaledVector(velocity,Math.sin(Math.PI*clamp((t-2.05)/2.2))*1.42);
    m.position.y+=.5;
    m.rotation.set(t*.7+a,t*1.3,t*.5+a);
    m.material.opacity=fraction;
  }
  w.orbit.forEach(({mesh,i})=>{
    const a=i*2*Math.PI/APPS.length+t*.45;
    mesh.position.set(2*Math.cos(a),.42+.83*Math.sin(a),.12+1.1*Math.sin(a));
    mesh.scale.setScalar(.58+.36*(1+Math.sin(a))/2);
    mesh.lookAt(w.camera.position);
    mesh.visible=construct>.12;
    mesh.material.opacity=construct;
  });
  w.halo.rotation.z=t*.4;w.halo.rotation.y=.22*Math.sin(t);
  w.halo.visible=t>.45;w.halo.material.opacity=ease(.45,1.2,t)*.5;
  w.stars.rotation.y=t*.12;
}
export default function NeuralCranium3D(){
  const canvasRef=useRef(null);
  const clockRef=useRef(0);
  const raf=useRef(0);
  const [playing,setPlaying]=useState(true);
  const [time,setTime]=useState(0);
  const [photo,setPhoto]=useState(null);
  useEffect(()=>{
    const world=createWorld(canvasRef.current);
    let start=performance.now(),last=0;
    const resize=()=>{
      const box=canvasRef.current.getBoundingClientRect();
      const width=Math.max(1,Math.round(box.width));
      const height=Math.max(1,Math.round(box.height));
      world.renderer.setSize(width,height,false);
      world.camera.aspect=width/height;world.camera.updateProjectionMatrix();
    };
    resize();window.addEventListener("resize",resize);
    const tick=now=>{
      if(playing)clockRef.current=(now-start)/1000%5;
      else start=now-clockRef.current*1000;
      const t=clockRef.current;
      animate(world,t);
      world.renderer.render(world.scene,world.camera);
      if(now-last>90){setTime(t);last=now}
      raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return ()=>{
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize",resize);
      world.root.traverse(x=>{
        x.geometry?.dispose();
        if(x.material){
          const materials=Array.isArray(x.material)?x.material:[x.material];
          materials.forEach(m=>{m.map?.dispose();m.dispose()});
        }
      });
      world.renderer.dispose();
    };
  },[playing]);
  useEffect(()=>()=>{if(photo)URL.revokeObjectURL(photo)},[photo]);
  return (
    <main style={{background:"#0a0d15",color:"#e8eef6",minHeight:"100vh",padding:"28px",
      fontFamily:"system-ui,sans-serif"}}>
      <nav style={{display:"flex",justifyContent:"space-between",maxWidth:1050,margin:"0 auto 22px"}}>
        <a href="/" style={{color:"#9cc6f5"}}>← VOLTAR AO SHOWREEL</a>
        <span style={{color:"#9cc6f5",letterSpacing:2,fontSize:12}}>V3 / NEURAL RECONSTRUCTION / 5S</span>
      </nav>
      <section style={{maxWidth:1050,margin:"auto"}}>
        <h1 style={{fontSize:"clamp(24px,5vw,50px)",marginBottom:8}}>BEHIND THE MIND.</h1>
        <p style={{opacity:.7,maxWidth:740}}>
          Experiência 3D autónoma: crânio articulado, cérebro orgânico, fragmentos
          volumétricos e reconstrução cibernética. Carrega a tua fotografia para
          utilizar o retrato sem o publicar no repositório.
        </p>
        <div style={{position:"relative",width:"100%",maxWidth:850,aspectRatio:"1 / 1",
          background:"radial-gradient(circle at 50% 30%,#113568,#07111e 50%,#0a0d15)",
          overflow:"hidden",margin:"20px auto",border:"1px solid #274465"}}>
          {photo&&<img src={photo} alt="Fotografia original de base"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain"}}/>}
          <canvas ref={canvasRef} aria-label="Cérebro e calota craniana em 3D real"
            style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          {!photo&&<p style={{position:"absolute",bottom:18,left:18,fontSize:12,
            opacity:.7,pointerEvents:"none"}}>Carrega a fotografia para combinar o rosto com a cena.</p>}
        </div>
        <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setPlaying(x=>!x)} style={{padding:"12px 20px",
            background:"#4466ff",border:0,borderRadius:24,color:"#fff",cursor:"pointer"}}>
            {playing?"Pausar":"Reproduzir"}
          </button>
          <label style={{border:"1px solid #4466ff",padding:"11px 16px",
            borderRadius:24,cursor:"pointer"}}>
            Carregar fotografia
            <input type="file" accept="image/png,image/jpeg,image/webp"
              style={{display:"none"}} onChange={event=>{
                const file=event.target.files?.[0];
                if(file){setPhoto(URL.createObjectURL(file));clockRef.current=0;}
              }}/>
          </label>
          <strong>{time.toFixed(1)} / 5.0 s</strong>
        </div>
      </section>
    </main>
  );
}
