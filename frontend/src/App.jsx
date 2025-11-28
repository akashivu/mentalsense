
import React from "react";
import TypingBox from "./components/TypingBox";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TrendContainer from "./components/TrendContainer";
import TrendGraph from "./components/TrendGraph";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Keystroke Capture — TypingBox</h1>
      <TypingBox />
      <Register/>
      <Login/>
      <TrendContainer userId={1} />
      
    </div>
  );
}

export default App;
