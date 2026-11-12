import { forwardRef } from "react";
import { Play } from "lucide-react";
import ExploreOverlay from "@/components/reel/ExploreOverlay";

function BreachGate({ r }) {
  if (r.isVertical) return (
    <button data-testid="breach-gate" onClick={r.toggle}
      className="group absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[var(--bg)] text-bone">
      <span className="font-mono text-[10px] uppercase tracking-[.3em] text-[#9cc6f5]">V3 / {r.format==="story"?"9:16":"4:5"}</span>
      <span className="font-display text-3xl sm:text-4xl font-bold text-center">THE WORK<br />MOVES.</span>
      <span className="font-mono text-[10px] tracking-[.25em] text-white/60">TOCAR PARA REPRODUZIR</span>
    </button>
  );
  return (
    <button data-testid="breach-gate" onClick={r.toggle} className="group absolute inset-0 bg-[var(--bg)] text-left overflow-hidden">
      <span className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--ember)] shadow-[0_0_24px_4px_rgba(68,102,255,0.55)] gate-line" />
      <span className="absolute left-[6%] top-[9%] font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white/70">Edmundo Kutuzov<br /><span className="text-[var(--ember)]">Art Director · Maputo</span></span>
      <span className="absolute right-[6%] top-[9%] text-right font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[var(--ember)]">-25.9692 / 32.5732<br /><span className="text-white/50">Depth 000</span></span>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-8 md:translate-y-12 flex flex-col items-center gap-3 whitespace-nowrap">
        <span className="font-mono text-[10px] md:text-xs tracking-[0.35em] uppercase text-white/80 group-hover:text-white transition-colors duration-300">Click · Enter / Space</span>
        <span className="font-display text-2xl md:text-4xl font-bold text-bone gate-breach">to breach</span>
      </span>
      <span className="absolute left-[6%] bottom-[9%] font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Showreel · {r.duration}s · som ligado</span>
    </button>
  );
}

const Stage = forwardRef(function Stage({ r }, ref) {
  const pos = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    return [(e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height];
  };
  const fresh = r.ready && !r.playing && r.recording === null && r.mode === "reel" && r.time < 0.01;
  const paused = r.ready && !r.playing && r.recording === null && r.mode === "reel" && r.time >= 0.01 && r.time < r.duration - 0.1;
  return (
    <div ref={ref} data-testid="reel-stage" className={`reel-stage relative w-full ${r.isVertical ? "" : "aspect-video"} bg-black overflow-hidden ${r.mode === "explore" ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={r.isVertical ? {aspectRatio:r.aspectRatio} : undefined}
      onPointerMove={(e) => r.pointer("move", ...pos(e))}
      onPointerDown={(e) => r.pointer("down", ...pos(e))}
      onPointerUp={(e) => r.pointer("up", ...pos(e))}
      onPointerLeave={() => r.pointer("leave", 0, 0)}
      onWheel={(e) => r.mode === "explore" && r.pointer("wheel", 0, 0, e.deltaY)}>
      <canvas ref={r.canvasRef} data-testid="reel-canvas" className="absolute inset-0 w-full h-full" />
      {!r.ready && (
        <div data-testid="reel-loading" className="absolute inset-0 grid place-items-center bg-[var(--bg)]">
          <div className="flex flex-col items-center gap-4">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[var(--ember)]">A carregar 155 obras · {Math.round(r.progress * 100)}%</p>
            <div className="h-px w-56 bg-white/10"><div className="h-px bg-[var(--ember)] transition-[width] duration-300" style={{ width: `${r.progress * 100}%` }} /></div>
          </div>
        </div>
      )}
      {fresh && <BreachGate r={r} />}
      {paused && (
        <button data-testid="stage-play-overlay" onClick={r.toggle} aria-label="Play"
          className="group absolute inset-0 grid place-items-center bg-black/20 hover:bg-black/5 transition-colors duration-300">
          <span className="h-16 w-16 rounded-full grid place-items-center border border-white/40 backdrop-blur-md bg-white/10 group-hover:scale-110 transition-transform duration-300">
            <Play size={22} className="text-white translate-x-[2px]" />
          </span>
        </button>
      )}
      {r.ready && !r.isVertical && !r.playing && r.recording === null && r.mode === "reel" && r.time >= r.duration - 0.1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button data-testid="stage-explore-button" onClick={() => r.setMode("explore")}
            className="h-10 px-4 rounded-full bg-[var(--primary)] font-mono text-[10px] tracking-[0.25em] uppercase text-white hover:bg-[#5a78ff] transition-colors duration-200">
            Explorar o arquivo →
          </button>
          <button data-testid="stage-replay-button" onClick={r.restart}
            className="h-10 px-4 rounded-full bg-black/50 backdrop-blur-md border border-white/20 font-mono text-[10px] tracking-[0.25em] uppercase text-white hover:bg-white hover:text-black transition-colors duration-200">
            ↺ Rever
          </button>
        </div>
      )}
      {r.mode === "explore" && <ExploreOverlay r={r} />}
      {r.recording !== null && (
        <div data-testid="recording-badge" className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur font-mono text-[10px] tracking-[0.25em] uppercase text-white flex items-center gap-2 pointer-events-none">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> A EXPORTAR MP4 · mantenha este separador aberto
        </div>
      )}
    </div>
  );
});

export default Stage;

