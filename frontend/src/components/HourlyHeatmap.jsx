import React, { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";

export default function HourlyHeatmap({ userId, mode = "combined" }) {
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/hourly-stress?days=7&mode=${mode}`,
          { headers: authHeader() }
        );
        setHours(res.data.hours || []);
      } catch (e) {
        console.error("Error loading hourly stress", e);
        setHours([]);
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      load();
    }
  }, [userId, mode]); 

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow text-sm text-gray-500">
        Collecting more data to build your hourly stress heatmap…
      </div>
    );
  }

  if (!hours || hours.length === 0 || hours.every((v) => v === 0)) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow text-sm text-gray-500">
        Not enough data yet — use the app regularly to unlock your hourly stress
        heatmap.
      </div>
    );
  }

  const max = Math.max(...hours, 0.0001);

  
  const title =
    mode === "keystroke"
      ? "Keystroke Stress by Hour (Last 7 Days)"
      : mode === "emotion"
      ? "Emotion Text Stress by Hour (Last 7 Days)"
      : "Stress by Hour of Day (Last 7 Days)";

  const helperText =
    mode === "keystroke"
      ? "Blocks show relative intensity of keystroke-based stress for each hour."
      : mode === "emotion"
      ? "Blocks show relative intensity of emotion-based stress for each hour."
      : "Blocks show relative intensity of overall stress for each hour.";

  return (
    <div className="bg-white rounded-2xl p-4 shadow mt-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <div className="grid grid-cols-12 gap-1 text-xs">
        {hours.map((val, i) => {
          const intensity = val / max;
          const color =
            intensity === 0
              ? "bg-gray-100"
              : intensity < 0.33
              ? "bg-green-200"
              : intensity < 0.66
              ? "bg-yellow-300"
              : "bg-red-400";

          return (
            <div
              key={i}
              className={`h-10 flex flex-col items-center justify-center ${color} rounded`}
            >
              <span>{i}</span>
              <span className="opacity-60">{Math.round(val * 100)}</span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-500 mt-1">
        {helperText} Values represent relative intensity, not absolute scores.
      </p>
    </div>
  );
}
