import React from "react";
import {
  Brain,
  Activity,
  ArrowRight,
  Moon,
  SunMedium,
  Coffee,
  Sparkles,
} from "lucide-react";


function getModeLabel(mode) {
  if (mode === "keystroke") return "Keystroke stress";
  if (mode === "emotion") return "Emotion text stress";
  return "Overall stress (all signals)";
}

function getModeHint(mode) {
  if (mode === "keystroke") {
    return "Based on your typing rhythm, pauses, and correction patterns.";
  }
  if (mode === "emotion") {
    return "Based on emotional tone and wording in your messages.";
  }
  return "Blended from both typing behavior and emotional language signals.";
}



export default function AiCoachPanel({
  mode = "combined",
  isLearning = true, 
}) {
  const modeLabel = getModeLabel(mode);
  const modeHint = getModeHint(mode);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-md p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg hover:border-gray-300 group">
     
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-20 right-[-30px] h-40 w-40 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 blur-3xl" />
        <div className="absolute bottom-[-40px] left-[-30px] h-40 w-40 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-3.5">
      
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                AI Coach
                <Sparkles
                  className="h-3.5 w-3.5 text-amber-500"
                  strokeWidth={2.5}
                />
              </span>
              <span className="text-xs text-gray-600 font-medium">
                Supportive insights, not judgments
              </span>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-700">
            Live
          </span>
        </div>

       
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 px-3.5 py-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-900">{modeLabel}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-indigo-200 px-2.5 py-1 text-xs text-indigo-700 font-semibold">
              <Activity className="h-3 w-3" strokeWidth={2.5} />
              Auto
            </span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            {modeHint}
          </p>
        </div>

        
        <div className="space-y-2 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          {isLearning ? (
            <>
              <p className="text-sm font-bold text-gray-900">
                We’re still learning your patterns.
              </p>
              <p className="text-xs leading-relaxed text-gray-700 font-medium">
                As you type more, MentalSense adapts to your unique rhythm and
                gradually unlocks more personalized insights.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-900">
                Here’s what we’re noticing so far.
              </p>
              <p className="text-xs leading-relaxed text-gray-700 font-medium">
                Your recent stress trend appears to be slightly{" "}
                <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                  decreasing
                </span>
                . You tend to experience more stress during{" "}
                <span className="font-bold text-gray-900">
                  focused work hours
                </span>{" "}
                and earlier in the week{" "}
                <span className="font-bold text-gray-900">(Mon–Tue)</span>.
              </p>
            </>
          )}
        </div>

        
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 px-3.5 py-3 space-y-2">
          <p className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-2">
            Today’s gentle nudges
            <span className="inline-flex items-center text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
              3
            </span>
          </p>

          <InsightRow
            icon={<Coffee className="h-3.5 w-3.5" strokeWidth={2.5} />}
            label="Micro-breaks"
            text="Consider 2–3 short breaks to reset your focus."
            color="amber"
          />

          <InsightRow
            icon={<SunMedium className="h-3.5 w-3.5" strokeWidth={2.5} />}
            label="Context switch"
            text="After a demanding task, try standing or stretching briefly."
            color="orange"
          />

          <InsightRow
            icon={<Moon className="h-3.5 w-3.5" strokeWidth={2.5} />}
            label="Evening wind-down"
            text="Lighter activities before sleep may help your mind settle."
            color="indigo"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all">
            <span>Explore suggestions</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>

          <button className="inline-flex items-center rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
            Log how you feel
          </button>
        </div>

        {/* Privacy reassurance */}
        <p className="text-[10px] text-gray-500 pt-1 flex items-center gap-1.5 font-medium">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Your signals stay private and are never shared without consent
        </p>
      </div>
    </div>
  );
}



function InsightRow({ icon, label, text, color }) {
  const colorClasses = {
    amber: "from-amber-100 to-orange-100 border-amber-200 text-amber-700",
    orange: "from-orange-100 to-red-100 border-orange-200 text-orange-700",
    indigo: "from-indigo-100 to-purple-100 border-indigo-200 text-indigo-700",
  };

  return (
    <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-white/60 transition-colors group/item">
      <div
        className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color]} border shadow-sm group-hover/item:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-900 mb-0.5">{label}</p>
        <p className="text-[11px] text-gray-700 leading-snug font-medium">
          {text}
        </p>
      </div>
    </div>
  );
}
