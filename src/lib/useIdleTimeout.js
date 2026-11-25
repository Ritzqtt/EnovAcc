import { useEffect, useRef } from "react";

const ACTIVITY_KEY = "enovacc:last-activity";
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
];
const CHECK_EVERY_MS = 5000;
const STORAGE_WRITE_EVERY_MS = 5000;

function readStoredActivity() {
  try {
    return Number(window.localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeStoredActivity(time) {
  try {
    window.localStorage.setItem(ACTIVITY_KEY, String(time));
  } catch {
    return;
  }
}

export default function useIdleTimeout({ enabled, timeoutMs, onTimeout }) {
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!enabled) return undefined;

    let lastActivity = Date.now();
    let lastWrite = lastActivity;
    let fired = false;
    writeStoredActivity(lastActivity);

    const markActive = () => {
      const time = Date.now();
      lastActivity = time;
      if (time - lastWrite >= STORAGE_WRITE_EVERY_MS) {
        lastWrite = time;
        writeStoredActivity(time);
      }
    };

    const check = () => {
      if (fired) return;
      const latest = Math.max(lastActivity, readStoredActivity());
      if (Date.now() - latest >= timeoutMs) {
        fired = true;
        onTimeoutRef.current?.();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") check();
    };

    ACTIVITY_EVENTS.forEach((name) =>
      window.addEventListener(name, markActive, { passive: true }),
    );
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = window.setInterval(check, CHECK_EVERY_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((name) =>
        window.removeEventListener(name, markActive),
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, [enabled, timeoutMs]);
}
