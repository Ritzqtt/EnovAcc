import { useState } from "react";

const textLink =
  "p-0 text-[16px] leading-[22px] text-[#0693c7] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]";

const inputClass =
  "box-border h-12 w-full rounded-lg border border-[#dce5ea] bg-white p-3 text-[16px] leading-[22px] tracking-[0.3em] text-[#021820] placeholder:tracking-normal placeholder:text-[#637a8a] focus-visible:border-[#0693c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7] aria-[invalid=true]:border-[#e5484d]";

/**
 * Props:
 *  email               the address the code was sent to
 *  onVerify(code)      async; throw/reject to show the error message
 *  onResend            called for "Resend verification code"
 *  onUseDifferentEmail called for "Use different email"
 *  onBackToLanding     navigation callback
 */
export default function VerifyEmailPage({
  email,
  onVerify,
  onResend,
  onUseDifferentEmail,
  onBackToLanding,
}) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (verifying) return;
    setError(null);

    if (!code.trim()) {
      setFieldError("Enter the verification code.");
      return;
    }
    setFieldError("");

    setVerifying(true);
    try {
      await onVerify(code.trim());
    } catch {
      setError("That code didn't work. Check it and try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-white font-['Inter',system-ui,sans-serif] text-[#021820] lg:grid-cols-[900fr_1020fr]">
      {/* Brand side (hidden on small screens) */}
      <section
        aria-label="About EnovAcc"
        className="relative hidden flex-col justify-start overflow-hidden px-[clamp(3rem,8.8vw,168px)] pt-[20vh] text-white lg:flex bg-[linear-gradient(180deg,#38bdf8_0%,#32ade5_34.135%,#0e58ad_56.25%,#003699_85.096%,#04294f_100%)]"
      >
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[-40%] bottom-[-38%] w-[150%] max-w-none object-contain opacity-[0.18] brightness-0 invert"
        />

        <div className="relative max-w-[480px]">
          <p className="mb-2 text-[15px] font-bold leading-4">THE FINANCIAL PICTURE, CONNECTED.</p>
          <h1 className="translate-x-1 whitespace-nowrap text-[clamp(4rem,7.25vw,136px)] font-black italic leading-none">
            EnovAcc:
          </h1>
          <p className="mb-8 translate-x-1 whitespace-nowrap text-[clamp(1.5rem,2.4vw,45px)] font-medium italic">
            Financial Management System
          </p>
          <p className="translate-x-1 text-[15px] leading-[22px]">
            From the first entry to the final report.
            <br />
            One connected workspace for your finances.
          </p>
        </div>

        <p className="absolute bottom-[12%] left-[clamp(3rem,8.8vw,168px)] text-[15px] leading-[18px] text-white/70">
          Enov8tive Technology Solutions Inc.
          <br />
          Philippine Entity · Internal Financial Management System
        </p>
      </section>

      {/* Verify-email side */}
      <section className="flex flex-col items-center justify-center bg-white px-6 py-8 sm:p-16">
        <div className="flex w-full max-w-[500px] flex-col">
          <button
            type="button"
            onClick={onBackToLanding}
            className={`${textLink} self-center`}
          >
            ← Back to landing page
          </button>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-6 flex w-full flex-col items-start gap-4"
          >
            <p className="text-[16px] font-bold leading-4 text-[#0693c7]">ALMOST THERE</p>
            <h2 className="whitespace-nowrap text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]">
              Verify your email.
            </h2>
            <p className="text-[16px] leading-[22px] text-[#637a8a]">
              We sent a code to{" "}
              <span className="font-bold text-[#021820]">{email}</span>.
            </p>

            {error && (
              <p
                role="alert"
                className="w-full rounded-lg border border-[#e5484d] bg-[#fff5f5] p-3 text-sm leading-5 text-[#a1232a]"
              >
                {error}
              </p>
            )}

            <div className="flex w-full flex-col gap-2">
              <label htmlFor="verify-code" className="text-[16px] font-bold leading-5">
                Verification Code
              </label>
              <input
                id="verify-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (fieldError) setFieldError("");
                }}
                aria-invalid={fieldError ? true : undefined}
                required
                className={inputClass}
              />
              {fieldError && (
                <p className="text-sm leading-5 text-[#e5484d]">{fieldError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="box-border inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#38bdf8] p-3 text-[15px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifying ? "Verifying…" : "Verify and continue  →"}
            </button>

            <button type="button" onClick={onResend} className={textLink}>
              Resend verification code
            </button>
            <button type="button" onClick={onUseDifferentEmail} className={textLink}>
              Use different email
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
