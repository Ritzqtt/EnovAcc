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
    /* fall through */
  }
  return "Could not create the user. Try again.";
}

export default function AddUserModal({ onClose, onCreated }) {
  const [roles, setRoles] = useState([]);
  const [rolesError, setRolesError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("roles")
      .select("role_id, role_name")
      .order("role_name", { ascending: true })
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setRolesError("Couldn’t load roles.");
        else setRoles(data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

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

    if (!fullName.trim()) return setError("Full name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Enter a valid email address.");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (!roleId) return setError("Choose a role.");

    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "invite-user",
        {
          body: {
            full_name: fullName.trim(),
            email: email.trim(),
            password,
            role_id: roleId,
          },
        },
      );

      if (fnError) throw new Error(await readFunctionError(fnError));
      if (data?.error) throw new Error(data.error);

      await onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message);
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
        aria-labelledby="add-user-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="add-user-title"
          className="text-[19px] font-bold leading-7 text-[#021820]"
        >
          Add user
        </h2>
        <p className="mt-1 text-xs leading-[18px] text-[#637a8a]">
          Create the account and give the credentials to the employee.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="au-name" className={LABEL}>
              Full name
            </label>
            <input
              id="au-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
              autoFocus
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="au-email" className={LABEL}>
              Email
            </label>
            <input
              id="au-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="off"
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="au-password" className={LABEL}>
              Password
            </label>
            <div className="relative">
              <input
                id="au-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={`${FIELD} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#637a8a] transition-colors hover:text-[#0a6fa6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0693c7]"
              >
                {showPassword ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
            <label htmlFor="au-role" className={LABEL}>
              Role
            </label>
            <div className="relative">
              <select
                id="au-role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={submitting || roles.length === 0}
                className={`${FIELD} cursor-pointer appearance-none pr-10`}
              >
                <option value="">Select a role</option>
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#637a8a]"
              >
                <path d="M5 8l5 5 5-5" />
              </svg>
            </div>
            {rolesError && (
              <p className="mt-1 text-xs text-[#b0243f]">{rolesError}</p>
            )}
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
              {submitting ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
