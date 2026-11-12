import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const VIDEO = "/v4/V4_REAL_SITE_30S.mp4";
const DURATION = 30;
const CHAPTERS = [
  [0, "Entrada original"],
  [1.8, "Home · EK em 3D"],
  [4.2, "Selected Work"],
  [6.7, "Arquivo de projectos"],
  [9.7, "Projecto individual"],
  [12.1, "Services"],
  [13, "Process"],
  [13.9, "About"],
  [16.6, "Clients"],
  [18.8, "Jarvis · demonstração"],
  [24.4, "Contact"],
  [27.7, "Assinatura final"],
];
function timecode(value) {
  return "00:" + String(Math.floor(Math.max(0, value))).padStart(2, "0");
}

/**
 * V4: actual video from a Playwright recording of the live public website.
 * The site layout, fonts, artwork, animations, Intro and Jarvis visual shell
 * are captured as rendered by the browser, rather than recreated in React.
 * The Jarvis discussion is editorially staged, not a backend guarantee.
 *
 * V1–V3 engines are entirely independent of this page.
 */
export default function SiteTourV4() {
  const videoRef = useRef(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(DURATION);
  const [error, setError] = useState("");
  const current = CHAPTERS.reduce(
    (chosen, item) => item[0] <= time ? item : chosen,
    CHAPTERS[0]
  );
  const seek = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    setTime(seconds);
    video.play().catch(() => {});
  };
  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };
  const fullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  };

  return (
    <main className="grain min-h-screen bg-[#0a0d15] text-[#e8eef6]">
      <div className="mx-auto max-w-[1540px] px-5 pb-20 pt-9 md:px-12">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Link to="/" className="font-mono text-[10px] uppercase tracking-[.24em] text-[#9cc6f5] transition-colors hover:text-white">
              ← Motion Archive
            </Link>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[.22em] text-[#9cc6f5]">04 / REAL-SITE EDITION</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.06] md:text-5xl">
              THIS IS THE SITE. <span className="text-[#9cc6f5]">IN MOTION.</span>
            </h1>
            <p className="mt-3 max-w-2xl font-mono text-[11px] leading-relaxed text-white/60">
              Navegação real captada no navegador. Layout, tipografia, arte e efeitos originais.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            16:9 / 1280 × 720 / 30 FPS / 30 SEC
          </span>
        </header>

        <section className="mt-8" aria-label="V4 — vídeo da navegação real pelo site">
          <div className="relative overflow-hidden rounded-lg border border-[#9cc6f5]/30 bg-black shadow-[0_18px_85px_rgba(16,52,112,.28)]">
            <video
              ref={videoRef}
              data-testid="v4-real-site-video"
              src={VIDEO}
              className="block aspect-video w-full bg-[#050912] object-contain"
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={(event) => {
                setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : DURATION);
                setError("");
              }}
              onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() => setError("O ficheiro não carregou. Verifique a ligação e tente novamente.")}
              aria-label="Vídeo de trinta segundos captado do site real de Edmundo Kutuzov"
            >
              O navegador não suporta vídeo MP4.
            </video>
          </div>
          {error && <p role="alert" className="mt-3 font-mono text-sm text-[#ffbaba]">{error}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={toggle} data-testid="v4-play-pause"
              className="rounded-full bg-[#9cc6f5] px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-[#09121e] transition-colors hover:bg-white">
              {playing ? "PAUSAR" : "REPRODUZIR"}
            </button>
            <button type="button" onClick={() => seek(0)}
              className="rounded-full border border-white/20 px-5 py-3 font-mono text-[11px] uppercase tracking-wider hover:border-white">
              REVER
            </button>
            <button type="button" onClick={fullscreen}
              className="rounded-full border border-white/20 px-5 py-3 font-mono text-[11px] uppercase tracking-wider hover:border-white">
              ECRÃ INTEIRO
            </button>
            <a data-testid="v4-download" href={VIDEO} download="edmundo-kutuzov-v4-site-real-30s.mp4"
              className="rounded-full border border-[#9cc6f5]/60 bg-[#4466ff]/15 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-[#9cc6f5] hover:bg-[#4466ff]/30">
              DESCARREGAR MP4 ↓
            </a>
            <span className="ml-auto font-mono text-xs tabular-nums text-[#9cc6f5]">
              {timecode(time)} / {timecode(duration)}
            </span>
          </div>
          <div className="mt-5 h-[2px] bg-white/10">
            <div className="h-full bg-[#9cc6f5]" style={{ width: String(Math.min(100, Math.max(0, 100 * time / (duration || DURATION)))) + "%" }} />
          </div>
        </section>

        <section className="mt-12 border-t border-white/10 pt-7" aria-label="Capítulos da V4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#9cc6f5]">THE JOURNEY / 12 CHAPTERS</p>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                A experiência real, num único percurso.
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              AGORA: {current[1]}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4" data-testid="v4-chapters">
            {CHAPTERS.map((chapter, index) => (
              <button
                type="button"
                key={String(chapter[0]) + chapter[1]}
                onClick={() => seek(chapter[0])}
                className={"rounded-lg border px-4 py-3 text-left transition-colors " +
                  (chapter === current ? "border-[#9cc6f5] bg-[#4466ff]/20" : "border-white/10 bg-white/[.025] hover:border-white/40")}
                aria-label={"Ir para " + chapter[1] + " às " + timecode(chapter[0])}>
                <span className="font-mono text-[10px] text-[#9cc6f5]">
                  {String(index + 1).padStart(2, "0")} / {timecode(chapter[0])}
                </span>
                <span className="mt-2 block font-display text-sm font-semibold">{chapter[1]}</span>
              </button>
            ))}
          </div>
        </section>
        <footer className="mt-10 flex flex-col gap-4 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl font-mono text-[10px] leading-relaxed text-white/55">
            Os fotogramas foram captados directamente de edmundokutuzov.art num navegador real.
            A montagem condensa as páginas principais. A conversa com o Jarvis é uma
            demonstração conceptual, não uma prova do funcionamento do backend.
          </p>
          <a href="https://edmundokutuzov.art" target="_blank" rel="noopener noreferrer"
            className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-[#9cc6f5] hover:text-white">
            ENTRAR NO SITE REAL ↗
          </a>
        </footer>
      </div>
    </main>
  );
}
