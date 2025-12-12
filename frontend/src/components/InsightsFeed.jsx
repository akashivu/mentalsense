import React from "react";
import { Lightbulb, Sparkles, Brain, TrendingUp } from "lucide-react";

export default function InsightsFeed({
  hourly,
  dow,
  trend,
  loading,
  mode = "combined",
}) {
  const title =
    mode === "keystroke"
      ? "Keystroke-Based Insights"
      : mode === "emotion"
      ? "Emotion Text Insights"
      : "Overall Stress Insights";

  const source =
    mode === "keystroke"
      ? "your typing behavior"
      : mode === "emotion"
      ? "your emotional tone"
      : "your overall signals";

  if (loading) {
    return (
      <div className="bg-white rounded-2xl px-5 py-5 shadow-lg border border-slate-200/60 w-full hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-1.5 rounded-lg ${mode === 'keystroke' ? 'bg-sky-100' : mode === 'emotion' ? 'bg-purple-100' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
            <Brain className={`w-4 h-4 ${mode === 'keystroke' ? 'text-sky-600' : mode === 'emotion' ? 'text-purple-600' : 'text-amber-600'}`} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Analyzing patterns...</p>
          <p className="text-xs text-slate-400 mt-1">Generating insights from {source}</p>
        </div>
      </div>
    );
  }

  if (
    (!hourly || hourly.length === 0) &&
    (!dow || dow.length === 0) &&
    !trend
  ) {
    return (
      <div className="bg-white rounded-2xl px-5 py-5 shadow-lg border border-slate-200/60 w-full hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-1.5 rounded-lg ${mode === 'keystroke' ? 'bg-sky-100' : mode === 'emotion' ? 'bg-purple-100' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
            <Brain className={`w-4 h-4 ${mode === 'keystroke' ? 'text-sky-600' : mode === 'emotion' ? 'text-purple-600' : 'text-amber-600'}`} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>

        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
          <div className="p-3 rounded-full bg-slate-100 mb-3">
            <Lightbulb className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">No Insights Yet</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Keep using the app and we'll unlock personalized insights based on {source}.
          </p>
        </div>
      </div>
    );
  }

  const insights = [];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Hourly pattern
  if (Array.isArray(hourly) && hourly.length === 24) {
    const maxVal = Math.max(...hourly);
    const maxHour = hourly.indexOf(maxVal);

    if (maxVal > 0) {
      insights.push(
        `You tend to experience higher stress from ${maxHour}:00 to ${
          maxHour + 1
        }:00 based on ${source}.`
      );

      if (mode === "keystroke") {
        insights.push(
          `Typing behavior indicates noticeable stress spikes during this hour — consider taking short breaks or pacing your work.`
        );
      } else if (mode === "emotion") {
        insights.push(
          `Your emotional text tone suggests this time of day may feel overwhelming — try journaling or mindfulness.`
        );
      }
    }
  }

  // Day-of-week pattern
  if (Array.isArray(dow) && dow.length === 7) {
    const maxDowVal = Math.max(...dow);
    const maxDowIndex = dow.indexOf(maxDowVal);

    if (maxDowVal > 0) {
      insights.push(
        `${dayNames[maxDowIndex]} seems to be your most stressful day based on ${source}.`
      );

      if (mode === "keystroke") {
        insights.push(
          `Typing patterns suggest tension builds up more on ${dayNames[maxDowIndex]}. Try breaking work into smaller pieces.`
        );
      } else if (mode === "emotion") {
        insights.push(
          `Emotional expression indicates ${dayNames[maxDowIndex]} carries more emotional load — schedule something lighter or enjoyable.`
        );
      }
    }
  }

  // Trend
  if (trend === "increasing" || trend === "up") {
    insights.push(
      `Your stress signals from ${source} have increased this week. Small routines like walking, breathing exercises, or journaling may help.`
    );
  } else if (trend === "decreasing" || trend === "down") {
    insights.push(
      `Your stress based on ${source} decreased this week — whatever you're doing is helping. Keep it up!`
    );
  } else if (trend === "stable" || trend === "flat") {
    insights.push(
      `Your stress signals from ${source} are fairly stable. This may be a good time to try gradual behavioral improvements.`
    );
  }

  if (insights.length === 0) {
    insights.push(
      `We're still collecting enough data from ${source}. Keep using the app and we'll surface insights soon.`
    );
  }

  return (
    <div className="bg-white rounded-2xl px-5 py-5 shadow-lg border border-slate-200/60 w-full hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${mode === 'keystroke' ? 'bg-sky-100' : mode === 'emotion' ? 'bg-purple-100' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
            <Sparkles className={`w-4 h-4 ${mode === 'keystroke' ? 'text-sky-600' : mode === 'emotion' ? 'text-purple-600' : 'text-amber-600'}`} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
        </div>
        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Auto-generated
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((text, i) => (
          <div
            key={i}
            className="group relative bg-gradient-to-br from-slate-50 to-slate-50/50 hover:from-slate-100 hover:to-slate-50 rounded-xl px-4 py-3 border border-slate-100 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                  <Lightbulb className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          These insights are generated from your recent activity patterns and may not reflect all factors affecting your wellbeing.
        </p>
      </div>
    </div>
  );
}