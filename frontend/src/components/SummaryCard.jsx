import React from "react";

export default function SummaryCard({ score, trend }) {
  // score: 0–1 (stress level)
  const safeScore = typeof score === "number" ? Math.max(0, Math.min(1, score)) : 0;

  const percent = (safeScore * 100).toFixed(0);

  let risk = "Low";
  if (safeScore > 0.7) risk = "High";
  else if (safeScore > 0.4) risk = "Moderate";

  const color =
    risk === "High" ? "red" : risk === "Moderate" ? "orange" : "green";

  const trendLabel =
    trend === "up"
      ? "Rising"
      : trend === "down"
      ? "Decreasing"
      : "Stable";

  const trendArrow =
    trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div className="bg-white shadow rounded-2xl p-4 md:p-6 flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-slate-800">
        Current Stress Summary
      </h2>

      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold text-${color}-600`}>
          {percent}%
        </span>
        <span className="text-sm text-slate-500">stress level</span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <div>
          <span className="text-slate-500">Risk:&nbsp;</span>
          <span className={`font-semibold text-${color}-600`}>{risk}</span>
        </div>

        <div>
          <span className="text-slate-500">Trend:&nbsp;</span>
          <span className="font-semibold text-slate-700">
            {trendArrow} {trendLabel}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-1">
        Based on your latest typing + text signals. This is not a diagnosis,
        just a stress indicator.
      </p>
    </div>
  );
}
