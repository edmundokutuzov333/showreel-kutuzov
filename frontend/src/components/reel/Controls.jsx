import { Play, Pause, RotateCcw, Maximize2, Download, Circle, Orbit } from "lucide-react";
import Timeline from "@/components/reel/Timeline";

const RESOLUTIONS = [
 ["720p","720p (HD)"], ["1080p","1080p (Full HD)"],
 ["1440p","1440p (QHD)"], ["2160p","4K (UHD / 2160p)"]
];

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#9cc6f5]">Instrumental · sem voz</span>
          <div data-testid="export-resolution-options" role="group" aria-label="Resolução do vídeo MP4"
            className="flex flex-wrap gap-1 rounded-xl border border-white/15 p-1">
            {RESOLUTIONS.map(([key,label]) => (
              <button key={key} type="button" data-testid={"export-quality-"+key}
                disabled={busy} aria-pressed={r.quality===key} onClick={() => r.setQualityPreset(key)}
                className={"px-3 h-9 rounded-lg font-mono text-[10px] transition-colors disabled:opacity-40 " +
                  (r.quality===key ? "bg-[#9cc6f5] text-[#0a0d15] font-semibold" : "text-white/60 hover:text-white hover:bg-white/10")}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!r.isVertical && (
          <button data-testid="explore-mode-button" onClick={() => r.setMode(r.mode === "explore" ? "reel" : "explore")} disabled={!r.ready || busy}
            className={`h-11 px-5 rounded-full border font-mono text-[11px] tracking-[0.22em] uppercase flex items-center gap-2 transition-colors duration-200 disabled:opacity-40 ${r.mode === "explore" ? "bg-[var(--ember)] text-[var(--bg)] border-[var(--ember)]" : "border-white/12 text-bone hover:bg-white hover:text-[var(--bg)]"}`}>
            <Orbit size={15} /> {r.mode === "explore" ? "A explorar" : "Explorar arquivo"}
          </button>
          )}
          <IconBtn testid="fullscreen-button" onClick={onFullscreen} disabled={!r.ready} label="Ecrã inteiro"><Maximize2 size={16} /></IconBtn>
          <button data-testid="export-video-button" onClick={r.exportVideo} disabled={!r.ready || busy}
            className="h-11 px-5 rounded-full bg-[var(--primary)] text-white font-mono text-[11px] tracking-[0.22em] uppercase flex items-center gap-2 hover:bg-[#5a78ff] transition-colors duration-200 disabled:opacity-50">
            {busy ? <Circle size={12} className="fill-red-500 text-red-500 animate-pulse" /> : <Download size={15} />}
            {busy ? "A exportar MP4 "+Math.round(r.recording * 100)+"%" :
              "Exportar "+RESOLUTIONS.find(([key])=>key===r.quality)?.[1]+" · MP4"}
          </button>
        </div>
      </div>
      {r.download && (
        <div role="status" data-testid="download-ready" className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#9cc6f5]/35 bg-[#4466ff]/10 px-4 py-3">
          <span className="font-mono text-[11px] leading-relaxed text-white/75">
            Vídeo pronto · {(r.download.size / 1e6).toFixed(1)} MB · MP4 H.264 + AAC ·
            {" "+r.download.width+" × "+r.download.height+" · "+r.download.fps+" fps · instrumental"}
          </span>
          <a data-testid="download-link" href={r.download.url} download={r.download.name}
            className="inline-flex items-center gap-2 rounded-full bg-[#9cc6f5] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#0a0d15] hover:bg-white transition-colors">
            <Download size={15} /> Descarregar agora
          </a>
        </div>
      )}
    </div>
  );
}

