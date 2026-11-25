import { useEffect, useRef, useState } from "react";

const LENGTH = 6;
const EMPTY = Array(LENGTH).fill("");

const textLink =
  "p-0 text-[16px] leading-[22px] text-[#0693c7] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7] disabled:cursor-not-allowed disabled:text-[#637a8a] disabled:no-underline";

const boxClass =
  "box-border h-14 w-full min-w-0 rounded-lg border border-[#dce5ea] bg-white p-0 text-center text-[24px] font-bold leading-none text-[#021820] focus-visible:border-[#0693c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7] aria-[invalid=true]:border-[#e5484d]";

export default function OtpPanel({
  maskedEmail,
  onVerify,
  onResend,
  onBack,
  resendCooldown = 30,
  expiresInMinutes = 5,
  eyebrow = "ONE MORE STEP",
  title = "Enter your code.",
  backLabel = "← Back to sign in",
  description,
}) {
  const [digits, setDigits] = useState(EMPTY);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(resendCooldown);

  const inputs = useRef([]);
  const submitting = useRef(false);
  const code = digits.join("");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function submit(value) {
    if (submitting.current) return;
    submitting.current = true;
    setVerifying(true);
    setError("");
    setNotice("");
    try {
      await onVerify(value);
    } catch (err) {
      setError(err?.message || "Incorrect code. Try again.");
      setDigits(EMPTY);
      setVerifying(false);
      submitting.current = false;
      setTimeout(() => focusBox(0), 0);
    }
  }

  useEffect(() => {
    if (code.length !== LENGTH) return undefined;
    const id = setTimeout(() => submit(code), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function focusBox(i) {
    inputs.current[Math.max(0, Math.min(i, LENGTH - 1))]?.focus();
  }

  function fill(start, raw) {
    const chars = raw
      .replace(/\D/g, "")
      .slice(0, LENGTH - start)
      .split("");
    if (!chars.length || chars[0] === "") return;
    setError("");
    setNotice("");
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((ch, k) => {
        next[start + k] = ch;
      });
      return next;
    });
    focusBox(start + chars.length);
  }

  function handleChange(i, e) {
    const v = e.target.value.replace(/\D/g, "");
    if (!v) {
      setDigits((prev) => prev.map((d, k) => (k === i ? "" : d)));
      return;
    }

    if (v.length >= LENGTH) fill(0, v);
    else fill(i, v.slice(-1));
  }

  function handlePaste(i, e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    fill(text.length >= LENGTH ? 0 : i, text);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigits((prev) => prev.map((d, k) => (k === i - 1 ? "" : d)));
      focusBox(i - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(i + 1);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (code.length < LENGTH) {
      setError("Enter the 6-digit code.");
      return;
    }
    submit(code);
  }

  async function handleResend() {
    if (cooldown > 0 || resending || verifying) return;
    setResending(true);
    setError("");
    setNotice("");
    try {
      await onResend();
      setDigits(EMPTY);
      setCooldown(resendCooldown);
      setNotice("We sent you a new code.");
      focusBox(0);
    } catch (err) {
      setError(err?.message || "We couldn't send a new code. Try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="otp-panel flex w-full flex-col">
      <style>{`
        .otp-panel { animation: otp-in .3s ease-out both; }
        @keyframes otp-in {
          from { opacity: 0; transform: translateX(16px) }
          to   { opacity: 1; transform: translateX(0) }
        }
        @media (prefers-reduced-motion: reduce) { .otp-panel { animation: none } }
      `}</style>

      <div className="self-center">
        <button
          type="button"
          onClick={onBack}
          disabled={verifying}
          className={textLink}
        >
          {backLabel}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex w-full flex-col items-start gap-4"
      >
        <p className="text-[16px] font-bold leading-4 text-[#0693c7]">
          {eyebrow}
        </p>
        <h2
          id="otp-heading"
          className="whitespace-nowrap text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]"
        >
          {title}
        </h2>
        <p className="text-[16px] leading-[22px] text-[#637a8a]">
          {description ?? (
            <>
              We sent a 6-digit code to{" "}
              <span className="font-bold text-[#021820]">{maskedEmail}</span>.
              It expires in {expiresInMinutes} minutes.
            </>
          )}
        </p>

        <div
          role="group"
          aria-labelledby="otp-heading"
          className="grid w-full grid-cols-6 gap-2 sm:gap-3"
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1} of ${LENGTH}`}
              aria-invalid={error ? true : undefined}
              value={d}
              readOnly={verifying}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => e.target.select()}
              className={boxClass}
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="text-sm leading-5 text-[#e5484d]">
            {error}
          </p>
        )}
        {notice && !error && (
          <p role="status" className="text-sm leading-5 text-[#637a8a]">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={verifying}
          className="box-border inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#38bdf8] p-3 text-[15px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifying ? "Verifying…" : "Verify code"}
        </button>

        <hr className="m-0 h-px w-full border-0 bg-[#dce5ea]" />

        <p className="text-[16px] leading-[22px] text-[#637a8a]">
          Didn’t get the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending || verifying}
            className={textLink}
          >
            {resending
              ? "Sending…"
              : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend code"}
          </button>
        </p>
      </form>
    </div>
  );
}
