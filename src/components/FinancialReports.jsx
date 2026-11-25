import { useState } from "react";

const CURRENT_MONTH = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

const TABS = [
  { id: "income", label: "Income statement" },
  { id: "balance", label: "Balance sheet" },
  { id: "cashflow", label: "Cash flow" },
];

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

function money(value) {
  const n = Number(value || 0);
  return n < 0 ? `−${peso.format(Math.abs(n))}` : peso.format(n);
}

const sum = (lines = []) =>
  lines.reduce((t, l) => t + Number(l.amount || 0), 0);

function ReportCard({ company, title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-[#dce5ea] bg-white p-5 sm:p-8">
      <header className="border-b border-[#dce5ea] pb-4">
        <p className="text-[10px] font-bold uppercase leading-4 text-[#0693c7]">
          {company}
        </p>
        <h2 className="mt-2 text-xl font-bold leading-7 text-[#021820]">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-[18px] text-[#637a8a]">{subtitle}</p>
      </header>
      <div className="pt-2">{children}</div>
    </section>
  );
}

function Line({ label, amount, strong = false, divider = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 text-sm text-[#021820] ${
        strong ? "font-bold" : ""
      } ${divider ? "border-t border-[#dce5ea]" : ""}`}
    >
      <span>{label}</span>
      <span className="whitespace-nowrap tabular-nums">{money(amount)}</span>
    </div>
  );
}

function GroupLabel({ children }) {
  return (
    <p className="pt-4 text-[10px] font-bold uppercase leading-4 text-[#637a8a]">
      {children}
    </p>
  );
}

function Group({ title, lines = [], totalLabel }) {
  return (
    <div>
      <GroupLabel>{title}</GroupLabel>
      {lines.length === 0 ? (
        <p className="py-4 text-sm text-[#637a8a]">Nothing posted yet.</p>
      ) : (
        lines.map((l, i) => (
          <Line key={`${l.label}-${i}`} label={l.label} amount={l.amount} />
        ))
      )}
      <Line label={totalLabel} amount={sum(lines)} strong divider />
    </div>
  );
}

function Highlight({ label, amount }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-[#e9f4f9] px-3 py-4 text-sm font-bold text-[#021820]">
      <span>{label}</span>
      <span className="whitespace-nowrap tabular-nums">{money(amount)}</span>
    </div>
  );
}

function Banner({ value, title, caption }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-gradient-to-r from-[#02355d] to-[#0672c8] px-5 py-5 text-white">
      <p className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold leading-10">
        {value}
      </p>
      <div className="text-xs leading-[18px] text-white/80">
        <p>{title}</p>
        <p>{caption}</p>
      </div>
    </div>
  );
}

function IncomeStatement({ data, ...head }) {
  const revenue = Number(data.revenue || 0);
  const operating = Number(data.operatingExpenses || 0);
  const salary = Number(data.salaryExpenses || 0);
  const net = revenue - operating - salary;
  const margin = revenue > 0 ? Math.round((net / revenue) * 100) : null;

  return (
    <ReportCard
      {...head}
      title="Income statement"
      subtitle={`For the month of ${head.month} · Philippine peso`}
    >
      <Line label="Revenue" amount={revenue} />
      <Line label="Operating expenses" amount={operating} />
      <Line label="Salary expenses" amount={salary} />
      <Highlight label="Net income" amount={net} />
      <Banner
        value={margin === null ? "—" : `${margin}%`}
        title="Net profit margin"
        caption={
          margin === null
            ? "No revenue has been posted yet."
            : "Based on posted revenue and expenses."
        }
      />
    </ReportCard>
  );
}

function BalanceSheet({ data, ...head }) {
  const assets = sum(data.assets);
  const liabilities = sum(data.liabilities);
  const equity = sum(data.equity);
  const diff = Math.round((assets - (liabilities + equity)) * 100) / 100;
  const balanced = Math.abs(diff) < 0.005;

  return (
    <ReportCard
      {...head}
      title="Balance sheet"
      subtitle={`As of the end of ${head.month} · Philippine peso`}
    >
      <Group title="Assets" lines={data.assets} totalLabel="Total assets" />
      <Group
        title="Liabilities"
        lines={data.liabilities}
        totalLabel="Total liabilities"
      />
      <Group title="Equity" lines={data.equity} totalLabel="Total equity" />
      <Highlight
        label="Total liabilities and equity"
        amount={liabilities + equity}
      />
      <Banner
        value={balanced ? "Balanced" : money(Math.abs(diff))}
        title={
          balanced
            ? "Assets equal liabilities plus equity."
            : "Assets and liabilities plus equity differ."
        }
        caption={
          balanced
            ? "Based on posted ledger entries."
            : "Review the posted journal entries to find the difference."
        }
      />
    </ReportCard>
  );
}

function CashFlow({ data, ...head }) {
  const opening = Number(data.openingCash || 0);
  const operating = sum(data.operating);
  const investing = sum(data.investing);
  const financing = sum(data.financing);
  const net = operating + investing + financing;

  return (
    <ReportCard
      {...head}
      title="Cash flow"
      subtitle={`For the month of ${head.month} · Philippine peso`}
    >
      <Group
        title="Operating activities"
        lines={data.operating}
        totalLabel="Net cash from operating activities"
      />
      <Group
        title="Investing activities"
        lines={data.investing}
        totalLabel="Net cash from investing activities"
      />
      <Group
        title="Financing activities"
        lines={data.financing}
        totalLabel="Net cash from financing activities"
      />
      <Highlight label="Net change in cash" amount={net} />
      <Banner
        value={money(opening + net)}
        title="Closing cash balance"
        caption={`Opening balance of ${money(opening)}, net change of ${money(net)}.`}
      />
    </ReportCard>
  );
}

export default function FinancialReports({
  incomeStatement,
  balanceSheet,
  cashFlow,
  companyName = "Enov8tive Technology Solutions Inc.",
  month = CURRENT_MONTH,
  loading = false,
  error = null,
}) {
  const [tab, setTab] = useState("income");

  const income = incomeStatement ?? {};
  const balance = balanceSheet ?? {};
  const cash = cashFlow ?? {};

  const head = { company: companyName, month };

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          FINANCE WORKSPACE / {month.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
          A clearer story behind the numbers.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Financial statements generated from approved ledger entries.
        </p>
      </div>

      <div
        role="group"
        aria-label="Financial statement"
        className="flex flex-wrap gap-2"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(t.id)}
              className={`h-[42px] min-w-[175px] rounded-lg px-5 text-[13px] font-bold transition-colors ${FOCUS} ${
                active
                  ? "bg-[#02355d] text-white"
                  : "bg-white text-[#637a8a] hover:bg-[#f3f6f8]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="rounded-xl border border-[#dce5ea] bg-white px-5 py-14 text-center text-sm text-[#637a8a]">
          Loading financial statements…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-[#dce5ea] bg-white px-5 py-14 text-center text-sm text-[#b0243f]">
          Couldn’t load financial statements: {error}. Refresh the page to try
          again.
        </div>
      )}

      {!loading && !error && tab === "income" && (
        <IncomeStatement data={income} {...head} />
      )}
      {!loading && !error && tab === "balance" && (
        <BalanceSheet data={balance} {...head} />
      )}
      {!loading && !error && tab === "cashflow" && (
        <CashFlow data={cash} {...head} />
      )}
    </main>
  );
}
