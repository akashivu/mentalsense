import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import TypingBox from "./components/TypingBox";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TrendContainer from "./components/TrendContainer";
import TrendGraph from "./components/TrendGraph";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import AuthSuccess from "./pages/AuthSuccess";
import WeeklyReport from "./pages/WeeklyReport";

export default function App() {
  return (
    //  Global scale wrapper (DESKTOP ONLY)
    <div className="min-h-screen xl:scale-[0.8] xl:origin-top xl:w-[125%]">
      <Router>
        <Routes>
  <Route path="/" element={<Navigate to="/login" replace />} />

  <Route path="/login" element={<Login />} />
  <Route
    path="/demo"
    element={<Navigate to="/login?demo=true" replace />}
  />

  <Route path="/register" element={<Register />} />
  <Route path="/auth/success" element={<AuthSuccess />} />
  <Route path="/onboarding" element={<Onboarding />} />
  <Route path="/dashboard" element={<Dashboard />} />

  <Route path="/trend" element={<TrendContainer />} />
  <Route path="/trend-graph" element={<TrendGraph />} />
  <Route path="/weekly-report" element={<WeeklyReport />} />
</Routes>

      </Router>
    </div>
  );
}
