import React, { useState } from "react";
import EmotionBox from "../components/EmotionBox";
import EmotionGraph from "../components/EmotionGraph";

export default function Dashboard() {
  const [predictions, setPredictions] = useState([]);

  const onNewPrediction = (res) => {
    const payload = res && res.result ? res.result : res;

    const p = {
      label: payload.label ?? "unknown",
      stress_score:
        typeof payload.stress_score === "number"
          ? payload.stress_score
          : payload.stressScore ?? 0,
      createdAt: new Date().toISOString(),
    };

    setPredictions((prev) => [p, ...prev].slice(0, 12));
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
