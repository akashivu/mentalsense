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

          setDow(Array.from({ length: 7 }, () => Math.random() * 0.9));
          return;
        }

        setDow([]); // new user → no data
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

  const title =
    mode === "keystroke"
      ? "Keystroke: Weekly Pattern"
      : mode === "emotion"
      ? "Emotion: Weekly Pattern"
      : "Weekly Stress Pattern";

  const max = Array.isArray(dow) ? Math.max(...dow, 0.0001) : 0.0001;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                    rounded-2xl p-4 shadow-sm hover:shadow-md transition-all min-h-[260px] flex flex-col">

      
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                        flex items-center justify-center shadow-md">
          <BarChart3 className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Last {days} days
          </p>
        </div>
      </div>

     
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3">
            Analyzing weekly patterns…
          </p>
        </div>
      )}

      {!loading && (!dow || dow.length === 0 || dow.every((v) => v === 0)) && (
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <Calendar className="w-6 h-6 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            No weekly data yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Use MentalSense consistently to unlock weekly insights.
          </p>
        </div>
      )}

      {!loading && dow && dow.length > 0 && !dow.every((v) => v === 0) && (
        <>
          
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
                          rounded-xl p-3 space-y-2">
            {dow.map((val, i) => {
              const ratio = val / max;
              const width = `${Math.round(ratio * 100)}%`;

              let color = "#22c55e";
              if (ratio > 0.66) color = "#ef4444";
              else if (ratio > 0.33) color = "#facc15";

              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-9 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {DAY_NAMES[i]}
                  </span>

                  <div className="flex-1 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 
                                  overflow-hidden border relative">
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
          <div className="flex justify-center gap-4 mt-3 text-[11px] text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-500" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-yellow-400" /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-500" /> High
            </span>
          </div>
        </>
      )}
    </div>
  );
}
