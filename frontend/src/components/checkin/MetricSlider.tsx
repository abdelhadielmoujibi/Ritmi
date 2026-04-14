"use client";

type MetricSliderProps = {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
  inverse?: boolean;
};

function getTone(value: number, inverse = false) {
  if (!inverse) {
    if (value <= 4) return "text-rose-300 bg-rose-300/15 border-rose-300/25";
    if (value <= 7) return "text-amber-200 bg-amber-300/15 border-amber-300/25";
    return "text-emerald-200 bg-emerald-300/15 border-emerald-300/25";
  }

  if (value <= 4) return "text-emerald-200 bg-emerald-300/15 border-emerald-300/25";
  if (value <= 7) return "text-amber-200 bg-amber-300/15 border-amber-300/25";
  return "text-rose-300 bg-rose-300/15 border-rose-300/25";
}

export function MetricSlider({ id, label, hint, value, onChange, inverse = false }: MetricSliderProps) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-zinc-100">
            {label}
          </label>
          <p className="text-xs text-zinc-400">{hint}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTone(value, inverse)}`}>{value}/10</span>
      </div>

      <input
        id={id}
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-amber-300"
      />

      <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}
