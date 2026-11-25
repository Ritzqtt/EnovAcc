import { useEffect, useState } from "react";
import OtpPanel from "./OtpPanel";
import PostLoginLoader from "./PostLoginLoader";

const textLink =
  "p-0 text-[16px] leading-[22px] text-[#0693c7] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]";

const inputClass =
  "box-border h-12 w-full rounded-lg border border-[#dce5ea] bg-white p-3 text-[16px] leading-[22px] text-[#021820] placeholder:text-[#637a8a] focus-visible:border-[#0693c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7] aria-[invalid=true]:border-[#e5484d]";

function EyeIcon({ off }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {off ? (
        <>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export default function LoginFormPanel({
  onSignIn,
  onSignInFailed,
  onVerifyOtp,
  onResendOtp,
  onLoadingComplete,
  loadingDuration = 2400,
  notice,
  onBackToLanding,
  onForgotPassword,
  emailRef,
}) {
  const [step, setStep] = useState("login");
  const [challenge, setChallenge] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (step !== "loading") return;
    const id = setTimeout(() => onLoadingComplete?.(), loadingDuration);
    return () => clearTimeout(id);
  }, [step, loadingDuration, onLoadingComplete]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (signingIn) return;

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email address is required.";
    if (!password) nextErrors.password = "Password is required.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError("");
    setSigningIn(true);
    try {
      const result = await onSignIn(email.trim(), password);
      setChallenge(result);
      setStep("otp");
    } catch (err) {
      setFormError(err?.message || "Unable to sign in. Try again.");
      onSignInFailed?.(err);
    } finally {
      setSigningIn(false);
    }
  }

  async function handleVerify(code) {
    await onVerifyOtp(challenge.challengeId, code);
    setStep("loading");
  }

  function handleResend() {
    return onResendOtp(challenge.challengeId);
  }

  function handleBackToLogin() {
    setFormError("");
    setPassword("");
    setChallenge(null);
    setStep("login");
  }

  return (
    <div className="auth-form-centered">
      <div className="auth-form-column flex w-full flex-col">
        {step === "loading" ? (
          <PostLoginLoader />
        ) : step === "otp" ? (
          <OtpPanel
            maskedEmail={challenge?.maskedEmail ?? email}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={handleBackToLogin}
          />
        ) : (
          <>
            <div
              className="auth-form-item self-center"
              style={{ "--stagger": 0 }}
            >
              <button
                type="button"
                onClick={onBackToLanding}
                className={textLink}
              >
                ← Back to landing page
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-6 flex w-full flex-col items-start gap-4"
            >
              <p
                className="auth-form-item text-[16px] font-bold leading-4 text-[#0693c7]"
                style={{ "--stagger": 1 }}
              >
                WELCOME BACK
              </p>
              <h2
                id="login-heading"
                className="auth-form-item text-[clamp(28px,8vw,42px)] font-bold leading-[1.1] text-[#021820] sm:whitespace-nowrap"
                style={{ "--stagger": 2 }}
              >
                Your workspace awaits.
              </h2>
              <p
                className="auth-form-item text-[16px] leading-[22px] text-[#637a8a]"
                style={{ "--stagger": 3 }}
              >
                Sign in to review, record, and move forward.
              </p>

              {notice && (
                <p
                  role="status"
                  className="w-full rounded-lg border border-[#2f9e6f]/30 bg-[#2f9e6f]/5 p-3 text-sm leading-5 text-[#1f7a53]"
                >
                  {notice}
                </p>
              )}

              <div
                className="auth-form-item flex w-full flex-col gap-2"
                style={{ "--stagger": 4 }}
              >
                <label
                  htmlFor="login-email"
                  className="text-[16px] font-bold leading-5 text-[#021820]"
                >
                  Email Address
                </label>
                <input
                  ref={emailRef}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError("");
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  required
                  className={inputClass}
                />
                {fieldErrors.email && (
                  <p className="text-sm leading-5 text-[#e5484d]">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div
                className="auth-form-item flex w-full flex-col gap-2"
                style={{ "--stagger": 5 }}
              >
                <label
                  htmlFor="login-password"
                  className="text-[16px] font-bold leading-5 text-[#021820]"
                >
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError("");
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    aria-invalid={fieldErrors.password ? true : undefined}
                    required
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-[#637a8a] hover:text-[#021820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7]"
                  >
                    <EyeIcon off={showPassword} />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm leading-5 text-[#e5484d]">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {formError && (
                <p
                  role="alert"
                  className="w-full rounded-lg border border-[#e5484d]/30 bg-[#e5484d]/5 p-3 text-sm leading-5 text-[#e5484d]"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={signingIn}
                className="auth-form-item box-border inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#38bdf8] p-3 text-[15px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ "--stagger": 6 }}
              >
                {signingIn ? "Signing in…" : "Sign In to EnovAcc  →"}
              </button>

              <hr
                className="auth-form-item m-0 h-px w-full border-0 bg-[#dce5ea]"
                style={{ "--stagger": 7 }}
              />

              <button
                type="button"
                onClick={onForgotPassword}
                className={`${textLink} auth-form-item`}
                style={{ "--stagger": 7 }}
              >
                Forgot password?
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
