
import { useRef, useCallback } from "react";
import axios from "axios";

export default function useKeystrokeCapture() {
  const startTimeRef = useRef(null);
  const keyCountsRef = useRef(0);
  const backspaceCountRef = useRef(0);
  const holdTimes = useRef([]);
  const lastKeyDown = useRef(null);

  const onKeyDown = useCallback((e) => {
    if (!startTimeRef.current) startTimeRef.current = performance.now();
    keyCountsRef.current += 1;
    if (e.key === "Backspace") backspaceCountRef.current += 1;
    lastKeyDown.current = performance.now();
  }, []);

  const onKeyUp = useCallback((e) => {
    if (lastKeyDown.current) {
      const hold = performance.now() - lastKeyDown.current;
      holdTimes.current.push(hold);
      lastKeyDown.current = null;
    }
  }, []);

  const getFeaturesAndReset = useCallback(() => {
    const durationMs = performance.now() - (startTimeRef.current || performance.now());
    const duration = durationMs / 1000;
    const typingSpeed = duration > 0 ? (keyCountsRef.current / duration) : 0;
    const avgHold = holdTimes.current.length ? (holdTimes.current.reduce((a,b)=>a+b,0) / holdTimes.current.length) : 0;
    const backspaceRate = (keyCountsRef.current === 0) ? 0 : (backspaceCountRef.current / keyCountsRef.current) * 100;
    const rawSample = ""; // you can fill with captured text if needed

    // reset
    startTimeRef.current = null;
    keyCountsRef.current = 0;
    backspaceCountRef.current = 0;
    holdTimes.current = [];
    lastKeyDown.current = null;

    return { typingSpeed, avgHold, backspaceRate, rawSample };
  }, []);

  const sendToServer = useCallback(async (features) => {
    try {
      // prefer baseURL via env in real app; using full URL for simplicity
      await axios.post("http://localhost:8080/keystroke/log", {
        userId: 1,
        typingSpeed: features.typingSpeed,
        avgKeyHold: features.avgHold,
        backspaceRate: features.backspaceRate,
        rawSample: features.rawSample
      });
    } catch (err) {
      console.error("Failed to send keystroke", err);
    }
  }, []);

  return { onKeyDown, onKeyUp, getFeaturesAndReset, sendToServer };
}
