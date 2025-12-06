import React, { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";

export default function AiCoachPanel({ mode = "combined" }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function loadAdvice() {
      try {
        setLoading(true);
        setErr(null);

        const res = await axios.get(
          `http://localhost:8080/coach/advice?mode=${mode}`,
          { headers: authHeader() }
        );

        setAdvice(res.data);
      } catch (e) {
        console.error(e);
        setErr("Unable to load coach right now.");
        setAdvice(null);
      } finally {
        setLoading(false);
      }
    }

    loadAdvice();
  }, [mode]); 

  const modeLabel =
    mode === "keystroke"
      ? "Typing signals"
      : mode === "emotion"
      ? "Emotion text signals"
      : "Overall signals";

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">AI Coach</h2>
          <span className="text-[11px] text-gray-400">
            Based on {modeLabel.toLowerCase()}
          </span>
        </div>
        <p className="text-sm text-gray-500">Analyzing your patterns…</p>
      </div>
    );
  }

  if (err || !advice) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">AI Coach</h2>
          <span className="text-[11px] text-gray-400">
            Based on {modeLabel.toLowerCase()}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {err || "No data yet. Use the app for a bit and check back!"}
        </p>
      </div>
    );
  }

  const severity = advice.severity || "LOW";

  const severityClass =
    {
      HIGH: "bg-red-100 text-red-700",
      MEDIUM: "bg-orange-100 text-orange-700",
      LOW: "bg-green-100 text-green-700",
    }[severity] || "bg-green-100 text-green-700";

  const severityLabel =
    severity.charAt(0) + severity.slice(1).toLowerCase(); 

  return (
    <div className="bg-white rounded-2xl p-4 shadow flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">AI Coach</h2>
          <span className="text-[11px] text-gray-400">
            Based on {modeLabel.toLowerCase()}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${severityClass}`}
        >
          {severityLabel} stress
        </span>
      </div>

      {advice.title && (
        <h3 className="text-sm font-semibold mt-1">{advice.title}</h3>
      )}

      {advice.summary && (
        <p className="text-sm text-gray-700">{advice.summary}</p>
      )}

      {advice.tips && advice.tips.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-500 mb-1">
            Suggested actions:
          </p>
          <ul className="list-disc ml-5 text-sm space-y-1">
            {advice.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
