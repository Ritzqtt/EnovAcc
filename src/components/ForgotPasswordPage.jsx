import { useState } from "react";

const textLink =
  "p-0 text-[16px] leading-[22px] text-[#0693c7] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]";

const inputClass =
  "box-border h-12 w-full rounded-lg border border-[#dce5ea] bg-white p-3 text-[16px] leading-[22px] text-[#021820] placeholder:text-[#637a8a] focus-visible:border-[#0693c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7] aria-[invalid=true]:border-[#e5484d]";

/**
 * Props:
 *  onSendResetLink(email)  async; throw/reject to show the error message
 *  onBackToSignIn          navigation callback
 *  onBackToLanding         navigation callback
 */
export default function ForgotPasswordPage({
  onSendResetLink,
  onBackToSignIn,
  onBackToLanding,
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;
    setError(null);

    if (!email.trim()) {
      setFieldError("Work email is required.");
      return;
    }
    setFieldError("");

    setSending(true);
    try {
      await onSendResetLink(email.trim());
    } catch {
      setError("We couldn't send the reset link. Check your email and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="auth-form-centered">
        <div className="auth-form-column flex w-full flex-col">
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
            <p className="text-[16px] font-bold leading-4 text-[#0693c7]">RESET ACCESS</p>
            <h2 className="whitespace-nowrap text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]">
              Forgot your password?
            </h2>
            <p className="text-[16px] leading-[22px] text-[#637a8a]">
              Enter your work email to receive a secure reset link.
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
              <label htmlFor="forgot-email" className="text-[16px] font-bold leading-5 text-[#021820]">
                Work Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="Enter Work Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
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
              disabled={sending}
              className="box-border inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#38bdf8] p-3 text-[15px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send reset link  →"}
            </button>

            <button type="button" onClick={onBackToSignIn} className={textLink}>
              Back to sign in
            </button>
          </form>
        </div>
    </div>
  );
}
