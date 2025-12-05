import React from "react";

export default function InsightsFeed({ hourly, dow, trend, loading }) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow w-full text-sm text-gray-500">
        Analyzing your patterns…
      </div>
    );
  }

  // If no data
  if (!hourly && !dow && !trend) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow w-full text-sm text-gray-500">
        Not enough data yet — use the app regularly to unlock personalized insights.
      </div>
    );
  }

  const insights = [];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  // 1) Hourly pattern insight
  if (Array.isArray(hourly) && hourly.length === 24) {
    const maxVal = Math.max(...hourly);
    const maxHour = hourly.indexOf(maxVal);

    if (maxVal > 0) {
      insights.push(
        `You experience peak stress between ${maxHour}:00 and ${maxHour + 1}:00. Consider adding a short break or relaxation routine around this time.`
      );
    }
  }

  // 2) Day-of-week pattern insight
  if (Array.isArray(dow) && dow.length === 7) {
    const maxDowVal = Math.max(...dow);
    const maxDowIndex = dow.indexOf(maxDowVal);

    if (maxDowVal > 0) {
      insights.push(
        `Your most stressful day is ${dayNames[maxDowIndex]}. Try planning something relaxing or lighter on that day.`
      );
    }
  }

  // 3) Weekly trend insight
  if (trend === "increasing") {
    insights.push(
      "Your stress levels increased this week. Try incorporating short breaks, breathing exercises, or journaling into your day."
    );
  } else if (trend === "decreasing") {
    insights.push(
      "Your stress levels decreased this week — great job maintaining balance. Keep up the habits that are working for you."
    );
  } else if (trend === "stable") {
    insights.push(
      "Your stress levels are fairly stable. This is a good time to experiment with small positive changes in your routine."
    );
  }

  // If still no insight (all zero / missing data)
  if (insights.length === 0) {
    insights.push(
      "We’re still collecting enough data to understand your patterns. Keep using the app and we’ll show insights here soon."
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow w-full mt-4">
      <h2 className="text-lg font-semibold mb-2">Insights</h2>
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
