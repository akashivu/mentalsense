// src/components/TypingBox.jsx
import React, { useState } from "react";
import useKeystrokeCapture from "../hooks/useKeystrokeCapture";
import { authHeader } from "../services/AuthService";
import axios from "axios";

export default function TypingBox({ userId = 1 }) {
  const [text, setText] = useState("");
  const { onKeyDown, onKeyUp, getFeaturesAndReset, sendToServer } = useKeystrokeCapture();
  const [samples, setSamples] = useState([]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  // pass the current textarea text to feature getter
  const features = getFeaturesAndReset(text.trim());
  // if user didn't type anything, warn
  if (!features.raw_text || features.raw_text.length < 3) {
    alert("Please type a meaningful sentence before sending.");
    return;
  }

  // guard: ensure userId exists
  if (userId === undefined || userId === null) {
    alert("User id not available. Please login or retry.");
    return;
  }

  try {
    await sendToServer(features, userId);   // <-- pass userId here
    setText("");
    alert("Keystroke features sent!");
  } catch (err) {
    alert("Failed to send sample: " + (err?.response?.data || err.message));
  }
};

  // keep your baseline logic; ensure you import axios at top (added)
  async function onNewSample(features) {
    setSamples(prev => {
      const arr = [...prev, features];
      if (arr.length >= 5) {
        const avgTypingSpeed = arr.reduce((s, f) => s + (f.typingSpeed || 0), 0) / arr.length;
        const avgStress = arr.reduce((s, f) => s + (f.backspaceRate || 0), 0) / arr.length;
        
        const tokenHeader = authHeader();
        axios.put(`http://localhost:8080/user/${userId}/baseline`, {
          baselineTypingSpeed: avgTypingSpeed,
          baselineStress: avgStress
        }, { headers: { ...tokenHeader, "Content-Type": "application/json" }});
        return [];
      } else return arr;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { onKeyDown(e); }}
        onKeyUp={(e) => { onKeyUp(e); }}
        rows={6}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        placeholder="Type here..."
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Send Sample
      </button>
    </form>
  );
}
