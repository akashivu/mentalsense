
import React from "react";

const MODES = [
  { id: "keystroke", label: "Keystroke" },
  { id: "emotion", label: "Emotion Text" },
  { id: "combined", label: "Combined" },
];

export default function StressModeTabs({ mode, onChange }) {
  return (
    <div className="flex gap-2 border-b border-slate-200 mb-4">
      {MODES.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-t-md transition
              ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 font-semibold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
