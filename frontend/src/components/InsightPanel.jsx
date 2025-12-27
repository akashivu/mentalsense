import React from "react";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from "lucide-react";

export default function InsightPanel({ score, trend, weekly, mode = "combined" }) {
  const safeScore =
    typeof score === "number" ? Math.max(0, Math.min(1, score)) : 0;
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
    if (safeScore > 0.4)
      return "your stress is in a moderate range — stay mindful.";
    return "your stress is low — keep up the good work!";
  })();

  const trendMsg = (() => {
    if (trend === "up") return "Your stress is rising this week.";
    if (trend === "down") return "Good news — your stress is decreasing.";
    return "Your stress is relatively stable over the week.";
  })();

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-rose-600"
      : trend === "down"
      ? "text-emerald-600"
      : "text-gray-600";

  const stressColor =
    safeScore > 0.7
      ? "text-rose-600"
      : safeScore > 0.4
      ? "text-amber-600"
      : "text-emerald-600";

  const stressBg =
    safeScore > 0.7
      ? "bg-rose-50 border-rose-200"
      : safeScore > 0.4
      ? "bg-amber-50 border-amber-200"
      : "bg-emerald-50 border-emerald-200";

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg hover:border-gray-300 group min-h-[400px]">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          <Lightbulb className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Real-time analysis
          </p>
        </div>
      </div>

      {/* INSIGHT CARD */}
      <div className={`p-4 rounded-xl border-2 ${stressBg}`}>
        <p className="text-sm text-gray-800 leading-relaxed font-medium mb-2">
          <span className="font-bold text-gray-900">{sourceLabel}</span>{" "}
          {insight}
        </p>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} strokeWidth={2.5} />
          <p className="text-sm text-gray-800 font-medium">
            {trendMsg}
          </p>
        </div>
      </div>

      {/* SCORE CARD */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Current Score
          </p>
          <p className="text-xs text-gray-500 font-medium">
            {mode === "keystroke"
              ? "Keystroke stress"
              : mode === "emotion"
              ? "Emotion-based stress"
              : "Overall stress"}
          </p>
        </div>

        <div className="text-right">
          <span className={`text-3xl font-black ${stressColor}`}>
            {pct}%
          </span>
          <p className="text-xs text-gray-500 font-medium mt-1">
            out of 100
          </p>
        </div>
      </div>

      {/* CTA BUTTON */}
      <button
        type="button"
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl
                   bg-gradient-to-r from-blue-500 to-indigo-600
                   hover:from-blue-600 hover:to-indigo-700
                   text-white px-4 py-3 text-sm font-bold shadow-lg
                   transition-all hover:scale-105"
      >
        <Target className="h-4 w-4" strokeWidth={2.5} />
        <span>Get Personalized Tips</span>
      </button>
    </div>
  );
}

