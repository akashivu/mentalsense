import React from "react";

export default function EmotionGraph({ data = [] }) {
  return (
    <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Recent Stress (Combined)</h3>
        <div className="text-xs text-slate-500">{data.length} entries</div>
      </div>

      {data.length === 0 ? (
        <div className="mt-4 text-sm text-slate-500">
          No predictions yet — type something above to analyze your mood.
        </div>
      ) : (
        <div
          className="mt-4 flex items-end gap-3 h-40"
          style={{ alignItems: "flex-end" }}
        >
          {data.map((d, i) => {
            const score = Math.max(0, Math.min(1, d.combined_score ?? 0));

            const height = 24 + Math.round(score * 140); 

            const backgroundColor =
              score > 0.66
                ? "#ef4444" 
                : score > 0.33
                ? "#f59e0b" 
                : "#10b981"; 

            
            const label = d.ts
              ? new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "—";

            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ alignItems: "center" }}
              >
                <div
                  style={{
                    width: 40,
                    height,
                    backgroundColor,
                    borderRadius: 8,
                    border: "2px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    transition: "height 300ms ease",
                  }}
                  title={`Combined Stress: ${Math.round(score * 100)}%`}
                />

                <div
                  className="mt-2 text-xs text-slate-600"
                  style={{ width: 42, textAlign: "center" }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
