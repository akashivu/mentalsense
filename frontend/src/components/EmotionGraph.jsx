import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { authHeader } from "../services/AuthService";
import { Activity, TrendingUp } from "lucide-react";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
);

export default function EmotionGraph({
  userId = null,
  limit = 50,
  data = null,
  mode = "combined",
}) {
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (Array.isArray(data)) {
      const items = data
        .map((p) => ({
          ts: p.ts ?? p.createdAt ?? p.created_at ?? null,
          combined_score: p.combined_score ?? p.combinedScore ?? p.combined ?? 0,
          keystroke_score: p.keystroke_score ?? p.keystrokeScore ?? null,
          text_score: p.text_score ?? p.textScore ?? p.emotion_score ?? null,
        }))
        .sort((a, b) => new Date(a.ts || 0) - new Date(b.ts || 0));

      setPast(items);
      return;
    }

    if (!userId) {
      setPast([]);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    (async function fetchData() {
      try {
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/predictions/recent?limit=${limit}`,
          { headers: authHeader() }
        );

        if (!mounted) return;

        const items = (res.data || [])
          .map((p) => ({
            ts: p.createdAt ?? p.ts ?? p.created_at,
            combined_score: p.combinedScore ?? p.combined_score ?? p.combined ?? 0,
            keystroke_score: p.keystroke_score ?? p.keystrokeScore ?? null,
            text_score: p.text_score ?? p.textScore ?? p.emotion_score ?? null,
          }))
          .sort((a, b) => new Date(a.ts || 0) - new Date(b.ts || 0));

        setPast(items);
      } catch (err) {
        console.error("Failed to load predictions", err);
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, data, limit]);

  // Score selection logic untouched
  const getScoreForMode = (p) => {
    if (mode === "keystroke") {
      return Math.max(0, Math.min(1, Number(p.keystroke_score ?? p.combined_score ?? 0)));
    }
    if (mode === "emotion") {
      return Math.max(0, Math.min(1, Number(p.text_score ?? p.combined_score ?? 0)));
    }
    return Math.max(0, Math.min(1, Number(p.combined_score ?? 0)));
  };

  const chartPoints = useMemo(
    () => past.map((p) => ({ x: p.ts ? new Date(p.ts) : null, y: getScoreForMode(p) })),
    [past, mode]
  );

  const datasetLabel =
    mode === "keystroke"
      ? "Keystroke Stress"
      : mode === "emotion"
      ? "Emotion Stress"
      : "Combined Stress";

  const strokeColor =
    mode === "keystroke"
      ? "rgb(99, 102, 241)"
      : mode === "emotion"
      ? "rgb(168, 85, 247)"
      : "rgb(59, 130, 246)";

  const fillColor =
    mode === "keystroke"
      ? "rgba(99,102,241,0.08)"
      : mode === "emotion"
      ? "rgba(168,85,247,0.08)"
      : "rgba(59,130,246,0.08)";

  const titleText =
    mode === "keystroke"
      ? "Keystroke Stress History"
      : mode === "emotion"
      ? "Emotion Stress History"
      : "Recent Stress Timeline";

  //  Smooth modern Apple-style curve 
  const baseDataset = {
    label: datasetLabel,
    data: chartPoints,
    borderWidth: 3,
    tension: 0.65, // <-- Smooth curve always
    borderColor: strokeColor,
    backgroundColor: fillColor,
    fill: true,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: strokeColor,
    pointBorderColor: "#fff",
    pointBorderWidth: 2,
  };

  const chartData = { datasets: [baseDataset] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        type: "time",
        time: { unit: "hour", tooltipFormat: "PP p" },
        ticks: { maxTicksLimit: 6, color: "#64748b", font: { size: 10 } },
        grid: { color: "rgba(203,213,225,0.3)", drawBorder: false },
        border: { display: false },
      },
      y: {
        min: 0,
        max: 1,
        ticks: {
          callback: (v) => `${Math.round(v * 100)}%`,
          color: "#64748b",
          font: { size: 10 },
        },
        grid: { color: "rgba(203,213,225,0.3)", drawBorder: false },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "rgba(226,232,240,1)",
        borderWidth: 1,
        titleColor: "#0f172a",
        bodyColor: "#475569",
        padding: 9,
        displayColors: false,
        callbacks: {
          label: (ctx) =>
            `${datasetLabel}: ${Math.round((ctx.parsed.y ?? 0) * 100)}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-4 py-4 h-52 md:h-56 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-300 group">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{titleText}</h2>
            <p className="text-xs text-gray-500 font-medium">{past.length} data points</p>
          </div>
        </div>

        <span className="text-xs text-gray-400 font-medium">Graph View</span>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <p className="text-xs text-rose-600 font-medium">Error loading predictions</p>
      ) : past.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-xs text-gray-500 font-medium">No predictions yet</p>
        </div>
      ) : (
        <div className="w-full flex-1">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
