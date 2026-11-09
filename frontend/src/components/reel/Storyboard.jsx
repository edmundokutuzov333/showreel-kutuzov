import { BLOCKS, fmt } from "@/reel/storyboard";

function BlockCard({ b, active, onSeek }) {
  return (
    <button data-testid={`storyboard-block-${b.id}`} onClick={() => onSeek(b.from)}
      className={`text-left p-6 border-t transition-colors duration-300 ${active ? "border-[var(--ember)] bg-white/[0.03]" : "border-white/10 hover:bg-white/[0.02]"}`}>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.25em] text-[var(--ember)]">({b.n})</span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 tabular-nums">{b.from}s — {b.to}s</span>
      </div>
      <h3 className="mt-8 font-display text-2xl font-semibold text-bone">{b.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/55">{b.desc}</p>
    </button>
  );
}

export default function Storyboard({ time, lines, onSeek }) {
  return (
    <section data-testid="storyboard" className="mt-24">
      <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/45 mb-6">Roteiro visual · 4 blocos</p>
      <div className="grid md:grid-cols-4">
        {BLOCKS.map((b) => <BlockCard key={b.id} b={b} active={time >= b.from && time < b.to} onSeek={onSeek} />)}
      </div>
      <div className="mt-20 grid md:grid-cols-[220px_1fr] gap-10">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/45">Narração</p>
          <p className="mt-3 text-sm text-white/50 leading-relaxed">Voz grave e cinematográfica, sincronizada com os cortes. A trilha baixa automaticamente sob a voz.</p>
        </div>
        <ol data-testid="narration-lines" className="divide-y divide-white/[0.07]">
          {lines.map((l) => {
            const on = time >= l.t && time < l.t + 3;
            return (
              <li key={l.i}>
                <button data-testid={`narration-line-${l.i}`} onClick={() => onSeek(Math.max(0, l.t - 0.5))}
                  className="w-full flex items-baseline gap-6 py-4 text-left group">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-white/35 tabular-nums w-20">{fmt(l.t)}</span>
                  <span className={`font-display text-lg md:text-xl transition-colors duration-300 ${on ? "text-[var(--ember)]" : "text-white/80 group-hover:text-white"}`}>{l.text}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

