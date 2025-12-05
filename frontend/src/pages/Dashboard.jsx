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

  const currentScore = (() => {
    if (predictions.length > 0) {
      return predictions[0].combined_score;
    }
    if (past.length > 0) {
      return past[past.length - 1];
    }
    return 0;
  })();

  const trendDir = (() => {
    if (past.length < 2) return "flat";

    const last = past[past.length - 1];
    const prev = past[past.length - 2];

    if (last > prev + 0.02) return "up";
    if (last < prev - 0.02) return "down";
    return "flat";
  })();

  const onNewPrediction = (res) => {
    const payload = res && res.result ? res.result : res;

    const label =
      payload?.text_metrics?.label ??
      payload?.label ??
      payload?.textMetrics?.label ??
      "unknown";

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

    const ts =
      payload?.ts ??
      payload?.createdAt ??
      new Date().toISOString();

    const p = { label, combined_score: combined, ts };

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

       
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <div className="text-sm text-slate-500">
            Check your emotional health
          </div>
        </header>

        
        <SummaryCard score={currentScore} trend={trendDir} />
        <InsightPanel
          score={currentScore}
          trend={trendDir}
          weekly={past}
        />

        
        <EmotionBox onNewPrediction={onNewPrediction} />

       
        <TrendGraph past={past} future={future} />
        <WeeklyTrend days={14} />
        <EmotionGraph data={predictions} />

        
        <DailyMoodCalendar userId={userId} days={28} />
        <DailyTrend userId={userId} />

      
        <div className="grid md:grid-cols-2 gap-4">
         
          <WeeklySummary
            thisWeek={weeklyStats?.thisWeek}
            lastWeek={weeklyStats?.lastWeek}
            trend={weeklyStats?.trend}
            loading={weeklyLoading}
          />

         
          <EngagementTimeline userId={userId} />

         
          <HourlyHeatmap userId={userId} />
          <DowPattern userId={userId} />
        </div>

        
        <InsightsFeed
          hourly={hourlyForInsights}
          dow={dowForInsights}
          trend={weeklyStats?.trend}
          loading={hourlyLoading || dowLoading || weeklyLoading}
        />
      </div>
    </div>
  );
}
