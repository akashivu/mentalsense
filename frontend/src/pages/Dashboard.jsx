import React, { useState } from "react";
import EmotionBox from "../components/EmotionBox";
import EmotionGraph from "../components/EmotionGraph";
import WeeklyTrend from "../components/WeeklyTrend";

export default function Dashboard() {
  const [predictions, setPredictions] = useState([]);

  const onNewPrediction = (res) => {
    const payload = res && res.result ? res.result : res;

    const label =
      payload?.text_metrics?.label ??
      payload?.label ??
      payload?.textMetrics?.label ??
      "unknown";

    let combined =
      typeof payload?.combined_score === "number"
        ? payload.combined_score
        : typeof payload?.combinedScore === "number"
        ? payload.combinedScore
        : typeof payload?.stress_score === "number"
        ? payload.stress_score
        : typeof payload?.stressScore === "number"
        ? payload.stressScore
        : 0;

    combined = Math.max(0, Math.min(1, combined));

    const ts =
      payload?.ts ??
      payload?.createdAt ??
      new Date().toISOString();

    const p = {
      label,
      combined_score: combined,
      ts,
    };

    setPredictions((prev) => {
      const next = [p, ...prev];
      return next.slice(0, 12);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <div className="text-sm text-slate-500">check your emotion</div>
        </header>

        <EmotionBox onNewPrediction={onNewPrediction} />

        {/* use client-side predictions (live) */}
        <WeeklyTrend days={14} />
        <EmotionGraph data={predictions} />
      </div>
    </div>
  );
}
