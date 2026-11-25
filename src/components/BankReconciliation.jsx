import { useMemo, useState } from "react";
import { Icon } from "./AppShell";

const CURRENT_MONTH = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

const STATUSES = ["Matched", "Unmatched"];

const STATUS_STYLES = {
  Matched: "bg-[#e1f5ec] text-[#13774f]",
  Unmatched: "bg-[#fff2d7] text-[#996514]",
};

const PAGE_SIZE = 12;

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

function formatSigned(amount) {
  const n = Number(amount || 0);
  const sign = n < 0 ? "−" : "+";
  return `${sign} ${peso.format(Math.abs(n))}`;
}

const isMatched = (m) => m.status === "Matched";

function exportCsv(rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["Date", "Bank description", "Amount", "Journal", "Status"]
      .map(esc)
      .join(","),
    ...rows.map((r) =>
      [
        formatDate(r.date),
        r.description,
        Number(r.amount || 0).toFixed(2),
        r.journal || "",
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
  a.download = "bank-reconciliation.csv";
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

export default function BankReconciliation({
  movements = [],
  ledgerBalance = 0,
  accountLabel = "Operating account · PHP",
  attentionHint = "",
  loading = false,
  error = null,
  month = CURRENT_MONTH,
  onViewEntry,
  onFindMatch,
  onCreateEntry,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movements.filter((m) => {
      if (statusFilter !== "All" && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(m.description ?? "")
          .toLowerCase()
          .includes(q) ||
        String(m.journal ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [movements, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visible.slice(pageStart, pageStart + PAGE_SIZE);

  const summary = useMemo(() => {
    const matched = movements.filter(isMatched);
    const unmatched = movements.filter((m) => !isMatched(m));
    return {
      total: movements.length,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      unmatchedAmount: unmatched.reduce(
        (t, m) => t + Math.abs(Number(m.amount || 0)),
        0,
      ),
    };
  }, [movements]);

  const matchedCaption =
    summary.matchedCount === 0
      ? "No movements linked yet"
      : summary.matchedCount === 1
        ? "One movement linked to the ledger"
        : `${plural(summary.matchedCount, "movement")} linked to the ledger`;

  const filterLabel = statusFilter === "All" ? "All records" : statusFilter;

  function renderAction(m) {
    if (isMatched(m)) {
      return { label: "View entry →", run: () => onViewEntry?.(m) };
    }
    if (m.suggestedJournal) {
      return { label: "Find match →", run: () => onFindMatch?.(m) };
    }
    return { label: "Create entry →", run: () => onCreateEntry?.(m) };
  }

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          FINANCE WORKSPACE / {month.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
          Bring your books and bank together.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Compare cash movements, resolve differences, and complete your review.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Ledger bank balance"
          value={peso.format(Number(ledgerBalance || 0))}
          caption={accountLabel}
        />
        <StatCard
          label="Matched movements"
          value={`${pad(summary.matchedCount)} / ${pad(summary.total)}`}
          caption={matchedCaption}
        />
        <StatCard
          label="Unmatched movements"
          value={`− ${peso.format(summary.unmatchedAmount)}`}
          caption={
            summary.unmatchedCount === 0
              ? "Nothing needs attention"
              : `${plural(summary.unmatchedCount, "item")} ${summary.unmatchedCount === 1 ? "needs" : "need"} attention`
          }
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <h2 className="mr-2 text-[19px] font-bold leading-7 text-[#021820]">
            Statement movements
          </h2>

          <label className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
            <span className="sr-only">Search statement movements</span>
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
              placeholder="Search records"
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
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Bank description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Journal</th>
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
                    Loading statement movements…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center text-[#b0243f]"
                  >
                    Couldn’t load statement movements: {error}. Refresh the page
                    to try again.
                  </td>
                </tr>
              )}

              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center text-[#637a8a]"
                  >
                    {movements.length === 0
                      ? "No statement movements yet. Import a bank statement to start reconciling."
                      : "No movements match your search. Clear the search or choose another status."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageRows.map((m, i) => {
                  const matched = isMatched(m);
                  const action = renderAction(m);
                  return (
                    <tr
                      key={
                        m.id ?? `${m.date}-${m.description}-${pageStart + i}`
                      }
                      className={`transition-colors ${
                        matched
                          ? "bg-[#e9f4f9] hover:bg-[#e0eff6]"
                          : "bg-white hover:bg-[#f3f8fb]"
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-5 font-bold text-[#0693c7]">
                        {formatDate(m.date)}
                      </td>
                      <td className="px-4 py-5 text-[#021820]">
                        {m.description}
                      </td>
                      <td className="whitespace-nowrap px-4 py-5 tabular-nums text-[#021820]">
                        {formatSigned(m.amount)}
                      </td>
                      <td className="px-4 py-5 text-[#021820]">
                        {m.journal || "—"}
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-block rounded-md px-3 py-1 text-xs font-medium ${
                            STATUS_STYLES[m.status] ||
                            "bg-[#f3f6f8] text-[#637a8a]"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-5">
                        <button
                          type="button"
                          onClick={action.run}
                          className={`rounded font-medium text-[#0693c7] hover:underline ${FOCUS}`}
                        >
                          {action.label}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs leading-[18px] text-[#637a8a]">
          <p>
            {plural(visible.length, "record")} · {filterLabel}
          </p>
          <div className="flex items-center gap-3">
            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`h-8 rounded-lg border border-[#dce5ea] bg-white px-3 font-bold text-[#021820] transition-colors hover:bg-[#f3f6f8] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
              >
                Previous
              </button>
            )}
            <p>
              Page {currentPage} of {totalPages}
            </p>
            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`h-8 rounded-lg border border-[#dce5ea] bg-white px-3 font-bold text-[#021820] transition-colors hover:bg-[#f3f6f8] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </Card>

      {!loading && !error && movements.length > 0 && (
        <div className="rounded-xl bg-[#e9f4f9] p-5">
          <p className="text-[13px] font-bold leading-5 text-[#0693c7]">
            {summary.unmatchedCount === 0
              ? "Every movement is matched."
              : `${summary.unmatchedCount === 1 ? "One movement needs" : `${plural(summary.unmatchedCount, "movement")} need`} your attention.`}
          </p>
          <p className="mt-1 text-xs leading-[18px] text-[#637a8a]">
            {summary.unmatchedCount === 0
              ? "Your statement and ledger agree. You can complete the review."
              : attentionHint ||
                "Match each unmatched movement to a journal entry, or record a new entry, before completing review."}
          </p>
        </div>
      )}
    </main>
  );
}
