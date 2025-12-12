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
  // human-friendly label shown in the mode pill
  if (mode === "keystroke") return "Keystroke stress";
  if (mode === "emotion") return "Emotion text stress";
  return "Overall stress (all signals)";
}

function getModeHint(mode) {
  // short hint describing the active mode (used in the pill subtitle)
  if (mode === "keystroke")
    return "Based on your typing speed, pauses, and correction patterns.";
  if (mode === "emotion")
    return "Based on the emotional tone and wording in your messages.";
  return "Blended from both keystroke and emotional language signals.";
}

export default function AiCoachPanel({ mode = "combined" }) {
  const modeLabel = getModeLabel(mode);
  const modeHint = getModeHint(mode);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-md p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg hover:border-gray-300 group">
      {/* Subtle background gradient accents — decorative only */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-20 right-[-30px] h-40 w-40 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 blur-3xl" />
        <div className="absolute bottom-[-40px] left-[-30px] h-40 w-40 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Header - shows product label + small badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                AI Coach
                <Sparkles className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.5} />
              </span>
              <span className="text-xs text-gray-600 font-medium">
                Personal guidance
              </span>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-700">
            Live
          </span>
        </div>

        {/* Mode pill - communicates which signal set is active */}
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 px-3.5 py-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-900">{modeLabel}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-indigo-200 px-2.5 py-1 text-xs text-indigo-700 font-semibold">
              <Activity className="h-3 w-3" strokeWidth={2.5} />
              <span>Auto</span>
            </span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-medium">{modeHint}</p>
        </div>

        {/* Main message block - concise summary for the user */}
        <div className="space-y-2 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <p className="text-sm font-bold text-gray-900">
            Your stress is relatively stable.
          </p>
          <p className="text-xs leading-relaxed text-gray-700 font-medium">
            Your recent stress trend is slightly{" "}
            <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
              decreasing
            </span>
            . You tend to be most stressed during{" "}
            <span className="font-bold text-gray-900">
              focused work hours
            </span>{" "}
            and around{" "}
            <span className="font-bold text-gray-900">
              early week days (Mon–Tue)
            </span>
            .
          </p>
        </div>

        {/* Micro-insights list — compact, actionable nudges */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 px-3.5 py-3 space-y-2">
          <p className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-2">
            Today's nudges
            <span className="inline-flex items-center text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-200">3</span>
          </p>

          <InsightRow
            icon={<Coffee className="h-3.5 w-3.5" strokeWidth={2.5} />}
            label="Micro-breaks"
            text="Plan 3–4 short 2-minute breaks this afternoon."
            color="amber"
          />

          <InsightRow
            icon={<SunMedium className="h-3.5 w-3.5" strokeWidth={2.5} />}
            label="Context switch"
            text="After a stressful task, stand up and stretch."
            color="orange"
          />

          <InsightRow
            icon={<Moon className="h-3.5 w-3.5" strokeWidth={2.5} />}
            label="Evening wind-down"
            text="Avoid intense work 30–45 mins before sleep."
            color="indigo"
          />
        </div>

        {/* Actions row — primary CTA + secondary action */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all">
            <span>View Actions</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>

          <button className="inline-flex items-center rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
            Log Feelings
          </button>
        </div>

        {/* Privacy note — reassuring copy for users */}
        <p className="text-[10px] text-gray-500 pt-1 flex items-center gap-1.5 font-medium">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Your signals stay private unless you share them
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
    // small interactive row used repeatedly in the nudges list
    <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-white/60 transition-colors group/item">
      <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color]} border shadow-sm group-hover/item:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-900 mb-0.5">{label}</p>
        <p className="text-[11px] text-gray-700 leading-snug font-medium">{text}</p>
      </div>
    </div>
  );
}
