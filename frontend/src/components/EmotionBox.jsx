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

      const hasKeystrokes = rawEvents.length > 0;
      const endpoint = hasKeystrokes
        ? "/predict/combined"
        : "/predict/emotion_text";
      const url = `http://localhost:8080${endpoint}`;

      const payload = { raw_text: text };
      if (hasKeystrokes) payload.event_times = rawEvents;

      const res = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        timeout: 15000,
      });

      const data = res.data || {};

     
      const mode = data.mode || (hasKeystrokes ? "combined" : "text_only");

     

      let combinedScore = null;
      let textScore = null;
      let keystrokeScore = null;

      const textMetrics = data.text_metrics ?? data.textMetrics ?? null;

      if (mode === "combined") {
        combinedScore =
          typeof data.combined_score === "number"
            ? data.combined_score
            : null;

       
        if (typeof data.text_score === "number") {
          textScore = data.text_score;
        } else if (
          textMetrics &&
          typeof textMetrics.text_stress_score === "number"
        ) {
          textScore = textMetrics.text_stress_score;
        }

        if (typeof data.keystroke_score === "number") {
          keystrokeScore = data.keystroke_score;
        }
      } else {
       
        textScore =
          typeof data.adjusted_score === "number"
            ? data.adjusted_score
            : typeof data.raw_score === "number"
            ? data.raw_score
            : null;

        
        combinedScore = textScore;
        keystrokeScore = null;
      }

      const predictionId =
        data.prediction_id ?? data.predictionId ?? data.id ?? null;

      const timestamp = new Date().toISOString();

      const out = {
        mode,
        combined_score: combinedScore,
        text_score: textScore,
        keystroke_score: keystrokeScore,
        text_metrics: textMetrics,
        prediction_id: predictionId,
        raw_text: text,
        ts: timestamp,
      };

      setResult(out);
      if (onNewPrediction) onNewPrediction(out);

      setText("");
      resetKeystrokeCapture();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error || "Failed to analyze text. Try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

 
  const formatPercent = (v) =>
    v == null ? "—" : `${(v * 100).toFixed(1).replace(/\.0$/, "")}%`;

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
              <span className="font-semibold">Emotion:</span>{" "}
              <span className="capitalize">
                {result.text_metrics?.label ?? "—"}
              </span>
              <span className="ml-2 text-[11px] uppercase tracking-wide text-slate-400">
                ({result.mode === "combined" ? "Text + Keystroke" : "Text-only"})
              </span>
            </div>

           
            <div className="text-sm">
              <span className="text-slate-600">Overall Stress:</span>{" "}
              <span
                className={`font-semibold ${
                  (result.combined_score ?? 0) > 0.66
                    ? "text-red-600"
                    : (result.combined_score ?? 0) > 0.33
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              >
                {formatPercent(result.combined_score)}
              </span>
            </div>
          </div>

        
          <div className="mt-2 text-xs text-slate-600 space-y-1">
            <div>
              Text Stress: {formatPercent(result.text_score)}
            </div>
            <div>
              Keystroke Stress: {formatPercent(result.keystroke_score)}
            </div>
          </div>

          <details className="mt-3">
            <summary className="text-xs text-slate-600 cursor-pointer">
              Show text metrics
            </summary>
            <pre className="mt-2 text-xs bg-white p-3 rounded-md border overflow-auto max-h-48">
              {JSON.stringify(result.text_metrics ?? {}, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
