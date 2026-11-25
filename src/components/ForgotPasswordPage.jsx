import { useState } from 'react'
import OtpPanel from './auth/OtpPanel'

const MIN_PASSWORD = 8

const textLink =
  'p-0 text-[16px] leading-[22px] text-[#0693c7] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7] disabled:cursor-not-allowed disabled:opacity-60'

const inputClass =
  'box-border h-12 w-full rounded-lg border border-[#dce5ea] bg-white p-3 text-[16px] leading-[22px] text-[#021820] placeholder:text-[#637a8a] focus-visible:border-[#0693c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7] aria-[invalid=true]:border-[#e5484d]'

const primaryButton =
  'box-border inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#38bdf8] p-3 text-[15px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:opacity-60'

const errorBanner =
  'w-full rounded-lg border border-[#e5484d] bg-[#fff5f5] p-3 text-sm leading-5 text-[#a1232a]'

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
  )
}

function PasswordField({ id, label, value, onChange, error, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-[16px] font-bold leading-5 text-[#021820]">
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          required
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-[#637a8a] hover:text-[#021820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7]"
        >
          <EyeIcon off={show} />
        </button>
      </div>
      {error && <p className="text-sm leading-5 text-[#e5484d]">{error}</p>}
    </div>
  )
}

function maskEmail(email) {
  const [name = '', domain = ''] = email.split('@')
  if (!name || !domain) return email
  return `${name[0]}${'*'.repeat(Math.max(name.length - 1, 2))}@${domain}`
}

/**
 * Forgot password flow: email  ->  code  ->  new password  ->  onComplete().
 *
 * Props:
 *  onSendResetCode(email)          async; emails a 6-digit code. Reject with an Error to show its message.
 *  onVerifyResetCode(email, code)  async; reject with an Error on a wrong code
 *  onResendResetCode(email)        async; reject with an Error on failure
 *  onUpdatePassword(newPassword)   async; reject with an Error to show its message
 *  onComplete                      called after the password is updated; go back to sign in here
 *  onBackToSignIn, onBackToLanding navigation callbacks
 */
export default function ForgotPasswordPage({
  onSendResetCode,
  onVerifyResetCode,
  onResendResetCode,
  onUpdatePassword,
  onComplete,
  onBackToSignIn,
  onBackToLanding,
}) {
  const [step, setStep] = useState('email') // 'email' | 'otp' | 'password'

  // Step 1
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [fieldError, setFieldError] = useState('')

  // Step 3
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [pwErrors, setPwErrors] = useState({})

  async function handleSendCode(e) {
    e.preventDefault()
    if (sending) return
    setEmailError('')

    if (!email.trim()) {
      setFieldError('Work email is required.')
      return
    }
    setFieldError('')

    setSending(true)
    try {
      await onSendResetCode(email.trim())
      setStep('otp')
    } catch (err) {
      setEmailError(err?.message || "We couldn't send the code. Check your email and try again.")
    } finally {
      setSending(false)
    }
  }

  async function handleSavePassword(e) {
    e.preventDefault()
    if (saving) return

    const errs = {}
    if (newPassword.length < MIN_PASSWORD) {
      errs.password = `Use at least ${MIN_PASSWORD} characters.`
    }
    if (!confirm) errs.confirm = 'Confirm your new password.'
    else if (confirm !== newPassword) errs.confirm = 'Passwords do not match.'
    setPwErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    setSaveError('')
    try {
      await onUpdatePassword(newPassword)
      onComplete?.()
    } catch (err) {
      setSaveError(err?.message || "We couldn't update your password. Try again.")
      setSaving(false)
    }
  }

  return (
    <div className="auth-form-centered">
      <div className="auth-form-column flex w-full flex-col">
        {step === 'otp' ? (
          <OtpPanel
            eyebrow="RESET ACCESS"
            title="Check your email."
            backLabel="← Use a different email"
            description={
              <>
                If an account exists for{' '}
                <span className="font-bold text-[#021820]">{maskEmail(email.trim())}</span>, we
                sent a 6-digit code. It expires in 5 minutes.
              </>
            }
            onVerify={async (code) => {
              await onVerifyResetCode(email.trim(), code)
              setStep('password')
            }}
            onResend={() => onResendResetCode(email.trim())}
            onBack={() => setStep('email')}
          />
        ) : step === 'password' ? (
          <>
            <form
              onSubmit={handleSavePassword}
              noValidate
              className="flex w-full flex-col items-start gap-4"
            >
              <p className="text-[16px] font-bold leading-4 text-[#0693c7]">RESET ACCESS</p>
              <h2 className="whitespace-nowrap text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]">
                Create a new password.
              </h2>
              <p className="text-[16px] leading-[22px] text-[#637a8a]">
                Choose a password you haven’t used before. Use at least {MIN_PASSWORD} characters.
              </p>

              {saveError && (
                <p role="alert" className={errorBanner}>
                  {saveError}
                </p>
              )}

              <PasswordField
                id="new-password"
                label="New Password"
                placeholder="Enter New Password"
                autoComplete="new-password"
                value={newPassword}
                error={pwErrors.password}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setSaveError('')
                  if (pwErrors.password) setPwErrors((p) => ({ ...p, password: '' }))
                }}
              />

              <PasswordField
                id="confirm-password"
                label="Confirm Password"
                placeholder="Re-enter New Password"
                autoComplete="new-password"
                value={confirm}
                error={pwErrors.confirm}
                onChange={(e) => {
                  setConfirm(e.target.value)
                  setSaveError('')
                  if (pwErrors.confirm) setPwErrors((p) => ({ ...p, confirm: '' }))
                }}
              />

              <button type="submit" disabled={saving} className={primaryButton}>
                {saving ? 'Updating…' : 'Update password  →'}
              </button>

              <button
                type="button"
                onClick={onBackToSignIn}
                disabled={saving}
                className={textLink}
              >
                Cancel and back to sign in
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBackToLanding}
              className={`${textLink} self-center`}
            >
              ← Back to landing page
            </button>

            <form
              onSubmit={handleSendCode}
              noValidate
              className="mt-6 flex w-full flex-col items-start gap-4"
            >
              <p className="text-[16px] font-bold leading-4 text-[#0693c7]">RESET ACCESS</p>
              <h2 className="whitespace-nowrap text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]">
                Forgot your password?
              </h2>
              <p className="text-[16px] leading-[22px] text-[#637a8a]">
                Enter your work email to receive a 6-digit reset code.
              </p>

              {emailError && (
                <p role="alert" className={errorBanner}>
                  {emailError}
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
                    setEmail(e.target.value)
                    if (fieldError) setFieldError('')
                  }}
                  aria-invalid={fieldError ? true : undefined}
                  required
                  className={inputClass}
                />
                {fieldError && <p className="text-sm leading-5 text-[#e5484d]">{fieldError}</p>}
              </div>

              <button type="submit" disabled={sending} className={primaryButton}>
                {sending ? 'Sending…' : 'Send reset code  →'}
              </button>

              <button type="button" onClick={onBackToSignIn} className={textLink}>
                Back to sign in
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}