import React, { useState, useRef } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";

export default function EmotionBox({ onNewPrediction }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const eventTimesRef = useRef([]); 
  const keyDownMapRef = useRef({}); 

  const nowMs = () => new Date().getTime();

  const handleKeyDown = (e) => {
    const k = e.key;
    if (k.length === 1 || k === "Backspace" || k === "Enter" || k === "Tab") {
      const t = nowMs();
      const id = `${k}_${t}`;
      keyDownMapRef.current[id] = t;
      eventTimesRef.current.push([k, t, null, id]);
    }
  };

  const handleKeyUp = (e) => {
    const k = e.key;
    const t = nowMs();
    for (let i = eventTimesRef.current.length - 1; i >= 0; i--) {
      const row = eventTimesRef.current[i];
      if (row[0] === k && row[2] === null) {
        row[2] = t;
        break;
      }
    }
  };

  const resetKeystrokeCapture = () => {
    eventTimesRef.current = [];
    keyDownMapRef.current = {};
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!text || text.trim().length < 3) {
      return alert("Please enter at least a short sentence.");
    }

    setLoading(true);
    setResult(null);

    try {
      const rawEvents = eventTimesRef.current
        .filter((r) => r[1] != null && r[2] != null)
        .map((r) => [r[0], r[1], r[2]]);

      // choose endpoint depending on whether we have keystroke events
      const hasKeystrokes = rawEvents.length > 0;
      const endpoint = hasKeystrokes ? "/predict/combined" : "/predict/emotion_text";
      const url = `http://localhost:8080${endpoint}`;

      const payload = { raw_text: text };
      if (hasKeystrokes) payload.event_times = rawEvents;

      const res = await axios.post(
        url,
        payload,
        { headers: { "Content-Type": "application/json", ...authHeader() }, timeout: 15000 }
      );

      const data = res.data || {};

      // normalize response shape for frontend usage:
      // prefer combined_score, then adjusted_score (text-only), then fallback to 0
      const combinedScore = typeof data.combined_score === "number"
        ? data.combined_score
        : typeof data.adjusted_score === "number"
        ? data.adjusted_score
        : (typeof data.raw_score === "number" ? data.raw_score : null);

      const textMetrics = data.text_metrics ?? data.textMetrics ?? null;
      // keystroke_score may not exist for text-only; fallback to provided keystroke_score or null
      const keystrokeScore = data.keystroke_score ?? null;
      const predictionId = data.prediction_id ?? data.predictionId ?? data.id ?? null;

      const timestamp = new Date().toISOString();

      const out = {
        combined_score: combinedScore,
        text_metrics: textMetrics,
        keystroke_score: keystrokeScore,
        prediction_id: predictionId,
        raw_text: text,
        ts: timestamp,
        source: endpoint === "/predict/combined" ? "combined" : "text_only",
      };

      setResult(out);
      if (onNewPrediction) onNewPrediction(out);

      // clear input and captured keystrokes after success
      setText("");
      resetKeystrokeCapture();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || "Failed to analyze text. Try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm border p-5">
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="emotionText" className="block text-sm font-medium text-slate-700">
          How are you feeling?
        </label>

        <textarea
          id="emotionText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>Analyzing…</span>
              </>
            ) : (
              "Analyze Emotion"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setText("");
              resetKeystrokeCapture();
            }}
            className="px-3 py-2 border rounded-md text-sm hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-4 bg-gray-50 p-4 rounded-md border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              <span className="font-semibold">Predicted:</span>{" "}
              <span className="capitalize">{result.text_metrics?.label ?? "—"}</span>
            </div>

            <div className="text-sm">
              <span className="text-slate-600">Combined:</span>{" "}
              <span
                className={`font-semibold ${
                  result.combined_score > 0.66 ? "text-red-600" : result.combined_score > 0.33 ? "text-amber-600" : "text-green-600"
                }`}
              >
                {result.combined_score != null ? `${Math.round(result.combined_score * 100)}%` : "—"}
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-600">Keystroke score: {result.keystroke_score != null ? Math.round(result.keystroke_score * 100) + "%" : "—"}</div>

          <details className="mt-3">
            <summary className="text-xs text-slate-600 cursor-pointer">Show text metrics</summary>
            <pre className="mt-2 text-xs bg-white p-3 rounded-md border overflow-auto max-h-48">
              {JSON.stringify(result.text_metrics ?? {}, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
