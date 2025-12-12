import React, { useEffect, useState } from "react";
import { BarChart3, Calendar } from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];



export default function DowPattern({ userId, days = 28, mode = "combined" }) {
  const [dow, setDow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setDow(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        // Demo delay used in UI while ML/backend isn't wired here
        await new Promise((r) => setTimeout(r, 600));
        if (!mounted) return;

        const normalized = Array(7).fill(0);
        for (let i = 0; i < 7; i++) {
          // random demo values with occasional zeros to simulate missing days
          normalized[i] = Math.round((Math.random() * 0.92 + 0.03) * 100) / 100;
          if (Math.random() < 0.18) normalized[i] = 0;
        }

        setDow(normalized);
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
  }, [userId, days, mode]);

  const title =
    mode === "keystroke"
      ? "Keystroke: Day patterns"
      : mode === "emotion"
      ? "Emotion: Day patterns"
      : "Weekly stress pattern";

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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 px-4 py-4 shadow-sm min-h-[200px] hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2 mb-3">
          <div style={{ background: cfg.badgeBg }} className="p-1 rounded-md">
            <BarChart3 className="w-4 h-4" style={{ color: cfg.iconColor }} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3">Analyzing weekly patterns…</p>
        </div>
      </div>
    );
  }

  if (!dow || dow.length === 0 || dow.every((v) => v === 0)) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 px-4 py-4 shadow-sm min-h-[200px] hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2 mb-3">
          <div style={{ background: cfg.badgeBg }} className="p-1 rounded-md">
            <BarChart3 className="w-4 h-4" style={{ color: cfg.iconColor }} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-3">
          <div className="p-2 rounded-full bg-slate-100 mb-2">
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">No Data</p>
          <p className="text-xs text-slate-500">Use the app and we'll surface weekly insights.</p>
        </div>
      </div>
    );
  }

  const max = Math.max(...dow, 0.0001);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-4 py-4 shadow-sm min-h-[200px] hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div style={{ background: cfg.badgeBg }} className="p-1 rounded-md">
            <BarChart3 className="w-4 h-4" style={{ color: cfg.iconColor }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{days}d</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
        <div className="flex flex-col gap-2">
          {dow.map((val, i) => {
            const ratio = val / max;
            const widthPct = Math.round(ratio * 10000) / 100;
            const width = `${widthPct}%`;

            let fillStyle = cfg.low;
            if (val === 0) fillStyle = "linear-gradient(90deg,#f8fafc,#f8fafc)";
            else if (ratio < 0.33) fillStyle = cfg.low;
            else if (ratio < 0.66) fillStyle = cfg.mid;
            else fillStyle = cfg.high;

            // decide if percent fits inside the bar
            const showPercentInside = widthPct > 14;

            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 text-xs font-semibold text-slate-700">{DAY_NAMES[i]}</span>

                {/* NOTE: added pr-14 to reserve space on the right for outside labels */}
                <div className="flex-1 h-7 rounded-lg bg-slate-200/50 overflow-hidden border border-slate-200 shadow-sm relative pr-14">
                  <div
                    className="h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    style={{
                      width,
                      background: fillStyle,
                      boxShadow: "inset 0 -2px 8px rgba(0,0,0,0.04)",
                    }}
                    aria-hidden
                  >
                    {val > 0 && showPercentInside && (
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          color: "#04202a",
                          // small padding when bar is very wide so text doesn't touch right edge
                          paddingRight: widthPct > 85 ? "8px" : undefined,
                        }}
                      >
                        {Math.round(val * 100)}%
                      </span>
                    )}
                  </div>

                 
                  {val > 0 && !showPercentInside && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-[11px] font-bold text-slate-800 bg-white/90 px-1 rounded-sm shadow-sm">
                        {Math.round(val * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {val === 0 ? (
                  <span className="w-12 text-right text-[11px] text-slate-400 font-medium">No data</span>
                ) : (
                  // keep placeholder to preserve layout; hidden visually
                  <span className="w-12 text-right text-[11px] text-slate-700 font-medium hidden" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="h-2 w-6 rounded-sm" style={{ background: cfg.low }} />
          <span className="font-medium text-slate-700">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-6 rounded-sm" style={{ background: cfg.mid }} />
          <span className="font-medium text-slate-700">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-6 rounded-sm" style={{ background: cfg.high }} />
          <span className="font-medium text-slate-700">High</span>
        </div>
      </div>
    </div>
  );
}
