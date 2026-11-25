import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const FIELD =
  "h-11 w-full rounded-lg border border-[#dce5ea] bg-white px-3 text-[13px] text-[#021820] outline-none placeholder:text-[#637a8a] focus-visible:ring-2 focus-visible:ring-[#0693c7] disabled:opacity-60";

const LABEL = "mb-1.5 block text-xs font-bold text-[#021820]";

async function readFunctionError(error) {
  try {
    const body = await error.context.json();
    if (body?.error) return body.error;
  } catch {
    // Fall through.
  }

  return "Could not reset the password. Try again.";
}

export default function ResetPasswordModal({ user, onClose, onReset }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setSubmitting(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "reset-user-password",
        {
          body: {
            user_id: user.id,
            password,
          },
        },
      );

      if (fnError) {
        throw new Error(await readFunctionError(fnError));
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      await onReset?.();
      onClose();
    } catch (err) {
      setError(err.message || "Could not reset the password.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#021820]/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="reset-password-title"
          className="text-[19px] font-bold leading-7 text-[#021820]"
        >
          Reset password
        </h2>

        <p className="mt-1 text-xs leading-[18px] text-[#637a8a]">
          Set a new password for {user.full_name}. Their current password is not
          required.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="rp-password" className={LABEL}>
              New password
            </label>

            <div className="relative">
              <input
                id="rp-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                autoFocus
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={`${FIELD} pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#637a8a] hover:text-[#0a6fa6]"
              >
                {showPassword ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 19c-6.5 0-10-7-10-7a18.5 18.5 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c6.5 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="rp-confirm" className={LABEL}>
              Confirm new password
            </label>

            <div className="relative">
              <input
                id="rp-confirm"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                autoComplete="new-password"
                placeholder="Enter the new password again"
                className={`${FIELD} pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#637a8a] hover:text-[#0a6fa6]"
              >
                {showConfirmPassword ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 19c-6.5 0-10-7-10-7a18.5 18.5 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c6.5 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-[#b0243f]">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 rounded-lg border border-[#dce5ea] bg-white px-5 text-[13px] font-bold text-[#021820] hover:bg-[#f3f6f8] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-lg bg-[#3dc0f0] px-6 text-[13px] font-bold text-white hover:bg-[#2fb0e0] disabled:opacity-60"
            >
              {submitting ? "Resetting…" : "Reset password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
