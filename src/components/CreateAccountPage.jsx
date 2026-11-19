import { useState } from "react";

const textLink =
  "p-0 text-[16px] leading-[22px] text-[#0693c7] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]";

const inputClass =
  "box-border h-12 w-full rounded-lg border border-[#dce5ea] bg-white p-3 text-[16px] leading-[22px] text-[#021820] placeholder:text-[#637a8a] focus-visible:border-[#0693c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7] aria-[invalid=true]:border-[#e5484d]";

/**
 * Props:
 *  onCreateAccount({ fullName, email, password })  async; throw/reject on failure
 *  onAccountFailed  called when account creation fails
 *  onBackToLanding, onSignIn  navigation callbacks
 */
export default function CreateAccountPage({
  onCreateAccount,
  onAccountFailed,
  onBackToLanding,
  onSignIn,
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (field) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Work email is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onCreateAccount({ fullName: fullName.trim(), email: email.trim(), password });
    } catch {
      onAccountFailed();
    } finally {
      setSubmitting(false);
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

      {/* Create-account side */}
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
            <p className="text-[16px] font-bold leading-4 text-[#0693c7]">GET STARTED</p>
            <h2 className="whitespace-nowrap text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]">
              Create your account
            </h2>
            <p className="text-[16px] leading-[22px] text-[#637a8a]">
              Use your work email — we will send a six-digit verification code.
            </p>

            <div className="flex w-full flex-col gap-2">
              <label htmlFor="account-fullname" className="text-[16px] font-bold leading-5">
                Full Name
              </label>
              <input
                id="account-fullname"
                type="text"
                autoComplete="name"
                placeholder="Enter Full Name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError("fullName");
                }}
                aria-invalid={fieldErrors.fullName ? true : undefined}
                required
                className={inputClass}
              />
              {fieldErrors.fullName && (
                <p className="text-sm leading-5 text-[#e5484d]">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <label htmlFor="account-email" className="text-[16px] font-bold leading-5">
                Work Email
              </label>
              <input
                id="account-email"
                type="email"
                autoComplete="email"
                placeholder="Enter Work Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                aria-invalid={fieldErrors.email ? true : undefined}
                required
                className={inputClass}
              />
              {fieldErrors.email && (
                <p className="text-sm leading-5 text-[#e5484d]">{fieldErrors.email}</p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <label htmlFor="account-password" className="text-[16px] font-bold leading-5">
                Password
              </label>
              <input
                id="account-password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                aria-invalid={fieldErrors.password ? true : undefined}
                required
                className={inputClass}
              />
              {fieldErrors.password && (
                <p className="text-sm leading-5 text-[#e5484d]">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <label htmlFor="account-confirm-password" className="text-[16px] font-bold leading-5">
                Confirm Password
              </label>
              <input
                id="account-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError("confirmPassword");
                }}
                aria-invalid={fieldErrors.confirmPassword ? true : undefined}
                required
                className={inputClass}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm leading-5 text-[#e5484d]">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="box-border inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#38bdf8] p-3 text-[15px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create Account  →"}
            </button>

            <button type="button" onClick={onSignIn} className={textLink}>
              Already registered? Sign in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
