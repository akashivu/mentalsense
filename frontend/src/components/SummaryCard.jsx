import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Keyboard,
  MessageCircle,
} from "lucide-react";
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
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 18px system-ui, -apple-system, 'Segoe UI'";
    ctx.fillText(percent, centerX, centerY - 6);

    ctx.font = "500 11px system-ui, -apple-system, 'Segoe UI'";
    ctx.fillStyle = "#6B7280";
    ctx.fillText("current stress", centerX, centerY + 14);

    ctx.restore();
  },
};

export default function SummaryCard({ score, trend, mode = "combined" }) {
  const safeScore =
    typeof score === "number" ? Math.max(0, Math.min(1, score)) : 0;

  const percent = (safeScore * 100).toFixed(0);

  // Human-friendly stress level
  let level = "Low";
  if (safeScore > 0.7) level = "High";
  else if (safeScore > 0.4) level = "Moderate";

  const levelPillClass =
    level === "High"
      ? "bg-rose-100 text-rose-700 border-rose-300"
      : level === "Moderate"
      ? "bg-amber-100 text-amber-700 border-amber-300"
      : "bg-emerald-100 text-emerald-700 border-emerald-300";

  // Trend (supportive wording)
  const trendLabel =
    trend === "up"
      ? "Increasing"
      : trend === "down"
      ? "Settling down"
      : "Stable";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-rose-600"
      : trend === "down"
      ? "text-emerald-600"
      : "text-gray-600";

  // Mode text
  const title =
    mode === "keystroke"
      ? "Typing Stress"
      : mode === "text"
      ? "Emotion Stress"
      : "Overall Stress";

  const description =
    mode === "keystroke"
      ? "Based on your typing rhythm"
      : mode === "text"
      ? "Based on emotional tone in text"
      : "Combined behavioral signals";

  const ModeIcon =
    mode === "keystroke"
      ? Keyboard
      : mode === "text"
      ? MessageCircle
      : Activity;

  const gradientClass =
    mode === "combined"
      ? "from-blue-500 to-indigo-600"
      : mode === "keystroke"
      ? "from-cyan-500 to-blue-600"
      : "from-purple-500 to-fuchsia-600";

  const sliceColor =
    level === "High"
      ? "#f43f5e"
      : level === "Moderate"
      ? "#f59e0b"
      : "#10b981";

  const chartData = {
    labels: ["stress", "rest"],
    datasets: [
      {
        data: [safeScore, 1 - safeScore],
        backgroundColor: [sliceColor, "#E6EDF3"],
        borderWidth: 0,
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
              ? `Stress level: ${percent}%`
              : `Remaining balance: ${100 - Number(percent)}%`,
        },
      },
      centerText: {
        text: `${percent}%`,
      },
    },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-md px-4 py-3 flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:shadow-xl hover:border-gray-300 group">

      <div className="relative z-10 flex gap-3">

        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}
              >
                <ModeIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">{title}</h2>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${levelPillClass}`}
            >
              {level} level
            </span>
          </div>

          {/* Trend */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-600 font-semibold">
              Recent trend
            </span>
            <div className={`flex items-center gap-1.5 ${trendColor} font-bold text-sm`}>
              <TrendIcon className="h-4 w-4" strokeWidth={2.5} />
              <span>{trendLabel}</span>
            </div>
          </div>
        </div>

        {/* Right */}
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
