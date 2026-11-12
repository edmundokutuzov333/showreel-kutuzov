import { useRef } from "react";
import { useReel } from "@/hooks/useReel";
import Stage from "@/components/reel/Stage";
import Controls from "@/components/reel/Controls";
import Storyboard from "@/components/reel/Storyboard";

const FORMATS=[
  {id:"wide",label:"Original · 16:9",detail:"1920 × 1080 · original preservado"},
  {id:"story",label:"Stories · 9:16",detail:"1080 × 1920 · edição vertical independente"},
  {id:"feed",label:"Feed vertical · 4:5",detail:"1080 × 1350 · edição vertical independente"},
];
const OUTPUT={
  wide:{ratio:"16:9",width:1920,height:1080},
  story:{ratio:"9:16",width:1080,height:1920},
  feed:{ratio:"4:5",width:1080,height:1350},
};
const VERSIONS = [
  {id:"v1", label:"Versão 1", sub:"Editorial · reconstrução", desc:"Homenagem programada ao Motion V1 de 52 segundos. O MP4 histórico não está neste repositório."},
  {id:"v2", label:"Versão 2", sub:"Original · arquivo 3D", desc:"A experiência interactiva original preservada: galáxia, campanhas, clientes e assinatura."},
  {id:"v3", label:"Versão 3", sub:"Final Cut · V2 restored", desc:"Intro, galáxia e índice originais da V2. Seis campanhas sem duplicações, quatro categorias em trios, 20 marcas e uma assinatura EK 3D mais cinemática."}
];

export default function ReelStudio() {
  const r=useReel();
  const stageRef=useRef(null);
  const fullscreen=()=>stageRef.current?.requestFullscreen?.();
  const selected=VERSIONS.find(v=>v.id===r.version);
  const output=OUTPUT[r.format];
  return (
    <div className="grain min-h-screen bg-[var(--bg)] text-bone">
      <header className="px-6 md:px-12 pt-8 flex items-start justify-between gap-6">
        <div className="reveal">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--ember)]">EDMUNDO KUTUZOV / MOTION ARCHIVE / 2026</p>
          <h1 data-testid="studio-title" className="mt-2 font-display text-3xl md:text-5xl font-bold leading-none">{r.version==="v3"?"The work moves.":"Break the frame."}</h1>
        </div>
        <div className="text-right font-mono text-[10px] tracking-[0.25em] uppercase text-white/45 space-y-1">
          <p>{output.ratio} · {output.width}×{output.height} · {r.duration}s</p>
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
        <section className="mx-auto mb-7 max-w-[980px]" aria-label="Versão 4 — Site Experience">
          <a data-testid="reel-version-v4" href="/v4"
            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-[#9cc6f5]/40 bg-gradient-to-r from-[#15284b] via-[#0e1a31] to-[#0a0d15] px-5 py-5 hover:border-[#9cc6f5] transition-colors">
            <div>
              <p className="font-mono text-[10px] text-[#9cc6f5] tracking-[.25em] uppercase">04 / New cinematic edition</p>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl mt-2">Versão 4 <span className="font-normal text-white/65">/ Enter the Experience</span></h2>
              <p className="font-mono text-[10px] text-white/60 mt-2">30 segundos · navegação pelo site · Jarvis simulado · V1–V3 preservadas</p>
            </div>
            <span className="shrink-0 rounded-full border border-[#9cc6f5]/45 px-5 py-3 font-mono text-[10px] text-[#9cc6f5] group-hover:bg-[#9cc6f5] group-hover:text-[#0a0d15] transition-colors">ABRIR V4 ↗</span>
          </a>
        </section>
        {r.version==="v3"&&(
          <section data-testid="reel-format-selector" aria-label="Variações de formato da versão 3"
            className="mx-auto mb-7 max-w-[980px]">
            <p className="mb-3 font-mono text-[10px] tracking-[.22em] uppercase text-[#9cc6f5]">
              V3 · Três composições independentes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {FORMATS.map(f=><button key={f.id} type="button"
                data-testid={"reel-format-"+f.id} aria-pressed={r.format===f.id}
                disabled={r.recording!==null} onClick={()=>r.setFormat(f.id)}
                className={"rounded-xl border text-left px-4 py-3 transition-colors disabled:opacity-40 "+
                  (r.format===f.id?"bg-[#4466ff]/15 border-[#9cc6f5]":"bg-white/[.025] border-white/15 hover:border-white/40")}>
                <span className="block font-display font-bold text-sm">{f.label}</span>
                <span className="block mt-1 font-mono text-[9px] tracking-wider text-white/50">{f.detail}</span>
              </button>)}
            </div>
          </section>
        )}
        <div className="mx-auto" style={{maxWidth:r.format==="wide"?
          "max(640px, calc((100vh - 260px) * 16 / 9))":"min(100%, 560px)"}}>
          <Stage key={r.version+"-"+r.format} ref={stageRef} r={r}/>
          <Controls r={r} onFullscreen={fullscreen}/>
          {r.error&&<p role="status" data-testid="reel-error" className="mt-4 font-mono text-[11px] text-[#ffadad]">{r.error}</p>}
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-white/50">{selected.desc}</p>
          <p className="mt-3 font-mono text-[10px] tracking-[.09em] text-white/35">
            Reprodução em tempo real. A exportação MP4 usa H.264 e instrumental AAC, em fotogramas renderizados na resolução real seleccionada. O original mantém as quatro qualidades; Stories exporta em 1080×1920 e o feed em 1080×1350. Quando terminar, clique em Descarregar agora. Mantenha o separador aberto.
          </p>
        </div>
        {r.version==="v2"&&<Storyboard time={r.time} lines={r.lines} onSeek={r.seek}/>}
        {r.version==="v3"&&<div className="max-w-[1180px] mx-auto mt-20">
          <section aria-label="Capítulos do filme" className="border-t border-white/15 pt-8">
            <p className="font-mono text-[10px] text-[#9cc6f5] tracking-[.3em] uppercase">THE FINAL CUT / V2 OPENING / 60 SECONDS</p>
            <div className="mt-3 flex flex-wrap justify-between gap-4 items-end">
              <h2 className="font-display text-2xl md:text-4xl font-bold">Every frame has a purpose.</h2>
              <span className="font-mono text-[10px] text-white/45">06 CAMPAIGNS / 38 UNIQUE ARTWORKS / 20 BRANDS</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-8">
              {[[0,"V2 INTRO"],[3.6,"GALAXY"],[13.8,"INDEX"],[21,"CAMPAIGNS"],
                [34.2,"VISUAL PRACTICE"],[45,"BRANDS"],[53.5,"EK 3D"]].map(([time,heading],i)=>
                <button type="button" key={heading} onClick={()=>r.seek(time)}
                  className="text-left border-t border-white/20 hover:border-[#9cc6f5] pt-4 pb-2 transition-colors group">
                  <span className="font-mono text-[10px] text-white/45">0{i+1} / {time.toFixed(1)}s</span>
                  <span className="block font-display font-bold mt-2 text-sm group-hover:text-[#9cc6f5]">{heading}</span>
                </button>)}
            </div>
          </section>
          <section aria-label="As seis campanhas" className="border-t border-white/15 mt-16 pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[.3em] text-[#9cc6f5]">CAMPAIGN DESIGN / COMPLETE COLLECTIONS</p>
            <h2 className="font-display text-2xl md:text-4xl font-bold mt-3">Six campaigns. No repeats.</h2>
            <div className="grid md:grid-cols-2 gap-3 mt-8">
              {[
                ["icor-depressao","A Depressão é Real","ICOR",10,21],
                ["diga-yes","Diga YES & Viva o Mundo Online","WEBMASTERS",9,23.2],
                ["cozinhar-arte","Cozinhar é Arte","PEMBE MOZ",2,25.4],
                ["agua-e-vida","Água é Vida e Você é 100% Água","FONTE FRESCA",3,27.6],
                ["super-mares","Viva a Experiência no Super Marés","SUPER MARÉS",7,29.8],
                ["we-are-giz","We Are GIZ","GIZ",6,32],
              ].map(([slug,title,client,count,start],i)=>
                <button key={slug} type="button" onClick={()=>r.seek(start)}
                  className="group border border-white/10 hover:border-[#9cc6f5]/75 bg-white/[.028] text-left overflow-hidden transition-colors">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-[43%] min-h-[220px] relative bg-[#111b2e] overflow-hidden">
                      <img src={"/reel/campaigns/"+slug+"/00.webp"} alt={title} loading="lazy"
                        className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.045] transition-transform duration-700"/>
                      <span className="absolute top-3 left-3 bg-[#0a0d15]/80 text-[#9cc6f5] p-2 font-mono text-[10px]">{String(i+1).padStart(2,"0")} / 06</span>
                    </div>
                    <div className="p-5 sm:w-[57%] flex flex-col justify-between min-w-0">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#9cc6f5]">{client} / CAMPAIGN DESIGN</p>
                        <h3 className="font-display font-bold text-lg md:text-xl mt-3 leading-tight break-words">{title}</h3>
                      </div>
                      <div className="mt-6">
                        <div className="flex gap-1 h-14">
                          {Array.from({length:Math.min(count,4)},(_,j)=>
                            <div key={j} className="flex-1 min-w-0 overflow-hidden bg-[#10192d]">
                              <img src={slug==="cozinhar-arte" && j===1 ? "/reel/img/147.webp" :
                                 "/reel/campaigns/"+slug+"/"+String(j).padStart(2,"0")+".webp"} loading="lazy" alt=""
                                className="w-full h-full object-contain"/>
                            </div>)}
                        </div>
                        <div className="flex justify-between items-center gap-2 mt-4 font-mono text-[10px]">
                          <span className="text-white/45">{count} {count===1?"ARTE":"ARTES"}</span>
                          <span className="text-[#9cc6f5]">{start.toFixed(1)}s / VER NO FILME</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>)}
            </div>
          </section>
          <section aria-label="Categorias do portfólio" className="border-t border-white/15 mt-16 pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[.3em] text-[#9cc6f5]">BEYOND CAMPAIGNS</p>
            <h2 className="font-display text-2xl md:text-4xl font-bold mt-3">Three at a time. Never twice.</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-7">
              {[[34.2,"SOCIAL MEDIA"],[36.9,"MANIPULATION"],[39.6,"SOME DEZAINES*"],
                [42.3,"VIDEO"]].map(([time,name],i)=>
                <button key={name} type="button" onClick={()=>r.seek(time)}
                  className="border border-white/15 hover:border-[#9cc6f5] bg-white/[.025] p-5 text-left transition-colors">
                  <span className="block font-mono text-[10px] text-white/40">0{i+1} / {time.toFixed(1)}s</span>
                  <span className="block font-display font-bold text-xs md:text-sm mt-4">{name}</span>
                </button>)}
            </div>
            <p className="font-mono text-[10px] text-white/40 leading-relaxed mt-5">
              Apenas as campanhas têm títulos individuais. Os outros trabalhos surgem em conjuntos de três, sem repetir artes.
              As 20 marcas identificam colaborações profissionais, não atribuições das campanhas anteriores.
            </p>
          </section>
        </div>}
      </main>
    </div>
  );
}
