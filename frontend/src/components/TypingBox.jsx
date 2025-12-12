import React, { useState } from "react";
import useKeystrokeCapture from "../hooks/useKeystrokeCapture";
import { authHeader } from "../services/AuthService";
import axios from "axios";

export default function TypingBox({ userId = 1 }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onKeyDown, onKeyUp, getFeaturesAndReset, sendToServer } = useKeystrokeCapture();
  const [samples, setSamples] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const features = getFeaturesAndReset(text.trim());
   
    if (!features.raw_text || features.raw_text.length < 3) {
      alert("Please type a meaningful sentence before sending.");
      return;
    }
   
    if (userId === undefined || userId === null) {
      alert("User id not available. Please login or retry.");
      return;
    }

    try {
      setIsSubmitting(true);
      await sendToServer(features, userId);   
      setText("");
      alert("Keystroke features sent!");
    } catch (err) {
      alert("Failed to send sample: " + (err?.response?.data || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  async function onNewSample(features) {
    setSamples(prev => {
      const arr = [...prev, features];
      if (arr.length >= 5) {
        const avgTypingSpeed = arr.reduce((s, f) => s + (f.typingSpeed || 0), 0) / arr.length;
        const avgStress = arr.reduce((s, f) => s + (f.backspaceRate || 0), 0) / arr.length;
        
        const tokenHeader = authHeader();
        axios.put(`http://localhost:8080/user/${userId}/baseline`, {
          baselineTypingSpeed: avgTypingSpeed,
          baselineStress: avgStress
        }, { headers: { ...tokenHeader, "Content-Type": "application/json" }});
        return [];
      } else return arr;
    });
  }

  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="w-full max-w-4xl bg-white rounded-[28px] border border-slate-200/60 p-8 md:p-10 shadow-sm">
     
      <div className="mb-6">
        <h2 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
          Keystroke Analysis
        </h2>
        <p className="text-sm text-slate-500">
          Type naturally to capture your stress patterns through keystroke dynamics
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
       
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { onKeyDown(e); }}
            onKeyUp={(e) => { onKeyUp(e); }}
            rows={8}
            className="w-full p-6 border-2 border-slate-200 rounded-2xl shadow-sm 
                     focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 
                     transition-all duration-200 resize-none
                     text-slate-800 text-base leading-relaxed
                     placeholder:text-slate-400
                     hover:border-slate-300"
            placeholder="Start typing here... Your keystroke patterns will be analyzed to detect stress levels."
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-4 right-4 flex items-center gap-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-xs font-medium text-slate-600">{wordCount} words</span>
            </div>
            <div className="w-px h-4 bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-xs font-medium text-slate-600">{charCount} chars</span>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-2 bg-teal-100 rounded-lg">
              <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Secure Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Your typing data is analyzed securely and privately</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Real-time Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Instant analysis of your keystroke patterns</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Pattern Learning</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Adapts to your unique typing style over time</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Minimum 3 characters required for analysis
          </p>
          <button
            type="submit"
            disabled={isSubmitting || text.trim().length < 3}
            className="group relative px-8 py-3.5 bg-linear-to-r from-teal-500 to-cyan-500 
                     text-white font-semibold rounded-xl 
                     hover:from-teal-600 hover:to-cyan-600 
                     focus:outline-none focus:ring-4 focus:ring-teal-500/20
                     disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed
                     shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30
                     transition-all duration-200 transform hover:-translate-y-0.5
                     disabled:shadow-none disabled:transform-none"
          >
            <span className="flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Send Sample</span>
                  <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}