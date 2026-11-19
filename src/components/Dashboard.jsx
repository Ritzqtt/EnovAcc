import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Sample data. Replace this with real data (Supabase) later.         */
/*  Every number on the page comes from here.                          */
/* ------------------------------------------------------------------ */
const SAMPLE_DATA = {
  month: "August 2026",
  dateLine: "Friday, 14 August · Your monthly financial picture.",
  user: { name: "Jamie Santos", role: "Accountant", initials: "JS" },
  cash: {
    amount: 88000,
    movement: 10000, // net cash movement this month
    trend: [30, 27, 33, 25, 38, 35, 31, 41, 39, 44],
  },
  revenue: 40000,
  expenses: 12000,
  expensePct: 30,
  summary: {
    netIncome: { value: 28000, note: "70% margin" },
    receivables: { value: 16000, note: "1 open invoice" },
    payables: { value: 4000, note: "1 supplier bill" },
    awaiting: { value: 1800, note: "1 item to review" },
  },
  chart: {
    labels: ["01 AUG", "07 AUG", "14 AUG", "21 AUG", "31 AUG"],
    revenue: [14, 16, 22, 20, 30, 27, 34, 31, 38],
    expenses: [5, 6, 9, 7, 11, 10, 12, 11, 15],
  },
  approval: {
    count: "01",
    title: "Development tools subscription",
    reference: "JE-0006 · Submitted by Jamie Santos",
    amount: 1800,
    date: "15 AUG",
  },
};

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

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

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

/** Simple 20px line icons (no extra package needed). */
function Icon({ name, className = "h-5 w-5" }) {
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

/** Turns a list of numbers into an SVG path "M x,y L x,y ..." */
function linePath(values, width, top, height, max) {
  const step = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = (i * step).toFixed(1);
      const y = (top + height - (v / max) * height).toFixed(1);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

/* ------------------------------------------------------------------ */
/*  Pieces of the page                                                 */
/* ------------------------------------------------------------------ */

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

function TopBar({ month, user, onSignOut }) {
  return (
    <header className="flex items-center justify-between gap-4 bg-white p-6">
      <p className="whitespace-pre text-xs leading-[18px] text-[#637a8a]">
        Enov8tive{"  /  "}Dashboard
      </p>

      <div className="flex h-9 items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-1 text-[13px] font-bold leading-5 text-[#021820]"
          aria-label="Change month"
        >
          {month}
          <Icon name="chevron" className="h-4 w-4" />
        </button>

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

function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[#dce5ea] bg-white ${className}`}>{children}</div>
  );
}

function MetricCard({ title, caption, value }) {
  return (
    <Card className="flex flex-1 flex-col gap-2 p-5">
      <div className="flex justify-between gap-4 text-xs leading-[18px] text-[#637a8a]">
        <p>{title}</p>
        <p>{caption}</p>
      </div>
      <div className="flex items-start justify-between gap-4">
        <p className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold leading-[44px] text-[#021820]">
          {peso.format(value)}
        </p>
        <div className="mt-2 h-[5px] w-[65px] shrink-0 bg-[#0693c7]" aria-hidden="true" />
      </div>
    </Card>
  );
}

function SummaryItem({ label, value, note }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold leading-4 text-[#637a8a]">{label}</p>
      <p className="flex items-start gap-3 text-[21px] font-bold leading-[30px] text-[#021820]">
        {peso.format(value)}
        <span className="text-sm font-normal leading-[22px] text-[#0693c7]" aria-hidden="true">
          ↗
        </span>
      </p>
      <p className="text-xs leading-[18px] text-[#637a8a]">{note}</p>
    </div>
  );
}

function CashCard({ cash }) {
  const max = Math.max(...cash.trend) * 1.1;
  const d = linePath(cash.trend, 760, 4, 50, max);
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-r from-[#02355d] to-[#046fc3] p-8 text-white">
      <p className="whitespace-pre text-[10px] font-bold leading-4 text-[#a7bfce]">
        AVAILABLE CASH{"  /  "}OPERATING ACCOUNT
      </p>
      <p className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.4]">
        {peso.format(cash.amount)}
      </p>
      <div className="flex flex-wrap items-start gap-x-6">
        <p className="text-[13px] font-bold leading-5">PHP</p>
        <p className="text-xs leading-[18px] text-[#a7bfce]">
          + {peso.format(cash.movement).replace(".00", "")} net cash movement this month
        </p>
      </div>
      <svg
        viewBox="0 0 760 58"
        preserveAspectRatio="none"
        className="mt-auto h-[58px] w-full"
        role="img"
        aria-label="Cash trend this month"
      >
        <path
          d={d}
          fill="none"
          stroke="#43c3ed"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function MonthChart({ month, chart }) {
  const W = 910;
  const H = 145;
  const max = Math.max(...chart.revenue, ...chart.expenses) * 1.1;
  const revenuePath = linePath(chart.revenue, W, 10, 125, max);
  const expensePath = linePath(chart.expenses, W, 10, 125, max);
  const areaPath = `${revenuePath} L${W},135 L0,135 Z`;

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-[19px] font-bold leading-7 text-[#021820]">Month in motion</h2>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Revenue and expenses · {month}
        </p>
      </div>

      <div className="flex gap-6 text-xs leading-[18px]">
        <p className="whitespace-pre text-[#0693c7]">●{"  "}Revenue</p>
        <p className="whitespace-pre text-[#637a8a]">●{"  "}Expenses</p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[145px] w-full"
        role="img"
        aria-label="Revenue and expenses over the month"
      >
        {[10, 45, 80, 115].map((y) => (
          <line
            key={y}
            x1="0"
            x2={W}
            y1={y}
            y2={y}
            stroke="#dce5ea"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={areaPath} fill="#0693c7" fillOpacity="0.08" />
        <path
          d={revenuePath}
          fill="none"
          stroke="#0693c7"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={expensePath}
          fill="none"
          stroke="#02355d"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="flex justify-between text-[10px] font-bold leading-4 text-[#637a8a]">
        {chart.labels.map((label) => (
          <p key={label}>{label}</p>
        ))}
      </div>
    </Card>
  );
}

function ApprovalCard({ approval, onReview }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[19px] font-bold leading-7 text-[#021820]">Needs your attention</h2>
        <span className="flex h-7 w-[112px] items-center justify-center rounded-md bg-[#fff2d7] text-xs text-[#996514]">
          {approval.count}
        </span>
      </div>

      <p className="text-[19px] font-bold leading-7 text-[#021820]">{approval.title}</p>
      <p className="text-xs leading-[18px] text-[#637a8a]">{approval.reference}</p>

      <div className="flex items-start justify-between gap-4 font-bold">
        <p className="text-[clamp(1.75rem,2.5vw,2.25rem)] leading-[44px] text-[#021820]">
          {peso.format(approval.amount)}
        </p>
        <p className="text-[10px] leading-4 text-[#637a8a]">{approval.date}</p>
      </div>

      <button
        type="button"
        onClick={onReview}
        className="mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#43c3ed] p-3 text-[13px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]"
      >
        Review transaction&nbsp; →
      </button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  The page                                                           */
/* ------------------------------------------------------------------ */

/**
 * Props (all optional):
 *  data               replace SAMPLE_DATA with real numbers
 *  onSignOut          called by the logout icon
 *  onNewTransaction   called by "+ New transaction"
 *  onReviewTransaction called by "Review transaction"
 */
export default function Dashboard({
  data = SAMPLE_DATA,
  onSignOut,
  onNewTransaction,
  onReviewTransaction,
}) {
  const [active, setActive] = useState("Dashboard");
  const { summary } = data;

  return (
    <div className="flex min-h-screen bg-[#f3f6f8] font-['Inter',system-ui,sans-serif] text-[#021820]">
      <Sidebar active={active} onNavigate={setActive} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar month={data.month} user={data.user} onSignOut={onSignOut} />

        <main className="flex flex-col gap-6 p-4 sm:p-8">
          {/* page heading */}
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
                FINANCE WORKSPACE / {data.month.toUpperCase()}
              </p>
              <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
                Your financial picture.
              </h1>
              <p className="text-xs leading-[18px] text-[#637a8a]">{data.dateLine}</p>
            </div>
            <button
              type="button"
              onClick={onNewTransaction}
              className="flex h-11 w-[190px] items-center justify-center rounded-lg bg-[#43c3ed] p-3 text-[13px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]"
            >
              + New transaction
            </button>
          </div>

          {/* cash + revenue/expenses */}
          <div className="grid gap-6 xl:grid-cols-[851fr_743fr]">
            <CashCard cash={data.cash} />
            <div className="flex flex-col gap-4">
              <MetricCard
                title="Revenue"
                caption="Posted revenue this month"
                value={data.revenue}
              />
              <MetricCard
                title="Expenses"
                caption={`${data.expensePct}% of monthly revenue`}
                value={data.expenses}
              />
            </div>
          </div>

          {/* summary strip */}
          <Card className="grid grid-cols-2 gap-6 p-5 lg:grid-cols-4">
            <SummaryItem label="NET INCOME" {...summary.netIncome} />
            <SummaryItem label="RECEIVABLES" {...summary.receivables} />
            <SummaryItem label="PAYABLES" {...summary.payables} />
            <SummaryItem label="AWAITING APPROVAL" {...summary.awaiting} />
          </Card>

          {/* chart + approval */}
          <div className="grid items-start gap-6 xl:grid-cols-[978fr_615fr]">
            <MonthChart month={data.month} chart={data.chart} />
            <ApprovalCard approval={data.approval} onReview={onReviewTransaction} />
          </div>
        </main>
      </div>
    </div>
  );
}
