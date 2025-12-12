
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import EmotionBox from "../components/EmotionBox";
import EmotionGraph from "../components/EmotionGraph";
import WeeklyTrend from "../components/WeeklyTrend";
import TrendGraph from "../components/TrendGraph";
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
import AnomalyAlert from "../components/AnomalyAlert";

import {
  Brain,
  Search,
  Home,
  LayoutDashboard,
  FileText,
  Calendar,
  Bot,
  LogOut,
  Activity,
} from "lucide-react";

import axios from "axios";
import { authHeader } from "../services/AuthService";


function SidebarNav() {
  const baseClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all";
  const activeClass = "bg-indigo-600 text-white shadow-md";
  const normalClass =
    "text-gray-300 hover:bg-gray-800 hover:text-white font-medium";

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : normalClass}`}
      >
        <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
        <span>Dashboard</span>
      </NavLink>

      
      <NavLink
        to="/dashboard#home"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <Home className="h-5 w-5" strokeWidth={2} />
        <span>Home</span>
      </NavLink>

      
      <NavLink
        to="/dashboard#weekly"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <FileText className="h-5 w-5" strokeWidth={2} />
        <span>Weekly Report</span>
      </NavLink>

      
      <NavLink
        to="/dashboard#engagement"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <Activity className="h-5 w-5" strokeWidth={2} />
        <span>Engagement Timeline</span>
      </NavLink>

   
      <NavLink
        to="/dashboard#aicoach"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <Bot className="h-5 w-5" strokeWidth={2} />
        <span>AI Coach Panel</span>
      </NavLink>
    </nav>
  );
}

/* ------------------------- Dashboard Component ------------------------ */
export default function Dashboard() {
  const userId = localStorage.getItem("userId");
  const location = useLocation();

  const [predictions, setPredictions] = useState([]);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const [weeklyStats, setWeeklyStats] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  const [hourlyForInsights, setHourlyForInsights] = useState([]);
  const [hourlyLoading, setHourlyLoading] = useState(true);

  const [dowForInsights, setDowForInsights] = useState([]);
  const [dowLoading, setDowLoading] = useState(true);

  const [mode, setMode] = useState("combined");

 
  const latest = predictions.length > 0 ? predictions[0] : null;

  const combinedScore = (() => {
    if (!latest) {
      return past.length > 0 ? past[past.length - 1] : 0;
    }
    return typeof latest.combined_score === "number" ? latest.combined_score : 0;
  })();

  const keystrokeScore =
    latest && typeof latest.keystroke_score === "number" ? latest.keystroke_score : combinedScore;

  const emotionScore =
    latest && typeof latest.text_score === "number" ? latest.text_score : combinedScore;

  const currentScore =
    mode === "keystroke" ? keystrokeScore : mode === "emotion" ? emotionScore : combinedScore;

  const trendDir = (() => {
    if (past.length < 2) return "flat";

    const last = past[past.length - 1];
    const prev = past[past.length - 2];

    if (last > prev + 0.02) return "up";
    if (last < prev - 0.02) return "down";
    return "flat";
  })();

  // ===== Anomaly Detection ===== //
  function getAnomalyMessage() {
    if (!latest) return null;

    const score = latest.combined_score ?? 0;

    
    if (score > 0.8) {
      return "High stress spike detected.";
    }

    // Sudden increase
    if (past.length > 1) {
      const last = past[past.length - 1];
      const prev = past[past.length - 2];

      if (last - prev > 0.2) {
        return "Sudden increase in stress detected.";
      }
    }

    return null;
  }

  const anomalyMessage = getAnomalyMessage();

  // ===== On New Prediction ===== //
  const onNewPrediction = (res) => {
    const payload = res?.result ?? res;

    let combined =
      payload?.combined_score ??
      payload?.combinedScore ??
      payload?.stress_score ??
      payload?.stressScore ??
      0;

    combined = Math.max(0, Math.min(1, combined));

    let keystroke = typeof payload?.keystroke_score === "number" ? payload.keystroke_score : null;

    if (keystroke != null) keystroke = Math.max(0, Math.min(1, keystroke));

    const tm = payload?.text_metrics ?? payload?.textMetrics;
    let textStress = tm?.stress_score ?? tm?.negative_prob ?? tm?.score ?? null;

    if (textStress != null) textStress = Math.max(0, Math.min(1, textStress));

    const p = {
      ...payload,
      combined_score: combined,
      keystroke_score: keystroke,
      text_score: textStress,
      ts: payload?.ts ?? payload?.createdAt ?? new Date().toISOString(),
    };

    setPredictions((prev) => [p, ...prev].slice(0, 12));

    fetchTrend();
  };

  // ===== Fetch Trend ===== //
  async function fetchTrend() {
    try {
      if (!userId) return;

      const histRes = await axios.get(`http://localhost:8080/history/${userId}`, {
        headers: authHeader(),
      });

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
  }

  useEffect(() => {
    if (userId) fetchTrend();
    
  }, [userId]);

  
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        setWeeklyLoading(true);
        const res = await axios.get(`http://localhost:8080/user/${userId}/weekly-stats`, {
          headers: authHeader(),
        });
        setWeeklyStats(res.data);
      } catch {
        setWeeklyStats(null);
      } finally {
        setWeeklyLoading(false);
      }
    })();

    (async () => {
      try {
        setHourlyLoading(true);
        const res = await axios.get(`http://localhost:8080/user/${userId}/hourly-stress?days=7`, {
          headers: authHeader(),
        });
        setHourlyForInsights(res.data.hours || []);
      } catch {
        setHourlyForInsights([]);
      } finally {
        setHourlyLoading(false);
      }
    })();

    (async () => {
      try {
        setDowLoading(true);
        const res = await axios.get(`http://localhost:8080/user/${userId}/dow-stress?days=28`, {
          headers: authHeader(),
        });
        setDowForInsights(res.data.dow || []);
      } catch {
        setDowForInsights([]);
      } finally {
        setDowLoading(false);
      }
    })();
    
  }, [userId]);

  
  useEffect(() => {
    
    if (!location || !location.hash) return;

   
    const id = location.hash.replace("#", "");
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        
        el.scrollIntoView({ behavior: "smooth", block: "center" });

       
        el.classList.add("ring-2", "ring-indigo-200", "ring-offset-2");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-indigo-200", "ring-offset-2");
        }, 1200);
      }
    }, 60);

    return () => clearTimeout(t);
  }, [location.hash]);


  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 text-gray-900">
      
      <aside className="w-64 bg-gray-900 border-r-2 border-gray-800 flex-shrink-0 overflow-hidden flex flex-col shadow-xl">
      
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">MentalSense</h2>
              <p className="text-xs text-gray-400 font-medium">AI Stress Monitor</p>
            </div>
          </div>
        </div>

      
        <SidebarNav />

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
             
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all shadow-md"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

     
      <div className="flex-1 overflow-y-auto bg-gray-50 relative">
     
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 py-6 space-y-6">
         
         <header className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-200">
  
  <div>
    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
    <p className="text-sm text-gray-600 mt-1 font-medium">Today's mental snapshot</p>
  </div>

  
  <div
    className="hidden md:flex items-center text-sm font-semibold rounded-xl px-4 py-2"
    style={{
      background: "linear-gradient(90deg,#eef2ff,#f3e8ff)",
      color: "#5b21b6",
      boxShadow: "0 4px 14px rgba(99,102,241,0.18)",
    }}
  >
    <span className="mr-2 w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 animate-pulse"></span>
    Your AI wellness companion is here ✨
  </div>
</header>


          
          <div>
            <StressModeTabs mode={mode} onChange={setMode} />
          </div>

        
          <main className="space-y-6 pb-8">
           
            <AnomalyAlert message={anomalyMessage} />

            
            <div id="trend" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              <div className="lg:col-span-8 space-y-4">
                <TrendGraph past={past} future={future} mode={mode} />

               
                <div id="engagement">
                  <EngagementTimeline userId={userId} mode={mode} />
                </div>

                <WeeklySummary
                  thisWeek={weeklyStats?.thisWeek}
                  lastWeek={weeklyStats?.lastWeek}
                  trend={weeklyStats?.trend}
                  loading={weeklyLoading}
                  mode={mode}
                />
              </div>

             
              <div id="aicoach" className="lg:col-span-4 space-y-4">
                <AiCoachPanel mode={mode} />
              </div>
            </div>

           
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <EmotionBox onNewPrediction={onNewPrediction} />
              </div>
              <div className="lg:col-span-5">
                <InsightPanel score={currentScore} trend={trendDir} weekly={past} mode={mode} />
              </div>
            </div>

           
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
             
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SummaryCard score={combinedScore} trend={trendDir} mode="combined" />
                <SummaryCard score={keystrokeScore} trend={trendDir} mode="keystroke" />
                <SummaryCard score={emotionScore} trend={trendDir} mode="emotion" />
              </div>

            
              <div className="lg:col-span-4">
                <WeeklyTrend days={14} mode={mode} />
              </div>
            </div>

            
            <div id="home" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <EmotionGraph data={predictions} mode={mode} />
              <DailyMoodCalendar userId={userId} days={28} mode={mode} />
              <DailyTrend userId={userId} mode={mode} />
            </div>

           
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HourlyHeatmap userId={userId} mode={mode} />

             
              <div id="weekly">
                <DowPattern userId={userId} mode={mode} />
              </div>
            </div>

           
            <InsightsFeed
              hourly={hourlyForInsights}
              dow={dowForInsights}
              trend={weeklyStats?.trend}
              loading={hourlyLoading || dowLoading || weeklyLoading}
              mode={mode}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
