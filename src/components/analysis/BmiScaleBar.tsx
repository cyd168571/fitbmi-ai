"use client";

type Props = { bmi: number };

const MIN = 15;
const MAX = 40;

export function BmiScaleBar({ bmi }: Props) {
  const pct = Math.min(100, Math.max(0, ((bmi - MIN) / (MAX - MIN)) * 100));
  const ticks = [15, 18.5, 25, 30, 40];

  return (
    <div className="w-full">
      <div
        className="relative h-3 w-full overflow-hidden rounded-full"
        style={{
          background:
            "linear-gradient(90deg, #C62828 0%, #FFCA28 18%, #66BB6A 35%, #43A047 55%, #FFCA28 75%, #C62828 100%)",
        }}
      >
        <div
          className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-slate-900 shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
