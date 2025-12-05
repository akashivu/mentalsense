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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, TimeScale);

export default function WeeklyTrend({ userId = null, days = 14, daily = null }) {
  const [dataPoints, setDataPoints] = useState(null); // null = not loaded
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If `daily` is passed directly as prop, just use it and don't call API
    if (Array.isArray(daily)) {
      const normalized = daily.map((d) => ({
        date: d.date ?? d.day ?? d.ts,
        avg: Math.max(0, Math.min(1, d.avg ?? d.average ?? d.daily_average ?? 0)),
      }));
      setDataPoints(normalized);
      setLoading(false);
      return;
    }

    // If no user, nothing to load
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
          `http://localhost:8080/user/${userId}/daily_stress?days=${days}`,
          { headers: authHeader() }
        );
        if (!mounted) return;

        const normalized = (res.data || []).map((d) => ({
          date: d.date ?? d.day ?? d.ts,
          avg: Math.max(0, Math.min(1, d.avg ?? d.average ?? d.daily_average ?? 0)),
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
  }, [userId, days, daily]);

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm mt-6 text-sm text-slate-500">
        Building your weekly stress trend…
      </div>
    );
  }

  // 🔹 Empty / no data state
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm mt-6 text-sm text-slate-500">
        No daily data yet — your weekly trend will appear here once you’ve used
        the app for a few days.
      </div>
    );
  }

  // From here onwards, we are sure we have data ✅
  const labels = useMemo(
    () => dataPoints.map((p) => (p.date ? new Date(p.date) : "")),
    [dataPoints]
  );
  const values = useMemo(() => dataPoints.map((p) => p.avg), [dataPoints]);

  // Last 7 days highlighted
  const bg = dataPoints.map((_, idx) =>
    idx >= Math.max(0, dataPoints.length - 7) ? "#ef4444" : "#60a5fa"
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily avg",
        data: values,
        backgroundColor: bg,
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: "time", time: { unit: "day" } },
      y: {
        min: 0,
        max: 1,
        ticks: {
          callback: (v) => `${Math.round(v * 100)}%`,
        },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-800">Weekly Trend</h3>
        <div className="text-xs text-slate-500">{dataPoints.length} days</div>
      </div>

      <div className="mt-4" style={{ height: 240 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
