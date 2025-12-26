import React, { useEffect, useState } from "react";
import TrendGraph from "./TrendGraph";
import { checkAnomaly, fetchTrendForUser } from "../api/ml";



export default function TrendContainer({ userId = 1 }) {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [anomaly, setAnomaly] = useState(null);
  const [message, setMessage] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      console.log("fetching trend for userId:", userId);
      try {
       const data = await fetchTrendForUser(userId);

setPast(Array.isArray(data.past) ? data.past : []);
setFuture(Array.isArray(data.future) ? data.future : []);
setMessage(null);

      } catch (e) {
        console.error("trend fetch error:", e);
        setMessage("Unable to fetch trend right now.");
        setPast([]);
        setFuture([]);
      }
    }

    load();
  }, [userId]);

  async function checkLatest(val) {
    try {
      setIsChecking(true);
      const r = await checkAnomaly(userId, val);

      setAnomaly(r?.anomaly ?? null);
      if (r?.anomaly === -1) {
        alert("Anomaly detected!");
      }
    } catch (e) {
      console.error("anomaly check error:", e);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="w-full bg-slate-50 rounded-[32px] border border-slate-200/60 p-8 md:p-10 shadow-sm">
   
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-100 rounded-xl">
            <svg
              className="h-6 w-6 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Stress Trend Analysis
          </h3>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Predictive analytics and anomaly detection for stress patterns
        </p>
      </div>

      
      {message && (
        <div className="mb-6 flex items-start gap-3 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">{message}</p>
            <p className="text-xs text-amber-700 mt-1">
              Continue using the app to generate enough data for trend analysis
            </p>
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 mb-6 hover:shadow-md transition-shadow">
        <TrendGraph past={past} future={future} />
      </div>

      {/* Action Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <button
          onClick={() => checkLatest(future[0] ?? 0)}
          disabled={isChecking || future.length === 0}
          className="group relative px-6 py-3.5 bg-white border-2 border-teal-500 text-teal-700 font-semibold rounded-xl 
                   hover:bg-teal-50 hover:border-teal-600
                   focus:outline-none focus:ring-4 focus:ring-teal-500/20
                   disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed
                   transition-all duration-200
                   shadow-sm hover:shadow-md"
        >
          <span className="flex items-center justify-center gap-2">
            {isChecking ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <span>Check Latest Anomaly</span>
              </>
            )}
          </span>
        </button>

        {/* Anomaly Result */}
        {anomaly !== null && (
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all duration-300 shadow-sm border-2
              ${
                anomaly === -1
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }
            `}
          >
            <div
              className={`flex-shrink-0 p-1.5 rounded-lg ${
                anomaly === -1 ? "bg-rose-100" : "bg-emerald-100"
              }`}
            >
              {anomaly === -1 ? (
                <svg
                  className="h-5 w-5 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {anomaly === -1 ? "Anomaly Detected" : "No Anomaly Found"}
              </p>
              <p className="text-xs mt-0.5">
                {anomaly === -1
                  ? "Unusual stress pattern identified"
                  : "Stress levels within normal range"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-start gap-3 text-slate-500">
          <svg
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs leading-relaxed">
            Anomaly detection uses machine learning to identify unusual stress
            patterns that deviate from your baseline. Regular data collection
            improves prediction accuracy over time.
          </p>
        </div>
      </div>
    </div>
  );
}
