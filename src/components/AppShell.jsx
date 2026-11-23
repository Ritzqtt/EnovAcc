/* Shared layout for every screen: sidebar + top bar. */

import { useState } from "react";

const DEFAULT_USER = { name: "Alex Rivera", role: "Administrator", initials: "AR" };

const MONTHS_2026 = [
  "January 2026",
  "February 2026",
  "March 2026",
  "April 2026",
  "May 2026",
  "June 2026",
  "July 2026",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
];

const NAV_MAIN = [
  ["Dashboard", "grid"],
  ["Chart of accounts", "list"],
  ["Journal entries", "journal"],
  ["General ledger", "book"],
  ["Invoices & receivables", "receipt"],
  ["Bills & payables", "card"],
  ["Expenses", "cash"],
  ["Bank reconciliation", "bank"],
];

const NAV_INSIGHTS = [
  ["Financial reports", "chart"],
  ["Tax summaries", "percent"],
  ["Integrations", "plug"],
];

/** Simple 20px line icons (no extra package needed). */
export function Icon({ name, className = "h-5 w-5" }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "grid":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "list":
    case "journal":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h8" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...props}>
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11" />
        </svg>
      );
    case "card":
      return (
        <svg {...props}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    case "cash":
      return (
        <svg {...props}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case "bank":
      return (
        <svg {...props}>
          <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2 20 7H4z" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
        </svg>
      );
    case "percent":
      return (
        <svg {...props}>
          <path d="M19 5 5 19" />
          <circle cx="6.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      );
    case "plug":
      return (
        <svg {...props}>
          <path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "logout":
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...props}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    default:
      return null;
  }
}

function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex h-[42px] w-full items-center gap-3 rounded-lg p-3 text-left text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        active
          ? "bg-white font-bold text-[#02355d]"
          : "font-normal text-white hover:bg-white/10"
      }`}
    >
      <Icon name={icon} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="relative hidden h-screen w-[228px] shrink-0 overflow-hidden bg-[linear-gradient(180deg,rgb(67,195,237)_0%,rgb(50,173,229)_5.2885%,rgb(4,97,169)_27.404%,rgb(3,82,144)_46.635%,rgb(2,53,93)_89.423%)] lg:sticky lg:top-0 lg:block">
      {/* faded logo watermark */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[calc(100%-140px)] w-full object-cover object-bottom opacity-10"
      />

      {/* brand */}
      <div className="relative flex flex-col items-center pt-8">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="h-[55px] w-[55px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        />
        <p className="mt-3 text-[32px] font-extrabold italic leading-none text-white [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">
          EnovAcc
        </p>
      </div>

      {/* navigation */}
      <nav className="relative mt-[26px] px-4" aria-label="Main">
        <p className="mb-1 text-[10px] font-bold leading-4 text-white">WORKSPACE</p>
        <div className="flex flex-col gap-1">
          {NAV_MAIN.map(([label, icon]) => (
            <NavItem
              key={label}
              label={label}
              icon={icon}
              active={label === active}
              onClick={() => onNavigate?.(label)}
            />
          ))}
        </div>

        <p className="mb-1 mt-4 text-[10px] font-bold leading-4 text-white">
          INSIGHTS &amp; CONTROL
        </p>
        <div className="flex flex-col gap-1">
          {NAV_INSIGHTS.map(([label, icon]) => (
            <NavItem
              key={label}
              label={label}
              icon={icon}
              active={label === active}
              onClick={() => onNavigate?.(label)}
            />
          ))}
        </div>
      </nav>

      {/* organization */}
      <div className="absolute bottom-8 left-[17px] flex w-[196px] flex-col gap-2 p-4">
        <p className="text-[10px] font-bold leading-4 text-white">ENOV8TIVE</p>
        <p className="text-[13px] font-bold leading-5 text-white">Philippine Entity</p>
        <p className="text-xs leading-[18px] text-[#a7bfce]">Financial Management System</p>
      </div>
    </aside>
  );
}

function TopBar({ active, month = "August 2026", onMonthChange, user, onSignOut }) {
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectMonth = (m) => {
    setSelectedMonth(m);
    setPickerOpen(false);
    onMonthChange?.(m);
  };

  return (
    <header className="flex items-center justify-between gap-4 bg-white p-6">
      <p className="whitespace-pre text-xs leading-[18px] text-[#637a8a]">
        Enov8tive{"  /  "}{active}
      </p>

      <div className="flex h-9 items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            aria-label="Change month"
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            className="flex items-center gap-1 text-[13px] font-bold leading-5 text-[#021820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]"
          >
            {selectedMonth}
            <Icon
              name="chevron"
              className={`h-4 w-4 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
            />
          </button>

          {pickerOpen && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setPickerOpen(false)}
              aria-hidden="true"
            />
          )}

          {pickerOpen && (
            <div
              role="listbox"
              aria-label="Select month"
              className="absolute right-0 top-full z-30 mt-2 w-[280px] rounded-xl border border-[#dce5ea] bg-white p-3 shadow-xl"
            >
              <p className="mb-2 px-1 text-[10px] font-bold leading-4 text-[#637a8a]">
                SELECT PERIOD
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS_2026.map((m) => {
                  const short = m.split(" ")[0].slice(0, 3);
                  const isSelected = m === selectedMonth;
                  return (
                    <button
                      key={m}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectMonth(m)}
                      className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
                        isSelected
                          ? "bg-[#0693c7] text-white"
                          : "text-[#021820] hover:bg-[#e6f6fd]"
                      }`}
                    >
                      {short}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button type="button" aria-label="Notifications" className="text-[#021820]">
          <Icon name="bell" />
        </button>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9f4f8] text-[13px] font-bold text-[#0693c7]"
          aria-hidden="true"
        >
          {user.initials}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-[13px] font-bold leading-5 text-[#021820]">{user.name}</p>
          <p className="text-xs leading-[18px] text-[#637a8a]">{user.role}</p>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          className="text-[#021820] hover:text-[#0693c7]"
        >
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
}

/**
 * Props:
 *  active      label of the sidebar item to highlight, e.g. "Dashboard"
 *  onNavigate  called with the label when a sidebar item is clicked
 *  month, user, onSignOut  shown in the top bar
 */
export default function AppShell({
  active,
  onNavigate,
  month = "August 2026",
  onMonthChange,
  user = DEFAULT_USER,
  onSignOut,
  children,
}) {
  return (
    <div className="flex min-h-screen bg-[#f3f6f8] font-['Inter',system-ui,sans-serif] text-[#021820]">
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          active={active}
          month={month}
          onMonthChange={onMonthChange}
          user={user}
          onSignOut={onSignOut}
        />
        {children}
      </div>
    </div>
  );
}
