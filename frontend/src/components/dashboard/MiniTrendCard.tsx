"use client";

import { DailyCheckinHistory } from "@/types/domain";

type MiniTrendCardProps = {
  checkins: DailyCheckinHistory[];
};

const W = 1000;
const H = 220;
const MARGIN = { top: 12, right: 10, bottom: 26, left: 30 };

function formatDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

function line(values: number[]) {
  if (values.length === 0) return "";
  const iw = W - MARGIN.left - MARGIN.right;
  const ih = H - MARGIN.top - MARGIN.bottom;
  const step = values.length > 1 ? iw / (values.length - 1) : 0;

  return values
    .map((value, i) => {
      const x = MARGIN.left + i * step;
      const y = MARGIN.top + ((10 - value) / 9) * ih;
      return `${x},${y}`;
    })
    .join(" ");
}

function pointCoords(values: number[]) {
  if (values.length === 0) return [] as { x: number; y: number }[];
  const iw = W - MARGIN.left - MARGIN.right;
  const ih = H - MARGIN.top - MARGIN.bottom;
  const step = values.length > 1 ? iw / (values.length - 1) : 0;

  return values.map((value, i) => ({
    x: MARGIN.left + i * step,
    y: MARGIN.top + ((10 - value) / 9) * ih,
  }));
}

export function MiniTrendCard({ checkins }: MiniTrendCardProps) {
  const ordered = [...checkins].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date)).slice(-7);

  if (ordered.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-white">7-day trend</h2>
        <p className="mt-2 text-sm text-zinc-300">Complete check-ins to unlock energy/focus/stress trend insights.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">7-day trend</h2>
        <span className="text-xs text-zinc-400">Scores 1-10</span>
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-48 w-full md:h-56">
          {[1, 4, 7, 10].map((tick) => {
            const y = MARGIN.top + ((10 - tick) / 9) * (H - MARGIN.top - MARGIN.bottom);
            return (
              <g key={tick}>
                <line x1={MARGIN.left} y1={y} x2={W - MARGIN.right} y2={y} stroke="#27272a" strokeWidth="1" />
                <text x={MARGIN.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#a1a1aa">
                  {tick}
                </text>
              </g>
            );
          })}
          <polyline points={line(ordered.map((d) => d.energy))} fill="none" stroke="#34d399" strokeWidth="2.5" />
          <polyline points={line(ordered.map((d) => d.focus))} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
          <polyline points={line(ordered.map((d) => d.stress))} fill="none" stroke="#fb7185" strokeWidth="2.5" />

          {pointCoords(ordered.map((d) => d.energy)).map((p, index) => (
            <circle key={`e-${ordered[index].checkin_date}`} cx={p.x} cy={p.y} r="2" fill="#34d399" />
          ))}
          {pointCoords(ordered.map((d) => d.focus)).map((p, index) => (
            <circle key={`f-${ordered[index].checkin_date}`} cx={p.x} cy={p.y} r="2" fill="#fbbf24" />
          ))}
          {pointCoords(ordered.map((d) => d.stress)).map((p, index) => (
            <circle key={`s-${ordered[index].checkin_date}`} cx={p.x} cy={p.y} r="2" fill="#fb7185" />
          ))}

          {ordered.map((d, index) => {
            const iw = W - MARGIN.left - MARGIN.right;
            const x = MARGIN.left + (ordered.length > 1 ? (iw / (ordered.length - 1)) * index : 0);
            return (
              <text key={d.checkin_date} x={x} y={H - 8} textAnchor="middle" fontSize="9" fill="#a1a1aa">
                {formatDay(d.checkin_date)}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2 py-0.5 text-emerald-200">Energy</span>
        <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-0.5 text-amber-200">Focus</span>
        <span className="rounded-full border border-rose-300/30 bg-rose-300/15 px-2 py-0.5 text-rose-200">Stress (lower is better)</span>
      </div>
    </section>
  );
}
