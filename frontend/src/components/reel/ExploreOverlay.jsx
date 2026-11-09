import { X, ArrowUpRight } from "lucide-react";
import { FILTERS } from "@/reel/storyboard";
import { BASE } from "@/reel/assets";

const stop = (e) => e.stopPropagation();
const pad = (n) => String(n).padStart(3, "0");

function Selected({ it, onClose }) {
  return (
    <div data-testid="explore-selected-panel" onPointerDown={stop} onPointerUp={stop}
      className="absolute right-4 top-4 bottom-4 w-[min(360px,46%)] rounded-2xl bg-[#0a0d15]/80 backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-3 explore-panel">
      <button data-testid="explore-close-selected" onClick={onClose} className="self-end h-8 w-8 grid place-items-center rounded-full border border-white/15 text-white hover:bg-white hover:text-black transition-colors duration-200"><X size={14} /></button>
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden bg-black/40 grid place-items-center">
        {it.video
          ? <video src={`${BASE}/vid/${it.id}.mp4`} autoPlay muted loop playsInline className="max-h-full max-w-full object-contain" />
          : <img src={`${BASE}/img/${pad(it.id)}.webp`} alt={it.title} className="max-h-full max-w-full object-contain" />}
      </div>
      <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--ember)]">№ {pad(it.id)} — {it.brand || it.cat}</p>
      <h4 className="font-display text-xl font-bold text-bone leading-tight">{it.title}</h4>
      <a data-testid="explore-open-site" href={`https://edmundokutuzov.art/work/${it.slug}`} target="_blank" rel="noreferrer"
        className="h-10 rounded-full bg-[var(--bone)] text-[var(--bg)] font-mono text-[10px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-[var(--ember)] transition-colors duration-200">
        Ver no site <ArrowUpRight size={14} />
      </a>
    </div>
  );
}

export default function ExploreOverlay({ r }) {
  return (
    <div data-testid="explore-overlay" className="absolute inset-0 pointer-events-none">
      <div className="absolute left-4 top-4 pointer-events-auto flex flex-wrap gap-1.5 max-w-[70%]" onPointerDown={stop} onPointerUp={stop}>
        {FILTERS.map((f) => (
          <button key={f} data-testid={`explore-filter-${f.toLowerCase().replace(/ /g, "-")}`} onClick={() => r.setFilter(f)}
            className={`h-8 px-3 rounded-full font-mono text-[9px] md:text-[10px] tracking-[0.2em] uppercase border transition-colors duration-200 ${r.filter === f ? "bg-[var(--primary)] border-[var(--primary)] text-white" : "bg-black/40 backdrop-blur border-white/15 text-white/70 hover:text-white"}`}>
            {f}
          </button>
        ))}
      </div>
      <button data-testid="explore-exit-button" onClick={() => r.setMode("reel")} onPointerDown={stop} onPointerUp={stop}
        className="absolute left-4 bottom-4 pointer-events-auto h-9 px-4 rounded-full bg-black/50 backdrop-blur border border-white/20 font-mono text-[10px] tracking-[0.22em] uppercase text-white hover:bg-white hover:text-black transition-colors duration-200">
        ← Voltar ao showreel
      </button>
      {!r.selected && (
        <p className="absolute right-4 bottom-4 font-mono text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-white/50">Arrastar · Scroll para aproximar · Clicar numa obra</p>
      )}
      {r.hover && !r.selected && (
        <div data-testid="explore-hover-label" className="absolute left-1/2 top-[12%] -translate-x-1/2 px-4 py-2 rounded-full bg-black/55 backdrop-blur border border-white/10 text-center whitespace-nowrap">
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--ember)]">{r.hover.brand || r.hover.cat} · </span>
          <span className="font-display text-sm text-bone">{r.hover.title}</span>
        </div>
      )}
      {r.selected && <div className="pointer-events-auto"><Selected it={r.selected} onClose={() => r.setSelected(null)} /></div>}
    </div>
  );
}

