import { Line } from "react-chartjs-2";

/**
 * MiniSparkline
 *
 * Purpose:
 * - Quick visual confidence
 * - No axes, no clutter
 * - Just trend direction
 */
export default function MiniSparkline({ data = [] }) {
  if (!data.length) return null;

  return (
    <div className="h-20">
      <Line
        data={{
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderWidth: 2,
              tension: 0.35,
              pointRadius: 0,
              borderColor: "#2563eb",
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        }}
      />
    </div>
  );
}
