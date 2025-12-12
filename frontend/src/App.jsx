
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
import Home from "./pages/Home";
import WeeklyReport from "./pages/WeeklyReport";
export default function App() {
  return (
    <div className="min-h-screen">
      <Router>
        <Routes>
         
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

         
          <Route path="/auth/success" element={<AuthSuccess />} />

          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />

         
          <Route path="/trend" element={<TrendContainer /> } />
          <Route path="/trend-graph" element={<TrendGraph />} />
           <Route path="/weekly-report" element={<WeeklyReport />} />

        
          <Route path="*" element={<div className="p-8">Page not found — <a href="/login" className="text-blue-600">Go to Login</a></div>} />
        </Routes>
      </Router>
    </div>
  );
}

