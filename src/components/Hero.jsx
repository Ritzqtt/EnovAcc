import BackgroundArrows from './BackgroundArrows'
import CashPositionCard from './CashPositionCard'
import GlassCard from './GlassCard'
import Logo from './Logo'
import MonthCloseCard from './MonthCloseCard'

const enterStyle = (delaySeconds, durationSeconds, shift) => ({
  '--enter-delay': `${delaySeconds}s`,
  '--enter-duration': `${durationSeconds}s`,
  ...(shift ? { '--enter-shift': shift } : null),
})

export default function Hero({ entering = false }) {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className={`hero-root relative isolate min-h-screen w-full overflow-hidden bg-hero-gradient font-sans text-white${
        entering ? ' is-entering' : ''
      }`}
    >
      <BackgroundArrows />

      <div className="relative z-10 min-h-screen w-full">
        <div className="flex w-full flex-col gap-16 px-6 py-10 sm:px-10 sm:py-12 lg:block lg:p-0">
          {/* ── Left column: message and actions ─────────────────────── */}
          <div className="hero-copy flex w-full flex-col items-start">
            <div
              className="hero-logo hero-enter hero-enter-logo"
              style={enterStyle(0, 0.15)}
            >
              <Logo />
            </div>

            <p
              className="hero-tagline mt-[50px] hero-enter text-[10px] font-semibold uppercase leading-none tracking-[0.04em] text-white"
              style={enterStyle(0.1, 0.25, '8px')}
            >
              The financial picture, connected.
            </p>

            <h1
              id="hero-heading"
              aria-label="Clarify From Entry To Report."
              className="hero-title mt-5 text-[clamp(46px,14.3vw,56px)] font-black italic leading-[0.9] tracking-[-0.005em] text-white sm:text-[clamp(56px,8.7vw,112px)]"
            >
              <span
                className="block hero-enter whitespace-nowrap"
                style={enterStyle(0.2, 0.35, '12px')}
              >
                Clarify From
              </span>
              <span
                className="block hero-enter whitespace-nowrap"
                style={enterStyle(0.29, 0.35, '12px')}
              >
                Entry To
              </span>
              <span
                className="block hero-enter whitespace-nowrap"
                style={enterStyle(0.38, 0.35, '12px')}
              >
                Report.
              </span>
            </h1>

            <p
              className="hero-subtitle mt-6 max-w-[510px] hero-enter text-[15px] italic leading-[1.25] text-white/95 sm:text-base"
              style={enterStyle(0.5, 0.3, '8px')}
            >
              EnovAcc brings your financial workflow into one secure place,
              <br />
              so every number has context and every decision starts connected.
            </p>

            <div
              className="hero-actions mt-7 flex w-full hero-enter flex-col gap-3.5 sm:w-auto sm:flex-row sm:items-center"
              style={enterStyle(0.58, 0.27, '8px')}
            >
              <a
                href="#sign-in"
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

          {/* ── Right column: floating product cards ─────────────────── */}
          <div className="hero-cluster relative flex w-full justify-center">
            <div
              role="group"
              aria-label="EnovAcc financial snapshot"
              className="hero-cluster-inner relative aspect-[542/451] w-full max-w-[465px]"
            >
              {/* Large, lightly frosted backdrop panel */}
              <div
                aria-hidden="true"
                className="hero-panel-wrap absolute left-[19.74%] top-[12.86%] z-10 h-[73.84%] w-[76.57%] animate-float will-change-transform"
                style={{ animationDelay: '-0.75s' }}
              >
                <GlassCard
                  tone="panel"
                  className="hero-panel h-full w-full rounded-[28px]"
                />
              </div>

              {/* Month close, overlapping the panel's top edge */}
              <div
                className="hero-month-wrap absolute right-0 top-0 z-20 h-[30.6%] min-h-[88px] w-[58.49%] animate-float will-change-transform"
                style={{ animationDelay: '-2.5s' }}
              >
                <MonthCloseCard percent={82} progress={76} />
              </div>

              {/* Cash position, overhanging the panel's bottom-left corner */}
              <div
                className="hero-cash-wrap absolute left-0 top-[69.4%] z-30 h-[30.6%] min-h-[88px] w-[53.51%] animate-float will-change-transform"
                style={{ animationDelay: '-4.25s' }}
              >
                <CashPositionCard
                  amount="₱50.67M"
                  caption="Updated across operating accounts"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
