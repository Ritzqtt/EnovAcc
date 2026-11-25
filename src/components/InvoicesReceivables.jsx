import { useMemo, useState } from "react";
import { Icon } from "./AppShell";

const CURRENT_MONTH = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

const FILTERS = ["Outstanding", "Overdue", "Paid"];

const PAGE_SIZE = 10;

const DAY = 86400000;

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

const pad = (n) => String(n).padStart(2, "0");

function parseDate(value) {
  if (value instanceof Date) return value;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
}

function formatDate(value) {
  const d = parseDate(value);
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  return `${pad(d.getDate())} ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

function formatDayMonth(value) {
  const d = parseDate(value);
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "long" })}`;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function statusOf(invoice, today) {
  if (!(Number(invoice.outstanding) > 0)) return "Paid";
  return startOfDay(parseDate(invoice.dueDate)) < today ? "Overdue" : "Outstanding";
}

function exportCsv(rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    ["Invoice", "Customer / Description", "Due date", "Total", "Outstanding"]
      .map(esc)
      .join(","),
    ...rows.map((r) =>
      [
        r.number,
        r.description ? `${r.customer} · ${r.description}` : r.customer,
        formatDate(r.dueDate),
        Number(r.total || 0).toFixed(2),
        Number(r.outstanding || 0).toFixed(2),
      ]
        .map(esc)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invoices.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[#dce5ea] bg-white ${className}`}>{children}</div>
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

export default function InvoicesReceivables({
  invoices = [],
  loading = false,
  error = null,
  month = CURRENT_MONTH,
  onRecordPayment,
  onViewInvoice,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const today = useMemo(() => startOfDay(new Date()), []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (filter === "Outstanding" && !(Number(inv.outstanding) > 0)) return false;
      if (filter === "Overdue" && statusOf(inv, today) !== "Overdue") return false;
      if (filter === "Paid" && statusOf(inv, today) !== "Paid") return false;
      if (!q) return true;
      return (
        String(inv.number).toLowerCase().includes(q) ||
        String(inv.customer).toLowerCase().includes(q) ||
        String(inv.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [invoices, query, filter, today]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visible.slice(pageStart, pageStart + PAGE_SIZE);

  const summary = useMemo(() => {
    const open = invoices.filter((inv) => Number(inv.outstanding) > 0);
    const total = invoices.reduce((t, inv) => t + Number(inv.total || 0), 0);
    const outstanding = open.reduce((t, inv) => t + Number(inv.outstanding || 0), 0);
    const collected = total - outstanding;

    const byDueDate = [...open].sort(
      (a, b) => parseDate(a.dueDate) - parseDate(b.dueDate),
    );
    const next = byDueDate.find((inv) => startOfDay(parseDate(inv.dueDate)) >= today) ?? byDueDate[0] ?? null;

    const aging = { current: 0, early: 0, late: 0 };
    open.forEach((inv) => {
      const daysLate = Math.round((today - startOfDay(parseDate(inv.dueDate))) / DAY);
      const value = Number(inv.outstanding || 0);
      if (daysLate <= 0) aging.current += value;
      else if (daysLate <= 30) aging.early += value;
      else aging.late += value;
    });

    return {
      total,
      collected,
      outstanding,
      collectedPct: total > 0 ? Math.round((collected / total) * 100) : 0,
      next,
      aging,
    };
  }, [invoices, today]);

  const monthName = month.split(" ")[0];

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          FINANCE WORKSPACE / {month.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
          Turn services into steady cash.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Track company subscriptions, licensing, and service invoices.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Total invoiced"
          value={peso.format(summary.total)}
          caption={invoices.length === 0 ? "No invoices yet" : `${monthName} subscription revenue`}
        />
        <StatCard
          label="Collected"
          value={peso.format(summary.collected)}
          caption={
            invoices.length === 0
              ? "Nothing collected yet"
              : `${summary.collectedPct}% of posted invoices`
          }
        />
        <StatCard
          label="Outstanding"
          value={peso.format(summary.outstanding)}
          caption={
            summary.next
              ? `Next due: ${formatDayMonth(summary.next.dueDate)}`
              : "Nothing outstanding"
          }
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <h2 className="mr-2 text-[19px] font-bold leading-7 text-[#021820]">
            Invoice register
          </h2>

          <label className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
            <span className="sr-only">Search invoices</span>
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
              placeholder="Search by invoice or customer"
              className="h-10 w-full rounded-lg bg-[#f3f6f8] pl-9 pr-3 text-[13px] text-[#021820] outline-none placeholder:text-[#637a8a] focus-visible:ring-2 focus-visible:ring-[#0693c7]"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Filter invoices</span>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 cursor-pointer appearance-none rounded-lg bg-[#e4f3fb] pl-3 pr-8 text-[13px] font-medium text-[#0a6fa6] outline-none focus-visible:ring-2 focus-visible:ring-[#0693c7]"
            >
              <option value="All">All records</option>
              {FILTERS.map((f) => (
                <option key={f} value={f}>
                  {f}
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
                <th className="px-5 py-3">Invoice</th>
                <th className="px-4 py-3">Customer / Description</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Outstanding</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-[#637a8a]">
                    Loading invoices…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-[#b0243f]">
                    Couldn’t load invoices: {error}. Refresh the page to try again.
                  </td>
                </tr>
              )}

              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-[#637a8a]">
                    {invoices.length === 0
                      ? "No invoices yet. Invoices you issue will appear here with what’s still owed."
                      : "No invoices match your search. Clear the search or choose another filter."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageRows.map((inv) => {
                  const paid = !(Number(inv.outstanding) > 0);
                  return (
                    <tr
                      key={inv.number}
                      className="border-t border-[#dce5ea] transition-colors hover:bg-[#f3f8fb]"
                    >
                      <td className="px-5 py-4 text-[#0693c7]">{inv.number}</td>
                      <td className="px-4 py-4 text-[#021820]">
                        {inv.description ? `${inv.customer} · ${inv.description}` : inv.customer}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#021820]">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="px-4 py-4 tabular-nums text-[#021820]">
                        {peso.format(Number(inv.total || 0))}
                      </td>
                      <td className="px-4 py-4 tabular-nums text-[#021820]">
                        {peso.format(Number(inv.outstanding || 0))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <button
                          type="button"
                          onClick={() => (paid ? onViewInvoice?.(inv) : onRecordPayment?.(inv))}
                          className={`rounded font-medium text-[#0693c7] hover:underline ${FOCUS}`}
                        >
                          {paid ? "View invoice →" : "Record payment →"}
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
              ? "0 invoices"
              : `Showing ${pageStart + 1}–${pageStart + pageRows.length} of ${visible.length} ${visible.length === 1 ? "invoice" : "invoices"}`}
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

      <div className="grid items-stretch gap-6 xl:grid-cols-[978fr_615fr]">
        <Card className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-[19px] font-bold leading-7 text-[#021820]">Receivables aging</h2>
            <p className="text-xs leading-[18px] text-[#637a8a]">
              As of {today.getDate()} {today.toLocaleDateString("en-US", { month: "long" })}{" "}
              {today.getFullYear()}
            </p>
          </div>
          <div className="flex flex-col">
            {[
              ["Not yet due", summary.aging.current],
              ["1–30 days overdue", summary.aging.early],
              ["31+ days overdue", summary.aging.late],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 border-t border-[#dce5ea] py-4 text-[13px] text-[#021820] first:border-t-0"
              >
                <p>{label}</p>
                <p className="tabular-nums">{peso.format(value)}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl bg-[#02355d] p-6 text-white">
          <p className="text-[10px] font-bold uppercase leading-4 text-[#a7bfce]">
            Next collection
          </p>
          {summary.next ? (
            <>
              <p className="text-[19px] font-bold leading-7">{summary.next.customer}</p>
              <p className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.2]">
                {peso.format(Number(summary.next.outstanding || 0))}
              </p>
              <p className="text-xs leading-[18px] text-[#a7bfce]">
                Due {formatDayMonth(summary.next.dueDate)} · {summary.next.number}
              </p>
              <button
                type="button"
                onClick={() => onViewInvoice?.(summary.next)}
                className="mt-2 h-10 w-fit rounded-lg bg-white px-5 text-[13px] font-bold text-[#02355d] transition-colors hover:bg-[#e4f3fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                View invoice →
              </button>
            </>
          ) : (
            <>
              <p className="text-[19px] font-bold leading-7">Nothing to collect</p>
              <p className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.2]">
                {peso.format(0)}
              </p>
              <p className="text-xs leading-[18px] text-[#a7bfce]">
                Open invoices will show here with their due date.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}