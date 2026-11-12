import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * V4 / a fully independent browser-playable director's storyboard.
 * It does NOT change the V1/V2/V3 engine or suggest Jarvis is functioning.
 * The 30s master is exported separately using the V4 Python/FFmpeg renderer.
 */
export const V4_DURATION = 30;
export const V4_SCENES = Object.freeze([
  { from: 0, to: 2, name: "THE GATE", path: "/" },
  { from: 2, to: 5, name: "HOME", path: "/" },
  { from: 5, to: 7.35, name: "MANIFESTO", path: "/" },
  { from: 7.35, to: 10.65, name: "WORK", path: "/work" },
  { from: 10.65, to: 13.1, name: "PROJECT", path: "/work/diga-yes" },
  { from: 13.1, to: 15.45, name: "CAPABILITIES", path: "/services" },
  { from: 15.45, to: 17.7, name: "PROCESS", path: "/process" },
  { from: 17.7, to: 19.65, name: "ABOUT", path: "/about" },
  { from: 19.65, to: 21.55, name: "CLIENTS", path: "/clients" },
  { from: 21.55, to: 26, name: "JARVIS / STAGED DEMO", path: "/" },
  { from: 26, to: 28.2, name: "CONTACT", path: "/contact" },
  { from: 28.2, to: 30, name: "ENTER THE EXPERIENCE", path: "/" },
]);
const ART = [
  { id: 143, label: "DIGA YES", discipline: "CAMPAIGN" },
  { id: 139, label: "A DEPRESSÃO É REAL", discipline: "CAMPAIGN" },
  { id: 145, label: "SUPER MARÉS", discipline: "CAMPAIGN" },
  { id: 142, label: "COZINHAR É ARTE", discipline: "CAMPAIGN" },
  { id: 141, label: "SOCIAL MEDIA", discipline: "CREATIVE" },
  { id: 127, label: "MANIPULATION", discipline: "CREATIVE" },
  { id: 146, label: "WE ARE GIZ", discipline: "CAMPAIGN" },
  { id: 110, label: "VIDEO", discipline: "CREATIVE" },
];
const CLIENTS = [
  "ABSA", "TOYOTA", "NISSAN", "HYUNDAI", "GALP",
  "TOTALENERGIES", "VODACOM", "GIZ", "KITKAT", "DStv / GOtv",
  "BRUTAL FRUIT", "PERNOD RICARD", "EMOSE", "HOTEL CARDOSO", "PROMAR",
  "JOAQUIM CHAVES", "RONIL", "PONTA APART", "FLYING FISH", "MCS"
];
const COLOURS = { bg:"#0a0d15", blue:"#4466ff", ice:"#9cc6f5", text:"#e8eef6" };
const mono = {fontFamily:'"JetBrains Mono", monospace',letterSpacing:".12em"};
const imgPath = (id) => "/reel/img/" + String(id).padStart(3,"0") + ".webp";
const sceneFor = (t) => V4_SCENES.find((scene) => t >= scene.from && t < scene.to) || V4_SCENES[V4_SCENES.length-1];
const step = (a,b,t) => { const p = Math.min(1,Math.max(0,(t-a)/(b-a)));return p*p*(3-2*p); };
const cap = (s) => <span style={{fontSize:"clamp(8px,.9vw,12px)",color:COLOURS.ice,...mono}}>{s}</span>;

function Artwork({ item, active = false, style = {} }) {
  return <div style={{position:"relative",minWidth:0,overflow:"hidden",border:"1px solid " + (active ? COLOURS.ice : "#344c68"),borderRadius:6,background:"#101d33",...style}}>
    <img src={imgPath(item.id)} alt={item.label} style={{display:"block",width:"100%",height:"100%",objectFit:"cover",filter:active?"saturate(1.12)":"saturate(.85)"}} />
    <span style={{position:"absolute",left:9,bottom:9,background:"#08111bdf",padding:"5px 8px",fontSize:"clamp(8px,.9vw,11px)",...mono}}>{item.label}</span>
  </div>;
}
function SiteContent({ name, local, time }) {
  const fade = step(0,.3,local);
  const common = {height:"100%",padding:"clamp(12px,3.7%,46px)",opacity:fade,overflow:"hidden"};
  if (name==="HOME") return <div style={{...common,display:"flex",alignItems:"center",justifyContent:"space-between",gap:20}}>
    <div style={{zIndex:2,maxWidth:"57%"}}>
      {cap("(01) / ENTRY")}
      <h2 className="v4-title" style={{fontSize:"clamp(24px,5vw,65px)",lineHeight:1.02,margin:"16px 0"}}>I MAKE IDEAS<br/>STOP, TAKE NOTICE,<br/><span style={{color:COLOURS.ice}}>STAY IN MEMORY,</span><br/>AND ACT.</h2>
      {cap("ART DIRECTOR / SOCIAL MEDIA MANAGER / AI EXPERT")}
    </div>
    <div style={{width:"39%",aspectRatio:"1/1",display:"grid",placeItems:"center",perspective:600,background:"radial-gradient(circle,#1a55a64a,transparent 66%)",borderRadius:"50%"}}>
      <span style={{fontFamily:"Syne, sans-serif",fontSize:"clamp(55px,11vw,170px)",fontWeight:800,color:COLOURS.ice,filter:"drop-shadow(0 0 25px #4466ff)",transform:"rotateY("+(time*25%32-16)+"deg)"}}>EK.</span>
    </div>
  </div>;
  if (name==="MANIFESTO") return <div style={common}>
    {cap("(01) / MANIFESTO")}
    <h2 className="v4-title" style={{fontSize:"clamp(24px,4.5vw,58px)",lineHeight:1.04,margin:"16px 0"}}>I BUILD BRAND SYSTEMS<br/>THAT EARN ATTENTION.</h2>
    {cap("30+ BRANDS. ONE OBSESSION.")}
    <div style={{borderTop:"1px solid #344c68",marginTop:25,paddingTop:15}}>
      <h3 className="v4-title" style={{fontSize:"clamp(15px,2vw,28px)",margin:"0 0 12px"}}>Work that refuses to be ignored.</h3>
      <div style={{display:"flex",height:"clamp(70px,11vw,160px)",gap:10}}>{ART.slice(0,4).map((a,i)=><Artwork key={a.id} item={a} active={i===Math.floor(local*3)%4} style={{flex:1}} />)}</div>
    </div>
  </div>;
  if(name==="WORK")return <div style={common}>
    {cap("INDEX OF WORK / 155 PROJECTS")}
    <h2 className="v4-title" style={{fontSize:"clamp(28px,5vw,70px)",margin:"8px 0 12px"}}>Selected work.</h2>
    <div style={{display:"flex",gap:8,marginBottom:15,flexWrap:"wrap"}}>
      {["ALL","CAMPAIGNS","SOCIAL MEDIA","MANIPULATION","VIDEO"].map((f,i)=><span key={f}
        style={{border:"1px solid "+(Math.floor(local*1.4)%5===i?COLOURS.ice:"#344c68"),padding:"6px 11px",fontSize:"clamp(9px,.8vw,12px)",...mono}}>{f}</span>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gridTemplateRows:"repeat(2,minmax(0,1fr))",gap:9,height:"58%",transform:"translateY(-"+(local*4)+"px)"}}>
      {ART.map((a,i)=><Artwork key={a.id} item={a} active={i===2&&local>2} />)}
    </div>
  </div>;
  if(name==="PROJECT")return <div style={common}>
    {cap("CAMPAIGN DESIGN / WEBMASTERS / YES")}
    <h2 className="v4-title" style={{fontSize:"clamp(25px,4.3vw,58px)",margin:"12px 0 18px",lineHeight:1}}>DIGA YES & VIVA<br/>O MUNDO ONLINE.</h2>
    <div style={{display:"flex",gap:12,height:"57%"}}>
      <Artwork item={ART[0]} active style={{flex:2.6}} />
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:12}}><Artwork item={ART[1]} style={{flex:1}}/><Artwork item={ART[4]} style={{flex:1}}/></div>
    </div>
  </div>;
  if(name==="CAPABILITIES")return <div style={common}>
    {cap("METHODOLOGY / PRACTICE")}
    <h2 className="v4-title" style={{fontSize:"clamp(23px,4.5vw,60px)",margin:"12px 0 20px",lineHeight:1}}>VISUAL CAPABILITIES<br/>& DISCIPLINES.</h2>
    {["IDENTITY VISUAL","ART DIRECTION","EDITORIAL & PRINT","DIGITAL DESIGN","AI CREATIVE DIRECTION"].map((s,i)=>
      <div key={s} style={{display:"flex",justifyContent:"space-between",padding:"clamp(7px,1.2vw,18px) 3px",borderBottom:"1px solid "+(Math.floor(local*3)%5===i?COLOURS.ice:"#344c68"),color:Math.floor(local*3)%5===i?COLOURS.text:"#8896aa"}}>
        <strong style={{fontSize:"clamp(11px,2.1vw,27px)",fontFamily:"Syne,sans-serif"}}><small style={{fontSize:12,marginRight:20,color:COLOURS.ice}}>0{i+1}</small>{s}</strong><span style={{...mono,fontSize:12,color:COLOURS.ice}}>↗</span>
      </div>)}
  </div>;
  if(name==="PROCESS")return <div style={common}>
    {cap("HOW AN IDEA MOVES")}
    <h2 className="v4-title" style={{fontSize:"clamp(26px,5vw,65px)",margin:"12px 0 20px"}}>PROCESS IS THE ART.</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:"6%",height:"53%"}}>
      {[["DISCOVERY","Immersion & context"],["STRATEGY","A visual point of view"],["CRAFT","Every detail counts"],["ROLLOUT","Production at every scale"]].map(([a,b],i)=>
        <div key={a} style={{padding:"20px 14px",background:"#12233a",border:"1px solid "+(Math.floor(local*2)%4===i?COLOURS.ice:"#344c68"),borderRadius:7,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          {cap("0"+(i+1))}<strong style={{fontSize:"clamp(10px,1.7vw,23px)",fontFamily:"Syne,sans-serif"}}>{a}</strong><small style={{fontSize:"clamp(8px,1.0vw,13px)",opacity:.65}}>{b}</small>
        </div>)}
    </div>
  </div>;
  if(name==="ABOUT")return <div style={{...common,display:"flex",gap:30}}>
    <div style={{width:"58%"}}>
      {cap("THE PERSON BEHIND THE PRACTICE")}
      <h2 className="v4-title" style={{fontSize:"clamp(32px,5.5vw,80px)",margin:"14px 0"}}>EDMUNDO<br/>KUTUZOV.</h2>
      {cap("ART DIRECTOR / MAPUTO / MOZAMBIQUE")}
      <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #344c68",marginTop:"15%",paddingTop:20}}>
        {["150+ / PROJECTS","30+ / BRANDS","360º / PRACTICE"].map(s=><strong key={s} style={{fontSize:"clamp(10px,1.5vw,19px)"}}>{s}</strong>)}
      </div>
    </div>
    <img src="https://edmundokutuzov.art/edmundo-kutuzov-foto.jpg" alt="Retrato de Edmundo Kutuzov"
      style={{width:"37%",objectFit:"cover",objectPosition:"center top",border:"1px solid #345074",borderRadius:8}} />
  </div>;
  if(name==="CLIENTS")return <div style={common}>
    {cap("SELECTED COLLABORATIONS")}
    <h2 className="v4-title" style={{fontSize:"clamp(25px,4.7vw,65px)",margin:"10px 0 16px"}}>BRANDS & TEAMS.</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
      {CLIENTS.map((s,i)=><div key={s} style={{height:"clamp(33px,5.1vw,72px)",display:"grid",placeItems:"center",background:"#13243c",border:"1px solid "+(Math.floor(local*13)%20===i?COLOURS.ice:"#344c68"),fontFamily:"Syne,sans-serif",fontSize:"clamp(8px,1.1vw,15px)",textAlign:"center",padding:5}}>{s}</div>)}
    </div>
  </div>;
  if(name==="JARVIS / STAGED DEMO")return <div style={common}>
    {cap("JARVIS / SITE INTELLIGENCE")}
    <h2 className="v4-title" style={{fontSize:"clamp(23px,4vw,55px)",margin:"12px 0 20px"}}>ASK. EXPLORE. DISCOVER.</h2>
    <div style={{border:"1px solid #9cc6f5",borderRadius:12,background:"#09182c",display:"flex",gap:"3%",padding:"3%",height:"66%"}}>
      <div style={{width:"29%",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:"75%",aspectRatio:"1",borderRadius:"50%",border:"2px solid #9cc6f5",boxShadow:"inset 0 0 0 17px #0a1933, 0 0 24px #4466ff",display:"grid",placeItems:"center",transform:"rotate("+(time*10)+"deg)"}}>
          <div style={{width:"45%",aspectRatio:"1",borderRadius:"50%",background:"#c9e4ff",boxShadow:"0 0 36px #98c3ff"}}/>
        </div>
      </div>
      <div style={{width:"68%",display:"flex",flexDirection:"column",gap:10}}>
        {cap("KUTUZOV · IA DE EDMUNDO")}
        <div style={{padding:13,background:"#142a48",borderRadius:7,fontSize:"clamp(10px,1.3vw,17px)"}}>
          {local<1.1?"Jarvis, mostra-me": "Jarvis, mostra-me as tuas campanhas."}
        </div>
        {local>1.3&&<div style={{padding:12,border:"1px solid #314f78",borderRadius:8,flex:1}}>
          <p style={{margin:"0 0 9px",fontSize:"clamp(10px,1.1vw,15px)"}}>Aqui estão três projectos em destaque.</p>
          <div style={{display:"flex",gap:7,height:"72%"}}>{ART.slice(0,3).map((a,i)=>
            local>1.7+i*.45?<Artwork key={a.id} item={a} style={{flex:1}}/>:null)}
          </div>
        </div>}
        <small style={{fontSize:"clamp(8px,.8vw,12px)",color:COLOURS.ice,...mono}}>DEMONSTRAÇÃO CONCEPTUAL · CONVERSA ENCENADA</small>
      </div>
    </div>
  </div>;
  if(name==="CONTACT")return <div style={common}>
    {cap("NEXT MOVE / AVAILABLE FOR PROJECTS")}
    <h2 className="v4-title" style={{fontSize:"clamp(48px,8vw,116px)",margin:"10px 0 10px"}}>LET'S TALK.</h2>
    <h3 style={{fontSize:"clamp(14px,2.7vw,36px)",lineHeight:1.2}}>LET'S BUILD A VISUAL PRESENCE<br/>IMPOSSIBLE TO IGNORE.</h3>
    <div style={{display:"flex",gap:14,marginTop:"8%"}}>
      {[
        ["EMAIL ↗","contact@edmundokutuzov.art"],
        ["WHATSAPP ↗","+258 87 601 312 1"]
      ].map(([k,v],i)=><div key={k} style={{flex:1,padding:18,background:i===0?"#1b3355":"#101d30",border:"1px solid #9cc6f5",borderRadius:8}}>
        {cap(k)}<p style={{fontSize:"clamp(10px,1.6vw,23px)",margin:"12px 0 0",wordBreak:"break-word"}}>{v}</p>
      </div>)}
    </div>
  </div>;
  return null;
}
export default function SiteTourV4(){
  const clock=useRef(0);
  const previous=useRef(0);
  const raf=useRef(0);
  const [time,setTime]=useState(0);
  const [playing,setPlaying]=useState(true);
  useEffect(()=>{
    previous.current=performance.now();
    const tick=now=>{
      const dt=Math.max(0,Math.min(.08,(now-previous.current)/1000));previous.current=now;
      if(playing){
        clock.current=Math.min(V4_DURATION,clock.current+dt);
        setTime(clock.current);
        if(clock.current===V4_DURATION)setPlaying(false);
      }
      raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf.current);
  },[playing]);
  const seek=(v)=>{clock.current=Math.max(0,Math.min(V4_DURATION,v));setTime(clock.current);};
  const scene=sceneFor(Math.min(time,29.999));
  const local=Math.max(0,time-scene.from);
  const progress=Math.max(0,Math.min(1,time/V4_DURATION));
  const isFinal=scene.name==="ENTER THE EXPERIENCE";
  const isIntro=scene.name==="THE GATE";
  return <main style={{minHeight:"100vh",background:COLOURS.bg,color:COLOURS.text,padding:"clamp(16px,3vw,48px)",fontFamily:'"Manrope",sans-serif'}}>
    <div style={{display:"flex",justifyContent:"space-between",maxWidth:1370,margin:"0 auto 25px",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <Link to="/" style={{color:COLOURS.ice,textDecoration:"none",...mono,fontSize:12}}>← MOTION ARCHIVE</Link>
      <span style={{...mono,fontSize:11,color:COLOURS.ice}}>V4 / SITE EXPERIENCE / 30 SECONDS</span>
    </div>
    <div style={{maxWidth:1370,margin:"auto"}}>
      <div data-testid="v4-stage" style={{aspectRatio:"16 / 9",overflow:"hidden",position:"relative",isolation:"isolate",border:"1px solid #344c68",background:"radial-gradient(circle at 58% 28%,#14376b,#0a1224 56%,#060a13)",borderRadius:8,boxShadow:"0 20px 90px #0009"}}>
        {(isFinal||isIntro)?<div style={{height:"100%",display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",gap:14}}>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(65px,15vw,225px)",color:COLOURS.ice,textShadow:"0 0 55px #4466ff",transform:"perspective(500px) rotateY("+(time*10%19-9)+"deg)"}}>EK.</div>
          <h1 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(18px,4vw,60px)",margin:0,textAlign:"center"}}>{isIntro?"NOT A PORTFOLIO.":"DON'T JUST WATCH."}</h1>
          <span style={{color:COLOURS.ice,...mono,fontSize:"clamp(9px,1.5vw,22px)"}}>{isIntro?"A WORLD TO ENTER.":"WWW.EDMUNDOKUTUZOV.ART ↗"}</span>
        </div>:<div style={{position:"absolute",inset:"5% 4%",background:"#0a1322",border:"1px solid #425d83",borderRadius:12,overflow:"hidden",boxShadow:"0 0 35px #061020"}}>
          <div style={{height:"7%",display:"flex",alignItems:"center",gap:7,background:"#14223b",padding:"0 2%"}}>
            {["#f27b80","#f4bf6c","#7cddb4"].map(c=><span key={c} style={{height:9,width:9,borderRadius:"50%",background:c}}/>)}
            <span style={{flex:1,textAlign:"center",fontSize:"clamp(8px,1vw,14px)",color:"#a7c7ed",...mono}}>⌁ edmundo'kutuzov.art'+scene.path</span>
          </div>
          <div style={{height:"11%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 4%",borderBottom:"1px solid #344c68"}}>
            <span style={{fontSize:"clamp(20px,2.7vw,36px)",fontWeight:800}}>EK.</span>
            <span style={{fontSize:"clamp(7px,1.1vw,13px)",color:COLOURS.ice,...mono}}>MAPUTO · AVAILABLE FOR PROJECTS</span>
            <span style={{fontSize:"clamp(10px,1.2vw,16px)",...mono}}>EN / PT　　MENU ☰</span>
          </div>
          <div style={{height:"82%",position:"relative"}}>
            <SiteContent name={scene.name} local={local} time={time}/>
          </div>
        </div>}
        <div style={{position:"absolute",left:"4%",right:"4%",bottom:"1.5%",display:"flex",justifyContent:"space-between",...mono,fontSize:"clamp(8px,1vw,13px)",color:COLOURS.ice}}>
          <span>{scene.name}</span><span>{String(Math.floor(time)).padStart(2,"0")} / 30</span>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,width:(progress*100)+"%",height:3,background:COLOURS.ice,boxShadow:"0 0 10px #4466ff"}}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:14,marginTop:20}}>
        <button type="button" onClick={()=>{if(time>=V4_DURATION)seek(0);setPlaying(p=>!p)}} style={{padding:"12px 25px",border:0,borderRadius:22,background:COLOURS.blue,color:"#fff",cursor:"pointer"}}>{playing?"PAUSA":"REPRODUZIR"}</button>
        <button type="button" onClick={()=>{seek(0);setPlaying(true)}} style={{padding:"11px 19px",border:"1px solid #344c68",borderRadius:22,background:"#101d30",color:"#fff",cursor:"pointer"}}>RECOMEÇAR</button>
        <input aria-label="Tempo da versão 4" type="range" min="0" max={V4_DURATION} step=".05" value={time} onChange={e=>seek(Number(e.target.value))} style={{flex:"1 1 200px",accentColor:COLOURS.ice}}/>
        <span style={{...mono,color:COLOURS.ice,fontSize:12}}>{time.toFixed(1)} / 30.0</span>
      </div>
      <p style={{color:"#9bb4d1",marginTop:16,lineHeight:1.6,maxWidth:880,fontSize:14}}>V4 — demonstração cinematográfica autónoma de navegação pelo portfólio. A conversa com Jarvis é encenada para o filme; esta pré-visualização não envia mensagens ao serviço real. O master MP4 de 30 segundos é uma renderização separada. As versões V1, V2 e V3 não foram alteradas.</p>
      <a href="https://edmundokutuzov.art" target="_blank" rel="noopener noreferrer" style={{color:COLOURS.ice,...mono,fontSize:13}}>EXPLORAR O SITE REAL ↗</a>
    </div>
  </main>;
}
