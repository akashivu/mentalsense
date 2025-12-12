import React from "react";
import { Sparkles, Keyboard, MessageSquare } from "lucide-react";

const TABS = [
  {
    id: "combined",
    label: "All signals",
    description: "Keystroke + emotion",
    Icon: Sparkles,
  },
  {
    id: "keystroke",
    label: "Keystroke",
    description: "Typing behaviour",
    Icon: Keyboard,
  },
  {
    id: "emotion",
    label: "Emotion text",
    description: "Language signals",
    Icon: MessageSquare,
  },
];

export default function StressModeTabs({ mode, onChange }) {
  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 px-3 sm:px-4 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.85)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* left label */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold text-slate-100">
              AI
            </span>
            <div className="flex flex-col">
              <span className="font-medium text-slate-100 text-xs">
                View mode
              </span>
              <span className="text-[11px] text-slate-500">
                Switch between combined, keystroke, and emotion stress.
              </span>
            </div>
          </div>

          {/* tabs */}
          <div className="flex-1">
            <div className="flex gap-1.5 rounded-xl bg-slate-950/70 px-1.5 py-1.5 overflow-x-auto scrollbar-none">
              {TABS.map(({ id, label, description, Icon }) => {
                const active = mode === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onChange?.(id)}
                    className={[
                      "group flex-1 min-w-[104px] sm:min-w-[130px] px-3 py-1.5 rounded-lg transition-all duration-200 border text-left",
                      active
                        ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 border-transparent shadow-[0_10px_30px_rgba(79,70,229,0.7)]"
                        : "bg-transparent border-slate-700/80 hover:bg-slate-800/80 hover:border-slate-500/80",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          "inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px]",
                          active
                            ? "bg-white/15 text-white"
                            : "bg-slate-800 text-slate-300 group-hover:bg-slate-700",
                        ].join(" ")}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={[
                            "text-xs font-semibold",
                            active ? "text-white" : "text-slate-100",
                          ].join(" ")}
                        >
                          {label}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-300 line-clamp-1">
                          {description}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
