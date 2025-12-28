
import React, { useState } from "react";
import { motion } from "framer-motion";
import { register } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import BASE from "../api/base";


export default function Register() {
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 async function onSubmit(e) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await register(name, email, password);

   
    if (res?.token) localStorage.setItem("token", res.token);
    if (res?.userId) localStorage.setItem("userId", res.userId);

    // Redirect to onboarding
    navigate("/onboarding", { replace: true });
  } catch (err) {
    setError(
      err?.response?.data?.error ||
      err?.message ||
      "Registration failed"
    );
  } finally {
    setLoading(false);
  }
}

  const handleGoogleRedirect = () => {
  window.location.href = `${BASE}/auth/google`;
};

  return (
    <div className="min-h-screen flex">
     
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-lg">MS</span>
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">MentalSense</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Your AI-powered
              <span className="block bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-white">
                stress companion
              </span>
            </h1>
            <p className="text-white text-lg leading-relaxed">
              Understand your stress patterns, get personalized insights, and build healthier habits with intelligent monitoring.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              {["Real-time Analysis", "AI Insights", "Privacy First"].map((feature) => (
                <span key={feature} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {["A", "C", "M", "S"].map((t, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-800 flex items-center justify-center"
                >
                  <span className="text-[10px] text-white font-medium">{t}</span>
                </div>
              ))}
            </div>
            <p className="text-white text-sm">
              Join our <span className="text-white font-medium">early adopters</span> improving their well-being
            </p>
          </div>
        </div>
      </div>

      
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-slate-900 font-semibold text-xl">MentalSense</span>
          </div>

          
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create your free account</h2>
            <p className="text-slate-500">Start your MentalSense wellness journey — it's free</p>
          </div>

        
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleRedirect}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

         
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">or register with email</span>
            </div>
          </div>

          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 mb-2 text-sm font-medium">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2 text-sm font-medium">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2 text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                placeholder="Create a strong password"
              />
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Creating account..." : "Create free account"}
            </motion.button>
          </form>

        
          <p className="mt-8 text-center text-slate-500 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</a>
          </p>

         
          <div className="mt-8 pt-6 border-t border-slate-100/20">
            <div className="flex items-center justify-center gap-6 text-slate-400">
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>SSL Secured</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22c4.97 0 9-4.03 9-9 0-4.64-3.55-8.46-8.11-8.95a1.9 1.9 0 0 0-1.78 1.02l-1.13 2.06A2 2 0 0 1 7.6 8.36l-2.15-.72A1.98 1.98 0 0 0 3 9.52C3 16.03 7.92 22 12 22Z" />
                </svg>
                <span>Privacy Focused</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
