import React from "react";

export default function InsightPanel({ score, trend, weekly, mode = "combined" }) {
  const safeScore = typeof score === "number" ? Math.max(0, Math.min(1, score)) : 0;
  const pct = Math.round(safeScore * 100);

  
  const title =
    mode === "keystroke"
      ? "Typing Stress Insights"
      : mode === "emotion"
      ? "Emotion Text Insights"
      : "Overall Stress Insights";

  
  const sourceLabel =
    mode === "keystroke"
      ? "Based on your typing pattern,"
      : mode === "emotion"
      ? "Based on how you express yourself in text,"
      : "Based on your combined signals,";

  
  const insight = (() => {
    if (safeScore > 0.7) return "you're under high stress today.";
    if (safeScore > 0.4) return "your stress is in a moderate range — stay mindful.";
    return "your stress is low — keep up the good work!";
  })();

  
  const trendMsg = (() => {
    if (trend === "up") return "Your stress is rising this week.";
    if (trend === "down") return "Good news — your stress is decreasing.";
    return "Your stress is relatively stable over the week.";
  })();

  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-3">
     
      <h2 className="text-lg font-semibold text-slate-800">
        {title}
      </h2>

     
      <p className="text-slate-600">
        <span className="font-medium">{sourceLabel}</span> {insight}
      </p>

      
      <p className="text-slate-600">{trendMsg}</p>

      
      <p className="text-sm text-slate-500">
        Current {mode === "keystroke"
          ? "keystroke stress"
          : mode === "emotion"
          ? "emotion-based stress"
          : "overall stress"}{" "}
        score: <span className="font-semibold">{pct}/100</span>
      </p>
    </div>
  );
}
