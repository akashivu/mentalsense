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
import HeroStressCard from "../components/HeroStressCard";
import BASE from "../api/base";

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
import { isDemoMode } from "../hooks/useDemo";

import {
  
  DEMO_PAST,
  DEMO_WEEKLY_STATS,
  DEMO_HOURLY,
  DEMO_DOW,
  DEMO_PREDICTIONS,
} from "../demo/demoData";

function SidebarNav({ onNavigate }) {
  const baseClass =
    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";
  const activeClass = "bg-indigo-600 text-white shadow-sm";
  const normalClass =
    "text-gray-300 hover:bg-gray-800 hover:text-white";

  return (
 <nav className="px-3 py-4 space-y-1">


      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        end
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : normalClass}`}
      >
        <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/dashboard#home"
         onClick={onNavigate}
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <Home className="h-5 w-5" strokeWidth={2} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/dashboard#weekly"
         onClick={onNavigate}
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <FileText className="h-5 w-5" strokeWidth={2} />
        <span>Weekly Report</span>
      </NavLink>

      <NavLink
        to="/dashboard#engagement"
         onClick={onNavigate}
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <Activity className="h-5 w-5" strokeWidth={2} />
        <span>Engagement Timeline</span>
      </NavLink>

      <NavLink
        to="/dashboard#aicoach"
         onClick={onNavigate}
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

export default function Dashboard() {
  const userId = localStorage.getItem("userId");
  const demo = isDemoMode();

  const location = useLocation();

  const [predictions, setPredictions] = useState([]);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [weeklyStats, setWeeklyStats] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  const [hourlyForInsights, setHourlyForInsights] = useState([]);
  const [hourlyLoading, setHourlyLoading] = useState(true);

  const [dowForInsights, setDowForInsights] = useState([]);
  const [dowLoading, setDowLoading] = useState(true);

  const [stressMode, setStressMode] = useState("combined");

  const latest = predictions.length > 0 ? predictions[0] : null;

  const combinedScore = (() => {
    if (!latest) {
      return past.length > 0 ? past[past.length - 1] : 0;
    }
    return typeof latest.combined_score === "number" ? latest.combined_score : 0;
  })();

  const keystrokeScore =
    latest && typeof latest.keystroke_score === "number" ? latest.keystroke_score : combinedScore;

  const textScore =
    latest && typeof latest.text_score === "number"
      ? latest.text_score
      : combinedScore;

  const currentScore =
  stressMode === "keystroke"
    ? keystrokeScore
    : stressMode === "emotion"
    ? textScore
    : combinedScore;


  const trendDir = (() => {
    if (past.length < 2) return "flat";

    const last = past[past.length - 1];
    const prev = past[past.length - 2];

    if (last > prev + 0.02) return "up";
    if (last < prev - 0.02) return "down";
    return "flat";
  })();

  const isFirstTimeUser = past.length < 3;

  function getAnomalyMessage() {
    if (!latest) return null;

    const score = latest.combined_score ?? 0;

    if (score > 0.8) {
      return "High stress spike detected.";
    }

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

    
  };

  
  

useEffect(() => {
  if (!userId || demo) return;


    (async () => {
      try {
        setWeeklyLoading(true);
       const res = await axios.get(`${BASE}/user/${userId}/weekly-stats`, {
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
        const res = await axios.get(
  `${BASE}/user/${userId}/hourly-stress?days=7`,
  { headers: authHeader() }
);

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
       const res = await axios.get(
  `${BASE}/user/${userId}/dow-stress?days=28`,
  { headers: authHeader() }
);

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

  const heroStress = {
    keystroke: {
      current: keystrokeScore,
      weekly: past.slice(-7),
      trend: trendDir,
    },
    text: {
      current: textScore,
      weekly: past.slice(-7),
      trend: trendDir,
    },
    combined: {
      current: combinedScore,
      weekly: past.slice(-7),
      trend: trendDir,
    },
  };
useEffect(() => {
  if (!demo) return;

  console.log("[Dashboard] Running in DEMO mode");

  // core timeline
  setPredictions(DEMO_PREDICTIONS);
  setPast(DEMO_PAST);

  // weekly
  setWeeklyStats(DEMO_WEEKLY_STATS);
  setWeeklyLoading(false);

  // insights
  setHourlyForInsights(DEMO_HOURLY);
  setDowForInsights(DEMO_DOW);
  setHourlyLoading(false);
  setDowLoading(false);
}, [demo]);

  return (
   <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-50 ">
     {mobileSidebarOpen && (
  <div className="fixed inset-0 z-50 lg:hidden">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setMobileSidebarOpen(false)}
    />

    {/* Drawer */}
    <aside className="absolute left-0 top-0 h-full w-64 bg-gray-900 flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <h2 className="text-white font-bold text-lg">MentalSense</h2>
      </div>
         <SidebarNav onNavigate={() => setMobileSidebarOpen(false)} />
      
    </aside>
  </div>
)}

  <aside
  className="
    hidden lg:flex
    fixed left-0 top-0
    h-screen w-64
    bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800
    flex-col
    z-40
  " 
>
  <div className="p-5 border-b border-gray-800 shrink-0">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
        <Brain className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">MentalSense</h2>
        <p className="text-xs text-gray-400">AI Wellness Platform</p>
      </div>
    </div>
  </div>

  
  <div className="flex-1  overflow-y-auto">
    <SidebarNav />
  </div>

  
  <div className="p-3 border-t border-gray-800 shrink-0">
    <button
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-red-600 text-white"
    >
      <LogOut className="h-5 w-5" />
      Logout
    </button>
  </div>
</aside>


       
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative lg:ml-64" >
       <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6" style={{ zoom: "0.8" }}>

        
          {/* Header */}
         <header className="flex items-center justify-between bg-white rounded-lg px-6 py-4 shadow-sm border border-gray-200">
  <div>
    <h1 className="text-2xl font-semibold text-gray-900">
      Dashboard
    </h1>
    <p className="text-sm text-gray-600 mt-0.5">Mental wellness insights and analytics</p>
  </div>

  <div className="hidden md:flex items-center gap-2.5 text-sm font-medium rounded-lg px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100">
    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
    AI Analysis Active
  </div>
  
  <button
    className="lg:hidden p-2.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
    onClick={() => setMobileSidebarOpen(true)}
    aria-label="Open navigation menu"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
</header>
         <main className="space-y-8 pb-10">

  
 {(isFirstTimeUser || anomalyMessage || isDemoMode) && (
  <section className="space-y-4">
    {isFirstTimeUser && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
          Welcome to MentalSense
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Begin typing naturally. The system analyzes your patterns over time with complete privacy and security.
        </p>
      </div>
    )}
    
    {isDemoMode && (
      <div className="border border-gray-300 bg-gray-50 rounded-lg p-5 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Demo Mode
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Currently displaying sample data for demonstration purposes. Actual insights will reflect your personal patterns once you begin using the application.
          </p>
        </div>
      </div>
    )}

    <AnomalyAlert message={anomalyMessage} />
  </section>
)}


  <section section id="engagement" className="grid grid-cols-1 xl:grid-cols-12 gap-6">

  {/* Left main content */}
  <div  className="xl:col-span-8 space-y-6">
    <HeroStressCard
      data={heroStress}
      stressMode={stressMode}
      onChange={setStressMode}
    />

    <TrendGraph
      past={past}
      future={future}
      mode={stressMode}
    />

    <EngagementTimeline
      userId={userId}
      mode={stressMode}
    />
  </div>

  
  <div  section id="aicoach" className="xl:col-span-4 space-y-6 xl:sticky xl:top-6">
    <AiCoachPanel mode={stressMode} />

    
    <WeeklyTrend days={14} mode={stressMode} />
  </div>

</section>

  
<section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

  {/* Insight */}
  <div className="lg:col-span-7 flex min-w-0">
    <InsightPanel
      score={currentScore}
      trend={trendDir}
      weekly={past}
      mode={stressMode}
    />
  </div>

  

  
    <div  section id="weekly" className="col-span-5 flex min-w-0">
      <WeeklySummary
        thisWeek={weeklyStats?.thisWeek}
        lastWeek={weeklyStats?.lastWeek}
        trend={weeklyStats?.trend}
        loading={weeklyLoading}
        mode={stressMode}
      />
    </div>

  
    

  
</section>


 
  <section>
    <EmotionBox onNewPrediction={onNewPrediction} />
  </section>


  <section>
    <SummaryCard
      data={{
        keystroke: { current: keystrokeScore },
        text: { current: textScore },
        combined: { current: combinedScore },
      }}
      stressMode={stressMode}
    />
  </section>

  
  <section
    id="home"
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    <EmotionGraph data={predictions} mode={stressMode} />
    <DailyMoodCalendar userId={userId} days={28} mode={stressMode} />
    <DailyTrend userId={userId} mode={stressMode} />
  </section>

 
  <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <HourlyHeatmap userId={userId} mode={stressMode} />
    <DowPattern userId={userId} mode={stressMode} />
  </section>

  
  <section>
    <InsightsFeed
      hourly={hourlyForInsights}
      dow={dowForInsights}
      trend={weeklyStats?.trend}
      loading={hourlyLoading || dowLoading || weeklyLoading}
      mode={stressMode}
    />
  </section>

</main>

        </div>
      </div>
    </div>
  );
}