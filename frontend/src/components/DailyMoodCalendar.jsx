import React, { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";

export default function DailyMoodCalendar({
  userId,
  days = 28,
  mode = "combined",
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      try {
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/daily-stress?days=${days}&mode=${mode}`,
          { headers: authHeader() }
        );
        setData(res.data || []);
      } catch (err) {
        console.error("DailyMoodCalendar error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, days, mode]);

  
  const stressByDay = new Map();
  data.forEach((d) => {
   
    stressByDay.set(d.day, d.avgStress);
  });

  
  const daysArray = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const iso = date.toISOString().split("T")[0];
    const label = date.getDate(); 
    const score = stressByDay.get(iso) ?? null;
    daysArray.push({ iso, label, score });
  }

  const getColorClass = (score) => {
    if (score == null) return "bg-slate-100 border border-slate-200";
    if (score < 0.33) return "bg-emerald-200";
    if (score < 0.66) return "bg-amber-300";
    return "bg-red-400";
  };

  
  const title =
    mode === "keystroke"
      ? "Daily Keystroke Stress Calendar"
      : mode === "emotion"
      ? "Daily Emotion Text Stress Calendar"
      : "Daily Overall Stress Calendar";

  
  const tooltipLabel =
    mode === "keystroke"
      ? "Avg keystroke stress"
      : mode === "emotion"
      ? "Avg emotion-based stress"
      : "Avg stress";

  return (
    <div className="bg-white rounded-2xl shadow p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800">
          {title}
        </h2>
        <span className="text-xs text-slate-400">
          Last {days} days
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {daysArray.map((d) => (
              <div
                key={d.iso}
                className={`h-7 w-7 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-[10px] md:text-xs text-slate-800 ${getColorClass(
                  d.score
                )}`}
                title={
                  d.score == null
                    ? `${d.iso} • No data`
                    : `${d.iso} • ${tooltipLabel}: ${(d.score * 100).toFixed(
                        0
                      )}%`
                }
              >
                {d.label}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-3 text-[10px] md:text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-emerald-200" /> Low
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-300" /> Medium
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-red-400" /> High
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded border border-slate-200 bg-slate-100" /> No data
            </div>
          </div>
        </>
      )}
    </div>
  );
}
