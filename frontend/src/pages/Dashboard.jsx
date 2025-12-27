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

function SidebarNav() {
  const baseClass =
    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";
  const activeClass = "bg-indigo-600 text-white shadow-sm";
  const normalClass =
    "text-gray-300 hover:bg-gray-800 hover:text-white";

  return (
    <nav className="flex-1 px-3 py-6 space-y-1">
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

export default function Dashboard() {
  const userId = localStorage.getItem("userId");
  const demo = isDemoMode();

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
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 flex-shrink-0 overflow-hidden flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">MentalSense</h2>
              <p className="text-xs text-gray-400 font-medium">AI Wellness Platform</p>
            </div>
          </div>
        </div>

        <SidebarNav />

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="w-full max-w-[1600px] mx-auto px-6 py-6 space-y-6">
          {/* Header */}
          <header className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl px-7 py-5 shadow-lg border border-white/60">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1.5 font-medium">Monitor your mental wellness journey</p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm font-semibold rounded-xl px-5 py-2.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-indigo-700 border border-indigo-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse shadow-sm"></span>
              AI Coach Active ✨
            </div>
          </header>

         <main className="space-y-8 pb-10">

  
  {(isFirstTimeUser || anomalyMessage) && (
    <section className="space-y-4">
      {isFirstTimeUser && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-blue-900 mb-2">
            Welcome to MentalSense 
          </h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            Start typing naturally. MentalSense learns your rhythm and emotional
            signals over time — privately and securely.
          </p>
        </div>
      )}
      <AnomalyAlert message={anomalyMessage} />
    </section>
  )}


  <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
    
    <div className="xl:col-span-8 space-y-6">
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

    
    <div className="xl:col-span-4 xl:sticky xl:top-6 h-fit">
      <AiCoachPanel mode={stressMode} />
    </div>
  </section>

  
<section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch auto-rows-fr">
  <div className="lg:col-span-4 h-full">
    <InsightPanel
      score={currentScore}
      trend={trendDir}
      weekly={past}
      mode={stressMode}
    />
  </div>

  <div className="lg:col-span-3 h-full">
    <WeeklySummary
      thisWeek={weeklyStats?.thisWeek}
      lastWeek={weeklyStats?.lastWeek}
      trend={weeklyStats?.trend}
      loading={weeklyLoading}
      mode={stressMode}
    />
  </div>

  <div className="lg:col-span-5 h-full">
    <WeeklyTrend days={14} mode={stressMode} />
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