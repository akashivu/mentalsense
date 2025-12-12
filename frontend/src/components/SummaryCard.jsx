import React from "react";
import { TrendingUp, TrendingDown, Minus, Activity, Keyboard, MessageCircle } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Center text plugin 
const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart) {
    const ctx = chart.ctx;
    const { left, top, width, height } = chart.chartArea;
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const percent = chart?.config?.options?.plugins?.centerText?.text || "";

    ctx.save();
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    
    ctx.font = "700 18px system-ui, -apple-system, 'Segoe UI'";
    ctx.fillText(percent, centerX, centerY - 6);

   
    ctx.font = "500 11px system-ui, -apple-system, 'Segoe UI'";
    ctx.fillStyle = "#6B7280";
    ctx.fillText("stress level", centerX, centerY + 14);

    ctx.restore();
  },
};

export default function SummaryCard({ score, trend, mode = "combined" }) {
  const safeScore = typeof score === "number" ? Math.max(0, Math.min(1, score)) : 0;
  const percent = (safeScore * 100).toFixed(0);

  // Risk 
  let risk = "Low";
  if (safeScore > 0.7) risk = "High";
  else if (safeScore > 0.4) risk = "Moderate";

  const riskColorClass =
    risk === "High"
      ? "text-rose-600"
      : risk === "Moderate"
      ? "text-amber-600"
      : "text-emerald-600";

  const riskPillClass =
    risk === "High"
      ? "bg-rose-100 text-rose-700 border-rose-300"
      : risk === "Moderate"
      ? "bg-amber-100 text-amber-700 border-amber-300"
      : "bg-emerald-100 text-emerald-700 border-emerald-300";

  // Trend 
  const trendLabel = trend === "up" ? "Rising" : trend === "down" ? "Decreasing" : "Stable";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up" ? "text-rose-600" : trend === "down" ? "text-emerald-600" : "text-gray-600";

  // Mode 
  const title =
    mode === "keystroke"
      ? "Keystroke Stress"
      : mode === "emotion"
      ? "Emotion Text"
      : "Overall Stress";

  const description =
    mode === "keystroke"
      ? "Typing behavior analysis"
      : mode === "emotion"
      ? "Emotional signals detected"
      : "Combined stress signals";

  const ModeIcon =
    mode === "keystroke" ? Keyboard : mode === "emotion" ? MessageCircle : Activity;


  const gradientClass =
    mode === "combined"
      ? "from-blue-500 to-indigo-600"
      : mode === "keystroke"
      ? "from-cyan-500 to-blue-600"
      : "from-purple-500 to-fuchsia-600";

  const hoverGradientClass =
    mode === "combined"
      ? "group-hover:from-blue-600 group-hover:to-indigo-700"
      : mode === "keystroke"
      ? "group-hover:from-cyan-600 group-hover:to-blue-700"
      : "group-hover:from-purple-600 group-hover:to-fuchsia-700";


  const sliceColor =
    risk === "High"
      ? "#f43f5e"
      : risk === "Moderate"
      ? "#f59e0b"
      : "#10b981";

  const chartData = {
    labels: ["stress", "rest"],
    datasets: [
      {
        data: [safeScore, 1 - safeScore],
        backgroundColor: [sliceColor, "#E6EDF3"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: "72%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ctx.dataIndex === 0
              ? `Stress: ${percent}%`
              : `Remaining: ${100 - Number(percent)}%`,
        },
      },
      centerText: {
        text: `${percent}%`,
      },
    },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-md px-4 py-3 flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 group">
      
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${
          mode === "combined"
            ? "from-blue-50/50 to-indigo-50/50"
            : mode === "keystroke"
            ? "from-cyan-50/50 to-blue-50/50"
            : "from-purple-50/50 to-fuchsia-50/50"
        }`} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex gap-3">
        
        {/* Left side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradientClass} ${hoverGradientClass} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110`}>
                <ModeIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight text-gray-900">{title}</h2>
                <p className="text-xs text-gray-500 font-medium">{description}</p>
              </div>
            </div>

            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${riskPillClass}`}>
              {risk} Risk
            </span>
          </div>

          {/* Trend */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-600 font-semibold">Trend</span>
            <div className={`flex items-center gap-1.5 ${trendColor} font-bold text-sm`}>
              <TrendIcon className="h-4 w-4" strokeWidth={2.5} />
              <span>{trendLabel}</span>
            </div>
          </div>
        </div>

        {/* Right: Doughut Chart */}
        <div className="w-28 h-28 flex items-center justify-center">
          <Doughnut
            data={chartData}
            options={chartOptions}
            plugins={[centerTextPlugin]}
          />
        </div>

      </div>
    </div>
  );
}
