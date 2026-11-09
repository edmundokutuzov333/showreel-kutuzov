import { useRef } from "react";
import { useReel } from "@/hooks/useReel";
import Stage from "@/components/reel/Stage";
import Controls from "@/components/reel/Controls";
import Storyboard from "@/components/reel/Storyboard";

export default function ReelStudio() {
  const r = useReel();
  const stageRef = useRef(null);
  const fullscreen = () => stageRef.current && stageRef.current.requestFullscreen && stageRef.current.requestFullscreen();
  return (
    <div className="grain min-h-screen bg-[var(--bg)] text-bone">
      <header className="px-6 md:px-12 pt-8 flex items-start justify-between gap-6">
        <div className="reveal" style={{ animationDelay: "0ms" }}>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--ember)]">Showreel · 2026</p>
          <h1 data-testid="studio-title" className="mt-2 font-display text-3xl md:text-5xl font-bold leading-none">Edmundo Kutuzov</h1>
        </div>
        <div className="reveal text-right font-mono text-[10px] tracking-[0.25em] uppercase text-white/45 space-y-1" style={{ animationDelay: "120ms" }}>
          <p>16:9 · 1920×1080 · 60s · 155 obras</p>
          <p>Art Director · Maputo</p>
          <a data-testid="site-link" href="https://edmundokutuzov.art" target="_blank" rel="noreferrer" className="text-[var(--ember)] hover:text-white">edmundokutuzov.art ↗</a>
        </div>
      </header>
      <main className="px-6 md:px-12 pt-10 pb-28 max-w-[1500px] mx-auto">
        <div className="reveal mx-auto" style={{ animationDelay: "220ms", maxWidth: "max(640px, calc((100vh - 230px) * 16 / 9))" }}>
          <Stage ref={stageRef} r={r} />
          <Controls r={r} onFullscreen={fullscreen} />
          {r.error && (
            <p data-testid="reel-error" onClick={() => r.setError("")} className="mt-4 font-mono text-[11px] tracking-[0.15em] text-red-300 cursor-pointer">{r.error}</p>
          )}
          <p className="mt-4 font-mono text-[10px] tracking-[0.18em] text-white/35">
            Mova o rato sobre o vídeo para sentir a profundidade. A exportação grava em tempo real (60s) com som e voz, sem o efeito do rato. Use Chrome ou Edge e mantenha o separador visível.
          </p>
        </div>
        <Storyboard time={r.time} lines={r.lines} onSeek={r.seek} />
      </main>
    </div>
  );
}

