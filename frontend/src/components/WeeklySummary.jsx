import React from "react";

export default function WeeklySummary({
  thisWeek,
  lastWeek,
  trend,
  loading,
  mode = "combined",
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow w-full text-sm text-gray-500">
        Calculating your weekly summary…
      </div>
    );
  }

  if (thisWeek == null || lastWeek == null) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow w-full text-sm text-gray-500">
        Not enough data yet — use the app regularly to unlock your weekly summary.
      </div>
    );
  }

  const thisPct = (thisWeek * 100).toFixed(0);

  
  const diffRaw = thisWeek - lastWeek;
  const diffPct = isNaN(diffRaw) ? 0 : Math.round(diffRaw * 100);

  const inc = diffRaw > 0;


  let risk = "Low";
  let riskClass = "text-green-600";

  if (thisWeek > 0.7) {
    risk = "High";
    riskClass = "text-red-600";
  } else if (thisWeek > 0.4) {
    risk = "Moderate";
    riskClass = "text-orange-500";
  }

 
  const title =
    mode === "keystroke"
      ? "Weekly Keystroke Stress Summary"
      : mode === "emotion"
      ? "Weekly Emotion Text Stress Summary"
      : "Weekly Overall Stress Summary";

  const subtitle =
    mode === "keystroke"
      ? "Average keystroke-based stress this week"
      : mode === "emotion"
      ? "Average emotion-based stress this week"
      : "Average overall stress this week";

  const trendText =
    trend === "up"
      ? "Stress increased"
      : trend === "down"
      ? "Stress decreased"
      : "Stress stable";

  return (
    <div className="bg-white rounded-2xl p-4 shadow w-full">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>

      <p className={`text-3xl font-bold ${riskClass}`}>
        {thisPct}%
      </p>

      <p className="text-sm text-gray-500 mb-2">
        {subtitle}
      </p>

      <p className="text-sm">
        Compared to last week:
        {isNaN(diffRaw) ? (
          <span className="text-gray-500 ml-1">(no data)</span>
        ) : (
          <span className={`ml-1 ${inc ? "text-red-600" : "text-green-600"}`}>
            {inc ? "+" : "-"}{Math.abs(diffPct)}%
          </span>
        )}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        Trend: {trendText}
      </p>

      <p className="text-xs text-gray-400">
        Risk Level: <span className={riskClass}>{risk}</span>
      </p>
    </div>
  );
}
