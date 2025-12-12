import React, { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";


export default function HourlyHeatmap({ userId, mode = "combined" }) {
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        //using synthetic data here so UI works without backend rteplace with real API call
        setTimeout(() => {
          const demoHours = Array.from({ length: 24 }, () => Math.random() * 0.8);
          setHours(demoHours);
          setLoading(false);
        }, 600);
      } catch (e) {
        console.error("Error loading hourly stress", e);
        setHours([]);
        setLoading(false);
      }
    }
    if (userId) load();
  }, [userId, mode]);

  const title =
    mode === "keystroke"
      ? "Stress by Hour (Keystroke)"
      : mode === "emotion"
      ? "Stress by Hour (Emotion)"
      : "Stress by Hour";

  const helperText =
    mode === "keystroke"
      ? "Keystroke intensity by hour"
      : mode === "emotion"
      ? "Emotion intensity by hour"
      : "Overall intensity by hour";

  /* Visual palette config per mode  */
  const MODE_CFG = {
    keystroke: {
      badgeBg: "linear-gradient(90deg,#f0f9ff,#e6f4ff)",
      iconColor: "#0369a1",
      low: "linear-gradient(90deg,#a7f3d0,#6ee7b7)",
      mid: "linear-gradient(90deg,#fde68a,#fbbf24)",
      high: "linear-gradient(90deg,#fecaca,#f87171)",
    },
    emotion: {
      badgeBg: "linear-gradient(90deg,#faf5ff,#f3efff)",
      iconColor: "#6d28d9",
      low: "linear-gradient(90deg,#a7f3d0,#6ee7b7)",
      mid: "linear-gradient(90deg,#fde68a,#fbbf24)",
      high: "linear-gradient(90deg,#fecaca,#f87171)",
    },
    combined: {
      badgeBg: "linear-gradient(90deg,#eef2ff,#e6f4ff)",
      iconColor: "#0ea5a4",
      low: "linear-gradient(90deg,#a7f3d0,#6ee7b7)",
      mid: "linear-gradient(90deg,#fde68a,#fbbf24)",
      high: "linear-gradient(90deg,#fecaca,#f87171)",
    },
  };

  const cfg = MODE_CFG[mode] || MODE_CFG.combined;

  // Compute summary stats and human-friendly ranges from hours 
  const insights = useMemo(() => {
    if (!Array.isArray(hours) || hours.length === 0) return null;

    const arr = hours.slice(0, 24).map((v) => (typeof v === "number" && !isNaN(v) ? Math.max(0, v) : 0));
    while (arr.length < 24) arr.push(0);

    const max = Math.max(...arr, 0);
    const nonZero = arr.filter((v) => v > 0);
    const minNonZero = nonZero.length ? Math.min(...nonZero) : 0;

    const peakIndexes = arr.reduce((acc, v, i) => {
      if (Math.abs(v - max) < 1e-9) acc.push(i);
      return acc;
    }, []);

    const lowestIndexes = [];
    if (minNonZero > 0) {
      arr.forEach((v, i) => {
        if (Math.abs(v - minNonZero) < 1e-9) lowestIndexes.push(i);
      });
    } else {
      arr.forEach((v, i) => {
        if (v === 0) lowestIndexes.push(i);
      });
    }

    const sum = arr.reduce((s, v) => s + v, 0);
    const avg = sum / arr.length;

    const counts = { low: 0, med: 0, high: 0 };
    arr.forEach((v) => {
      const rel = max > 0 ? v / max : 0;
      if (v === 0) counts.low++;
      else if (rel < 0.33) counts.low++;
      else if (rel < 0.66) counts.med++;
      else counts.high++;
    });

    const hrListToRanges = (list) => {
      if (!list || list.length === 0) return "None";
      const sorted = [...list].sort((a, b) => a - b);
      const ranges = [];
      let start = sorted[0];
      let prev = sorted[0];
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === prev + 1) prev = sorted[i];
        else {
          ranges.push(start === prev ? `${start}:00` : `${start}:00–${prev}:00`);
          start = sorted[i];
          prev = sorted[i];
        }
      }
      ranges.push(start === prev ? `${start}:00` : `${start}:00–${prev}:00`);
      return ranges.join(", ");
    };

    const eveningAvg = (arr[17] + arr[18] + arr[19]) / 3;
    const morningAvg = (arr[7] + arr[8] + arr[9]) / 3;
    const nightAvg = (arr[1] + arr[2] + arr[3]) / 3;

    const patterns = [];
    const threshold = Math.max(0.06, avg * 0.25);

    if (eveningAvg - avg > threshold) patterns.push("Evening spike (5–7 PM)");
    if (morningAvg - avg > threshold) patterns.push("Morning uptick (7–9 AM)");
    if (avg - nightAvg > threshold) patterns.push("Night calm (1–3 AM)");

    const significantPoints = arr.filter((v) => v > avg + threshold).length;
    if (significantPoints >= 6) patterns.push("Irregular spikes throughout the day");

    let summary = "No strong hourly pattern detected.";
    if (patterns.length === 1) summary = `Notable pattern: ${patterns[0]}.`;
    else if (patterns.length > 1) summary = `Patterns: ${patterns.join("; ")}.`;

    return {
      peakHours: hrListToRanges(peakIndexes),
      lowestHours: hrListToRanges(lowestIndexes),
      averagePercent: Math.round(avg * 100),
      counts,
      summary,
      raw: { max, min: Math.min(...arr), avg, arr },
    };
  }, [hours]);

  if (loading) {
    // Loading placeholder UI
    return (
      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-slate-100 min-h-[200px] flex flex-col hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2 mb-3">
          <div style={{ background: cfg.badgeBg }} className="p-1 rounded-md">
            <Clock className="w-4 h-4" style={{ color: cfg.iconColor }} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3">Analyzing hourly patterns…</p>
        </div>
      </div>
    );
  }

  if (!hours || hours.length === 0 || hours.every((v) => v === 0)) {
    return (
      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-slate-100 min-h-[200px] flex flex-col hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2 mb-3">
          <div style={{ background: cfg.badgeBg }} className="p-1 rounded-md">
            <Clock className="w-4 h-4" style={{ color: cfg.iconColor }} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-3">
          <div className="p-2 rounded-full bg-slate-100 mb-2">
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">No Data Yet</p>
          <p className="text-xs text-slate-500">Use the app regularly to unlock hourly insights.</p>
        </div>
      </div>
    );
  }

  // Prevent divide-by-zero when computing intensity
  const max = Math.max(...hours, 0.0001);

  return (
    <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-slate-100 min-h-[200px] hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div style={{ background: cfg.badgeBg }} className="p-1 rounded-md">
            <Clock className="w-4 h-4" style={{ color: cfg.iconColor }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{helperText}</p>
          </div>
        </div>

        <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
          24h
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 mb-2">
        <div className="grid grid-cols-12 gap-1">
          {hours.map((val, i) => {
            const intensity = val / max; // 0..1
            const pct = Math.round(val * 100);

            // choose fill and matching subtle border color
            let fill = "linear-gradient(90deg,#f8fafc,#f8fafc)";
            let borderColor = "#eef2f7";

            if (intensity === 0) {
              fill = "linear-gradient(90deg,#f8fafc,#f8fafc)";
              borderColor = "#eef2f7";
            } else if (intensity < 0.33) {
              fill = cfg.low;
              borderColor = "#9fe5c5"; 
            } else if (intensity < 0.66) {
              fill = cfg.mid;
              borderColor = "#f7d86a";
            } else {
              fill = cfg.high;
              borderColor = "#fca5a5"; 
            }

            const textColor = intensity > 0.5 ? "#071124" : "#0f172a";

            return (
           
              <div
                key={i}
                className="h-10 flex flex-col items-center justify-center rounded-md transition-transform duration-150 hover:scale-105 cursor-pointer"
                title={`${i}:00 — ${pct}%`}
                style={{
                  background: fill,
                  border: `1px solid ${borderColor}`,
                }}
                aria-label={`Hour ${i}, ${pct} percent`}
              >
                <span className="text-[10px] font-semibold" style={{ color: textColor }}>
                  {i}
                </span>
                <span className="text-[9px] font-medium" style={{ color: textColor }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
        <span className="truncate font-medium">{helperText}</span>
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: "linear-gradient(90deg,#a7f3d0,#6ee7b7)", border: "1px solid #9fe5c5" }}
            />
            <span className="text-slate-600">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: "linear-gradient(90deg,#fde68a,#fbbf24)", border: "1px solid #f7d86a" }}
            />
            <span className="text-slate-600">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: "linear-gradient(90deg,#fecaca,#f87171)", border: "1px solid #fca5a5" }}
            />
            <span className="text-slate-600">High</span>
          </div>
        </div>
      </div>

      {/* Insights Toggle */}
      <div className="mt-3">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md transition-colors"
        >
          {showInsights ? "Hide Analysis ▲" : "View Analysis ▼"}
        </button>

        {showInsights && insights && (
          <div className="mt-2 bg-white border border-slate-100 rounded-lg p-3 text-[12px] text-slate-700 leading-relaxed shadow-sm">
            <div className="mb-1 font-semibold text-slate-800">Hourly Stress Insights</div>

            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <div className="text-[11px] text-slate-500">Peak hours</div>
                <div className="font-semibold text-slate-800">{insights.peakHours}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Lowest hours</div>
                <div className="font-semibold text-slate-800">{insights.lowestHours}</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500">Average intensity</div>
                <div className="font-semibold text-slate-800">{insights.averagePercent}%</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Distribution</div>
                <div className="font-semibold text-slate-800">
                  Low {insights.counts.low} • Med {insights.counts.med} • High {insights.counts.high}
                </div>
              </div>
            </div>

            <div className="mt-3 text-[13px] text-slate-700">{insights.summary}</div>

            <p className="mt-2 text-[11px] text-slate-500">
              These insights are computed from your hourly intensity data and are meant to help you spot trends.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
