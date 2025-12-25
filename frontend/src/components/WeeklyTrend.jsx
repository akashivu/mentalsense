import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { authHeader } from "../services/AuthService";
import { BarChart3, Maximize2, X } from "lucide-react";
import BASE from "../api/base";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, TimeScale);

export default function WeeklyTrend({
  userId = null,
  days = 14,
  daily = null,
  mode = "combined",
}) {
  const [dataPoints, setDataPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (Array.isArray(daily)) {
      const normalized = daily.map((d) => ({
        date: d.date ?? d.day ?? d.ts,
        avg: Math.max(
          0,
          Math.min(1, d.avg ?? d.average ?? d.daily_average ?? 0)
        ),
      }));
      setDataPoints(normalized);
      setLoading(false);
      return;
    }

    if (!userId) {
      setDataPoints([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async function fetchData() {
      try {
        const res = await axios.get(
  `${BASE}/user/${userId}/daily_stress?days=${days}&mode=${mode}`,
  { headers: authHeader() }
);

        if (!mounted) return;

        const normalized = (res.data || []).map((d) => ({
          date: d.date ?? d.day ?? d.ts,
          avg: Math.max(
            0,
            Math.min(1, d.avg ?? d.average ?? d.daily_average ?? 0)
          ),
        }));
        setDataPoints(normalized);
      } catch (err) {
        console.error("Failed to load daily stress", err);
        if (mounted) {
          setDataPoints([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, days, daily, mode]);

  const title =
    mode === "keystroke"
      ? "Weekly Keystroke Stress Trend"
      : mode === "emotion"
      ? "Weekly Emotion Text Stress Trend"
      : "Weekly Overall Stress Trend";

  const gradientClass =
    mode === "combined"
      ? "from-blue-500 to-indigo-600"
      : mode === "keystroke"
      ? "from-cyan-500 to-blue-600"
      : "from-purple-500 to-fuchsia-600";

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 px-5 py-5 min-h-[200px] flex flex-col hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}>
              <BarChart3 className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Daily averages</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Loading trend data...</p>
        </div>
      </div>
    );
  }

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 px-5 py-5 min-h-[200px] flex flex-col hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}>
              <BarChart3 className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Daily averages</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="p-3 rounded-full bg-slate-100 mb-3">
            <BarChart3 className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">No Data Available Yet</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your weekly trend will appear here once you've used the app for a few days.
          </p>
        </div>
      </div>
    );
  }

  const labels = useMemo(
    () => dataPoints.map((p) => (p.date ? new Date(p.date) : "")),
    [dataPoints]
  );
  const values = useMemo(() => dataPoints.map((p) => p.avg), [dataPoints]);

  const bg = dataPoints.map((_, idx) =>
    idx >= Math.max(0, dataPoints.length - 7) ? "#ef4444" : "#60a5fa"
  );

  const datasetLabel =
    mode === "keystroke"
      ? "Daily avg (Keystroke)"
      : mode === "emotion"
      ? "Daily avg (Emotion Text)"
      : "Daily avg (Overall)";

  const chartData = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: values,
        backgroundColor: bg,
        borderRadius: 6,
        barThickness: isExpanded ? 24 : 16,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        type: "time", 
        time: { unit: "day" },
        ticks: {
          color: "#64748b",
          font: { size: isExpanded ? 12 : 10, weight: "500" }
        },
        grid: { display: false }
      },
      y: {
        min: 0,
        max: 1,
        ticks: {
          callback: (v) => `${Math.round(v * 100)}%`,
          color: "#64748b",
          font: { size: isExpanded ? 12 : 10, weight: "500" }
        },
        grid: { color: "rgba(203, 213, 225, 0.3)" }
      },
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        padding: 12,
        borderColor: "rgba(226, 232, 240, 1)",
        borderWidth: 1,
        titleColor: "#0f172a",
        bodyColor: "#475569",
        displayColors: false,
        cornerRadius: 10,
        callbacks: {
          label: (context) => `Stress: ${(context.parsed.y * 100).toFixed(0)}%`,
        },
      }
    },
  };

  const ChartContent = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 px-5 py-5 min-h-[200px] flex flex-col hover:shadow-xl transition-all duration-300 relative group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
            <BarChart3 className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Weekly Trend</h3>
            <p className="text-xs text-slate-500 font-medium">
              {dataPoints.length} days of data
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors duration-200 opacity-0 group-hover:opacity-100"
          title={isExpanded ? "Close expanded view" : "Expand chart"}
        >
          {isExpanded ? (
            <X className="h-4 w-4 text-slate-600" />
          ) : (
            <Maximize2 className="h-4 w-4 text-slate-600" />
          )}
        </button>
      </div>

      <div className="flex-1 min-h-[120px]">
        <Bar data={chartData} options={options} />
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-blue-400"></span>
          <span className="font-medium">Previous week</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-400"></span>
          <span className="font-medium">Last 7 days</span>
        </div>
      </div>
    </div>
  );

  if (isExpanded) {
    return (
      <>
     
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        />
        
        {/* Expanded Modal */}
        <div className="fixed inset-4 md:inset-8 z-50 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 px-6 py-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}>
                  <BarChart3 className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {dataPoints.length} days of data
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <Bar data={chartData} options={options} />
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-blue-400"></span>
                <span className="font-medium">Previous week</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-red-400"></span>
                <span className="font-medium">Last 7 days</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return <ChartContent />;
}