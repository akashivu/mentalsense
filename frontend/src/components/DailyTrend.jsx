import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { authHeader } from "../services/AuthService";
import BASE from "../api/base";


export default function DailyTrend({ userId, mode = "combined" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch 7-day daily stress when user or mode changes
    if (!userId) return;
    async function load() {
      try {
        setLoading(true);
       const res = await axios.get(
  `${BASE}/user/${userId}/daily-stress?days=7&mode=${mode}`,
  { headers: authHeader() }
);

        setData(res.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load daily stress:", err);
        setError("Failed to load trend");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, mode]); 
  
  const labels = data.map((d) => d.day); 
  const scores = data.map((d) => d.avgStress);
  
  const datasetLabel =
    mode === "keystroke"
      ? "7-Day Keystroke Stress Trend"
      : mode === "emotion"
      ? "7-Day Emotion Text Stress Trend"
      : "7-Day Overall Stress Trend";
      
  const titleText =
    mode === "keystroke"
      ? "Weekly Keystroke Stress"
      : mode === "emotion"
      ? "Weekly Emotional Stress"
      : "Weekly Stress Overview";
  
  // Provide color sets per mode for chart styling
  const getGradientColors = () => {
    if (mode === "keystroke") {
      return {
        start: "rgba(14, 165, 233, 0.4)",
        end: "rgba(14, 165, 233, 0.02)",
        border: "rgb(14, 165, 233)",
        point: "rgb(14, 165, 233)"
      };
    } else if (mode === "emotion") {
      return {
        start: "rgba(168, 85, 247, 0.4)",
        end: "rgba(168, 85, 247, 0.02)",
        border: "rgb(168, 85, 247)",
        point: "rgb(168, 85, 247)"
      };
    } else {
      return {
        start: "rgba(6, 182, 212, 0.55)",
        end: "rgba(134, 239, 172, 0.12)",
        border: "rgb(20, 184, 166)",
        point: "rgb(20, 184, 166)"
      };
    }
  };
  
  const colors = getGradientColors();
  
  const chartData = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: scores,
        borderColor: colors.border,
        backgroundColor: (context) => {
          // create vertical gradient for the area under the line
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 180);
          gradient.addColorStop(0, colors.start);
          gradient.addColorStop(1, colors.end);
          return gradient;
        },
        borderWidth: 2,
        tension: 0.42,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.point,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: colors.point,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
        fill: true,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        padding: 10,
        borderColor: "rgba(226, 232, 240, 1)",
        borderWidth: 1,
        titleColor: "#0f172a",
        titleFont: { size: 12, weight: "600", family: "system-ui, -apple-system, sans-serif" },
        bodyColor: "#475569",
        bodyFont: { size: 12, weight: "500", family: "system-ui, -apple-system, sans-serif" },
        displayColors: false,
        cornerRadius: 10,
        caretSize: 6,
        caretPadding: 8,
        callbacks: {
          title: (context) => context[0].label,
          // show percentage for the y-value in tooltip
          label: (context) => `${(context.parsed.y * 100).toFixed(0)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 1,
        grid: {
          color: "rgba(203, 213, 225, 0.3)",
          drawBorder: false,
          lineWidth: 1,
        },
        border: { display: false },
        ticks: {
          color: "#64748b",
          font: { size: 11, weight: "500", family: "system-ui, -apple-system, sans-serif" },
          padding: 8,
          // convert tick to percentage label
          callback: (value) => (value * 100).toFixed(0) + "%",
        },
      },
      x: {
        grid: { display: false, drawBorder: false },
        border: { display: false },
        ticks: {
          color: "#64748b",
          font: { size: 11, weight: "500", family: "system-ui, -apple-system, sans-serif" },
          padding: 6,
        },
      },
    },
    interaction: { intersect: false, mode: "index" },
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-3 py-3 h-52 md:h-56 flex flex-col">
      <h2 className="text-sm font-semibold mb-1.5 text-slate-900">
        {titleText}
      </h2>

      {loading && (
        <p className="text-xs text-gray-500">Loading trend...</p>
      )}

      {error && !loading && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-xs text-gray-500">
          Not enough data yet. Use the app for a few days to see your weekly trend.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="w-full flex-1">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
