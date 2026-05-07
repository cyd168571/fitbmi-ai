"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const SLICES = [
  { id: "u", from: 15, to: 18.5, color: "#f472b6" },
  { id: "n", from: 18.5, to: 25, color: "#22c55e" },
  { id: "o", from: 25, to: 30, color: "#fbbf24" },
  { id: "b", from: 30, to: 40, color: "#ef4444" },
] as const;

const chartData = SLICES.map((s) => ({
  name: s.id,
  value: s.to - s.from,
  color: s.color,
}));

type Props = {
  bmi: number;
  label: string;
};

export function BmiDonut({ bmi, label }: Props) {
  return (
    <div className="relative mx-auto h-52 w-52 sm:h-56 sm:w-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="82%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive
          >
            {chartData.map((e) => (
              <Cell key={e.name} fill={e.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-data text-3xl font-bold text-brand">{bmi}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
          {label}
        </p>
      </div>
    </div>
  );
}
