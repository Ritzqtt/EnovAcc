import AppShell from "../layout/AppShell";

export default function ModulePage({
  active,
  title,
  description,
  actionLabel,
  onAction,
  month,
  onMonthChange,
  user,
  onNavigate,
  onSignOut,
  children,
}) {
  return (
    <AppShell
      active={active}
      onNavigate={onNavigate}
      month={month}
      onMonthChange={onMonthChange}
      user={user}
      onSignOut={onSignOut}
    >
      <main className="flex flex-col gap-6 p-4 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
              FINANCE WORKSPACE
            </p>
            <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
              {title}
            </h1>
            <p className="text-xs leading-[18px] text-[#637a8a]">
              {description}
            </p>
          </div>
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="flex h-11 min-w-[190px] items-center justify-center rounded-lg bg-[#43c3ed] px-4 text-[13px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]"
            >
              {actionLabel}
            </button>
          )}
        </div>

        {children ?? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#dce5ea] bg-white p-8 text-center">
            <p className="text-[19px] font-bold leading-7 text-[#021820]">
              {title}
            </p>
            <p className="max-w-[420px] text-xs leading-[18px] text-[#637a8a]">
              This screen is not built yet. Add its table, filters and forms
              here.
            </p>
          </div>
        )}
      </main>
    </AppShell>
  );
}
