import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import defaultProfile from "../assets/default-profile.jpg";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function splitName(fullName = "") {
  const [first = "", ...rest] = fullName.trim().split(/\s+/);
  return { first, last: rest.join(" ") };
}

function TextField({ id, label, error, hint, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-[#021820]">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`h-11 rounded-lg border bg-white px-3 text-sm text-[#021820] outline-none transition-colors placeholder:text-[#9aaab5] focus:border-[#0693c7] focus:ring-2 focus:ring-[#0693c7]/20 ${
          error ? "border-[#e5484d]" : "border-[#dce5ea]"
        }`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-[#c93a3f]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-[#637a8a]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ProfileForm({ currentUser, onProfileUpdated }) {
  const saved = splitName(currentUser.full_name);
  const savedEmail = currentUser.email || "";
  const savedAvatar = currentUser.avatar_url || null;

  const [firstName, setFirstName] = useState(saved.first);
  const [lastName, setLastName] = useState(saved.last);
  const [email, setEmail] = useState(savedEmail);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    []
  );

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  const trimmedEmail = email.trim();

  const nameChanged = trimmedFirst !== saved.first || trimmedLast !== saved.last;
  const emailChanged =
    trimmedEmail.toLowerCase() !== savedEmail.toLowerCase() &&
    trimmedEmail.toLowerCase() !== pendingEmail.toLowerCase();
  const photoChanged = Boolean(photoFile) || photoRemoved;
  const dirty = nameChanged || emailChanged || photoChanged;

  const hasPhoto = Boolean(photoPreview || (!photoRemoved && savedAvatar));
  const shownAvatar = photoPreview || (!photoRemoved && savedAvatar) || defaultProfile;

  const clearPhotoDraft = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoRemoved(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!PHOTO_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: "Use a JPG, PNG or WebP image." }));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((prev) => ({ ...prev, photo: "The image must be 2 MB or smaller." }));
      return;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;

    setPhotoFile(file);
    setPhotoPreview(url);
    setPhotoRemoved(false);
    setErrors((prev) => ({ ...prev, photo: undefined }));
    setStatus(null);
  };

  const handleRemovePhoto = () => {
    clearPhotoDraft();
    setPhotoRemoved(true);
    setErrors((prev) => ({ ...prev, photo: undefined }));
    setStatus(null);
  };

  const handleReset = () => {
    setFirstName(saved.first);
    setLastName(saved.last);
    setEmail(savedEmail);
    clearPhotoDraft();
    setErrors({});
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !dirty) return;

    const nextErrors = {};
    if (!trimmedFirst) nextErrors.firstName = "Enter your first name.";
    if (!EMAIL_PATTERN.test(trimmedEmail)) nextErrors.email = "Enter a valid email address.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setStatus(null);
    const done = [];

    try {
      if (nameChanged || photoChanged) {
        let avatarUrl = savedAvatar;

        if (photoFile) {
          const path = `${currentUser.id}/avatar`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, photoFile, {
              upsert: true,
              contentType: photoFile.type,
              cacheControl: "3600",
            });
          if (uploadError) throw new Error("We couldn't upload your photo. Try again.");

          const { data } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
        } else if (photoRemoved) {
          avatarUrl = null;
        }

        const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(" ");
        const { data: updated, error: updateError } = await supabase
          .from("users")
          .update({ full_name: fullName, avatar_url: avatarUrl })
          .eq("id", currentUser.id)
          .select("full_name, avatar_url")
          .single();

        if (updateError || !updated) {
          throw new Error("We couldn't save your profile. Try again.");
        }

        onProfileUpdated?.({ full_name: updated.full_name, avatar_url: updated.avatar_url });
        clearPhotoDraft();
        done.push("Your profile was updated.");
      }

      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (emailError) throw new Error(emailError.message);

        setPendingEmail(trimmedEmail);
        done.push(
          `We sent a confirmation link to ${trimmedEmail}. Your email changes after you confirm it.`
        );
      }

      setStatus({ type: "success", text: done.join(" ") });
    } catch (err) {
      const text = [...done, err.message].join(" ");
      setStatus({ type: "error", text });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto w-full max-w-[720px] rounded-xl border border-[#dce5ea] bg-white"
    >
      <div className="flex flex-wrap items-center gap-5 border-b border-[#e6edf1] p-6">
        <img
          src={shownAvatar}
          alt="Your profile picture"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultProfile;
          }}
          className="h-20 w-20 shrink-0 rounded-full bg-[#e9f4f8] object-cover"
        />

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-9 rounded-lg border border-[#dce5ea] bg-white px-4 text-[13px] font-semibold text-[#021820] transition-colors hover:bg-[#f1f8fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]"
            >
              Change photo
            </button>
            {hasPhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="h-9 rounded-lg px-3 text-[13px] font-semibold text-[#c93a3f] transition-colors hover:bg-[#fdf0f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c93a3f]"
              >
                Remove photo
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload a profile picture"
          />
          {errors.photo ? (
            <p className="text-xs text-[#c93a3f]">{errors.photo}</p>
          ) : (
            <p className="text-xs text-[#637a8a]">JPG, PNG or WebP, up to 2 MB.</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-2">
        <TextField
          id="first-name"
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName}
          autoComplete="given-name"
          maxLength={60}
        />
        <TextField
          id="last-name"
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          maxLength={60}
        />
        <div className="sm:col-span-2">
          <TextField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            hint={
              pendingEmail
                ? `Waiting for you to confirm ${pendingEmail}. Check that inbox for the link.`
                : "We email a confirmation link before the change takes effect."
            }
            autoComplete="email"
          />
        </div>
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

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!dirty || saving}
            className="h-10 rounded-lg bg-[#02355d] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#03487f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:bg-[#a7bfce]"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!dirty || saving}
            className="h-10 rounded-lg border border-[#dce5ea] bg-white px-5 text-[13px] font-semibold text-[#021820] transition-colors hover:bg-[#f1f8fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7] disabled:cursor-not-allowed disabled:text-[#9aaab5] disabled:hover:bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default function AccountSettings({ currentUser, onProfileUpdated }) {
  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">Account Settings</h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Update your photo and personal details.
        </p>
      </div>

      {currentUser ? (
        <ProfileForm
          key={currentUser.id}
          currentUser={currentUser}
          onProfileUpdated={onProfileUpdated}
        />
      ) : (
        <p className="text-sm text-[#637a8a]">Loading your account…</p>
      )}
    </main>
  );
}