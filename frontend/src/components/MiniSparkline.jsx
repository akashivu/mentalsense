import { Line } from "react-chartjs-2";

export default function MiniSparkline({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="h-20 w-full">
      <Line
        data={{
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderWidth: 2.5,
              tension: 0.45,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderColor: "#2563eb",
              fill: true,
              backgroundColor: (ctx) => {
                const chart = ctx.chart;
                const { ctx: canvas, chartArea } = chart;
                if (!chartArea) return null;

                const gradient = canvas.createLinearGradient(
                  0,
                  chartArea.top,
                  0,
                  chartArea.bottom
                );
                gradient.addColorStop(0, "rgba(37,99,235,0.35)");
                gradient.addColorStop(1, "rgba(37,99,235,0.02)");
                return gradient;
              },
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 600,
            easing: "easeOutQuart",
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
              min: 0,
              max: 1,
            },
          },
          elements: {
            line: {
              capBezierPoints: true,
            },
          },
        }}
      />
    </div>
  );
}
