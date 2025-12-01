import React, { useEffect, useState } from "react";
import TrendGraph from "./TrendGraph";
import { fetchTrendForUser, checkAnomaly } from "../api/ml"; 

export default function TrendContainer({ userId = 1 }) {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [anomaly, setAnomaly] = useState(null);
  const [message, setMessage] = useState(null);


  useEffect(() => {
  if (!userId) return;

  async function load() {
    console.log("fetching trend for userId:", userId);
    try {
      const res = await fetch(`http://localhost:8080/user/${userId}/trend`);
      if (!res.ok) {
        const err = await res.json();
       
        if (err.error && err.error.includes("Not enough data")) {
          setPast([]);
          setFuture([]);
          setAnomaly(null);
          setMessage(`Need ${err.required} samples. You have ${err.found}. Keep typing!`);
        } else {
          throw err;
        }
        return;
      }

      const data = await res.json();
      setPast(data.past || []);
      setFuture(data.future || []);
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
      const r = await checkAnomaly(userId, val);
      
      setAnomaly(r?.anomaly ?? null);
      if (r?.anomaly === -1) {
        alert("⚠ Anomaly detected!");
      }
    } catch (e) {
      console.error("anomaly check error:", e);
    }
  }

  return (
    <div className="w-full bg-gray-500 dark:bg-gray-900 shadow-lg rounded-xl p-6 mt-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Stress Trend
      </h3>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-inner">
        <TrendGraph past={past} future={future} />
      </div>
        {message && (
  <div className="mt-3 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 text-sm">
    {message}
  </div>
)}
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => checkLatest(future[0] ?? 0)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition duration-200 shadow-md"
        >
          Check Latest Anomaly
        </button>
      </div>

      {anomaly !== null && (
        <div
          className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium
            ${anomaly === -1
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            }
          `}
        >
          {anomaly === -1 ? "Anomaly Detected ⚠" : "No Anomaly Found ✔"}
        </div>
      )}
    </div>
  );
}
