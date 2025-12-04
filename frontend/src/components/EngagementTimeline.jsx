import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { authHeader } from "../services/AuthService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend
);

export default function EngagementTimeline({ userId, days = 30 }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/engagement?days=${days}`,
          { headers: authHeader() }
        );

        if (!mounted) return;

        const arr = Array.isArray(res.data) ? res.data : [];
        // normalize to { date: Date, count: number }
        const normalized = arr.map((d) => ({
          date: d.day ? new Date(d.day) : new Date(),
          count: typeof d.count === "number" ? d.count : 0,
        }));

        setPoints(normalized);
      } catch (e) {
        console.error("Failed to load engagement timeline", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, days]);

  const labels = points.map((p) => p.date);
  const values = points.map((p) => p.count);

  const data = {
    labels,
    datasets: [
      {
        label: "Interactions per day",
        data: values,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
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
        ticks: { maxTicksLimit: 10 },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) =>
            items[0]?.parsed?.x
              ? new Date(items[0].parsed.x).toDateString()
              : "",
          label: (ctx) => `Interactions: ${ctx.parsed.y}`,
        },
      },
    },
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-800">
          Engagement Timeline
        </h3>
        <div className="text-xs text-slate-500">Last {days} days</div>
      </div>

      <div className="mt-4" style={{ height: 260 }}>
        {points.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            {loading ? "Loading…" : "No engagement data yet."}
          </div>
        )}
      </div>
    </div>
  );
}
