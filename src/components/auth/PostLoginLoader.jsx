import { useEffect, useState } from "react";

const MESSAGES = ["Signing you in", "Loading your workspace", "Almost ready"];

export default function PostLoginLoader({ messages = MESSAGES }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => Math.min(i + 1, messages.length - 1)),
      1200,
    );
    return () => clearInterval(id);
  }, [messages]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="pll-panel flex w-full flex-col items-center text-center"
    >
      <style>{`
        .pll-panel { animation: pll-fade-in .35s ease-out both; }
        .pll-spinner { animation: pll-spin .9s linear infinite; }
        .pll-msg { animation: pll-msg-in .35s ease-out both; }

        @keyframes pll-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pll-spin { to { transform: rotate(360deg) } }
        @keyframes pll-msg-in {
          from { opacity: 0; transform: translateY(6px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @media (prefers-reduced-motion: reduce) {
          .pll-panel, .pll-msg { animation: none }
          .pll-spinner { animation-duration: 3s }
        }
      `}</style>

      <svg
        viewBox="0 0 50 50"
        className="pll-spinner h-16 w-16"
        aria-hidden="true"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#dce5ea"
          strokeWidth="4"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.4 125.6"
        />
      </svg>

      <h2 className="m-0 mt-8 text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]">
        Welcome back.
      </h2>

      <p
        key={index}
        className="pll-msg m-0 mt-3 text-[16px] leading-[22px] text-[#637a8a]"
      >
        {messages[index]}…
      </p>
    </div>
  );
}
