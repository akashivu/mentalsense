import React from "react";

export default function InsightPanel({ score, trend, weekly }) {
  const pct = Math.round(score * 100);

  const insight = (() => {
    if (score > 0.7) return "You're under high stress today.";
    if (score > 0.4) return "Moderate stress levels — stay mindful.";
    return "Low stress levels — keep up the good work!";
  })();

  const trendMsg = (() => {
    if (trend === "up") return "Your stress is rising this week.";
    if (trend === "down") return "Good! Your stress is decreasing.";
    return "Your stress is stable.";
  })();

  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">
        Your Mood Insights
      </h2>

      <p className="text-slate-600">{insight}</p>

      <p className="text-slate-600">{trendMsg}</p>

      <p className="text-sm text-slate-500">
        Current score: <span className="font-semibold">{pct}/100</span>
      </p>
    </div>
  );
}
