import GlassCard from './GlassCard'

export default function MonthCloseCard({
  percent = 82,
  progress = 76,
  className = '',
}) {
  const safePercent = Math.min(100, Math.max(0, Number(percent) || 0))
  const fillPercent = Math.min(100, Math.max(0, Number(progress) || 0))

  return (
    <GlassCard
      className={`month-close-card flex h-full w-full flex-col justify-between rounded-lg bg-white/[0.12] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[6px] sm:p-[22px] ${className}`}
    >
      <p className="month-close-label text-[9px] font-bold uppercase leading-none tracking-[0.05em] text-white">
        Month close
      </p>

      <div>
        <p className="month-close-value text-[26px] font-medium leading-none tracking-normal text-white sm:text-[30px]">
          {safePercent}%
        </p>

        <div
          role="progressbar"
          aria-label="Month close progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={safePercent}
          className="month-close-track mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/55 sm:mt-3"
        >
          <div
            className="month-close-fill h-full animate-progress rounded-full bg-[#0a8fcc]"
            style={{ '--progress-width': `${fillPercent}%` }}
          />
        </div>
      </div>
    </GlassCard>
  )
}
