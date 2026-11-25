import { useMemo, useState } from "react";
import { Icon } from "./AppShell";

const CURRENT_MONTH = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Available: "bg-[#e4f3fb] text-[#0a6fa6]",
  Ready: "bg-[#e4f3fb] text-[#0a6fa6]",
};

// Always offered in the status filter, even before any data exists.
const STATUS_OPTIONS = ["Available", "Ready"];

// Rows with these statuses get the light blue row tint.
const TINTED_STATUSES = new Set(["Available"]);

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

const pad = (n) => String(n).padStart(2, "0");

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

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

function exportCsv(rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["Date", "Module", "Activity", "Status"].map(esc).join(","),
    ...rows.map((r) => [formatDate(r.date), r.module, r.activity, r.status].map(esc).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "exchange-activity.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- icons ---------- */

function UsersGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 19c.5-3 2.8-4.75 5.5-4.75S14 16 14.5 19" />
      <path d="M15.5 5.2a3 3 0 0 1 0 5.6" />
      <path d="M17 14.5c1.9.5 3.1 2 3.5 4.5" />
    </svg>
  );
}

function BarsGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 19v-5" />
      <path d="M12 19V6" />
      <path d="M19 19v-9" />
    </svg>
  );
}

/* ---------- building blocks ---------- */

function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[#dce5ea] bg-white ${className}`}>{children}</div>
  );
}

function IntegrationCard({ icon, title, description, actionLabel, onAction }) {
  return (
    <Card className="flex flex-col p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e4f3fb] text-[#0693c7]">
        {icon}
      </div>
      <h2 className="mt-6 text-xl font-bold leading-7 text-[#021820]">{title}</h2>
      <p className="mt-4 text-sm leading-[22px] text-[#637a8a]">{description}</p>
      <div className="mt-5">
        <button
          type="button"
          onClick={() => onAction?.()}
          className={`h-11 rounded-lg bg-[#3dc0f0] px-8 text-[13px] font-bold text-white transition-colors hover:bg-[#2fb0e0] ${FOCUS}`}
        >
          {actionLabel}
        </button>
      </div>
    </Card>
  );
}

/**
 * activity: [{ id?, date, module, activity, status }]   e.g. status "Available" | "Ready"
 * onPreviewPayrollImport, onExportLedgerData: () => void
 */
export default function Integrations({
  activity = [],
  month = CURRENT_MONTH,
  loading = false,
  error = null,
  onPreviewPayrollImport,
  onExportLedgerData,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const statuses = useMemo(
    () => [...new Set([...STATUS_OPTIONS, ...activity.map((a) => a.status).filter(Boolean)])],
    [activity],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activity.filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(a.module ?? "").toLowerCase().includes(q) ||
        String(a.activity ?? "").toLowerCase().includes(q) ||
        String(a.status ?? "").toLowerCase().includes(q)
      );
    });
  }, [activity, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visible.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          FINANCE WORKSPACE / {month.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
          Connected records. Clear boundaries.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Exchange relevant data with the existing payroll and analytics modules.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <IntegrationCard
          icon={<UsersGlyph />}
          title="Payroll module"
          description="Import summarized salary expenses for review and posting. Payroll processing remains in the existing module."
          actionLabel="Preview payroll import"
          onAction={onPreviewPayrollImport}
        />
        <IntegrationCard
          icon={<BarsGlyph />}
          title="Business analytics"
          description="Export approved ledger records for the existing analytics environment. Keep reporting connected to the books."
          actionLabel="Export ledger data"
          onAction={onExportLedgerData}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <h2 className="mr-2 text-[19px] font-bold leading-7 text-[#021820]">
            Exchange activity
          </h2>

          <label className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
            <span className="sr-only">Search exchange activity</span>
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
              {statuses.map((s) => (
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
                <th className="w-[11%] px-5 py-3">Date</th>
                <th className="w-[16%] px-4 py-3">Module</th>
                <th className="w-[31%] px-4 py-3">Activity</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-[#637a8a]">
                    Loading exchange activity…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-[#b0243f]">
                    Couldn’t load exchange activity: {error}. Refresh the page to try again.
                  </td>
                </tr>
              )}

              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-[#637a8a]">
                    {activity.length === 0
                      ? "No exchange activity yet. Imports and exports will appear here."
                      : "No activity matches your search. Clear the search or choose another status."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageRows.map((a, i) => (
                  <tr
                    key={a.id ?? `${a.date}-${a.module}-${pageStart + i}`}
                    className={`transition-colors ${
                      TINTED_STATUSES.has(a.status)
                        ? "bg-[#e9f4f9] hover:bg-[#e0eff6]"
                        : "bg-white hover:bg-[#f3f8fb]"
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-5 font-bold text-[#0693c7]">
                      {formatDate(a.date)}
                    </td>
                    <td className="px-4 py-5 text-[#021820]">{a.module}</td>
                    <td className="px-4 py-5 text-[#021820]">{a.activity}</td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-block rounded-md px-3 py-1.5 text-xs font-medium ${
                          STATUS_STYLES[a.status] || "bg-[#f3f6f8] text-[#637a8a]"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dce5ea] px-5 py-4 text-xs leading-[18px] text-[#637a8a]">
          <p>
            {visible.length === 0
              ? "0 records"
              : `Showing ${pageStart + 1}–${pageStart + pageRows.length} of ${plural(visible.length, "record")}`}
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