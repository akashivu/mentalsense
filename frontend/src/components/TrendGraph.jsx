import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip,Filler);

export default function TrendGraph({ past = [], future = [] }) {
  // Labels: P1 P2 ... F1 F2 to match real trend logic
  const labels = [
    ...past.map((_, i) => `P${i + 1}`),
    ...future.map((_, i) => `F${i + 1}`)
  ];

  const fullValues = [...past, ...future];

  const data = {
    labels,
    datasets: [
      {
        label: "Stress Trend",
        data: fullValues,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.12)",
        tension: 0.35,
        pointRadius: 3,
        borderWidth: 2,
        segment: {
          borderDash: ctx =>
            ctx.p0DataIndex < past.length - 1 ? [] : [6, 5], // dotted predictions
        },
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#374151" } },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: "#6b7280" } },
      y: {
        ticks: { color: "#6b7280" },
        min: 0,
        max: 1,
      },
    },
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 shadow-md rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Stress Trend (Past + Forecast)
      </h2>

      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
