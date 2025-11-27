import { useRef, useCallback } from "react";
import axios from "axios";
import { authHeader } from "../services/AuthService";

export default function useKeystrokeCapture() {
  const startTimeRef = useRef(null);
  const keyCountsRef = useRef(0);
  const backspaceCountRef = useRef(0);
  const holdTimes = useRef([]);
  const lastKeyDown = useRef(null);
  const eventTimes = useRef([]);

  const onKeyDown = useCallback((e) => {
    const now = performance.now();
    if (!startTimeRef.current) startTimeRef.current = now;
    keyCountsRef.current += 1;
    if (e.key === "Backspace") backspaceCountRef.current += 1;
    lastKeyDown.current = now;
    eventTimes.current.push(now - startTimeRef.current);
  }, []);

  const onKeyUp = useCallback((e) => {
    if (lastKeyDown.current) {
      const hold = performance.now() - lastKeyDown.current;
      holdTimes.current.push(hold);
      lastKeyDown.current = null;
    }
  }, []);

  const getFeaturesAndReset = useCallback((rawText = "") => {
    const now = performance.now();
    const durationMs = now - (startTimeRef.current || now);
    const duration = durationMs / 1000;

    const typingSpeed = duration > 0 ? (keyCountsRef.current / duration) : 0;
    const avgHold = holdTimes.current.length
      ? holdTimes.current.reduce((a, b) => a + b, 0) / holdTimes.current.length
      : 0;
    const backspaceRate =
      keyCountsRef.current === 0
        ? 0
        : (backspaceCountRef.current / keyCountsRef.current) * 100;

    const ev = eventTimes.current.map((v) => Math.round(v));

    startTimeRef.current = null;
    keyCountsRef.current = 0;
    backspaceCountRef.current = 0;
    holdTimes.current = [];
    lastKeyDown.current = null;
    eventTimes.current = [];

    return {
      typingSpeed,
      avgHold,
      backspaceRate,
      raw_text: rawText,
      event_times: ev
    };
  }, []);

  const sendToServer = useCallback(async (features, userId) => {
    try {
      
      await axios.post(
        "http://localhost:8080/keystroke/log",
        {
          event_times: features.event_times,
          raw_text: features.raw_text,
          typingSpeed: features.typingSpeed,
          avgKeyHold: features.avgHold,
          backspaceRate: features.backspaceRate
        },
        {
          headers: { "Content-Type": "application/json", ...authHeader() }
        }
      );

     
      const anomalyPayload = {
        features: [
          features.typingSpeed,
          features.avgHold,
          features.backspaceRate
        ]
      };

      const anomalyRes = await axios.post(
        `http://localhost:8080/user/${userId}/anomaly`,
        anomalyPayload,
        {
          headers: { "Content-Type": "application/json", ...authHeader() }
        }
      );

      console.log("Anomaly result:", anomalyRes.data);

    } catch (err) {
      console.error("send failed", err.response?.data || err.message);
      throw err;
    }
  }, []);

  return { onKeyDown, onKeyUp, getFeaturesAndReset, sendToServer };
}

