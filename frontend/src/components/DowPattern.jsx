import React, { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DowPattern({ userId, days = 28 }) {
  const [dow, setDow] = useState(null); // null = no data yet
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
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/dow-stress?days=${days}`,
          { headers: authHeader() }
        );

        const arr = res.data?.dow ?? [];
        if (!mounted) return;

        const normalized = Array(7).fill(0);
        arr.forEach((v, i) => {
          if (i >= 0 && i < 7 && typeof v === "number") {
            normalized[i] = v;
          }
        });

        setDow(normalized);
      } catch (e) {
        console.error("Failed to load DOW stress", e);
        if (mounted) {
          setDow([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, days]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm mt-6 text-sm text-slate-500">
        Analyzing which days are most stressful for you…
      </div>
    );
  }

  // Empty / no meaningful data
  if (!dow || dow.length === 0 || dow.every((v) => v === 0)) {
    return (
      <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm mt-6 text-sm text-slate-500">
        Not enough data yet to show a day-of-week stress pattern. Keep using
        the app and we’ll surface insights here.
      </div>
    );
  }

  const max = Math.max(...dow, 0.0001);

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-800">
          Day-of-Week Stress Pattern
        </h3>
        <div className="text-xs text-slate-500">Last {days} days</div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {dow.map((val, i) => {
          const ratio = val / max;
          const width = `${ratio * 100}%`;

          const color =
            val === 0
              ? "bg-gray-200"
              : ratio < 0.33
              ? "bg-green-300"
              : ratio < 0.66
              ? "bg-yellow-300"
              : "bg-red-400";

          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-10 text-slate-600">{DAY_NAMES[i]}</span>
              <div className="flex-1 h-5 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full ${color}`} style={{ width }} />
              </div>
              <span className="w-10 text-right text-xs text-slate-500">
                {Math.round(val * 100)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
