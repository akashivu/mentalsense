import React, { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";
import { Calendar } from "lucide-react";

export default function DailyMoodCalendar({
  userId,
  days = 28,
  mode = "combined",
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch daily stress values whenever userId/days/mode changes
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

  // Convert API array into a quick lookup map for ISO date → score
  const stressByDay = new Map();
  data.forEach((d) => {
    stressByDay.set(d.day, d.avgStress);
  });

  // Build the last N calendar days so the UI stays consistent even with gaps
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

  // Small visual scale representing stress intensity
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

  // Tooltip shows a clearer label depending on active mode
  const tooltipLabel =
    mode === "keystroke"
      ? "Avg keystroke stress"
      : mode === "emotion"
      ? "Avg emotion-based stress"
      : "Avg stress";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm px-5 py-5 h-52 md:h-56 flex flex-col hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${mode === 'keystroke' ? 'bg-sky-100' : mode === 'emotion' ? 'bg-purple-100' : 'bg-gradient-to-br from-teal-100 to-cyan-100'}`}>
            <Calendar className={`w-4 h-4 ${mode === 'keystroke' ? 'text-sky-600' : mode === 'emotion' ? 'text-purple-600' : 'text-teal-600'}`} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
        </div>
        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
          {days}d
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Simple loading spinner placeholder */}
          <div className="relative">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Loading calendar...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          {/* Calendar heatmap grid */}
          <div className="bg-slate-50/50 rounded-xl p-2 border border-slate-100">
            <div className="grid grid-cols-7 gap-1">
              {daysArray.map((d) => (
                <div
                  key={d.iso}
                  className={`h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-semibold text-slate-800 transition-all duration-200 hover:scale-110 hover:shadow-md cursor-pointer ${getColorClass(
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
          </div>

          {/* Mini legend explaining stress colors */}
          <div className="flex items-center justify-center flex-wrap gap-2 text-[9px] text-slate-600 px-2 py-1.5">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-green-300 shadow-sm border border-emerald-300/50" />
              <span className="font-medium">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-blue-300 shadow-sm border border-amber-400/50" />
              <span className="font-medium">Med</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-red-400 shadow-sm border border-red-500/50" />
              <span className="font-medium">High</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded border border-slate-300 bg-slate-100 shadow-sm" />
              <span className="font-medium">None</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
