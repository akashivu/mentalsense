// frontend/src/components/TypingBox.jsx
import React, { useState } from "react";
import useKeystrokeCapture from "../hooks/useKeystrokeCapture";

export default function TypingBox() {
  const [text, setText] = useState("");
  const { onKeyDown, onKeyUp, getFeaturesAndReset, sendToServer } = useKeystrokeCapture();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const features = getFeaturesAndReset();
    await sendToServer(features);
    setText("");
    alert("Keystroke features sent!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
  <textarea
    value={text}
    onChange={(e) => setText(e.target.value)}
    onKeyDown={onKeyDown}
    onKeyUp={onKeyUp}
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
