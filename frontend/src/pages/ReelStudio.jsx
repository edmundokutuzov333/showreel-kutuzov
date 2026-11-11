import { useRef } from "react";
import { useReel } from "@/hooks/useReel";
import Stage from "@/components/reel/Stage";
import Controls from "@/components/reel/Controls";
import Storyboard from "@/components/reel/Storyboard";

const VERSIONS = [
  {id:"v1", label:"Versão 1", sub:"Editorial · reconstrução", desc:"Homenagem programada ao Motion V1 de 52 segundos. O MP4 histórico não está neste repositório."},
  {id:"v2", label:"Versão 2", sub:"Original · arquivo 3D", desc:"A experiência interactiva original preservada: galáxia, campanhas, clientes e assinatura."},
  {id:"v3", label:"Director's Cut", sub:"Novo · Breach 2026", desc:"60 segundos de novas metamorfoses cinematográficas, editorial, materiais, ritmo e assinatura."}
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
          <h1 data-testid="studio-title" className="mt-2 font-display text-3xl md:text-5xl font-bold leading-none">Break the frame.</h1>
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
            Reprodução em tempo real. A exportação usa MediaRecorder e depende da capacidade gráfica do dispositivo e da disponibilidade das vozes. Para a gravação, mantenha o separador visível.
          </p>
        </div>
        {r.version==="v2"&&<Storyboard time={r.time} lines={r.lines} onSeek={r.seek}/>}
        {r.version==="v3"&&<section className="max-w-[980px] mx-auto mt-20 border-t border-white/10 pt-6">
          <p className="font-mono text-[10px] tracking-[.3em] uppercase text-[#9cc6f5]">DIRECTOR'S CUT / THE CHAPTERS</p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            {[[0,"BREACH"],[7,"ARTWORK"],[14,"MATERIALS"],[21,"EDITORIAL"],[28,"MACHINE"],[38,"OVERLOAD"],[45,"PROOF"],[50,"CREATOR"],[56,"SIGNATURE"]].map(([t,label])=><button key={label} onClick={()=>r.seek(t)} className="text-left border-t border-white/15 hover:border-[#9cc6f5] pt-3 transition-colors">
              <span className="font-mono text-xs text-white/40">{String(t).padStart(2,"0")}s</span>
              <span className="block mt-1 text-xs font-display font-semibold">{label}</span>
            </button>)}
          </div>
        </section>}
      </main>
    </div>
  );
}
