
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { login, setToken } from "../services/AuthService";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "true";



useEffect(() => {
  const handleTokenInUrl = () => {
    const url = new URL(window.location.href);
    
    const params = new URLSearchParams(url.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const tokenFromUrl = params.get("token") || params.get("accessToken") || hash.get("token") || hash.get("accessToken");
    const userIdFromUrl = params.get("userId") || params.get("user_id") || hash.get("userId") || hash.get("user_id");

    if (tokenFromUrl) {
      console.log("[Login] token found in URL:", tokenFromUrl, "userId:", userIdFromUrl);
      setToken(tokenFromUrl);
      if (userIdFromUrl) localStorage.setItem("userId", userIdFromUrl);

     
      try {
        url.searchParams.delete("token");
        url.searchParams.delete("accessToken");
        url.searchParams.delete("userId");
        url.searchParams.delete("user_id");
        window.history.replaceState({}, document.title, url.pathname + url.hash);
       
        if (window.location.hash) window.history.replaceState({}, document.title, url.pathname);
      } catch (err) {
        console.warn("[Login] failed to clean URL", err);
      }

      // navigate
      setTimeout(() => window.location.assign("/dashboard"), 250);
    }
  };

  try {
    handleTokenInUrl();
  } catch (err) {
    console.error("[Login] error reading token from URL", err);
  }
}, []);

const onSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const res = await login(email, password);
    console.log("[Login] API response:", res);

    // support multiple token shapes
    const data = res?.data || {};
    const token = data.token || data.accessToken || data.jwt || data.access_token;
    if (token) {
      console.log("[Login] token received from API:", token);
      setToken(token);

      const user = data.user || data.userDetails || data;
      const userId = user?.userId || user?.id || data?.userId;
      if (userId) localStorage.setItem("userId", userId);

      window.location.assign("/dashboard");
      return;
    }

   
    
    if (res?.status === 200) {
      console.log("[Login] 200 response but no token in body — check if backend set an httpOnly cookie.");
      // navigate anyway if cookie-based session is used
      window.location.assign("/dashboard");
      return;
    }

    alert("Invalid login — token not returned.");
  } catch (err) {
    console.error("[Login] login error:", err, err?.response?.data);
    alert("Login failed: " + (err?.response?.data?.error || err?.message || "Unknown error"));
  } finally {
    setIsLoading(false);
  }
};
useEffect(() => {
  if (!isDemo) return;

  console.log("[Demo] Demo mode activated");

  // fake token & user
  setToken("demo-token");
  localStorage.setItem("userId", "demo-user");
  localStorage.setItem("isDemo", "true");

  
  setTimeout(() => {
    window.location.assign("/onboarding");
  }, 600);
}, [isDemo]);


  // Helper redirect to backend google oauth. Backend should handle redirect & callback.
const handleGoogleRedirect = () => {
  
  const apiBase = import.meta.env.VITE_API_BASE_URL;


  console.log("[Login] Redirecting to Google OAuth:", apiBase + "/oauth2/authorize/google");


  window.location.href = `${apiBase}/oauth2/authorize/google`;
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

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
       <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
  <div className="w-11 h-11 rounded-2xl 
                  bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500
                  flex items-center justify-center shadow-md">
    <span className="text-white font-bold text-sm tracking-widest">
      MS
    </span>
  </div>

  <span className="text-gray-900 font-bold text-lg tracking-tight">
    Mental<span className="text-gray-900">Sense</span>
  </span>
</div>


         
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to continue your wellness journey</p>
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
            <button
  type="button"
  onClick={() => window.location.assign("/demo")}
 className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
           bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
           hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700
           text-white font-semibold shadow-lg shadow-indigo-500/30
           transition-all"
>
 Try Live Demo
</button>

          </div>

         
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 mb-2 text-sm font-medium">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                placeholder=""
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-slate-700 text-sm font-medium">Password</label>
               
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                placeholder=""
                required
              />
            </div>

           
            <div className="flex items-center">
              <input id="remember" type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="ml-2 text-sm text-slate-600">Keep me signed in</label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>

         
          <p className="mt-8 text-center text-slate-500 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Create one free</a>
          </p>

         
          <div className="mt-8 pt-6 border-t border-slate-100/20">
  <div className="flex items-center justify-center gap-6 text-slate-400">
    
    
    <div className="flex items-center gap-2 text-xs">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
        />
      </svg>
      <span>SSL Secured</span>
    </div>

   
    <div className="flex items-center gap-2 text-xs">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 22c4.97 0 9-4.03 9-9 0-4.64-3.55-8.46-8.11-8.95a1.9 1.9 0 0 0-1.78 1.02l-1.13 2.06A2 2 0 0 1 7.6 8.36l-2.15-.72A1.98 1.98 0 0 0 3 9.52C3 16.03 7.92 22 12 22Z" 
        />
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
