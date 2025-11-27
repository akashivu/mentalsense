import React from "react";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";


ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function TrendGraph({ past = [], future = [] }) {
  const data = {
    labels: [
      ...past.map((_, i) => `-${past.length - i}`),
      "+1", "+2", "+3", "+4", "+5"
    ],
    datasets: [
      {
        label: "Stress Trend",
        data: [...past, ...future],
        borderWidth: 2,
        tension: 0.35,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        pointRadius: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { ticks: { color: "#6b7280" } },
      x: { ticks: { color: "#6b7280" } }
    },
    plugins: {
      legend: {
        labels: { color: "#374151" }
      }
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 shadow-md rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Stress Trend Analysis
      </h2>

      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
