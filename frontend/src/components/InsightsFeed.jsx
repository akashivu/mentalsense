import React from "react";
import {
  Lightbulb,
  Sparkles,
  Brain,
  TrendingUp,
} from "lucide-react";


const ICON_THEME = {
  keystroke: {
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    text: "text-white",
  },
  emotion: {
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    text: "text-white",
  },
  combined: {
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    text: "text-white",
  },
};

export default function InsightsFeed({
  hourly,
  dow,
  trend,
  loading,
  mode = "combined",
}) {
 
  const safeMode =
    mode === "keystroke" || mode === "emotion" || mode === "combined"
      ? mode
      : "combined";

  const iconStyle = ICON_THEME[safeMode];

  const title =
    safeMode === "keystroke"
      ? "Keystroke-Based Insights"
      : safeMode === "emotion"
      ? "Emotion Text Insights"
      : "Overall Stress Insights";

  const source =
    safeMode === "keystroke"
      ? "your typing behavior"
      : safeMode === "emotion"
      ? "your emotional tone"
      : "your overall signals";


  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5 shadow-lg border border-slate-200 dark:border-slate-700 w-full min-h-[260px] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md ${iconStyle.bg}`}>
            <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3 font-medium">
            Analyzing patterns…
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Generating insights from {source}
          </p>
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5 shadow-lg border border-slate-200 dark:border-slate-700 w-full min-h-[260px] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md ${iconStyle.bg}`}>
            <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <Lightbulb className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            No Insights Yet
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Keep using the app and we’ll unlock personalized insights based on{" "}
            {source}.
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

  if (Array.isArray(hourly) && hourly.length === 24) {
    const maxVal = Math.max(...hourly);
    const maxHour = hourly.indexOf(maxVal);

    if (maxVal > 0) {
      insights.push(
        `You tend to experience higher stress from ${maxHour}:00 to ${maxHour + 1}:00 based on ${source}.`
      );
    }
  }

  if (Array.isArray(dow) && dow.length === 7) {
    const maxDowVal = Math.max(...dow);
    const maxDowIndex = dow.indexOf(maxDowVal);

    if (maxDowVal > 0) {
      insights.push(
        `${dayNames[maxDowIndex]} seems to be your most stressful day based on ${source}.`
      );
    }
  }

  if (trend === "up" || trend === "increasing") {
    insights.push(
      `Your stress signals from ${source} increased this week. Consider small recovery routines.`
    );
  } else if (trend === "down" || trend === "decreasing") {
    insights.push(
      `Your stress based on ${source} decreased this week — keep it up!`
    );
  }

  if (insights.length === 0) {
    insights.push(
      `We're still collecting enough data from ${source}. Insights will appear soon.`
    );
  }

  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5 shadow-lg border border-slate-200 dark:border-slate-700 w-full min-h-[260px] flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md ${iconStyle.bg}`}>
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>

        <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Auto-generated
        </span>
      </div>

      {/* INSIGHTS */}
      <div className="space-y-3 flex-1">
        {insights.map((text, i) => (
          <div
            key={i}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700 hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <p className="text-[10px] text-slate-400 text-center">
          Insights are generated from recent activity patterns and may not reflect all factors.
        </p>
      </div>
    </div>
  );
}
