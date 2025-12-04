import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { authHeader } from "../services/AuthService";



export default function DailyTrend({ userId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8080/user/${userId}/daily-stress?days=7`,
          { headers: authHeader() }
        );
        setData(res.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load daily stress:", err);
        setError("Failed to load trend");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  
  const labels = data.map((d) => d.day); 

 
  const scores = data.map((d) => d.avgStress);

  const chartData = {
    labels,
    datasets: [
      {
        label: "7-Day Stress Trend",
        data: scores,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
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
      <h2 className="text-lg font-bold mb-3">Weekly Stress Trend</h2>

      {loading && (
        <p className="text-sm text-gray-500">Loading trend...</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-sm text-gray-500">
          Not enough data yet. Use the app for a few days to see your weekly trend.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="w-full h-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
