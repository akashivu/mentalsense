import React, { useEffect, useMemo, useState } from "react";
import { Clock, Lock } from "lucide-react";

const UNLOCK_THRESHOLD = 24;

export default function HourlyHeatmap({
  userId,
  mode = "combined",
  useDemoData = false,
}) {
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      if (!userId) {
        setHours([]);
        setLoading(false);
        return;
      }

      if (useDemoData) {
        setTimeout(() => {
          setHours(Array.from({ length: 24 }, () => Math.random() * 0.85));
          setLoading(false);
        }, 500);
        return;
      }

      try {
        setHours([]); // new user → no data
      } catch (e) {
        console.error(e);
        setHours([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, mode, useDemoData]);

  const dataPoints = Array.isArray(hours)
    ? hours.filter((v) => v > 0).length
    : 0;

  const progressPercent = Math.min(
    Math.round((dataPoints / UNLOCK_THRESHOLD) * 100),
    100
  );

  const insightsUnlocked = dataPoints >= UNLOCK_THRESHOLD;

  const title = "Stress by Hour";
  const helperText = "Hourly stress intensity (24h)";

  const insights = useMemo(() => {
    if (!Array.isArray(hours) || hours.length === 0) return null;

    const arr = hours.map((v) => Math.max(0, v));
    const max = Math.max(...arr, 0.0001);
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;

    const peakHours = arr
      .map((v, i) => (v === max ? `${i}:00` : null))
      .filter(Boolean)
      .join(", ");

    return { avg: Math.round(avg * 100), peakHours };
  }, [hours]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                    rounded-2xl p-4 shadow-sm hover:shadow-md transition-all min-h-[260px] flex flex-col">

      {/* ✅ HEADER — ALWAYS VISIBLE */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                        flex items-center justify-center shadow-md">
          <Clock className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {helperText}
          </p>
        </div>
      </div>

      {/* 🔄 BODY */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      )}

      {!loading && (!hours || hours.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Clock className="w-6 h-6 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            No data yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Use MentalSense regularly to unlock insights.
          </p>
        </div>
      )}

      {!loading && hours && hours.length > 0 && (
        <>
          {/* HEATMAP */}
          <div className="grid grid-cols-12 gap-1 mb-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border">
            {hours.map((val, i) => {
              const intensity = val / Math.max(...hours, 0.0001);
              let color = "#e5e7eb";
              if (intensity > 0.66) color = "#ef4444";
              else if (intensity > 0.33) color = "#facc15";
              else if (intensity > 0) color = "#22c55e";

              return (
                <div
                  key={i}
                  className="h-10 rounded-md flex items-center justify-center text-[10px] font-semibold"
                  style={{ backgroundColor: color }}
                  title={`${i}:00 — ${Math.round(val * 100)}%`}
                >
                  {i}
                </div>
              );
            })}
          </div>

          {!insightsUnlocked && (
            <div className="bg-slate-100 dark:bg-slate-800 border rounded-xl p-3 mb-3">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Collecting data</span>
                <span>{dataPoints}/{UNLOCK_THRESHOLD} hrs</span>
              </div>
              <div className="h-2 bg-slate-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <button
            disabled={!insightsUnlocked}
            onClick={() => setShowInsights(!showInsights)}
            className={`w-full text-xs font-semibold py-2 rounded-md flex items-center justify-center gap-2
              ${insightsUnlocked
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            {!insightsUnlocked && <Lock className="w-3 h-3" />}
            {insightsUnlocked ? "View Insights" : "Insights Locked"}
          </button>

          {showInsights && insightsUnlocked && insights && (
            <div className="mt-3 bg-slate-50 dark:bg-slate-800 border rounded-xl p-3 text-sm">
              <p><b>Average intensity:</b> {insights.avg}%</p>
              <p><b>Peak hours:</b> {insights.peakHours || "—"}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
