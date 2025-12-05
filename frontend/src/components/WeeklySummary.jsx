import React from "react";

export default function WeeklySummary({ thisWeek, lastWeek, trend, loading }) {
  // Loading state (optional)
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow w-full text-sm text-gray-500">
        Calculating your weekly summary…
      </div>
    );
  }

  // If no data yet
  if (thisWeek == null || lastWeek == null) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow w-full text-sm text-gray-500">
        Not enough data yet — use the app regularly to unlock your weekly summary.
      </div>
    );
  }

  const thisPct = (thisWeek * 100).toFixed(0);
  const diff = (thisWeek - lastWeek) * 100;
  const inc = diff > 0;

  // Risk level based on this week's average
  let risk = "Low";
  let riskClass = "text-green-600";

  if (thisWeek > 0.7) {
    risk = "High";
    riskClass = "text-red-600";
  } else if (thisWeek > 0.4) {
    risk = "Moderate";
    riskClass = "text-orange-500";
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow w-full">
      <h2 className="text-lg font-semibold mb-1">Weekly Summary</h2>

      <p className={`text-3xl font-bold ${riskClass}`}>
        {thisPct}%
      </p>
      <p className="text-sm text-gray-500 mb-2">
        Average stress this week
      </p>

      <p className="text-sm">
        Compared to last week:{" "}
        <span className={inc ? "text-red-600" : "text-green-600"}>
          {inc ? "+" : "-"}
          {Math.abs(diff).toFixed(0)}%
        </span>
      </p>

      <p className="text-xs text-gray-400 mt-2">
        Trend: {trend}
      </p>

      <p className="text-xs text-gray-400">
        Risk Level: <span className={riskClass}>{risk}</span>
      </p>
    </div>
  );
}
