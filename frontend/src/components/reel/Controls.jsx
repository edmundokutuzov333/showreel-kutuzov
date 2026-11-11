import { Play, Pause, RotateCcw, Maximize2, Download, Circle, Orbit } from "lucide-react";
import Timeline from "@/components/reel/Timeline";

const LANGS = [["en", "EN"], ["pt", "PT"], ["off", "Sem voz"]];

function IconBtn({ testid, onClick, disabled, children, label }) {
  return (
    <button data-testid={testid} onClick={onClick} disabled={disabled} aria-label={label}
      className="h-11 w-11 shrink-0 grid place-items-center rounded-full border border-white/12 text-bone hover:bg-white hover:text-[var(--bg)] transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none">
      {children}
    </button>
  );
}

export default function Controls({ r, onFullscreen }) {
  const busy = r.recording !== null;
  return (
    <div data-testid="reel-controls" className="flex flex-col gap-5 pt-5">
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
        <button data-testid="play-pause-button" onClick={r.toggle} disabled={!r.ready || busy}
          className="h-11 pl-4 pr-5 rounded-full bg-[var(--bone)] text-[var(--bg)] font-mono text-[11px] tracking-[0.22em] uppercase flex items-center gap-2 hover:bg-[var(--ember)] transition-colors duration-200 disabled:opacity-40">
          {r.playing ? <Pause size={15} /> : <Play size={15} />}
          {r.playing ? "Pausa" : "Play"}
        </button>
        <IconBtn testid="restart-button" onClick={r.restart} disabled={!r.ready || busy} label="Recomeçar"><RotateCcw size={16} /></IconBtn>
        <div className="w-full md:w-auto md:flex-1 min-w-0"><Timeline time={r.time} duration={r.duration} onSeek={r.seek} disabled={!r.ready || busy} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/45">Narração</span>
          <div className="flex rounded-full border border-white/12 p-1">
            {LANGS.map(([k, l]) => (
              <button key={k} data-testid={`narration-lang-${k}`} disabled={busy || r.voLoading} onClick={() => r.setLang(k)}
                className={`px-4 h-8 rounded-full font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 ${r.lang === k ? "bg-[var(--primary)] text-white" : "text-white/60 hover:text-white"}`}>
                {l}
              </button>
            ))}
          </div>
          {r.voLoading && <span data-testid="narration-loading" className="font-mono text-[10px] tracking-[0.2em] text-[var(--ember)] uppercase">a carregar voz…</span>}
        </div>
        <div className="flex items-center gap-3">
          <button data-testid="explore-mode-button" onClick={() => r.setMode(r.mode === "explore" ? "reel" : "explore")} disabled={!r.ready || busy}
            className={`h-11 px-5 rounded-full border font-mono text-[11px] tracking-[0.22em] uppercase flex items-center gap-2 transition-colors duration-200 disabled:opacity-40 ${r.mode === "explore" ? "bg-[var(--ember)] text-[var(--bg)] border-[var(--ember)]" : "border-white/12 text-bone hover:bg-white hover:text-[var(--bg)]"}`}>
            <Orbit size={15} /> {r.mode === "explore" ? "A explorar" : "Explorar arquivo"}
          </button>
          <IconBtn testid="fullscreen-button" onClick={onFullscreen} disabled={!r.ready} label="Ecrã inteiro"><Maximize2 size={16} /></IconBtn>
          <button data-testid="export-video-button" onClick={r.exportVideo} disabled={!r.ready || busy}
            className="h-11 px-5 rounded-full bg-[var(--primary)] text-white font-mono text-[11px] tracking-[0.22em] uppercase flex items-center gap-2 hover:bg-[#5a78ff] transition-colors duration-200 disabled:opacity-50">
            {busy ? <Circle size={12} className="fill-red-500 text-red-500 animate-pulse" /> : <Download size={15} />}
            {busy ? `A gravar ${Math.round(r.recording * 100)}%` : "Exportar 1080p"}
          </button>
        </div>
      </div>
      {r.download && (
        <a data-testid="download-link" href={r.download.url} download={r.download.name}
          className="self-end font-mono text-[11px] tracking-[0.18em] text-[var(--ember)] hover:text-white underline underline-offset-4">
          ↓ {r.download.name} · {(r.download.size / 1e6).toFixed(1)} MB
        </a>
      )}
    </div>
  );
}

