import React, { useEffect, useState } from "react";
import EmotionBox from "../components/EmotionBox";
import EmotionGraph from "../components/EmotionGraph";
import WeeklyTrend from "../components/WeeklyTrend";
import TrendGraph from "../components/TrendGraph";
import AnomalyAlert from "../components/AnomalyAlert";
import axios from "axios";

export default function Dashboard() {
  const userId = localStorage.getItem("userId");

  const [predictions, setPredictions] = useState([]);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [anomaly, setAnomaly] = useState(false);

 
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

    const p = {
      label,
      combined_score: combined,
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
      const histRes = await axios.get(
        `http://localhost:8080/history/${userId}`
      );

      const values = histRes.data.map((item) => item.stressScore);

      if (!values || values.length === 0) return;

      const res = await axios.post(
        `http://localhost:8080/user/${userId}/trend`,
        { past_values: values }
      );

      setPast(res.data.past || []);
      setFuture(res.data.future || []);

     
      const lastVal = values[values.length - 1];
      checkAnomaly(lastVal);

    } catch (err) {
      console.error("Trend fetch error:", err);
    }
  };

  
  const checkAnomaly = async (lastValue) => {
    try {
      const res = await axios.post(
        `http://localhost:8080/user/${userId}/anomaly`,
        { value: Number(lastValue) }
      );

      if (res.data.anomaly === -1) {
        setAnomaly(true);
      } else {
        setAnomaly(false);
      }
    } catch (err) {
      console.error("Anomaly error:", err);
    }
  };

  
  useEffect(() => {
    fetchTrend();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <div className="text-sm text-slate-500">Check your emotional health</div>
        </header>

       
        <AnomalyAlert visible={anomaly} />

        
        <EmotionBox onNewPrediction={onNewPrediction} />

        
        <TrendGraph past={past} future={future} />

        
        <WeeklyTrend days={14} />

        
        <EmotionGraph data={predictions} />

      </div>
    </div>
  );
}
