import { useState } from 'react'

const textLink =
  'p-0 text-[16px] leading-[22px] text-[#0693c7] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]'

const inputClass =
  'box-border h-12 w-full rounded-lg border border-[#dce5ea] bg-white p-3 text-[16px] leading-[22px] text-[#021820] placeholder:text-[#637a8a] focus-visible:border-[#0693c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0693c7] aria-[invalid=true]:border-[#e5484d]'

/**
 * The white half of the auth surface. It is always mounted so the panel can
 * slide in/out; AuthSurface controls visibility, focus and inertness.
 *
 * Props:
 *  onSignIn(email, password)  async; throw/reject on failure
 *  onSignInFailed             called when sign in fails
 *  onBackToLanding, onForgotPassword  navigation callbacks
 *  emailRef                   forwarded to the email input for post-transition focus
 */
export default function LoginFormPanel({
  onSignIn,
  onSignInFailed,
  onBackToLanding,
  onForgotPassword,
  emailRef,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  async function handleSubmit(e) {
    e.preventDefault()
    if (signingIn) return

    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Email address is required.'
    if (!password) nextErrors.password = 'Password is required.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSigningIn(true)
    try {
      await onSignIn(email.trim(), password)
    } catch {
      onSignInFailed()
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="auth-form-centered">
      <div className="auth-form-column flex w-full flex-col">
        <div className="auth-form-item self-center" style={{ '--stagger': 0 }}>
          <button type="button" onClick={onBackToLanding} className={textLink}>
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
            style={{ '--stagger': 1 }}
          >
            WELCOME BACK
          </p>
          <h2
            id="login-heading"
            className="auth-form-item whitespace-nowrap text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]"
            style={{ '--stagger': 2 }}
          >
            Your workspace awaits.
          </h2>
          <p
            className="auth-form-item text-[16px] leading-[22px] text-[#637a8a]"
            style={{ '--stagger': 3 }}
          >
            Sign in to review, record, and move forward.
          </p>

          <div
            className="auth-form-item flex w-full flex-col gap-2"
            style={{ '--stagger': 4 }}
          >
            <label htmlFor="login-email" className="text-[16px] font-bold leading-5 text-[#021820]">
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
                setEmail(e.target.value)
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: '' }))
                }
              }}
              aria-invalid={fieldErrors.email ? true : undefined}
              required
              className={inputClass}
            />
            {fieldErrors.email && (
              <p className="text-sm leading-5 text-[#e5484d]">{fieldErrors.email}</p>
            )}
          </div>

          <div
            className="auth-form-item flex w-full flex-col gap-2"
            style={{ '--stagger': 5 }}
          >
            <label htmlFor="login-password" className="text-[16px] font-bold leading-5 text-[#021820]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }))
                }
              }}
              aria-invalid={fieldErrors.password ? true : undefined}
              required
              className={inputClass}
            />
            {fieldErrors.password && (
              <p className="text-sm leading-5 text-[#e5484d]">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={signingIn}
            className="auth-form-item box-border inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#38bdf8] p-3 text-[15px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ '--stagger': 6 }}
          >
            {signingIn ? 'Signing in…' : 'Sign In to EnovAcc  →'}
          </button>

          <hr
            className="auth-form-item m-0 h-px w-full border-0 bg-[#dce5ea]"
            style={{ '--stagger': 7 }}
          />

          <button
            type="button"
            onClick={onForgotPassword}
            className={`${textLink} auth-form-item`}
            style={{ '--stagger': 7 }}
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  )
}
