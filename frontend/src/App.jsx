
import React from "react";
import TypingBox from "./components/TypingBox";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Keystroke Capture — TypingBox</h1>
      <TypingBox />
      <Register/>
      <Login/>
    </div>
  );
}

export default App;
