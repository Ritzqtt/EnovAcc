import AppShell from "./AppShell";

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

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

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
 *  data                replace SAMPLE_DATA with real numbers
 *  onNavigate          called with a sidebar label when a menu item is clicked
 *  onSignOut           called by the logout icon
 *  onNewTransaction    called by "+ New transaction"
 *  onReviewTransaction called by "Review transaction"
 */
export default function Dashboard({
  data = SAMPLE_DATA,
  onNavigate,
  onSignOut,
  onNewTransaction,
  onReviewTransaction,
}) {
  const { summary } = data;

  return (
    <AppShell
      active="Dashboard"
      onNavigate={onNavigate}
      month={data.month}
      user={data.user}
      onSignOut={onSignOut}
    >
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
    </AppShell>
  );
}
