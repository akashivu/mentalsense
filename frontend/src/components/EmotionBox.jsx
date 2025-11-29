import React, { useState } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";

export default function EmotionBox({ onNewPrediction }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e && e.preventDefault();

    if (!text || text.trim().length < 3) {
      return alert("Please enter at least a short sentence.");
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        "http://localhost:8080/emotion/text",
        { text },
        { headers: { "Content-Type": "application/json", ...authHeader() } }
      );

      // normalized payload
      const payload = res.data && res.data.result ? res.data.result : res.data;

      setResult(payload);

      if (onNewPrediction) onNewPrediction(payload);

      setText("");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to analyze text. Try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm border p-5">
      <form onSubmit={submit} className="space-y-3">
        <label
          htmlFor="emotionText"
          className="block text-sm font-medium text-slate-700"
        >
          How are you feeling?
        </label>

        <textarea
          id="emotionText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a sentence about how you feel..."
          rows={4}
          maxLength={800}
          className="w-full resize-y rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                <span>Analyzing…</span>
              </>
            ) : (
              "Analyze Emotion"
            )}
          </button>

          <button
            type="button"
            onClick={() => setText("")}
            className="px-3 py-2 border rounded-md text-sm hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-4 bg-slate-50 p-4 rounded-md border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              <span className="font-semibold">Predicted:</span>{" "}
              <span className="capitalize">{result.label}</span>
            </div>

            <div className="text-sm">
              <span className="text-slate-600">Stress:</span>{" "}
              <span
                className={`font-semibold ${
                  result.stress_score > 0.66
                    ? "text-red-600"
                    : result.stress_score > 0.33
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              >
                {Math.round((result.stress_score ?? 0) * 100)}%
              </span>
            </div>
          </div>

          <details className="mt-3">
            <summary className="text-xs text-slate-600 cursor-pointer">
              Show per-class scores
            </summary>
            <pre className="mt-2 text-xs bg-white p-3 rounded-md border overflow-auto max-h-48">
              {JSON.stringify(result.scores, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
