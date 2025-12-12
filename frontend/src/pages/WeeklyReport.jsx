import React, { useEffect, useState } from "react";
import WeeklyTrend from "../components/WeeklyTrend";
import HourlyHeatmap from "../components/HourlyHeatmap";
import DowPattern from "../components/DowPattern";
import axios from "axios";
import { authHeader } from "../services/AuthService";
import { Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export default function WeeklyReport() {
  const userId = localStorage.getItem("userId");

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/weekly-stats`,
          { headers: authHeader() }
        );
        setStats(res.data);

        generateInsights(res.data);
      } catch (err) {
        console.error("Weekly stats error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  function generateInsights(data) {
    if (!data) return;

    const insightsList = [];

    if (data.trend > 0)
      insightsList.push("Your stress increased this week — consider taking more breaks.");
    else if (data.trend < 0)
      insightsList.push("Your stress improved this week — great progress!");
    else
      insightsList.push("Your stress remained stable throughout the week.");

    if (data.bestDay)
      insightsList.push(`Your calmest day was ${data.bestDay}. Try to repeat what worked that day.`);

    if (data.worstDay)
      insightsList.push(`Your most stressful day was ${data.worstDay}. Identify triggers to manage them.`);

    insightsList.push("Evening hours appear calmer compared to mornings.");

    setInsights(insightsList);
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading weekly report...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Report</h1>
          <p className="text-gray-600 mt-1 text-sm">Your last 7 days at a glance</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-4 py-2 rounded-xl shadow border">
          <Calendar className="h-4 w-4" />
          <span>This Week Summary</span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Avg Score */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
          <h3 className="text-sm text-gray-500">Average Stress</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            {(stats.average * 100).toFixed(0)}%
          </p>
        </div>

        {/* Best Day */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
          <h3 className="text-sm text-gray-500">Best Day</h3>
          <p className="text-xl font-bold mt-2 text-emerald-600">
            {stats.bestDay || "N/A"}
          </p>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
          <h3 className="text-sm text-gray-500">Weekly Change</h3>

          <div className="flex items-center gap-2 mt-2">
            {stats.trend < 0 ? (
              <ArrowDownRight className="h-5 w-5 text-emerald-600" />
            ) : stats.trend > 0 ? (
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            ) : (
              <Activity className="h-5 w-5 text-gray-500" />
            )}

            <p className="text-xl font-bold text-gray-900">
              {stats.trend.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Trend Graph */}
      <div className="bg-white rounded-2xl p-6 shadow border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Weekly Stress Trend
        </h3>
        <WeeklyTrend days={14} mode="combined" />
      </div>

      {/* Behavior Patterns (Heatmap + DOW pattern) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <HourlyHeatmap userId={userId} mode="combined" />
        <DowPattern userId={userId} mode="combined" />
      </div>

      {/* Insights List */}
      <div className="bg-white rounded-2xl p-6 shadow border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-3">Insights</h3>
        <ul className="space-y-3">
          {insights.map((i, index) => (
            <li
              key={index}
              className="text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200"
            >
              {i}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <button
        onClick={() => window.location.assign("/dashboard")}
        className="w-full py-4 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
