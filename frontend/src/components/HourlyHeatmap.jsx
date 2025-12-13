import React, { useEffect, useMemo, useState } from "react";
import { Clock, Lock } from "lucide-react";

/* ================================
   CONFIG
================================ */
const UNLOCK_THRESHOLD = 24; // hours needed to unlock insights

export default function HourlyHeatmap({
  userId,
  mode = "combined",
  useDemoData = false,
}) {
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);

  /* ================================
     DATA LOADING
  ================================ */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // No user → no data
      if (!userId) {
        setHours([]);
        setLoading(false);
        return;
      }

      // Demo mode (portfolio / UI showcase)
      if (useDemoData) {
        setTimeout(() => {
          const demo = Array.from({ length: 24 }, () =>
            Math.random() * 0.85
          );
          setHours(demo);
          setLoading(false);
        }, 500);
        return;
      }

      // Real API (replace later)
      try {
        // const res = await fetch(`/api/user/${userId}/hourly-stress`);
        // const data = await res.json();
        const data = []; // new user → no data
        setHours(data);
      } catch (e) {
        console.error(e);
        setHours([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, mode, useDemoData]);

  /* ================================
     UNLOCK LOGIC
  ================================ */
  const dataPoints = Array.isArray(hours)
    ? hours.filter((v) => v > 0).length
    : 0;

  const progressPercent = Math.min(
    Math.round((dataPoints / UNLOCK_THRESHOLD) * 100),
    100
  );

  const insightsUnlocked = dataPoints >= UNLOCK_THRESHOLD;

  /* ================================
     COLOR SYSTEM (HIGH CONTRAST)
  ================================ */
  const cfg = {
    badgeBg: "#0f172a",
    iconColor: "#ffffff",
    low: "#22c55e",   // green
    mid: "#facc15",   // yellow
    high: "#ef4444",  // red
  };

  const title = "Stress by Hour";
  const helperText = "Hourly stress intensity (24h)";

  /* ================================
     INSIGHTS COMPUTATION
  ================================ */
  const insights = useMemo(() => {
    if (!Array.isArray(hours) || hours.length === 0) return null;

    const arr = hours.map((v) => Math.max(0, v));
    const max = Math.max(...arr, 0.0001);
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;

    const peakHours = arr
      .map((v, i) => (v === max ? `${i}:00` : null))
      .filter(Boolean)
      .join(", ");

    return {
      avg: Math.round(avg * 100),
      peakHours,
    };
  }, [hours]);

  /* ================================
     LOADING
  ================================ */
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[220px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  /* ================================
     EMPTY STATE
  ================================ */
  if (!hours || hours.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[220px] flex flex-col justify-center items-center text-center">
        <div className="bg-slate-900 p-2 rounded-full mb-3">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <p className="font-semibold text-slate-800">No data yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Use MentalSense regularly to unlock insights.
        </p>
      </div>
    );
  }

  const max = Math.max(...hours, 0.0001);

  /* ================================
     MAIN RENDER
  ================================ */
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-1.5 rounded-md"
          style={{ background: cfg.badgeBg }}
        >
          <Clock className="w-4 h-4" style={{ color: cfg.iconColor }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500">{helperText}</p>
        </div>
      </div>

      {/* HEATMAP */}
      <div className="grid grid-cols-12 gap-1 mb-3 bg-slate-50 p-2 rounded-xl border">
        {hours.map((val, i) => {
          const intensity = val / max;
          let color = "#e5e7eb";

          if (intensity > 0.66) color = cfg.high;
          else if (intensity > 0.33) color = cfg.mid;
          else if (intensity > 0) color = cfg.low;

          return (
            <div
              key={i}
              className="h-10 rounded-md flex flex-col items-center justify-center text-[10px] font-semibold text-slate-900"
              style={{ backgroundColor: color }}
              title={`${i}:00 — ${Math.round(val * 100)}%`}
            >
              {i}
            </div>
          );
        })}
      </div>

      {/* LEGEND */}
      <div className="flex justify-between text-[11px] text-slate-600 mb-3">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: cfg.low }} /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: cfg.mid }} /> Med
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: cfg.high }} /> High
        </span>
      </div>

      {/* UNLOCK PROGRESS */}
      {!insightsUnlocked && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-3 mb-3">
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>Collecting data</span>
            <span>{dataPoints}/{UNLOCK_THRESHOLD} hrs</span>
          </div>
          <div className="h-2 bg-slate-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Insights unlock automatically after sufficient usage.
          </p>
        </div>
      )}

      {/* INSIGHTS */}
      <button
        disabled={!insightsUnlocked}
        onClick={() => setShowInsights(!showInsights)}
        className={`w-full text-xs font-semibold py-2 rounded-md flex items-center justify-center gap-2
          ${
            insightsUnlocked
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }
        `}
      >
        {!insightsUnlocked && <Lock className="w-3 h-3" />}
        {insightsUnlocked ? "View Insights" : "Insights Locked"}
      </button>

      {showInsights && insightsUnlocked && insights && (
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
          <p><b>Average intensity:</b> {insights.avg}%</p>
          <p><b>Peak hours:</b> {insights.peakHours || "—"}</p>
        </div>
      )}
    </div>
  );
}
