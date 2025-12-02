
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { authHeader } from "../services/AuthService";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale,Filler);

export default function EmotionGraph({ userId = null, limit = 50, data = null }) {
  
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
   
    if (Array.isArray(data)) {
      const items = data.map((p) => ({
        ts: p.ts ?? p.createdAt ?? p.created_at ?? null,
        combined_score: p.combined_score ?? p.combinedScore ?? p.combined ?? 0,
      })).sort((a,b) => (new Date(a.ts||0)).getTime() - (new Date(b.ts||0)).getTime());
      setPast(items);
      return;
    }

   
    if (!userId) {
      setPast([]);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    (async function fetchData() {
      try {
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/predictions/recent?limit=${limit}`,
          { headers: authHeader() }
        );
        if (!mounted) return;
        const items = (res.data || []).map((p) => ({
          ts: p.createdAt ?? p.ts ?? p.created_at,
          combined_score: p.combinedScore ?? p.combined_score ?? p.combined ?? 0,
        })).sort((a,b) => (new Date(a.ts||0)).getTime() - (new Date(b.ts||0)).getTime());
        setPast(items);
      } catch (err) {
        console.error("Failed to load recent predictions", err);
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [userId, limit, data]);

 
  const chartPoints = useMemo(() =>
    past.map(p => ({
      x: p.ts ? new Date(p.ts) : null,
      y: Math.max(0, Math.min(1, Number(p.combined_score ?? 0))),
    })), [past]);

  const chartData = useMemo(() => ({
    datasets: [{
      label: "Combined Stress",
      data: chartPoints,
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      borderWidth: 2,
      borderColor: "#ef4444",
      backgroundColor: "rgba(239,68,68,0.12)",
    }]
  }), [chartPoints]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { type: "time", time: { unit: "hour", tooltipFormat: "PP p" }, ticks: { maxTicksLimit: 8 } },
      y: { min: 0, max: 1, ticks: { callback: v => `${Math.round(v * 100)}%` } }
    },
    plugins: {
      tooltip: { callbacks: { label: ctx => `Stress: ${Math.round((ctx.parsed.y ?? 0) * 100)}%` } },
      legend: { display: false }
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-800">Recent Stress (Combined)</h3>
        <div className="text-xs text-slate-500">{past.length} entries</div>
      </div>

      {loading ? <div className="mt-4 text-sm text-slate-500">Loading…</div> :
       error ? <div className="mt-4 text-sm text-red-500">Error loading predictions</div> :
       past.length === 0 ? <div className="mt-4 text-sm text-slate-500">No predictions yet — type something above to analyze your mood.</div> : (
        <>
          <div className="mt-4" style={{ height: 220 }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="mt-4 py-2" style={{ height: 140, overflowX: "auto", overflowY: "hidden", paddingBottom: 6 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "end", paddingLeft: 4 }}>
              {past.map((d, i) => {
                const score = Math.max(0, Math.min(1, d.combined_score ?? 0));
                const barWidth = 18;
                const minHeight = 18;
                const height = minHeight + Math.round(score * 110);
                const backgroundColor = score > 0.66 ? "#ef4444" : score > 0.33 ? "#f59e0b" : "#10b981";
                const timeLabel = d.ts ? new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: barWidth }}>
                    <div style={{ width: barWidth, height, backgroundColor, borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "height 200ms ease" }} title={`Combined Stress: ${Math.round(score*100)}%`} />
                    <div className="mt-2 text-[10px] text-slate-600" style={{ width: barWidth, textAlign: "center" }}>{timeLabel}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
