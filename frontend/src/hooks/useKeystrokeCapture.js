
import { useRef, useCallback } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";
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
    const rawSample = ""; 
   
    startTimeRef.current = null;
    keyCountsRef.current = 0;
    backspaceCountRef.current = 0;
    holdTimes.current = [];
    lastKeyDown.current = null;

    return { typingSpeed, avgHold, backspaceRate, rawSample };
  }, []);

  const sendToServer = useCallback(async (features) => {
    try {
     
      await axios.post("http://localhost:8080/keystroke/log", {
       
        typingSpeed: features.typingSpeed,
        avgKeyHold: features.avgHold,
        backspaceRate: features.backspaceRate,
        rawSample: features.rawSample
      }, {
      headers: { "Content-Type": "application/json", ...authHeader() }
    });
    } catch (err) {
     console.error("send failed", err?.response?.data || err.message);
    throw err;
    }
  }, []);

  return { onKeyDown, onKeyUp, getFeaturesAndReset, sendToServer };
}
