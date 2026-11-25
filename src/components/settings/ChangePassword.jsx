import { useState } from "react";
import { supabase } from "../../lib/supabase";

const MIN_LENGTH = 8;

function EyeIcon({ off }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {off ? (
        <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.2-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete, error, show, onToggle }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-[#021820]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-lg border bg-white pl-3 pr-11 text-sm text-[#021820] outline-none transition-colors focus:border-[#0693c7] focus:ring-2 focus:ring-[#0693c7]/20 ${
            error ? "border-[#e5484d]" : "border-[#dce5ea]"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide passwords" : "Show passwords"}
          aria-pressed={show}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#637a8a] transition-colors hover:text-[#021820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0693c7]"
        >
          <EyeIcon off={show} />
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-[#c93a3f]">
          {error}
        </p>
      )}
    </div>
  );
}

function Rule({ met, children }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${met ? "text-[#14683a]" : "text-[#637a8a]"}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        {met ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <circle cx="12" cy="12" r="4" />}
      </svg>
      {children}
      <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
    </li>
  );
}

export default function ChangePassword({ currentUser }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const rules = [
    { label: `At least ${MIN_LENGTH} characters`, met: next.length >= MIN_LENGTH },
    { label: "One uppercase letter", met: /[A-Z]/.test(next) },
    { label: "One lowercase letter", met: /[a-z]/.test(next) },
    { label: "One number", met: /\d/.test(next) },
    { label: "One special character", met: /[^A-Za-z0-9\s]/.test(next) },
    {
      label: "Different from your current password",
      met: next.length > 0 && current.length > 0 && next !== current,
    },
    { label: "Matches the confirmation", met: confirm.length > 0 && next === confirm },
  ];
  const canSubmit = current.length > 0 && rules.every((r) => r.met) && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (!currentUser?.email) {
      setStatus({ type: "error", text: "We couldn't find your account. Sign in again." });
      return;
    }

    setSaving(true);
    setStatus(null);
    setErrors({});

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: current,
      });

      if (verifyError) {
        const wrong = verifyError.message?.toLowerCase().includes("invalid login credentials");
        if (wrong) {
          setErrors({ current: "Your current password is incorrect." });
        } else {
          setStatus({ type: "error", text: "We couldn't verify your password. Try again." });
        }
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: next });
      if (updateError) {
        setStatus({ type: "error", text: updateError.message });
        return;
      }

      setCurrent("");
      setNext("");
      setConfirm("");
      setShow(false);
      setStatus({ type: "success", text: "Your password was updated." });
    } catch {
      setStatus({ type: "error", text: "Something went wrong. Try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">Change Password</h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Enter your current password, then choose a new one.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto w-full max-w-[480px] rounded-xl border border-[#dce5ea] bg-white"
      >
        <div className="flex flex-col gap-5 p-6">
          <PasswordField
            id="current-password"
            label="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            error={errors.current}
            show={show}
            onToggle={() => setShow((s) => !s)}
          />
          <PasswordField
            id="new-password"
            label="New password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            show={show}
            onToggle={() => setShow((s) => !s)}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            show={show}
            onToggle={() => setShow((s) => !s)}
          />

          <ul className="flex flex-col gap-1.5" aria-label="Password requirements">
            {rules.map((rule) => (
              <Rule key={rule.label} met={rule.met}>
                {rule.label}
              </Rule>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#e6edf1] p-6">
          {status && (
            <p
              role={status.type === "error" ? "alert" : "status"}
              className={`rounded-lg px-4 py-3 text-[13px] leading-5 ${
                status.type === "error"
                  ? "bg-[#fde4e4] text-[#a12b30]"
                  : "bg-[#e3f7ea] text-[#14683a]"
              }`}
            >
              {status.text}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-10 rounded-lg bg-[#02355d] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#03487f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:bg-[#a7bfce]"
            >
              {saving ? "Updating…" : "Update password"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}