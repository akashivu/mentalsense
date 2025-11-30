import React, { useState } from "react";
import EmotionBox from "../components/EmotionBox";
import EmotionGraph from "../components/EmotionGraph";

export default function Dashboard() {
  const [predictions, setPredictions] = useState([]);

  /**
   * Handles both legacy and Day-6 new payload shapes:
   *
   * New ML/backend payload (preferred):
   *  {
   *    combined_score: 0.42,
   *    text_metrics: { label: "anxious", ... },
   *    keystroke_score: 0.12,
   *    prediction_id: 123,
   *    ts: "2025-11-29T12:00:00.000Z"
   *  }
   *
   * Legacy payload (older Emotion API):
   *  {
   *    label: "sad",
   *    stress_score: 0.37,
   *    id: 45
   *  }
   */
  const onNewPrediction = (res) => {
    // normalize payload (if caller passed { result: ... } keep compatibility)
    const payload = res && res.result ? res.result : res;

    // label may appear in text_metrics.label (new) or payload.label (legacy)
    const label =
      payload?.text_metrics?.label ??
      payload?.label ??
      payload?.textMetrics?.label ??
      "unknown";

    // combined_score field (new) or fallback to legacy stress_score / stressScore
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

    // clamp to 0..1
    combined = Math.max(0, Math.min(1, combined));

    // timestamp: prefer payload.ts or payload.createdAt; else now
    const ts =
      payload?.ts ??
      payload?.createdAt ??
      new Date().toISOString();

    const p = {
      label,
      combined_score: combined,
      ts,
    };

    // add to head, keep latest 12
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

        <EmotionGraph data={predictions} />
      </div>
    </div>
  );
}
