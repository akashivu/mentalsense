import React from "react";
import { Line } from "react-chartjs-2";



export default function TrendGraph({ past = [], future = [], anomalies = [] }) {
  const pastArr = Array.isArray(past) ? past : [];
  const futureArr = Array.isArray(future) ? future : [];

  const trendValues = [...pastArr, ...futureArr];
  const totalLength = trendValues.length;

  
  const labels = [
    ...pastArr.map((_, idx) => `P-${pastArr.length - idx}`),
    ...futureArr.map((_, idx) => `+${idx + 1}`),
  ];

 
  const anomalyScores = new Array(totalLength).fill(null);

  anomalies.slice(0, totalLength).forEach((a, idx) => {
   
    anomalyScores[idx] = a.score ?? a.combinedScore ?? trendValues[idx] ?? null;
    
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Stress Trend",
        data: trendValues,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "Anomalies",
        data: anomalyScores,
        pointBackgroundColor: "red",
        pointBorderColor: "red",
        pointRadius: 6,
        showLine: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 1,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 md:p-6 h-64 md:h-80">
      <h2 className="text-lg font-bold mb-3">Predicted Stress Trend</h2>
      {trendValues.length === 0 ? (
        <p className="text-sm text-gray-500">
          Need more data to compute trend.
        </p>
      ) : (
        <div className="w-full h-full">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
}
