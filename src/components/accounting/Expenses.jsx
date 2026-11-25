import { useMemo, useState } from "react";
import { Icon } from "../layout/AppShell";

const CURRENT_MONTH = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

const STATUSES = ["Posted", "Pending"];

const STATUS_STYLES = {
  Posted: "bg-[#e1f5ec] text-[#13774f]",
  Pending: "bg-[#fff2d7] text-[#996514]",
};

const PAGE_SIZE = 10;

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

const pad = (n) => String(n).padStart(2, "0");

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

function parseDate(value) {
  if (value instanceof Date) return value;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  return m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(value);
}

function formatDate(value) {
  const d = parseDate(value);
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  return `${pad(d.getDate())} ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

function exportCsv(rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    ["Reference", "Payee / Description", "Date", "Amount", "Status"]
      .map(esc)
      .join(","),
    ...rows.map((r) =>
      [
        r.reference,
        r.description ? `${r.payee} · ${r.description}` : r.payee,
        formatDate(r.date),
        Number(r.amount || 0).toFixed(2),
        r.status,
      ]
        .map(esc)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[#dce5ea] bg-white ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ label, value, caption }) {
  return (
    <Card className="flex flex-col gap-2 p-5">
      <p className="text-xs leading-[18px] text-[#637a8a]">{label}</p>
      <p className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold leading-[44px] text-[#021820]">
        {value}
      </p>
      <p className="text-xs leading-[18px] text-[#637a8a]">{caption}</p>
    </Card>
  );
}

export default function Expenses({
  expenses = [],
  supplierCosts = 0,
  loading = false,
  error = null,
  month = CURRENT_MONTH,
  onReviewExpense,
  onViewExpense,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...expenses].sort((a, b) => {
        const byDate = parseDate(b.date) - parseDate(a.date);
        if (byDate) return byDate;
        return String(b.reference).localeCompare(
          String(a.reference),
          undefined,
          {
            numeric: true,
          },
        );
      }),
    [expenses],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((e) => {
      if (statusFilter !== "All" && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(e.reference).toLowerCase().includes(q) ||
        String(e.payee).toLowerCase().includes(q) ||
        String(e.description ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [sorted, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visible.slice(pageStart, pageStart + PAGE_SIZE);

  const summary = useMemo(() => {
    const sum = (list) => list.reduce((t, e) => t + Number(e.amount || 0), 0);
    const posted = expenses.filter((e) => e.status === "Posted");
    const pending = expenses.filter((e) => e.status === "Pending");
    return {
      postedCount: posted.length,
      postedAmount: sum(posted),
      pendingCount: pending.length,
      pendingAmount: sum(pending),
    };
  }, [expenses]);

  return (
    <main className="flex min-w-0 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          FINANCE WORKSPACE / {month.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
          Keep every expense in view.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Capture operating costs and keep the approval trail intact.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Posted cash expenses"
          value={peso.format(summary.postedAmount)}
          caption={
            summary.postedCount === 0
              ? "No posted expenses"
              : plural(summary.postedCount, "posted expense")
          }
        />
        <StatCard
          label="Awaiting approval"
          value={peso.format(summary.pendingAmount)}
          caption={
            summary.pendingCount === 0
              ? "Nothing to review"
              : `${plural(summary.pendingCount, "expense")} to review`
          }
        />
        <StatCard
          label="Approved supplier costs"
          value={peso.format(Number(supplierCosts || 0))}
          caption="Recorded through payables"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <h2 className="mr-2 text-[19px] font-bold leading-7 text-[#021820]">
            Expense register
          </h2>

          <label className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
            <span className="sr-only">Search expenses</span>
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#637a8a]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by reference or payee"
              className="h-10 w-full rounded-lg bg-[#f3f6f8] pl-9 pr-3 text-[13px] text-[#021820] outline-none placeholder:text-[#637a8a] focus-visible:ring-2 focus-visible:ring-[#0693c7]"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Filter by status</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 cursor-pointer appearance-none rounded-lg bg-[#e4f3fb] pl-3 pr-8 text-[13px] font-medium text-[#0a6fa6] outline-none focus-visible:ring-2 focus-visible:ring-[#0693c7]"
            >
              <option value="All">All records</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Icon
              name="chevron"
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a6fa6]"
            />
          </label>

          <button
            type="button"
            onClick={() => exportCsv(visible)}
            disabled={!visible.length}
            className={`ml-auto h-10 rounded-lg border border-[#dce5ea] bg-white px-5 text-[13px] font-bold text-[#021820] transition-colors hover:bg-[#f3f6f8] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
          >
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-[#f3f6f8] text-[10px] font-bold uppercase leading-4 text-[#637a8a]">
                <th className="px-5 py-3">Reference</th>
                <th className="px-4 py-3">Payee / Description</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center text-[#637a8a]"
                  >
                    Loading expenses…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center text-[#b0243f]"
                  >
                    Couldn’t load expenses: {error}. Refresh the page to try
                    again.
                  </td>
                </tr>
              )}

              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center text-[#637a8a]"
                  >
                    {expenses.length === 0
                      ? "No expenses yet. Expenses you capture will appear here with their approval status."
                      : "No expenses match your search. Clear the search or choose another status."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageRows.map((e) => {
                  const pending = e.status === "Pending";
                  return (
                    <tr
                      key={e.reference}
                      className="border-t border-[#dce5ea] transition-colors hover:bg-[#f3f8fb]"
                    >
                      <td className="px-5 py-4 font-bold text-[#0693c7]">
                        {e.reference}
                      </td>
                      <td className="px-4 py-4 text-[#021820]">
                        {e.description
                          ? `${e.payee} · ${e.description}`
                          : e.payee}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#021820]">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-4 py-4 tabular-nums text-[#021820]">
                        {peso.format(Number(e.amount || 0))}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-md px-3 py-1 text-xs font-medium ${
                            STATUS_STYLES[e.status] ||
                            "bg-[#f3f6f8] text-[#637a8a]"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            pending ? onReviewExpense?.(e) : onViewExpense?.(e)
                          }
                          className={`rounded font-medium text-[#0693c7] hover:underline ${FOCUS}`}
                        >
                          {pending ? "Review expense →" : "View entry →"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dce5ea] px-5 py-4 text-xs leading-[18px] text-[#637a8a]">
          <p>
            {visible.length === 0
              ? "0 expenses"
              : `Showing ${pageStart + 1}–${pageStart + pageRows.length} of ${visible.length} ${visible.length === 1 ? "expense" : "expenses"}`}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`h-8 rounded-lg border border-[#dce5ea] bg-white px-3 font-bold text-[#021820] transition-colors hover:bg-[#f3f6f8] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
            >
              Previous
            </button>
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`h-8 rounded-lg border border-[#dce5ea] bg-white px-3 font-bold text-[#021820] transition-colors hover:bg-[#f3f6f8] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </main>
  );
}
