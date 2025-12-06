import React from "react";

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
      <div className="bg-white rounded-2xl p-4 shadow w-full text-sm text-gray-500">
        Analyzing {source}…
      </div>
    );
  }

  
  if (
    (!hourly || hourly.length === 0) &&
    (!dow || dow.length === 0) &&
    !trend
  ) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow w-full text-sm text-gray-500">
        Not enough data yet — keep using the app and we’ll unlock personalized insights based on {source}.
      </div>
    );
  }

  const insights = [];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  
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
      `We’re still collecting enough data from ${source}. Keep using the app and we’ll surface insights soon.`
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow w-full mt-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ul className="text-sm space-y-2">
        {insights.map((text, i) => (
          <li key={i} className="text-gray-700 flex items-start">
            <span className="text-green-500 font-bold mr-2">•</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
