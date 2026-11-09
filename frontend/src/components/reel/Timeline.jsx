import { useRef } from "react";
import { SCENES, fmt } from "@/reel/storyboard";

const DUR = 60;

export default function Timeline({ time, onSeek, disabled }) {
  const ref = useRef(null);
  const toTime = (e) => {
    const r = ref.current.getBoundingClientRect();
    return Math.min(DUR, Math.max(0, ((e.clientX - r.left) / r.width) * DUR));
  };
  const down = (e) => {
    if (disabled) return;
    ref.current.setPointerCapture(e.pointerId);
    onSeek(toTime(e));
  };
  const move = (e) => {
    if (!disabled && e.buttons === 1) onSeek(toTime(e));
  };
  return (
    <div className="flex items-center gap-4 w-full">
      <span data-testid="timeline-current-time" className="font-mono text-[11px] tracking-[0.18em] text-bone tabular-nums w-[78px]">{fmt(time)}</span>
      <div
        ref={ref}
        data-testid="timeline-scrubber"
        onPointerDown={down}
        onPointerMove={move}
        className={`relative flex-1 h-9 select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-ew-resize"}`}
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex gap-[3px] h-[22px]">
          {SCENES.map((s) => (
            <div key={s.label} style={{ width: `${((s.to - s.from) / DUR) * 100}%` }} className="relative h-full bg-white/[0.05] hover:bg-white/[0.09] transition-colors duration-200 overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-[rgba(68,102,255,0.45)]" style={{ width: `${Math.min(100, Math.max(0, ((time - s.from) / (s.to - s.from)) * 100))}%` }} />
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-[0.2em] uppercase text-white/55 whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-0 bottom-0 w-px bg-[var(--ember)] shadow-[0_0_12px_2px_rgba(156,198,245,0.6)] pointer-events-none" style={{ left: `${(time / DUR) * 100}%` }} />
      </div>
      <span className="font-mono text-[11px] tracking-[0.18em] text-white/45 tabular-nums">01:00:00</span>
    </div>
  );
}

