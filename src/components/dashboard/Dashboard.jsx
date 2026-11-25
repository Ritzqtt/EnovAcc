const now = new Date();
const CURRENT_MONTH = now.toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});
const DATE_LINE = `${now.toLocaleDateString("en-US", { weekday: "long" })}, ${now.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} · Your monthly financial picture.`;
const MONTH_SHORT = now
  .toLocaleDateString("en-US", { month: "short" })
  .toUpperCase();
const LAST_DAY = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const CHART_LABELS = [1, 7, 14, 21, LAST_DAY].map(
  (day) => `${String(day).padStart(2, "0")} ${MONTH_SHORT}`,
);

const EMPTY_DATA = {
  month: CURRENT_MONTH,
  dateLine: DATE_LINE,
  cash: { amount: 0, movement: 0, trend: Array(10).fill(0) },
  revenue: 0,
  expenses: 0,
  receivables: { amount: 0, count: 0 },
  payables: { amount: 0, count: 0 },
  awaiting: { amount: 0, count: 0 },
  chart: {
    labels: CHART_LABELS,
    revenue: Array(9).fill(0),
    expenses: Array(9).fill(0),
  },
  approval: null,
};

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

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

function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[#dce5ea] bg-white ${className}`}>
      {children}
    </div>
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
        <div
          className="mt-2 h-[5px] w-[65px] shrink-0 bg-[#0693c7]"
          aria-hidden="true"
        />
      </div>
    </Card>
  );
}

function SummaryItem({ label, value, note, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick
        ? {
            type: "button",
            onClick,
            className:
              "flex flex-col gap-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]",
          }
        : { className: "flex flex-col gap-1" })}
    >
      <p className="text-[10px] font-bold leading-4 text-[#637a8a]">{label}</p>
      <p className="flex items-start gap-3 text-[21px] font-bold leading-[30px] text-[#021820]">
        {peso.format(value)}
        <span
          className="text-sm font-normal leading-[22px] text-[#0693c7]"
          aria-hidden="true"
        >
          ↗
        </span>
      </p>
      <p className="text-xs leading-[18px] text-[#637a8a]">{note}</p>
    </Tag>
  );
}

function CashCard({ cash }) {
  const max = Math.max(...cash.trend, 1) * 1.1;
  const d = linePath(cash.trend, 760, 4, 50, max);
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-r from-[#02355d] to-[#046fc3] p-5 text-white sm:p-8">
      <p className="whitespace-pre text-[10px] font-bold leading-4 text-[#a7bfce]">
        AVAILABLE CASH{"  /  "}OPERATING ACCOUNT
      </p>
      <p className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.4]">
        {peso.format(cash.amount)}
      </p>
      <div className="flex flex-wrap items-start gap-x-6">
        <p className="text-[13px] font-bold leading-5">PHP</p>
        <p className="text-xs leading-[18px] text-[#a7bfce]">
          {cash.movement < 0 ? "−" : "+"}{" "}
          {peso.format(Math.abs(cash.movement)).replace(".00", "")} net cash
          movement this month
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
  const max = Math.max(...chart.revenue, ...chart.expenses, 1) * 1.1;
  const revenuePath = linePath(chart.revenue, W, 10, 125, max);
  const expensePath = linePath(chart.expenses, W, 10, 125, max);
  const areaPath = `${revenuePath} L${W},135 L0,135 Z`;
  const isEmpty = [...chart.revenue, ...chart.expenses].every((v) => v === 0);

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-[19px] font-bold leading-7 text-[#021820]">
          Month in motion
        </h2>
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

      {isEmpty && (
        <p className="text-xs leading-[18px] text-[#637a8a]">
          No revenue or expenses have been posted this month yet.
        </p>
      )}
    </Card>
  );
}

function ApprovalCard({ count, approval }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[19px] font-bold leading-7 text-[#021820]">
          Needs your attention
        </h2>
        <span className="flex h-7 w-[112px] items-center justify-center rounded-md bg-[#fff2d7] text-xs text-[#996514]">
          {String(count).padStart(2, "0")}
        </span>
      </div>

      {approval ? (
        <>
          <p className="text-[19px] font-bold leading-7 text-[#021820]">
            {approval.title}
          </p>
          <p className="text-xs leading-[18px] text-[#637a8a]">
            {approval.reference}
          </p>

          <div className="flex items-start justify-between gap-4 font-bold">
            <p className="text-[clamp(1.75rem,2.5vw,2.25rem)] leading-[44px] text-[#021820]">
              {peso.format(approval.amount)}
            </p>
            <p className="text-[10px] leading-4 text-[#637a8a]">
              {approval.date}
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="text-[19px] font-bold leading-7 text-[#021820]">
            You're all caught up.
          </p>
          <p className="text-xs leading-[18px] text-[#637a8a]">
            Items waiting for your approval will show up here.
          </p>
        </>
      )}
    </Card>
  );
}

export default function Dashboard({ data = EMPTY_DATA }) {
  const {
    cash,
    revenue,
    expenses,
    receivables,
    payables,
    awaiting,
    chart,
    approval,
  } = data;

  const netIncome = revenue - expenses;
  const margin = revenue > 0 ? Math.round((netIncome / revenue) * 100) : 0;
  const expensePct = revenue > 0 ? Math.round((expenses / revenue) * 100) : 0;

  return (
    <main className="flex min-w-0 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
            FINANCE WORKSPACE / {data.month.toUpperCase()}
          </p>
          <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
            Your financial picture.
          </h1>
          <p className="text-xs leading-[18px] text-[#637a8a]">
            {data.dateLine}
          </p>
        </div>
      </div>

      {}
      <div className="grid gap-6 xl:grid-cols-[851fr_743fr]">
        <CashCard cash={cash} />
        <div className="flex flex-col gap-4">
          <MetricCard
            title="Revenue"
            caption="Posted revenue this month"
            value={revenue}
          />
          <MetricCard
            title="Expenses"
            caption={`${expensePct}% of monthly revenue`}
            value={expenses}
          />
        </div>
      </div>

      {}
      <Card className="grid grid-cols-1 gap-6 p-5 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <SummaryItem
          label="NET INCOME"
          value={netIncome}
          note={revenue > 0 ? `${margin}% margin` : "No revenue yet"}
        />
        <SummaryItem
          label="RECEIVABLES"
          value={receivables.amount}
          note={
            receivables.count === 0
              ? "No open invoices"
              : plural(receivables.count, "open invoice")
          }
        />
        <SummaryItem
          label="PAYABLES"
          value={payables.amount}
          note={
            payables.count === 0
              ? "No supplier bills"
              : plural(payables.count, "supplier bill")
          }
        />
        <SummaryItem
          label="AWAITING APPROVAL"
          value={awaiting.amount}
          note={
            awaiting.count === 0
              ? "Nothing to review"
              : `${plural(awaiting.count, "item")} to review`
          }
        />
      </Card>

      {}
      <div className="grid items-start gap-6 xl:grid-cols-[978fr_615fr]">
        <MonthChart month={data.month} chart={chart} />
        <ApprovalCard count={awaiting.count} approval={approval} />
      </div>
    </main>
  );
}
