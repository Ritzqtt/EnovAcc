
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const FIELD =
  "h-11 w-full rounded-lg border border-[#dce5ea] bg-white px-3 text-[13px] text-[#021820] outline-none placeholder:text-[#637a8a] focus-visible:ring-2 focus-visible:ring-[#0693c7] disabled:opacity-60";

const LABEL = "mb-1.5 block text-xs font-bold text-[#021820]";

const STATUS_OPTIONS = ["Active", "Inactive"];

async function readFunctionError(error) {
  try {
    const body = await error.context.json();
    if (body?.error) return body.error;
  } catch {
    // Fall through.
  }
  return "Could not update the user. Try again.";
}

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [roles, setRoles] = useState([]);
  const [rolesError, setRolesError] = useState("");

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [roleId, setRoleId] = useState(user?.role_id ?? "");
  const [status, setStatus] = useState(user?.status ?? "Active");

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

        if (err) {
          setRolesError("Couldn't load roles.");
        } else {
          setRoles(data ?? []);
        }
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

    if (!fullName.trim()) {
      return setError("Full name is required.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Enter a valid email address.");
    }

    if (!roleId) {
      return setError("Choose a role.");
    }

    if (!status) {
      return setError("Choose a status.");
    }

    setSubmitting(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "update-user",
        {
          body: {
            user_id: user.id,
            full_name: fullName.trim(),
            email: email.trim(),
            role_id: roleId,
            status,
          },
        },
      );

      if (fnError) {
        throw new Error(await readFunctionError(fnError));
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      await onUpdated?.();
      onClose();
    } catch (err) {
      setError(err.message || "Could not update the user.");
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
        aria-labelledby="edit-user-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="edit-user-title"
          className="text-[19px] font-bold leading-7 text-[#021820]"
        >
          Edit user
        </h2>

        <p className="mt-1 text-xs leading-[18px] text-[#637a8a]">
          Update this user's account information and access.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="eu-name" className={LABEL}>
              Full name
            </label>
            <input
              id="eu-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
              autoFocus
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="eu-email" className={LABEL}>
              Email
            </label>
            <input
              id="eu-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="off"
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="eu-role" className={LABEL}>
              Role
            </label>
            <div className="relative">
              <select
                id="eu-role"
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

          <div>
            <label htmlFor="eu-status" className={LABEL}>
              Status
            </label>
            <div className="relative">
              <select
                id="eu-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={submitting}
                className={`${FIELD} cursor-pointer appearance-none pr-10`}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
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
              disabled={submitting || roles.length === 0}
              className="h-10 rounded-lg bg-[#3dc0f0] px-6 text-[13px] font-bold text-white hover:bg-[#2fb0e0] disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
