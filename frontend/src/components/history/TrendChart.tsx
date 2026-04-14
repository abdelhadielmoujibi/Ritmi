"use client";

import { DailyCheckinHistory } from "@/types/domain";

type TrendChartProps = {
  checkins: DailyCheckinHistory[];
};

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 320;
const MARGIN = { top: 16, right: 14, bottom: 28, left: 34 };

function formatDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

function buildLine(values: number[], min = 1, max = 10) {
  if (values.length === 0) return "";
  const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = MARGIN.left + stepX * index;
      const y = MARGIN.top + ((max - value) / (max - min)) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildPoints(values: number[], min = 1, max = 10) {
  if (values.length === 0) return [] as { x: number; y: number }[];
  const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  return values.map((value, index) => ({
    x: MARGIN.left + stepX * index,
    y: MARGIN.top + ((max - value) / (max - min)) * innerHeight,
  }));
}

export function TrendChart({ checkins }: TrendChartProps) {
  if (checkins.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Energy / Focus / Stress Trends</h2>
        <p className="mt-2 text-sm text-zinc-300">No check-in history yet to draw trend lines.</p>
      </section>
    );
  }

  const ordered = [...checkins].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date)).slice(-10);

  const energyLine = buildLine(ordered.map((item) => item.energy));
  const focusLine = buildLine(ordered.map((item) => item.focus));
  const stressLine = buildLine(ordered.map((item) => item.stress));

  return (
    <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Energy / Focus / Stress Trends</h2>
        <p className="text-xs text-zinc-400">Last {ordered.length} check-ins (1-10 scale)</p>
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-3">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" className="h-64 w-full md:h-72">
          {[1, 4, 7, 10].map((tick) => {
            const y = MARGIN.top + ((10 - tick) / 9) * (CHART_HEIGHT - MARGIN.top - MARGIN.bottom);
            return (
              <g key={tick}>
                <line x1={MARGIN.left} y1={y} x2={CHART_WIDTH - MARGIN.right} y2={y} stroke="#27272a" strokeWidth="1" />
                <text x={MARGIN.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#a1a1aa">
                  {tick}
                </text>
              </g>
            );
          })}

          <polyline points={energyLine} fill="none" stroke="#34d399" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={focusLine} fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={stressLine} fill="none" stroke="#fb7185" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

          {buildPoints(ordered.map((item) => item.energy)).map((p, index) => (
            <circle key={`energy-${ordered[index].checkin_date}`} cx={p.x} cy={p.y} r="2.5" fill="#34d399" />
          ))}
          {buildPoints(ordered.map((item) => item.focus)).map((p, index) => (
            <circle key={`focus-${ordered[index].checkin_date}`} cx={p.x} cy={p.y} r="2.5" fill="#fbbf24" />
          ))}
          {buildPoints(ordered.map((item) => item.stress)).map((p, index) => (
            <circle key={`stress-${ordered[index].checkin_date}`} cx={p.x} cy={p.y} r="2.5" fill="#fb7185" />
          ))}

          {ordered.map((item, index) => {
            const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
            const x = MARGIN.left + (ordered.length > 1 ? (innerWidth / (ordered.length - 1)) * index : 0);
            return (
              <text key={item.checkin_date} x={x} y={CHART_HEIGHT - 8} textAnchor="middle" fontSize="11" fill="#a1a1aa">
                {formatDay(item.checkin_date)}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2.5 py-1 text-emerald-200">Energy</span>
        <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-2.5 py-1 text-amber-200">Focus</span>
        <span className="rounded-full border border-rose-300/30 bg-rose-300/15 px-2.5 py-1 text-rose-200">Stress (lower is better)</span>
      </div>
    </section>
  );
}
