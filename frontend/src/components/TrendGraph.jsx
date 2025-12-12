
import React from "react";
import { Line } from "react-chartjs-2";
import { TrendingUp, Activity } from "lucide-react";
import SkeletonCard from "./SkeletonCard";

export default function TrendGraph({
  past = [],
  future = [],
  anomalies = [],
  mode = "combined",
  loading = false, // pass true while fetching
}) {
  const pastArr = Array.isArray(past) ? past : [];
  const futureArr = Array.isArray(future) ? future : [];

  const trendValues = [...pastArr, ...futureArr];
  const totalLength = trendValues.length;

  const labels = [
    ...pastArr.map((_, idx) => `P-${pastArr.length - idx}`),
    ...futureArr.map((_, idx) => `+${idx + 1}`),
  ];

  const anomalyScores = new Array(totalLength).fill(null);

  anomalies.slice(0, totalLength).forEach((a, idx) => {
    anomalyScores[idx] =
      a.score ?? a.combinedScore ?? trendValues[idx] ?? null;
  });

  const baseLabel =
    mode === "keystroke"
      ? "Keystroke Stress Trend"
      : mode === "emotion"
      ? "Emotion Text Stress Trend"
      : "Overall Stress Trend";

  const anomalyLabel =
    mode === "keystroke"
      ? "Keystroke Anomalies"
      : mode === "emotion"
      ? "Emotion Anomalies"
      : "Stress Anomalies";

  const titleText =
    mode === "keystroke"
      ? "Predicted Keystroke Stress Trend"
      : mode === "emotion"
      ? "Predicted Emotion Text Stress Trend"
      : "Predicted Overall Stress Trend";

  
  const lineGray = "#6B7280";
  const fillGray = "rgba(107,114,128,0.06)";

  const data = {
    labels,
    datasets: [
      {
        label: baseLabel,
        data: trendValues,
        borderColor: lineGray,
        backgroundColor: fillGray,
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "white",
        pointBorderWidth: 2,
        fill: true,
      },
      {
        label: anomalyLabel,
        data: anomalyScores,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 7,
        pointHoverRadius: 9,
        showLine: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top", align: "end" },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.98)",
        borderColor: "rgba(226,232,240,1)",
        borderWidth: 1,
        titleColor: "#0f172a",
        bodyColor: "#475569",
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 1,
        ticks: {
          callback: (value) => `${(value * 100).toFixed(0)}%`,
        },
        grid: { color: "rgba(203,213,225,0.3)" },
      },
      x: {
        ticks: { maxTicksLimit: 8 },
        grid: { display: false },
      },
    },
    interaction: { intersect: false, mode: "index" },
  };

  return (
    <SkeletonCard loading={loading} heightClass="h-36">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-5 py-5 h-60 md:h-64 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{titleText}</h2>
              <p className="text-xs text-gray-500 font-medium">Historical & forecasted data</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mode === "keystroke" ? "bg-indigo-100 text-indigo-700" : mode === "emotion" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
            {mode === "keystroke" ? "Keystroke" : mode === "emotion" ? "Emotion" : "Combined"}
          </span>
        </div>

        {trendValues.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-10 w-10 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm font-medium text-gray-500">Need more data to compute trend</p>
              <p className="text-xs text-gray-400 mt-1">Keep using the app to see predictions</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 mt-2">
            <Line data={data} options={options} />
          </div>
        )}
      </div>
    </SkeletonCard>
  );
}
