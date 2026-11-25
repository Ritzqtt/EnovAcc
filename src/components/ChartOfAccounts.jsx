import { useMemo, useState } from "react";
import { Icon } from "./AppShell";

const now = new Date();
const CURRENT_MONTH = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const CLASSES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

const DEBIT_CLASSES = ["Asset", "Expense"];

function expectedClass(code) {
  const lead = String(code).trim()[0];
  if (lead === "1") return "Asset";
  if (lead === "2") return "Liability";
  if (lead === "3") return "Equity";
  if (lead === "4") return "Revenue";
  if (lead >= "5" && lead <= "9") return "Expense";
  return null;
}

const CLASS_STYLES = {
  Asset: "bg-[#e4f3fb] text-[#0a6fa6]",
  Liability: "bg-[#fdeee3] text-[#b4570f]",
  Equity: "bg-[#e9e8fb] text-[#4a43b5]",
  Revenue: "bg-[#e1f5ec] text-[#13774f]",
  Expense: "bg-[#fbe8ec] text-[#b0243f]",
};

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const PAGE_SIZE = 10;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

function exportCsv(rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    ["Code", "Account name", "Class", "Balance"].map(esc).join(","),
    ...rows.map((r) =>
      [r.code, r.name, r.class, Number(r.balance).toFixed(2)].map(esc).join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chart-of-accounts.csv";
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

export default function ChartOfAccounts({
  accounts = [],
  loading = false,
  error = null,
  month = CURRENT_MONTH,
  onViewLedger,
  onAddAccount,
}) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...accounts].sort((a, b) =>
        String(a.code).localeCompare(String(b.code), undefined, { numeric: true }),
      ),
    [accounts],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((a) => {
      if (classFilter !== "All" && a.class !== classFilter) return false;
      if (!q) return true;
      return (
        String(a.code).toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.class.toLowerCase().includes(q)
      );
    });
  }, [sorted, query, classFilter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visible.slice(pageStart, pageStart + PAGE_SIZE);

  const stats = useMemo(() => {
    const sum = (pred) =>
      accounts.filter(pred).reduce((t, a) => t + Number(a.balance || 0), 0);
    const assets = sum((a) => a.class === "Asset");
    const debits = sum((a) => DEBIT_CLASSES.includes(a.class));
    const credits = sum((a) => !DEBIT_CLASSES.includes(a.class));
    return {
      assets,
      classCount: new Set(accounts.map((a) => a.class)).size,
      balanced: Math.abs(debits - credits) < 0.005,
      difference: Math.abs(debits - credits),
    };
  }, [accounts]);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          FINANCE WORKSPACE / {month.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
          Built on a balanced foundation.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Organize every transaction with a consistent account structure.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Active accounts"
          value={accounts.length}
          caption={
            accounts.length === 0
              ? "No accounts yet"
              : `Across ${stats.classCount} account ${stats.classCount === 1 ? "class" : "classes"}`
          }
        />
        <StatCard
          label="Ledger balance"
          value={peso.format(stats.assets)}
          caption={`Assets through ${month}`}
        />
        <StatCard
          label="Posting status"
          value={stats.balanced ? "Balanced" : "Out of balance"}
          valueClass={stats.balanced ? "text-[#021820]" : "text-[#996514]"}
          caption={
            stats.balanced
              ? "Debits match credits"
              : `Debits and credits differ by ${peso.format(stats.difference)}`
          }
        />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <h2 className="mr-2 text-[19px] font-bold leading-7 text-[#021820]">
            Account directory
          </h2>

          <label className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
            <span className="sr-only">Search accounts</span>
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
              placeholder="Search by code, name or class"
              className="h-10 w-full rounded-lg bg-[#f3f6f8] pl-9 pr-3 text-[13px] text-[#021820] outline-none placeholder:text-[#637a8a] focus-visible:ring-2 focus-visible:ring-[#0693c7]"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Filter by class</span>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 cursor-pointer appearance-none rounded-lg bg-[#e4f3fb] pl-3 pr-8 text-[13px] font-medium text-[#0a6fa6] outline-none focus-visible:ring-2 focus-visible:ring-[#0693c7]"
            >
              <option value="All">All classes</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Icon
              name="chevron"
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a6fa6]"
            />
          </label>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => exportCsv(visible)}
              disabled={!visible.length}
              className={`h-10 rounded-lg border border-[#dce5ea] bg-white px-5 text-[13px] font-bold text-[#021820] transition-colors hover:bg-[#f3f6f8] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
            >
              Export
            </button>
            {onAddAccount && (
              <button
                type="button"
                onClick={onAddAccount}
                className={`h-10 rounded-lg bg-[#02355d] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#03487f] ${FOCUS}`}
              >
                New account
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-[#f3f6f8] text-[10px] font-bold uppercase leading-4 text-[#637a8a]">
                <th className="px-5 py-3">Code</th>
                <th className="px-4 py-3">Account name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-[#637a8a]">
                    Loading accounts…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-[#b0243f]">
                    Couldn’t load accounts: {error}. Refresh the page to try again.
                  </td>
                </tr>
              )}

              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-[#637a8a]">
                    {accounts.length === 0
                      ? "No accounts yet. Add your first account to start posting entries."
                      : "No accounts match your search. Clear the search or choose another class."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageRows.map((a) => {
                  const expected = expectedClass(a.code);
                  const suspicious = expected && expected !== a.class;
                  return (
                    <tr
                      key={a.code}
                      className="border-t border-[#dce5ea] transition-colors hover:bg-[#f3f8fb]"
                    >
                      <td className="px-5 py-4 font-bold text-[#0693c7]">{a.code}</td>
                      <td className="px-4 py-4 text-[#021820]">{a.name}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              CLASS_STYLES[a.class] || "bg-[#f3f6f8] text-[#637a8a]"
                            }`}
                          >
                            {a.class}
                          </span>
                          {suspicious && (
                            <span
                              title={`Code ${a.code} usually belongs to ${expected}. Check this account’s class.`}
                              aria-label={`Check class: code ${a.code} usually belongs to ${expected}`}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#fff2d7] text-xs font-bold text-[#996514]"
                            >
                              !
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-[#021820]">
                        {peso.format(Number(a.balance || 0))}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onViewLedger?.(a)}
                          className={`rounded font-medium text-[#0693c7] hover:underline ${FOCUS}`}
                        >
                          View ledger →
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
              ? "0 accounts"
              : `Showing ${pageStart + 1}–${pageStart + pageRows.length} of ${visible.length} ${visible.length === 1 ? "account" : "accounts"}`}
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