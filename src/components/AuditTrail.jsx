import { useMemo, useState } from "react";
import { Icon } from "./AppShell";

const CURRENT_MONTH = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

const PAGE_SIZE = 15;

// Always offered in the filter, even before any data exists.
const ACTION_OPTIONS = [
  "Signed in",
  "Submitted expense",
  "Approved and posted journal",
  "Recorded customer payment",
];

// Rows with these actions get the light blue row tint.
const TINTED_ACTIONS = new Set(["Signed in"]);

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

const pad = (n) => String(n).padStart(2, "0");

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseTimestamp(value) {
  if (value instanceof Date) return value;
  const m = DATE_ONLY.exec(String(value ?? ""));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
}

// "14 Oct 2026 · 09:12", or just "14 Oct 2026" when only a date was recorded.
function formatTimestamp(value) {
  const d = parseTimestamp(value);
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  const date = `${pad(d.getDate())} ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getFullYear()}`;
  if (typeof value === "string" && DATE_ONLY.test(value)) return date;
  return `${date} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function exportCsv(rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["Timestamp", "User", "Action", "Reference"].map(esc).join(","),
    ...rows.map((r) =>
      [formatTimestamp(r.timestamp), r.user, r.action, r.reference].map(esc).join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit-trail.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[#dce5ea] bg-white ${className}`}>{children}</div>
  );
}

/**
 * entries: [{ id?, timestamp (ISO string or Date), user, action, reference }]
 * Shown newest first. The "All records" filter lists the usual actions plus any others found in the data.
 */
export default function AuditTrail({
  entries = [],
  month = CURRENT_MONTH,
  loading = false,
  error = null,
}) {
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) => (parseTimestamp(b.timestamp).getTime() || 0) - (parseTimestamp(a.timestamp).getTime() || 0),
      ),
    [entries],
  );

  const actions = useMemo(
    () => [...new Set([...ACTION_OPTIONS, ...entries.map((e) => e.action).filter(Boolean)])],
    [entries],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((e) => {
      if (actionFilter !== "All" && e.action !== actionFilter) return false;
      if (!q) return true;
      return (
        String(e.user ?? "").toLowerCase().includes(q) ||
        String(e.action ?? "").toLowerCase().includes(q) ||
        String(e.reference ?? "").toLowerCase().includes(q)
      );
    });
  }, [sorted, query, actionFilter]);

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
          A record of every decision.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Trace approvals, changes, and exports to the person behind them.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <h2 className="mr-2 text-[19px] font-bold leading-7 text-[#021820]">
            Activity history
          </h2>

          <label className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
            <span className="sr-only">Search activity history</span>
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
            <span className="sr-only">Filter by action</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 cursor-pointer appearance-none rounded-lg bg-[#e4f3fb] pl-3 pr-8 text-[13px] font-medium text-[#0a6fa6] outline-none focus-visible:ring-2 focus-visible:ring-[#0693c7]"
            >
              <option value="All">All records</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
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
                <th className="w-[13%] px-5 py-3">Timestamp</th>
                <th className="w-[13%] px-4 py-3">User</th>
                <th className="w-[26%] px-4 py-3">Action</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-[#637a8a]">
                    Loading activity history…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-[#b0243f]">
                    Couldn’t load activity history: {error}. Refresh the page to try again.
                  </td>
                </tr>
              )}

              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-[#637a8a]">
                    {entries.length === 0
                      ? "No activity yet. Approvals, changes, and exports will appear here."
                      : "No activity matches your search. Clear the search or choose another action."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageRows.map((e, i) => (
                  <tr
                    key={e.id ?? `${e.timestamp}-${e.user}-${pageStart + i}`}
                    className={`transition-colors ${
                      TINTED_ACTIONS.has(e.action)
                        ? "bg-[#e9f4f9] hover:bg-[#e0eff6]"
                        : "bg-white hover:bg-[#f3f8fb]"
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-5 font-bold text-[#0693c7]">
                      {formatTimestamp(e.timestamp)}
                    </td>
                    <td className="px-4 py-5 text-[#021820]">{e.user}</td>
                    <td className="px-4 py-5 text-[#021820]">{e.action}</td>
                    <td className="px-4 py-5 text-[#021820]">{e.reference || "—"}</td>
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