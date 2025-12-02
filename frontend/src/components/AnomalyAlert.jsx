import React from "react";

export default function AnomalyAlert({ visible }) {
  if (!visible) return null;

  return (
    <div className="w-full bg-red-600 text-white px-4 py-3 rounded-lg shadow-md mb-4">
      <p className="text-center font-semibold">
         Sudden Stress Spike Detected — Take a short break and breathe.
      </p>
    </div>
  );
}
