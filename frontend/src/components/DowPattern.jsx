import React, { useEffect, useState } from "react";
import { BarChart3, Calendar } from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DowPattern({
  userId,
  days = 28,
  mode = "combined",
  useDemoData = false, 
}) {
  const [dow, setDow] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    
    if (!userId) {
      setDow([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
      
        if (useDemoData) {
          await new Promise((r) => setTimeout(r, 500));
          if (!mounted) return;

          const demo = Array.from({ length: 7 }, () =>
            Math.random() * 0.9
          );
          setDow(demo);
          return;
        }

        
        

        const data = []; 
        setDow(data);
      } catch (e) {
        console.error("Failed to load DOW stress", e);
        if (mounted) setDow([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, days, mode, useDemoData]);

 
  const cfg = {
    badgeBg: "#0f172a",   
    iconColor: "#ffffff",
    low: "#22c55e",       
    mid: "#facc15",      
    high: "#ef4444",      
  };

  const title =
    mode === "keystroke"
      ? "Keystroke: Weekly pattern"
      : mode === "emotion"
      ? "Emotion: Weekly pattern"
      : "Weekly stress pattern";


  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[200px] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3">
          Analyzing weekly patterns…
        </p>
      </div>
    );
  }

  
  if (!dow || dow.length === 0 || dow.every((v) => v === 0)) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[200px] flex flex-col justify-center items-center text-center">
        <div className="bg-slate-900 p-2 rounded-full mb-3">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <p className="font-semibold text-slate-800">No weekly data yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Use MentalSense consistently to unlock weekly insights.
        </p>
      </div>
    );
  }

  const max = Math.max(...dow, 0.0001);

  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-1.5 rounded-md"
          style={{ background: cfg.badgeBg }}
        >
          <BarChart3 className="w-4 h-4" style={{ color: cfg.iconColor }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500">{days} days</p>
        </div>
      </div>

      {/* BARS */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        {dow.map((val, i) => {
          const ratio = val / max;
          const width = `${Math.round(ratio * 100)}%`;

          let color = cfg.low;
          if (ratio > 0.66) color = cfg.high;
          else if (ratio > 0.33) color = cfg.mid;

          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-9 text-xs font-semibold text-slate-700">
                {DAY_NAMES[i]}
              </span>

              <div className="flex-1 h-7 rounded-lg bg-slate-200 overflow-hidden border border-slate-300 relative">
                <div
                  className="h-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width, backgroundColor: color }}
                >
                  <span className="text-[11px] font-bold text-slate-900">
                    {Math.round(val * 100)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LEGEND */}
      <div className="flex justify-center gap-4 mt-3 text-[11px] text-slate-700">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: cfg.low }} />
          Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: cfg.mid }} />
          Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: cfg.high }} />
          High
        </span>
      </div>
    </div>
  );
}
