import React, { useEffect, useState } from "react";
import EmotionBox from "../components/EmotionBox";
import EmotionGraph from "../components/EmotionGraph";
import WeeklyTrend from "../components/WeeklyTrend";
import TrendGraph from "../components/TrendGraph";
import AnomalyAlert from "../components/AnomalyAlert";
import DailyTrend from "../components/DailyTrend";
import SummaryCard from "../components/SummaryCard";
import DailyMoodCalendar from "../components/DailyMoodCalendar";
import InsightPanel from "../components/InsightPanel";
import HourlyHeatmap from "../components/HourlyHeatmap";
import DowPattern from "../components/DowPattern";

import EngagementTimeline from "../components/EngagementTimeline";
import WeeklySummary from "../components/WeeklySummary";
import InsightsFeed from "../components/InsightsFeed";
import AiCoachPanel from "../components/AiCoachPanel";

import StressModeTabs from "../components/StressModeTabs";

import axios from "axios";
import { authHeader } from "../services/AuthService";

export default function Dashboard() {
  const userId = localStorage.getItem("userId");

  const [predictions, setPredictions] = useState([]);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [anomaly, setAnomaly] = useState(false);

  const [weeklyStats, setWeeklyStats] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  const [hourlyForInsights, setHourlyForInsights] = useState([]);
  const [hourlyLoading, setHourlyLoading] = useState(true);

  const [dowForInsights, setDowForInsights] = useState([]);
  const [dowLoading, setDowLoading] = useState(true);

  // 🔹 Global stress view mode: "keystroke" | "emotion" | "combined"
  const [mode, setMode] = useState("combined");

  // 🔹 DERIVED SCORES FROM LATEST PREDICTION

  // latest prediction from EmotionBox (if any)
  const latest = predictions.length > 0 ? predictions[0] : null;

  // combined score (main stress index)
  const combinedScore = (() => {
    if (!latest) {
      // fall back to last value from trend if available
      return past.length > 0 ? past[past.length - 1] : 0;
    }
    return typeof latest.combined_score === "number"
      ? latest.combined_score
      : 0;
  })();

  // keystroke-only stress
  const keystrokeScore = (() => {
    if (!latest) return combinedScore;
    if (typeof latest.keystroke_score === "number") {
      return latest.keystroke_score;
    }
    // fallback to combined if keystroke not available
    return combinedScore;
  })();

  // emotion/text-only stress
  const emotionScore = (() => {
    if (!latest) return combinedScore;
    if (typeof latest.text_score === "number") {
      return latest.text_score;
    }
    // fallback to combined if emotion-score not available
    return combinedScore;
  })();

  // 🔥 this is what SummaryCard / InsightPanel see
  const currentScore =
    mode === "keystroke"
      ? keystrokeScore
      : mode === "emotion"
      ? emotionScore
      : combinedScore;

  const trendDir = (() => {
    if (past.length < 2) return "flat";

    const last = past[past.length - 1];
    const prev = past[past.length - 2];

    if (last > prev + 0.02) return "up";
    if (last < prev - 0.02) return "down";
    return "flat";
  })();

  // 🔹 Handle new prediction from EmotionBox
  const onNewPrediction = (res) => {
    // EmotionBox sends "out" directly, but also sometimes wrapped as { result: out }
    const payload = res && res.result ? res.result : res;

    // Emotion label
    const label =
      payload?.text_metrics?.label ??
      payload?.label ??
      payload?.textMetrics?.label ??
      "unknown";

    // Combined score (main stress index)
    let combined =
      typeof payload?.combined_score === "number"
        ? payload.combined_score
        : typeof payload?.combinedScore === "number"
        ? payload.combinedScore
        : typeof payload?.stress_score === "number"
        ? payload.stress_score
        : typeof payload?.stressScore === "number"
        ? payload.stressScore
        : 0;
    combined = Math.max(0, Math.min(1, combined));

    // Keystroke-only stress (if backend sent it)
    let keystroke =
      typeof payload?.keystroke_score === "number"
        ? payload.keystroke_score
        : null;
    if (keystroke != null) {
      keystroke = Math.max(0, Math.min(1, keystroke));
    }

    // Text / emotion-only stress (try a few common fields, fall back to null)
    const tm = payload?.text_metrics ?? payload?.textMetrics ?? null;
    let textStress =
      typeof tm?.stress_score === "number"
        ? tm.stress_score
        : typeof tm?.negative_prob === "number"
        ? tm.negative_prob
        : typeof tm?.score === "number"
        ? tm.score
        : null;
    if (textStress != null) {
      textStress = Math.max(0, Math.min(1, textStress));
    }

    const ts =
      payload?.ts ??
      payload?.createdAt ??
      new Date().toISOString();

    // store full enriched prediction object
    const p = {
      ...payload,
      label,
      combined_score: combined,
      keystroke_score: keystroke,
      text_score: textStress,
      ts,
    };

    setPredictions((prev) => {
      const next = [p, ...prev];
      return next.slice(0, 12);
    });

    fetchTrend();
  };

  const fetchTrend = async () => {
    try {
      if (!userId) return;

      const histRes = await axios.get(
        `http://localhost:8080/history/${userId}`,
        { headers: authHeader() }
      );

      const values = histRes.data.map((item) => item.stressScore);
      if (!values || values.length === 0) return;

      const res = await axios.post(
        `http://localhost:8080/user/${userId}/trend`,
        { past_values: values },
        { headers: authHeader() }
      );

      setPast(res.data.past || []);
      setFuture(res.data.future || []);
    } catch (err) {
      console.error("Trend fetch error:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTrend();
    }
  }, [userId]);

  // 🔹 Insights & stats fetch (currently combined; later can be mode-aware)
  useEffect(() => {
    if (!userId) {
      return;
    }

    console.log("Dashboard insights useEffect, userId =", userId);

    (async () => {
      try {
        setWeeklyLoading(true);
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/weekly-stats`,
          { headers: authHeader() }
        );
        console.log("Weekly stats:", res.data);
        setWeeklyStats(res.data);
      } catch (e) {
        console.error("Weekly stats error", e);
        setWeeklyStats(null);
      } finally {
        setWeeklyLoading(false);
      }
    })();

    (async () => {
      try {
        setHourlyLoading(true);
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/hourly-stress?days=7`,
          { headers: authHeader() }
        );
        console.log("Hourly for insights:", res.data);
        setHourlyForInsights(res.data.hours || []);
      } catch (e) {
        console.error("Hourly (insights) error", e);
        setHourlyForInsights([]);
      } finally {
        setHourlyLoading(false);
      }
    })();

    (async () => {
      try {
        setDowLoading(true);
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/dow-stress?days=28`,
          { headers: authHeader() }
        );
        console.log("DOW for insights:", res.data);
        setDowForInsights(res.data.dow || []);
      } catch (e) {
        console.error("DOW (insights) error", e);
        setDowForInsights([]);
      } finally {
        setDowLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <div className="text-sm text-slate-500">
            Check your emotional health
          </div>
        </header>

        {/* 🔹 Global stress mode tabs */}
        <StressModeTabs mode={mode} onChange={setMode} />

        {/* Current summary + insights (mode-aware, using currentScore) */}
        <SummaryCard score={currentScore} trend={trendDir} mode={mode} />
        <InsightPanel
          score={currentScore}
          trend={trendDir}
          weekly={past}
          mode={mode}
        />

        {/* Emotion input box (already combined + keystroke-aware) */}
        <EmotionBox onNewPrediction={onNewPrediction} />

        {/* Trends & graphs */}
        <TrendGraph past={past} future={future} mode={mode} />
        <WeeklyTrend days={14} mode={mode} />
        <EmotionGraph data={predictions} mode={mode} />

        {/* Calendar + daily trends */}
        <DailyMoodCalendar userId={userId} days={28} mode={mode} />
        <DailyTrend userId={userId} mode={mode} />

        {/* Grid: weekly summary, engagement, heatmap, DOW pattern */}
        <div className="grid md:grid-cols-2 gap-4">
          <WeeklySummary
            thisWeek={weeklyStats?.thisWeek}
            lastWeek={weeklyStats?.lastWeek}
            trend={weeklyStats?.trend}
            loading={weeklyLoading}
            mode={mode}
          />

          <EngagementTimeline userId={userId} mode={mode} />

          <HourlyHeatmap userId={userId} mode={mode} />
          <DowPattern userId={userId} mode={mode} />
        </div>

        {/* Insights + AI coach */}
        <InsightsFeed
          hourly={hourlyForInsights}
          dow={dowForInsights}
          trend={weeklyStats?.trend}
          loading={hourlyLoading || dowLoading || weeklyLoading}
          mode={mode}
        />

        <AiCoachPanel mode={mode} />
      </div>
    </div>
  );
}
