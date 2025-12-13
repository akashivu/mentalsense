
import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { setToken } from "../services/AuthService";


export default function AuthSuccess({ redirectTo = "/dashboard", cleanRoute = "/auth/success" }) {
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const parseFromSearchOrHash = () => {
      try {
        const q = new URLSearchParams(window.location.search || "");
        let hashParams = new URLSearchParams();
        if (window.location.hash) {
          const raw = window.location.hash.replace(/^#/, "");
          const idx = raw.indexOf("?");
          const maybeQuery = idx >= 0 ? raw.slice(idx + 1) : raw;
          hashParams = new URLSearchParams(maybeQuery);
        }

        const token =
          q.get("token") ||
          q.get("accessToken") ||
          q.get("access_token") ||
          hashParams.get("token") ||
          hashParams.get("accessToken") ||
          hashParams.get("access_token");

        const userId =
          q.get("userId") ||
          q.get("user_id") ||
          hashParams.get("userId") ||
          hashParams.get("user_id");

        return { token, userId };
      } catch (err) {
        console.error("[AuthSuccess] parse error", err);
        return { token: null, userId: null };
      }
    };

    const { token, userId } = parseFromSearchOrHash();
    if (!token) {
      setStatus("error");
      return;
    }

    try {
      setToken(token);
      if (userId) localStorage.setItem("userId", userId);
      setStatus("ok");

      // Clean URL to browser-style route
      try {
        const origin = window.location.origin;
        const cleaned = origin + (cleanRoute || "/auth/success");
        window.history.replaceState({}, document.title, cleaned);
      } catch (err) {
        console.warn("[AuthSuccess] failed to clean URL", err);
      }

      setTimeout(() => {
        // redirect to browser-route dashboard
        window.location.assign(redirectTo || "/dashboard");
      }, 700);
    } catch (err) {
      console.error("[AuthSuccess] storing token error", err);
      setStatus("error");
    }
  }, [redirectTo, cleanRoute]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl">
        {status === "processing" && (
          <>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Loader2 className="h-7 w-7 text-white animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Signing you in...</h1>
            <p className="text-slate-500 text-sm">Securing your session and redirecting you to the app.</p>
          </>
        )}

        {status === "ok" && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">You're signed in</h1>
            <p className="text-slate-500 text-sm">Redirecting to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center shadow-sm">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sign-in failed</h1>
            <p className="text-slate-500 text-sm">No token found. Try signing in again.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => (window.location.assign("/login"))} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">Back to Login</button>
              <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium">Retry</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
