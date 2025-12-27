import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { authHeader } from "../services/AuthService";
import { Activity } from "lucide-react";
import SkeletonCard from "./SkeletonCard";
import BASE from "../api/base";
import { DEMO_ENGAGEMENT } from "../demo/demoData";

/* 🔴 DEMO SWITCH — turn OFF after screenshots */
const USE_DEMO = true;

export default function EngagementTimeline({ userId, days = 30 }) {
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ DEMO MODE (no API)
    if (USE_DEMO) {
      setPoints(DEMO_ENGAGEMENT.slice(-days));
      setLoading(false);
      return;
    }

    // ✅ REAL MODE (API)
    if (!userId) {
      setPoints([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const res = await axios.get(
          `${BASE}/user/${userId}/engagement?days=${days}`,
          { headers: authHeader() }
        );

        if (!mounted) return;

        const arr = Array.isArray(res.data) ? res.data : [];

        const normalized = arr.map((d) => ({
          date: d.day ? new Date(d.day) : new Date(),
          count: typeof d.count === "number" ? d.count : 0,
        }));

        setPoints(normalized);
      } catch (e) {
        console.error("Failed to load engagement timeline", e);
        if (mounted) setPoints([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, days]);

 
  if (!points || points.length === 0) {
    return (
      <SkeletonCard loading={loading} heightClass="h-28">
        <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-md flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Engagement Timeline
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Daily activity tracking
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <Activity className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              No engagement data yet
            </p>
          </div>
        </div>
      </SkeletonCard>
    );
  }


  const labels = points.map((p) => p.date);
  const values = points.map((p) => p.count);

  const total = values.reduce((s, v) => s + v, 0);
  const avg = (total / values.length).toFixed(1);
  const peak = Math.max(...values);

 
  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.12)",
        borderWidth: 3,
        tension: 0.42,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#6366f1",
        pointBorderWidth: 2,
        fill: true,
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
        ticks: { maxTicksLimit: 6, color: "#64748b" },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: "#64748b" },
        grid: { color: "rgba(203,213,225,0.3)" },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.98)",
        borderColor: "rgba(226,232,240,1)",
        borderWidth: 1,
        titleColor: "#0f172a",
        bodyColor: "#475569",
        callbacks: {
          label: (ctx) => `Interactions: ${ctx.parsed.y}`,
        },
      },
    },
    interaction: { intersect: false, mode: "index" },
  };

 
  return (
    <SkeletonCard loading={loading} heightClass="h-28">
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-md flex flex-col hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Engagement Timeline
              </h3>
              <p className="text-xs text-gray-500">
                Daily activity tracking
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
            {days}d
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="Total" value={total} color="blue" />
          <Stat label="Avg / Day" value={avg} color="purple" />
          <Stat label="Peak" value={peak} color="amber" />
        </div>

        <div className="relative h-[90px]">
          <Line data={data} options={options} />
        </div>
      </div>
    </SkeletonCard>
  );
}


function Stat({ label, value, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-900",
    purple: "bg-purple-50 border-purple-100 text-purple-900",
    amber: "bg-amber-50 border-amber-100 text-amber-900",
  };

  return (
    <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
