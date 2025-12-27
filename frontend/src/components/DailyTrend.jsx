import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { TrendingUp } from "lucide-react";
import { authHeader } from "../services/AuthService";
import BASE from "../api/base";
import { isDemoMode } from "../hooks/useDemo";
import { DEMO_DAILY_TREND } from "../demo/demoData";

export default function DailyTrend({ userId, mode = "combined" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const demo = isDemoMode();

 useEffect(() => {
  //  DEMO MODE
  if (demo) {
    setData(DEMO_DAILY_TREND);
    setLoading(false);
    setError(null);
    return;
  }

  // real user only
  if (!userId) {
    setLoading(false);
    return;
  }

  async function load() {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE}/user/${userId}/daily-stress?days=7&mode=${mode}`,
        { headers: authHeader() }
      );

      const safeData = Array.isArray(res.data) ? res.data : [];
      setData(safeData);
      setError(null);
    } catch (err) {
      console.error("Failed to load daily stress:", err);
      setError("Failed to load trend");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [userId, mode, demo]);


  const labels = data.map((d) => d.day);
  const scores = data.map((d) => d.avgStress);

  const titleText =
    mode === "keystroke"
      ? "Weekly Keystroke Stress"
      : mode === "emotion"
      ? "Weekly Emotional Stress"
      : "Weekly Stress Overview";

  const subtitleText = "Last 7 days trend";

  const getGradientColors = () => {
    if (mode === "keystroke") {
      return {
        start: "rgba(14, 165, 233, 0.4)",
        end: "rgba(14, 165, 233, 0.05)",
        border: "rgb(14, 165, 233)",
      };
    } else if (mode === "emotion") {
      return {
        start: "rgba(168, 85, 247, 0.4)",
        end: "rgba(168, 85, 247, 0.05)",
        border: "rgb(168, 85, 247)",
      };
    } else {
      return {
        start: "rgba(99, 102, 241, 0.45)",
        end: "rgba(99, 102, 241, 0.06)",
        border: "rgb(99, 102, 241)",
      };
    }
  };

  const colors = getGradientColors();

  const chartData = {
    labels,
    datasets: [
      {
        data: scores,
        borderColor: colors.border,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
          g.addColorStop(0, colors.start);
          g.addColorStop(1, colors.end);
          return g;
        },
        borderWidth: 2,
        tension: 0.42,
        pointRadius: 4,
        pointBackgroundColor: colors.border,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
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
        backgroundColor: "rgba(255,255,255,0.98)",
        borderColor: "rgba(226,232,240,1)",
        borderWidth: 1,
        titleColor: "#0f172a",
        bodyColor: "#475569",
        displayColors: false,
        callbacks: {
          label: (ctx) => `${(ctx.parsed.y * 100).toFixed(0)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 1,
        ticks: {
          callback: (v) => `${(v * 100).toFixed(0)}%`,
        },
      },
    },
    interaction: { intersect: false, mode: "index" },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 h-56 flex flex-col transition-all hover:shadow-lg">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{titleText}</h3>
          <p className="text-xs text-gray-500 font-medium">{subtitleText}</p>
        </div>
      </div>

      {/* CONTENT */}
      {loading && (
        <p className="text-xs text-gray-500 text-center mt-6">
          Loading trend…
        </p>
      )}

      {error && !loading && (
        <p className="text-xs text-red-500 text-center mt-6">
          {error}
        </p>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm font-medium text-gray-600">
            No data yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Use the app regularly to unlock trends
          </p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="flex-1">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
