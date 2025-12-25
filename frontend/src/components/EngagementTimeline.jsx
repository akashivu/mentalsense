
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { authHeader } from "../services/AuthService";
import { Activity } from "lucide-react";
import SkeletonCard from "./SkeletonCard";
import BASE from "../api/base";


export default function EngagementTimeline({ userId, days = 30 }) {
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load engagement data when userId or days change
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

        // normalize API response into Date objects and numeric counts
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
    // Show placeholder card while data is empty (or loading)
    return (
      <SkeletonCard loading={loading} heightClass="h-28">
        <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-md">
          <div className="flex flex-col items-center justify-center py-6">
            <Activity className="h-10 w-10 text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-gray-600 text-center">No engagement data yet</p>
            <p className="text-xs text-gray-400 text-center mt-1 max-w-xs">
              Your interactions will appear here once you start using the app regularly
            </p>
          </div>
        </div>
      </SkeletonCard>
    );
  }

  // labels are dates; Chart.js time scale expects Date objects or ISO strings.
  const labels = points.map((p) => p.date);
  const values = points.map((p) => p.count);

  const totalInteractions = values.reduce((sum, v) => sum + v, 0);
  const avgPerDay = (totalInteractions / values.length).toFixed(1);
  const maxDay = Math.max(...values);

  // GRAY professional line
  const lineGray = "#6B7280";
  const fillGray = "rgba(107,114,128,0.10)";

  const data = {
    labels,
    datasets: [
      {
        label: "Interactions per day",
        data: values,
        borderColor: lineGray,
        backgroundColor: fillGray,
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "white",
        pointBorderColor: lineGray,
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
        ticks: { maxTicksLimit: 6, color: "#64748b", padding: 6 },
        grid: { display: false, drawBorder: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: "#64748b", padding: 6 },
        grid: { color: "rgba(203,213,225,0.3)", lineWidth: 1 },
        border: { display: false },
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
          // Tooltip: format date as readable string and show count
          title: (items) =>
            items[0]?.parsed?.x ? new Date(items[0].parsed.x).toDateString() : "",
          label: (ctx) => `Interactions: ${ctx.parsed.y}`,
        },
      },
    },
    interaction: { intersect: false, mode: "index" },
  };

  return (
    <SkeletonCard loading={loading} heightClass="h-28">
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-md flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-300 group">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Engagement Timeline</h3>
              <p className="text-xs text-gray-500 font-medium">Daily activity tracking</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">{days}d</span>
        </div>

        {/* Small summary cards for quick glance metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs font-semibold text-blue-700">Total</p>
            </div>
            <p className="text-lg font-black text-blue-900">{totalInteractions}</p>
          </div>
          <div className="p-2.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs font-semibold text-purple-700">Avg/Day</p>
            </div>
            <p className="text-lg font-black text-purple-900">{avgPerDay}</p>
          </div>
          <div className="p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs font-semibold text-amber-700">Peak</p>
            </div>
            <p className="text-lg font-black text-amber-900">{maxDay}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="relative -mx-1" style={{ height: 90 }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </SkeletonCard>
  );
}
