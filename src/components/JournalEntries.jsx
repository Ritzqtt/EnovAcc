import { useMemo, useState } from "react";
import { Icon } from "./AppShell";

const now = new Date();
const CURRENT_MONTH = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const STATUSES = ["Posted", "Pending"];

const STATUS_STYLES = {
  Posted: "bg-[#e1f5ec] text-[#13774f]",
  Pending: "bg-[#fff2d7] text-[#996514]",
};

const PAGE_SIZE = 10;

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

const pad = (n) => String(n).padStart(2, "0");

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  return `${pad(d.getDate())} ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

function exportCsv(rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    ["Reference", "Description", "Date", "Debit", "Credit", "Status"].map(esc).join(","),
    ...rows.map((r) =>
      [
        r.reference,
        r.description,
        formatDate(r.date),
        Number(r.debit).toFixed(2),
        Number(r.credit).toFixed(2),
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
  a.download = "journal-entries.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[#dce5ea] bg-white ${className}`}>{children}</div>
  );
}

function StatCard({ label, value, caption, valueClass = "text-[#021820]" }) {
  return (
    <Card className="flex flex-col gap-2 p-5">
      <p className="text-xs leading-[18px] text-[#637a8a]">{label}</p>
      <p
        className={`text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold leading-[44px] ${valueClass}`}
      >
        {value}
      </p>
      <p className="text-xs leading-[18px] text-[#637a8a]">{caption}</p>
    </Card>
  );
}

export default function JournalEntries({
  entries = [],
  loading = false,
  error = null,
  month = CURRENT_MONTH,
  onViewEntry,
  onReviewEntry,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => {
        const byDate = new Date(b.date) - new Date(a.date);
        if (byDate) return byDate;
        return String(b.reference).localeCompare(String(a.reference), undefined, {
          numeric: true,
        });
      }),
    [entries],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((e) => {
      if (statusFilter !== "All" && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(e.reference).toLowerCase().includes(q) ||
        String(e.description).toLowerCase().includes(q) ||
        String(e.status).toLowerCase().includes(q)
      );
    });
  }, [sorted, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visible.slice(pageStart, pageStart + PAGE_SIZE);

  const stats = useMemo(() => {
    const posted = entries.filter((e) => e.status === "Posted");
    const pending = entries.filter((e) => e.status === "Pending");
    const debits = entries.reduce((t, e) => t + Number(e.debit || 0), 0);
    const credits = entries.reduce((t, e) => t + Number(e.credit || 0), 0);
    return {
      posted: posted.length,
      pending: pending.length,
      pendingAmount: pending.reduce((t, e) => t + Number(e.debit || 0), 0),
      balanced: Math.abs(debits - credits) < 0.005,
      difference: Math.abs(debits - credits),
    };
  }, [entries]);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          FINANCE WORKSPACE / {month.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
          Every entry, accounted for.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Prepare, review, and post with a clear approval trail.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Posted entries"
          value={pad(stats.posted)}
          caption="Included in financial reports"
        />
        <StatCard
          label="Awaiting review"
          value={pad(stats.pending)}
          caption={
            stats.pending === 0
              ? "Nothing to approve"
              : `${peso.format(stats.pendingAmount)} to approve`
          }
        />
        <StatCard
          label="Ledger integrity"
          value={stats.balanced ? "Balanced" : "Out of balance"}
          valueClass={stats.balanced ? "text-[#021820]" : "text-[#996514]"}
          caption={
            stats.balanced
              ? "Total debits equal total credits"
              : `Debits and credits differ by ${peso.format(stats.difference)}`
          }
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <h2 className="mr-2 text-[19px] font-bold leading-7 text-[#021820]">
            Journal register
          </h2>

          <label className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
            <span className="sr-only">Search entries</span>
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
              placeholder="Search by reference, description or status"
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
          <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-[#f3f6f8] text-[10px] font-bold uppercase leading-4 text-[#637a8a]">
                <th className="px-5 py-3">Reference</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-[#637a8a]">
                    Loading entries…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-[#b0243f]">
                    Couldn’t load entries: {error}. Refresh the page to try again.
                  </td>
                </tr>
              )}

              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-[#637a8a]">
                    {entries.length === 0
                      ? "No journal entries yet. Entries you prepare will appear here with their approval status."
                      : "No entries match your search. Clear the search or choose another status."}
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
                      <td className="px-5 py-4 font-bold text-[#0693c7]">{e.reference}</td>
                      <td className="px-4 py-4 text-[#021820]">{e.description}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#021820]">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-[#021820]">
                        {peso.format(Number(e.debit || 0))}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-[#021820]">
                        {peso.format(Number(e.credit || 0))}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-md px-3 py-1 text-xs font-medium ${
                            STATUS_STYLES[e.status] || "bg-[#f3f6f8] text-[#637a8a]"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => (pending ? onReviewEntry?.(e) : onViewEntry?.(e))}
                          className={`rounded font-medium text-[#0693c7] hover:underline ${FOCUS}`}
                        >
                          {pending ? "Review & approve →" : "View entry →"}
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
              ? "0 entries"
              : `Showing ${pageStart + 1}–${pageStart + pageRows.length} of ${visible.length} ${visible.length === 1 ? "entry" : "entries"}`}
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