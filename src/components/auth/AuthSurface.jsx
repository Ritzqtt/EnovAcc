import { useCallback, useEffect, useRef, useState } from 'react'
import BackgroundArrows from '../BackgroundArrows'
import CashPositionCard from '../CashPositionCard'
import GlassCard from '../GlassCard'
import Logo from '../Logo'
import MonthCloseCard from '../MonthCloseCard'
import LoginFormPanel from './LoginFormPanel'
import ForgotPasswordPage from '../ForgotPasswordPage'
import { AUTH_MOTION } from './authMotion'
import './auth-transition.css'

const enterStyle = (delaySeconds, durationSeconds, shift) => ({
  '--enter-delay': `${delaySeconds}s`,
  '--enter-duration': `${durationSeconds}s`,
  ...(shift ? { '--enter-shift': shift } : null),
})

const motionVars = {
  '--auth-duration': `${AUTH_MOTION.duration}ms`,
  '--auth-fade-duration': `${AUTH_MOTION.fadeDuration}ms`,
  '--auth-brand-fade-duration': `${AUTH_MOTION.brandFadeDuration}ms`,
  '--auth-brand-delay': `${AUTH_MOTION.brandDelay}ms`,
  '--auth-form-fade-duration': `${AUTH_MOTION.formFadeDuration}ms`,
  '--auth-slide-duration': `${AUTH_MOTION.slideDuration}ms`,
  '--auth-card-duration': `${AUTH_MOTION.cardDuration}ms`,
  '--auth-stagger': `${AUTH_MOTION.stagger}ms`,
  '--auth-form-stagger': `${AUTH_MOTION.formStagger}ms`,
  '--auth-form-delay': `${AUTH_MOTION.formDelay}ms`,
  '--auth-mobile-header': `${AUTH_MOTION.mobileHeader}px`,
  '--auth-ease': AUTH_MOTION.ease,
  '--auth-fade-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
  '--auth-entrance-progress': `${AUTH_MOTION.entrance.progress}ms`,
  '--auth-back-duration': `${AUTH_MOTION.backDuration}ms`,
  '--auth-back-content': `${AUTH_MOTION.backContentFade}ms`,
  '--auth-back-panel-delay': `${AUTH_MOTION.backPanelDelay}ms`,
  '--auth-back-panel-duration': `${AUTH_MOTION.backPanelDuration}ms`,
  '--auth-back-title-delay': `${AUTH_MOTION.backTitleDelay}ms`,
  '--auth-back-title-duration': `${AUTH_MOTION.backTitleDuration}ms`,
  '--auth-back-blue-delay': `${AUTH_MOTION.backBlueDelay}ms`,
  '--auth-back-blue-duration': `${AUTH_MOTION.backBlueDuration}ms`,
}

/**
 * One continuous surface for the landing page and the login page.
 *
 * The blue panel is always mounted and only clips/shrinks; the white panel
 * slides over the right side. Shared elements (wordmark, tagline, arrows) live
 * once and move between their landing/login positions.
 */
export default function AuthSurface({
  view,
  preloading = false,
  onNavigate,
  onSignIn,
  onSignInFailed,
  onForgotPassword,
  onSendResetLink,
}) {
  const isAuthPanel = view === 'login' || view === 'forgot-password'
  const isLogin = view === 'login'
  const blueRef = useRef(null)
  const emailRef = useRef(null)
  const landingHeadingRef = useRef(null)
  const viewRef = useRef(view)
  const rafRef = useRef(0)

  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  // idle -> run -> done. The entrance can replay on every arrival at landing.
  const [entranceState, setEntranceState] = useState('idle')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDir, setTransitionDir] = useState(null)
  const [returning, setReturning] = useState(false)
  const [previousView, setPreviousView] = useState(view)
  const reducedRef = useRef(reduced)

  // Adjust the transition state during render so the new direction and the
  // hidden incoming copy are part of the same commit as the view change.
  // (React supports this prop-derived state adjustment pattern.)
  if (previousView !== view) {
    setPreviousView(view)
    if (view === 'login') {
      setReturning(false)
      setTransitionDir('forward')
      setIsTransitioning(true)
    } else if (view === 'forgot-password') {
      setReturning(false)
      setTransitionDir(null)
      setIsTransitioning(false)
    } else {
      setEntranceState('idle')
      setTransitionDir('back')
      setReturning(true)
      setIsTransitioning(true)
    }
  }

  // Keep reduced-motion in sync if the OS setting changes mid-session.
  useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  useEffect(() => {
    viewRef.current = view
  }, [view])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => setReduced(event.matches)
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])

  // Restart the CSS entrance from a clean idle state on the next frame.
  const startEntrance = useCallback(() => {
    setEntranceState('idle')
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setEntranceState('run'))
    })
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // Fresh visit: the loader releases the page, then the entrance starts.
  // Sign out / returning from a password flow mounts this surface at landing,
  // so the same effect covers those arrivals. In-app returns are handled by
  // the reverse timer below (they must wait for the morph).
  useEffect(() => {
    if (preloading || viewRef.current !== 'landing') return undefined
    const timer = setTimeout(startEntrance, 20)
    return () => clearTimeout(timer)
  }, [preloading, startEntrance])

  // Release the entrance once the last item has settled so the next arrival
  // can replay it from the beginning.
  useEffect(() => {
    if (entranceState !== 'run') return undefined
    const total = reduced
      ? AUTH_MOTION.reducedDuration
      : AUTH_MOTION.entrance.total
    const timer = setTimeout(() => setEntranceState('done'), total + 80)
    return () => clearTimeout(timer)
  }, [entranceState, reduced])

  // Timers for the direction chosen during render. State is only written from
  // the callbacks, never synchronously in the effect body.
  useEffect(() => {
    if (!isTransitioning) return undefined
    // The mobile landing column scrolls; start the login header at the top.
    if (blueRef.current) blueRef.current.scrollTop = 0

    const reducedMotion = reducedRef.current

    if (view === 'login') {
      const duration = reducedMotion
        ? AUTH_MOTION.reducedDuration
        : AUTH_MOTION.duration
      const settleTimer = setTimeout(() => {
        setIsTransitioning(false)
        // Reset the progress fill only once the cards are clipped away, so it
        // never visibly empties during the forward exit.
        setEntranceState('idle')
      }, duration + 80)
      const focusTimer = setTimeout(() => {
        emailRef.current?.focus({ preventScroll: true })
      }, duration + 40)

      return () => {
        clearTimeout(settleTimer)
        clearTimeout(focusTimer)
      }
    }

    // Login -> landing: the login copy is already fading out, then the title
    // morphs, the panel slides out and blue expands. Only when that is done
    // does the landing entrance start.
    const duration = reducedMotion
      ? AUTH_MOTION.reducedDuration
      : AUTH_MOTION.backDuration
    const settleTimer = setTimeout(() => {
      setReturning(false)
      setIsTransitioning(false)
      startEntrance()
    }, duration)
    const focusTimer = setTimeout(() => {
      landingHeadingRef.current?.focus({ preventScroll: true })
    }, duration + 40)

    return () => {
      clearTimeout(settleTimer)
      clearTimeout(focusTimer)
    }
  }, [isTransitioning, view, startEntrance])

  const goToLanding = (event) => {
    event?.preventDefault()
    onNavigate('landing')
  }

  return (
    <main
      className={`auth-stage${isTransitioning ? ' is-transitioning' : ''}${
        preloading ? ' is-preloading' : ''
      }`}
      data-view={view}
      data-dir={transitionDir || undefined}
      data-entrance={entranceState}
      data-returning={returning ? 'true' : undefined}
      data-reduced={reduced ? 'true' : 'false'}
      style={motionVars}
    >
      <section
        id="top"
        ref={blueRef}
        aria-label="EnovAcc"
        className="auth-blue"
      >
        <div className="auth-login-wash" aria-hidden="true" />

        <div className="auth-arrows" aria-hidden="true">
          <BackgroundArrows />
        </div>

        <Logo
          href={isAuthPanel ? '/' : '#top'}
          onClick={isAuthPanel ? goToLanding : undefined}
          className="auth-wordmark"
        />

        <p
          className="auth-tagline auth-landing-enter"
          style={enterStyle(0, 0.25)}
        >
          THE FINANCIAL PICTURE, CONNECTED.
        </p>

        <div
          className="auth-landing"
          inert={isAuthPanel}
          aria-hidden={isAuthPanel ? 'true' : undefined}
        >
          <div className="hero-copy auth-landing-copy flex w-full flex-col items-start">
            <h1
              ref={landingHeadingRef}
              tabIndex={-1}
              id="hero-heading"
              aria-label="Clarify From Entry To Report."
              className="hero-title auth-landing-item mt-5 text-[clamp(46px,14.3vw,56px)] font-black italic leading-[0.9] tracking-[-0.005em] text-white sm:text-[clamp(56px,8.7vw,112px)]"
              style={{ '--stagger': 0 }}
            >
              <span
                className="auth-landing-enter block whitespace-nowrap"
                style={enterStyle(0.15, 0.32, '20px')}
              >
                Clarify From
              </span>
              <span
                className="auth-landing-enter block whitespace-nowrap"
                style={enterStyle(0.27, 0.32, '20px')}
              >
                Entry To
              </span>
              <span
                className="auth-landing-enter block whitespace-nowrap"
                style={enterStyle(0.39, 0.32, '20px')}
              >
                Report.
              </span>
            </h1>

            <p
              className="hero-subtitle auth-landing-item auth-landing-enter mt-6 max-w-[510px] text-[15px] italic leading-[1.25] text-white/95 sm:text-base"
              style={{ ...enterStyle(0.72, 0.25), '--stagger': 1 }}
            >
              EnovAcc brings your financial workflow into one secure place,
              <br />
              so every number has context and every decision starts connected.
            </p>

            <div
              className="hero-actions auth-landing-item auth-landing-enter mt-7 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:items-center"
              style={{ ...enterStyle(0.99, 0.22), '--stagger': 2 }}
            >
              <a
                href="#sign-in"
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate('login')
                }}
                className="hero-cta group inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-[4px] border border-brand-action-border bg-brand-action px-4 text-[11px] font-bold tracking-[0.01em] text-white shadow-[0_10px_24px_-12px_rgba(0,15,35,0.85)] transition-colors duration-200 hover:bg-brand-action-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ocean sm:w-auto"
              >
                Sign in to EnovAcc
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </div>
          </div>

          <div className="hero-cluster auth-cards relative flex w-full justify-center">
            <div
              role="group"
              aria-label="EnovAcc financial snapshot"
              className="hero-cluster-inner relative aspect-[542/451] w-full max-w-[465px]"
            >
              <div
                aria-hidden="true"
                className="hero-panel-wrap absolute left-[19.74%] top-[12.86%] z-10 h-[73.84%] w-[76.57%] animate-float will-change-transform"
                style={{ animationDelay: '-0.75s' }}
              >
                <div className="auth-card auth-card--panel h-full w-full">
                  <GlassCard tone="panel" className="hero-panel h-full w-full rounded-[28px]" />
                </div>
              </div>

              <div
                className="hero-month-wrap absolute right-0 top-0 z-20 h-[30.6%] min-h-[88px] w-[58.49%] animate-float will-change-transform"
                style={{ animationDelay: '-2.5s' }}
              >
                <div className="auth-card auth-card--month h-full w-full">
                  <MonthCloseCard percent={82} progress={82} />
                </div>
              </div>

              <div
                className="hero-cash-wrap absolute left-0 top-[69.4%] z-30 h-[30.6%] min-h-[88px] w-[53.51%] animate-float will-change-transform"
                style={{ animationDelay: '-4.25s' }}
              >
                <div className="auth-card auth-card--cash h-full w-full">
                  <CashPositionCard
                    amount="₱50.67M"
                    caption="Updated across operating accounts"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-login-brand" aria-hidden={isAuthPanel ? undefined : 'true'}>
          <p
            className="auth-login-subtitle auth-brand-item"
            style={{ '--stagger': 0 }}
          >
            Financial Management System
          </p>
          <p
            className="auth-login-description auth-brand-item"
            style={{ '--stagger': 1 }}
          >
            From the first entry to the final report.
            <br />
            One connected workspace for your finances.
          </p>
          <p className="auth-login-footer auth-brand-item" style={{ '--stagger': 2 }}>
            Enov8tive Technology Solutions Inc.
            <br />
            Philippine Entity · Internal Financial Management System
          </p>
        </div>
      </section>

      <section
        className="auth-white-panel"
        aria-labelledby="login-heading"
        inert={!isAuthPanel}
        aria-hidden={!isAuthPanel ? 'true' : undefined}
      >
        {isLogin ? (
          <LoginFormPanel
            emailRef={emailRef}
            onSignIn={onSignIn}
            onSignInFailed={onSignInFailed}
            onBackToLanding={() => onNavigate('landing')}
            onForgotPassword={onForgotPassword}
          />
        ) : (
          <ForgotPasswordPage
            onBackToLanding={() => onNavigate('landing')}
            onBackToSignIn={() => onNavigate('login')}
            onSendResetLink={onSendResetLink}
          />
        )}
      </section>
    </main>
  )
}
