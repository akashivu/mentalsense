import React, { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatHourRange(h) {
  if (h == null || isNaN(h)) return "Not enough data";
  const start = h % 24;
  const end = (h + 1) % 24;

  const toLabel = (x) => {
    const suffix = x === 0 ? "AM" : x < 12 ? "AM" : "PM";
    let hr = x % 12;
    if (hr === 0) hr = 12;
    return `${hr}${suffix}`;
  };

  return `${toLabel(start)} – ${toLabel(end)}`;
}

export default function InsightCard({ userId }) {
  const [hourly, setHourly] = useState(Array(24).fill(0));
  const [dow, setDow] = useState(Array(7).fill(0));
  const [weekInsight, setWeekInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const [hourRes, dowRes, dailyRes] = await Promise.all([
          axios.get(
            `http://localhost:8080/user/${userId}/hourly-stress?days=7`,
            { headers: authHeader() }
          ),
          axios.get(
            `http://localhost:8080/user/${userId}/dow-stress?days=28`,
            { headers: authHeader() }
          ),
          axios.get(
            `http://localhost:8080/user/${userId}/daily-stress?days=14`,
            { headers: authHeader() }
          ),
        ]);

        if (!mounted) return;

        const hArr = hourRes.data?.hours ?? [];
        const hNorm = Array(24).fill(0);
        hArr.forEach((v, i) => {
          if (i >= 0 && i < 24 && typeof v === "number") hNorm[i] = v;
        });
        setHourly(hNorm);

        const dArr = dowRes.data?.dow ?? [];
        const dNorm = Array(7).fill(0);
        dArr.forEach((v, i) => {
          if (i >= 0 && i < 7 && typeof v === "number") dNorm[i] = v;
        });
        setDow(dNorm);

        const rawDaily = Array.isArray(dailyRes.data) ? dailyRes.data : [];
        const dailyAvgs = rawDaily
          .map((d) => d.avg ?? d.average ?? d.daily_average ?? d.value)
          .filter((v) => typeof v === "number");

        if (dailyAvgs.length >= 8) {
          const last7 = dailyAvgs.slice(-7);
          const prev7 = dailyAvgs.slice(-14, -7);

          if (prev7.length > 0) {
            const avg = (arr) =>
              arr.reduce((s, v) => s + v, 0) / arr.length;

            const aThis = avg(last7);
            const aPrev = avg(prev7);
            const diff = aThis - aPrev;
            const pct =
              aPrev === 0 ? null : Math.round((diff / aPrev) * 100);

            setWeekInsight({
              thisWeek: aThis,
              lastWeek: aPrev,
              diff,
              pct,
            });
          }
        }
      } catch (e) {
        console.error("Failed to load insights", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  let maxHourIndex = null;
  if (hourly.some((v) => v > 0)) {
    maxHourIndex = hourly.reduce(
      (bestIdx, val, idx) =>
        val > hourly[bestIdx] ? idx : bestIdx,
      0
    );
  }

  let maxDowIndex = null;
  if (dow.some((v) => v > 0)) {
    maxDowIndex = dow.reduce(
      (bestIdx, val, idx) =>
        val > dow[bestIdx] ? idx : bestIdx,
      0
    );
  }

  let minDowIndex = null;
  const nonZeroDays = dow
    .map((v, i) => ({ v, i }))
    .filter((x) => x.v > 0);
  if (nonZeroDays.length > 0) {
    minDowIndex = nonZeroDays.reduce((best, cur) =>
      cur.v < best.v ? cur : best
    ).i;
  }

  let weekText = "Not enough weekly data yet.";
  if (weekInsight) {
    const { diff, pct } = weekInsight;
    if (pct === null) {
      weekText = "Tracking weekly trend…";
    } else if (diff < 0) {
      weekText = `Your average stress this week is about ${Math.abs(
        pct
      )}% lower than last week. Nice progress 👏`;
    } else if (diff > 0) {
      weekText = `Your average stress this week is about ${pct}% higher than last week. Looks like a tougher week — remember to take short breaks 💙`;
    } else {
      weekText =
        "Your average stress this week is about the same as last week.";
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] p-6 
      transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
      
      <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
        Your Insights
      </h3>

      {loading && (
        <div className="text-sm text-slate-500">Calculating insights…</div>
      )}

      {!loading && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">🕐</span>
              <div>
                <p className="text-sm font-semibold text-[#0F172A] mb-1">Most stressful hour</p>
                <p className="text-sm text-slate-600">
                  {maxHourIndex != null
                    ? formatHourRange(maxHourIndex)
                    : "Not enough data yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">📅</span>
              <div>
                <p className="text-sm font-semibold text-[#0F172A] mb-1">Most stressful day</p>
                <p className="text-sm text-slate-600">
                  {maxDowIndex != null
                    ? DAY_NAMES[maxDowIndex]
                    : "Not enough data"}
                </p>
              </div>
            </div>
          </div>

          {minDowIndex != null && (
            <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">✨</span>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A] mb-1">You're calmest on</p>
                  <p className="text-sm text-slate-600">{DAY_NAMES[minDowIndex]}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-100">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">📊</span>
              <div>
                <p className="text-sm font-semibold text-[#0F172A] mb-1">Weekly comparison</p>
                <p className="text-sm text-slate-600">{weekText}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}