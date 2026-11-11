import { useRef } from "react";
import { useReel } from "@/hooks/useReel";
import Stage from "@/components/reel/Stage";
import Controls from "@/components/reel/Controls";
import Storyboard from "@/components/reel/Storyboard";

const VERSIONS = [
  {id:"v1", label:"Versão 1", sub:"Editorial · reconstrução", desc:"Homenagem programada ao Motion V1 de 52 segundos. O MP4 histórico não está neste repositório."},
  {id:"v2", label:"Versão 2", sub:"Original · arquivo 3D", desc:"A experiência interactiva original preservada: galáxia, campanhas, clientes e assinatura."},
  {id:"v3", label:"Versão 3", sub:"A Point of View · Cinema 2026", desc:"Uma montagem de 60 segundos com campanhas reais seleccionadas, 20 clientes em grupos de quatro e a assinatura original em 3D."}
];

export default function ReelStudio() {
  const r=useReel();
  const stageRef=useRef(null);
  const fullscreen=()=>stageRef.current?.requestFullscreen?.();
  const selected=VERSIONS.find(v=>v.id===r.version);
  return (
    <div className="grain min-h-screen bg-[var(--bg)] text-bone">
      <header className="px-6 md:px-12 pt-8 flex items-start justify-between gap-6">
        <div className="reveal">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--ember)]">EDMUNDO KUTUZOV / MOTION ARCHIVE / 2026</p>
          <h1 data-testid="studio-title" className="mt-2 font-display text-3xl md:text-5xl font-bold leading-none">{r.version==="v3"?"A point of view.":"Break the frame."}</h1>
        </div>
        <div className="text-right font-mono text-[10px] tracking-[0.25em] uppercase text-white/45 space-y-1">
          <p>16:9 · 1920×1080 · {r.duration}s</p>
          <p>Art Director · Maputo</p>
          <a href="https://edmundokutuzov.art" target="_blank" rel="noreferrer" className="text-[var(--ember)] hover:text-white">edmundokutuzov.art ↗</a>
        </div>
      </header>
      <main className="px-6 md:px-12 pt-10 pb-28 max-w-[1500px] mx-auto">
        <section aria-label="Seleccionar versão" className="mx-auto mb-7 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-[980px]" data-testid="reel-version-selector">
          {VERSIONS.map(v=><button key={v.id} type="button" onClick={()=>r.setVersion(v.id)}
            disabled={r.recording!==null} aria-pressed={v.id===r.version} data-testid={`reel-version-${v.id}`}
            className={`text-left group rounded-xl px-5 py-4 border transition-all duration-300 disabled:opacity-40 ${v.id===r.version?"border-[#9cc6f5] bg-[#4466ff]/15 shadow-[inset_0_1px_0_rgba(156,198,245,.18)]":"border-white/10 bg-white/[.025] hover:border-white/30"}`}>
            <div className="flex justify-between items-center">
              <span className="font-display text-lg font-bold">{v.label}</span>
              <span className={`h-2 w-2 rounded-full ${v.id===r.version?"bg-[#9cc6f5]":"bg-white/20"}`}/>
            </div>
            <span className="block mt-1 font-mono text-[10px] uppercase tracking-[.15em] text-white/50">{v.sub}</span>
          </button>)}
        </section>
        <div className="mx-auto" style={{maxWidth:"max(640px, calc((100vh - 260px) * 16 / 9))"}}>
          <Stage key={r.version} ref={stageRef} r={r}/>
          <Controls r={r} onFullscreen={fullscreen}/>
          {r.error&&<p role="status" data-testid="reel-error" className="mt-4 font-mono text-[11px] text-[#ffadad]">{r.error}</p>}
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-white/50">{selected.desc}</p>
          <p className="mt-3 font-mono text-[10px] tracking-[.09em] text-white/35">
            Reprodução em tempo real. A gravação capta vídeo e áudio em tempo real, com a opção de voz seleccionada. Depois de concluída, clique em Descarregar agora. Mantenha este separador visível. A extensão MP4 ou WebM depende do navegador.
          </p>
        </div>
        {r.version==="v2"&&<Storyboard time={r.time} lines={r.lines} onSeek={r.seek}/>}
        {r.version==="v3"&&<div className="max-w-[1120px] mx-auto mt-20">
          <section aria-label="Capítulos do filme" className="border-t border-white/15 pt-7">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[10px] tracking-[.30em] uppercase text-[#9cc6f5]">A POINT OF VIEW / FILM INDEX</p>
                <h2 className="mt-3 font-display text-2xl md:text-4xl font-bold tracking-tight">Eight chapters. One signature.</h2>
              </div>
              <span className="font-mono text-[10px] text-white/40 whitespace-nowrap">60:00 / 16:9</span>
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-7">
              {[[3.6,"THE MARK"],[7.7,"HUMAN STORIES"],[14.2,"BRAND WORLDS"],[22,"DIGITAL CULTURE"],
                [30,"CULTURE & IMPACT"],[38,"THE CRAFT"],[45,"COLLABORATIONS"],[54,"SIGNATURE"]
              ].map(([t,label],i)=><button type="button" key={label} onClick={()=>r.seek(t)}
                className="text-left group border-t border-white/15 hover:border-[#9cc6f5] pt-3 transition-colors">
                <span className="font-mono text-[10px] text-white/35">0{i+1} / {t.toFixed(1)}s</span>
                <span className="block mt-1.5 text-xs font-display font-semibold tracking-[.05em] group-hover:text-[#9cc6f5] transition-colors">{label}</span>
              </button>)}
            </div>
          </section>
          <section aria-label="Campanhas seleccionadas" className="mt-16 border-t border-white/15 pt-7">
            <p className="font-mono text-[10px] tracking-[.30em] uppercase text-[#9cc6f5]">THE FILM / SELECTED WORK</p>
            <div className="mt-3 flex items-end justify-between gap-6">
              <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight">The work. Not the noise.</h2>
              <a href="https://edmundokutuzov.art/work" target="_blank" rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-[.1em] text-[#9cc6f5] hover:text-white">Full portfolio ↗</a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-7">
              {[
                {id:139,t:8,name:"A Depressão é Real",brand:"ICOR"},
                {id:140,t:14.3,name:"Para quem tu queres",brand:"KITKAT"},
                {id:143,t:22.2,name:"Diga Yes & Viva Online",brand:"WEBMASTERS"},
                {id:146,t:30.2,name:"We Are GIZ",brand:"GIZ"},
                {id:145,t:32.8,name:"Viva a Experiência",brand:"SUPER MARÉS"},
                {id:147,t:35.4,name:"Jimmys Killer",brand:"JIMMYS KILLER"}
              ].map((work,i)=><button type="button" key={work.id} onClick={()=>r.seek(work.t)}
                className="group relative overflow-hidden text-left bg-white/[.035] border border-white/10 hover:border-[#9cc6f5]/70 transition-colors">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={`/reel/img/${String(work.id).padStart(3,"0")}.webp`} loading="lazy" alt={work.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d15]/70 to-transparent"/>
                  <span className="absolute bottom-3 left-4 font-mono text-[10px] text-white/80 tracking-[.1em]">{work.brand}</span>
                  <span className="absolute bottom-3 right-4 text-white/75 font-mono text-[10px]">{String(i+1).padStart(2,"0")}</span>
                </div>
                <div className="px-4 py-4 flex items-center justify-between gap-3">
                  <span className="font-display font-semibold text-sm">{work.name}</span>
                  <span className="font-mono text-[10px] text-[#9cc6f5] whitespace-nowrap">{work.t}s ↗</span>
                </div>
              </button>)}
            </div>
            <p className="font-mono text-[10px] leading-relaxed mt-5 text-white/40">
              A sequência de campanhas apresenta projectos identificados no portfólio. Os 20 logótipos seguintes identificam colaborações, não necessariamente a autoria de campanhas para cada marca.
            </p>
          </section>
        </div>}
      </main>
    </div>
  );
}
