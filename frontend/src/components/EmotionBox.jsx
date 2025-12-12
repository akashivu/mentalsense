import React, { useState, useRef } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";
import { MessageSquare, Activity, Send, X, Sparkles } from "lucide-react";

export default function EmotionBox({ onNewPrediction }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Keep keystroke timestamps and keydown map here (collected but lightweight)
  const eventTimesRef = useRef([]);
  const keyDownMapRef = useRef({});

  const nowMs = () => new Date().getTime();

  // Record keydown timestamps — we only track characters, backspace, enter, tab
  const handleKeyDown = (e) => {
    const k = e.key;
    if (k.length === 1 || k === "Backspace" || k === "Enter" || k === "Tab") {
      const t = nowMs();
      const id = `${k}_${t}`;
      keyDownMapRef.current[id] = t;
      eventTimesRef.current.push([k, t, null, id]);
    }
  };

  // Match the keyup to the last unmatched keydown for the same key
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
      // Prepare keystroke events only if we have complete down+up pairs
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

      // Parse scores from the ML response with safe fallbacks
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
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 space-y-4 transition-all duration-300 hover:shadow-lg hover:border-gray-300 group">
      <form onSubmit={submit} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <MessageSquare className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <label
                htmlFor="emotionText"
                className="text-sm font-bold text-gray-900 flex items-center gap-1.5"
              >
                How are you feeling?
                <Sparkles className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.5} />
              </label>
              <p className="text-xs text-gray-500 font-medium">
                Express your emotions freely
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-lg">
            AI Analysis
          </span>
        </div>

        {/* Textarea */}
        <textarea
          id="emotionText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder="Write about how you're feeling right now... (e.g., I'm feeling stressed about work today)"
          rows={3}
          maxLength={800}
          className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
        />

        {/* Character count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            {text.length}/800 characters
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Text + typing behavior tracked
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-105"
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
              <>
                <Send className="h-4 w-4" strokeWidth={2.5} />
                <span>Analyze Emotion</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setText("");
              resetKeystrokeCapture();
              setResult(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-300 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
            <span>Clear</span>
          </button>
        </div>
      </form>

      {/* Result section — shows concise scores and expandable metrics */}
      {result && (
        <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Main result header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-blue-200">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Detected Emotion
              </p>
              <p className="text-lg font-black text-gray-900 capitalize">
                {result.text_metrics?.label ?? "Unknown"}
              </p>
              <span className="inline-flex items-center text-xs text-gray-600 font-medium bg-white px-2 py-0.5 rounded-full border border-gray-200 mt-1">
                {result.mode === "combined" ? "Text + Keystroke Analysis" : "Text-only Analysis"}
              </span>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Overall Stress
              </p>
              <span
                className={`text-2xl font-black ${
                  (result.combined_score ?? 0) > 0.66
                    ? "text-rose-600"
                    : (result.combined_score ?? 0) > 0.33
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {formatPercent(result.combined_score)}
              </span>
            </div>
          </div>

          {/* Detailed scores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Text Stress
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatPercent(result.text_score)}
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Keystroke Stress
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatPercent(result.keystroke_score)}
              </p>
            </div>
          </div>

          {/* Expandable metrics */}
          <details className="mt-2">
            <summary className="text-xs text-gray-700 font-semibold cursor-pointer hover:text-gray-900 flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
              <Activity className="h-3.5 w-3.5" strokeWidth={2.5} />
              View Detailed Metrics
            </summary>
            <pre className="mt-2 text-xs bg-white p-3 rounded-lg border border-blue-200 overflow-auto max-h-40 font-mono text-gray-800">
              {JSON.stringify(result.text_metrics ?? {}, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
