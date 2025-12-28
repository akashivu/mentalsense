import React from "react";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function WeeklySummary({
  thisWeek,
  lastWeek,
  trend,
  loading,
  mode = "combined",
}) {
  if (loading) {
    return (
     <div className="w-full h-full min-h-[400px]
                bg-white rounded-2xl border border-gray-200
                p-4 shadow-md flex flex-col">

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Calendar className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Weekly Summary</h3>
            <p className="text-xs text-gray-500 font-medium">7 days overview</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-xs text-gray-500 text-center font-medium mt-3">
            Calculating your weekly summary…
          </p>
        </div>
      </div>
    );
  }

  if (thisWeek == null || lastWeek == null) {
    return (
      <div className="w-full min-h-[400px] bg-white rounded-2xl border border-gray-200 p-5 shadow-md flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Calendar className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Weekly Summary</h3>
            <p className="text-xs text-gray-500 font-medium">7 days overview</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <Calendar className="h-10 w-10 text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-gray-600">
            Not enough data yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Use the app regularly to unlock your weekly summary
          </p>
        </div>
      </div>
    );
  }

  const thisPct = (thisWeek * 100).toFixed(0);
  const diffRaw = thisWeek - lastWeek;
  const diffPct = isNaN(diffRaw) ? 0 : Math.round(diffRaw * 100);
  const inc = diffRaw > 0;

  let risk = "Low";
  let riskClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
  let valueColor = "text-emerald-600";

  if (thisWeek > 0.7) {
    risk = "High";
    riskClass = "text-rose-600 bg-rose-50 border-rose-200";
    valueColor = "text-rose-600";
  } else if (thisWeek > 0.4) {
    risk = "Moderate";
    riskClass = "text-amber-600 bg-amber-50 border-amber-200";
    valueColor = "text-amber-600";
  }

  const subtitle =
    mode === "keystroke"
      ? "Weekly keystroke average"
      : mode === "emotion"
      ? "Weekly emotion average"
      : "Weekly overall average";

  const trendText =
    trend === "up"
      ? "Increased"
      : trend === "down"
      ? "Decreased"
      : "Stable";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="w-full min-h-[400px] bg-white rounded-2xl border border-gray-200 p-4 shadow-md flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Calendar className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Weekly Summary
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              7 days overview
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
          7d
        </span>
      </div>

      <div className="mb-3 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            This Week Avg
          </p>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskClass}`}
          >
            {risk}
          </span>
        </div>
        <p className={`text-3xl font-black ${valueColor}`}>{thisPct}%</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            vs Last Week
          </p>
          {isNaN(diffRaw) ? (
            <span className="text-xs font-medium text-gray-400">No data</span>
          ) : (
            <span
              className={`text-lg font-bold ${
                inc ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {inc ? "+" : ""}
              {diffPct}%
            </span>
          )}
        </div>

        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
            <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
            Trend
          </p>
          <span
            className={`text-lg font-bold ${
              trend === "up"
                ? "text-rose-600"
                : trend === "down"
                ? "text-emerald-600"
                : "text-gray-600"
            }`}
          >
            {trendText}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100">
  <p className="text-xs text-gray-500 font-medium">
    {subtitle}
  </p>
  <p className="text-[11px] text-gray-400 mt-1">
    Updated daily
  </p>
</div>

    </div>
  );
}
