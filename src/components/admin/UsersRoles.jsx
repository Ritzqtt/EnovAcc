import { useMemo, useState } from "react";
import { Icon } from "../layout/AppShell";

const CURRENT_MONTH = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

const PAGE_SIZE = 15;

const STATUS_STYLES = {
  Active: "bg-[#e1f5ec] text-[#13774f]",
  Invited: "bg-[#fff2d7] text-[#996514]",
  Inactive: "bg-[#f3f6f8] text-[#637a8a]",
};

const ROLE_OPTIONS = ["Administrator", "Finance Manager", "Accounting"];
const TINTED_ROLES = new Set(["Administrator"]);

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

const nameOf = (u) => u.full_name ?? u.name ?? "";
const roleOf = (u) => u.role_name ?? u.role ?? "";

function exportCsv(rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["Name", "Email", "Role", "Status"].map(esc).join(","),
    ...rows.map((u) =>
      [nameOf(u), u.email, roleOf(u), u.status].map(esc).join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "workspace-members.csv";
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

export default function UsersRoles({
  users = [],
  month = CURRENT_MONTH,
  loading = false,
  error = null,
  onInviteUser,
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);

  const roles = useMemo(
    () => [...new Set([...ROLE_OPTIONS, ...users.map(roleOf).filter(Boolean)])],
    [users],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "All" && roleOf(u) !== roleFilter) return false;
      if (!q) return true;
      return (
        nameOf(u).toLowerCase().includes(q) ||
        String(u.email ?? "")
          .toLowerCase()
          .includes(q) ||
        roleOf(u).toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visible.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <main className="flex min-w-0 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
            FINANCE WORKSPACE / {month.toUpperCase()}
          </p>
          <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
            The right access for every role.
          </h1>
          <p className="text-xs leading-[18px] text-[#637a8a]">
            Define responsibilities across your finance workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onInviteUser?.()}
          className={`h-11 w-full self-center rounded-lg bg-[#3dc0f0] px-8 text-[13px] font-bold text-white transition-colors hover:bg-[#2fb0e0] sm:w-auto sm:self-auto ${FOCUS}`}
        >
          + Add user
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <h2 className="mr-2 text-[19px] font-bold leading-7 text-[#021820]">
            Workspace members
          </h2>

          <label className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
            <span className="sr-only">Search workspace members</span>
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
            <span className="sr-only">Filter by role</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 cursor-pointer appearance-none rounded-lg bg-[#e4f3fb] pl-3 pr-8 text-[13px] font-medium text-[#0a6fa6] outline-none focus-visible:ring-2 focus-visible:ring-[#0693c7]"
            >
              <option value="All">All records</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
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
                <th className="w-[15%] px-5 py-3">Name</th>
                <th className="w-[30%] px-4 py-3">Email</th>
                <th className="w-[15%] px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-14 text-center text-[#637a8a]"
                  >
                    Loading workspace members…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-14 text-center text-[#b0243f]"
                  >
                    Couldn’t load workspace members: {error}. Refresh the page
                    to try again.
                  </td>
                </tr>
              )}

              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-14 text-center text-[#637a8a]"
                  >
                    {users.length === 0
                      ? "No members yet. Invite a user to give them access to this workspace."
                      : "No members match your search. Clear the search or choose another role."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageRows.map((u, i) => (
                  <tr
                    key={u.id ?? `${u.email}-${pageStart + i}`}
                    className={`transition-colors ${
                      TINTED_ROLES.has(roleOf(u))
                        ? "bg-[#e9f4f9] hover:bg-[#e0eff6]"
                        : "bg-white hover:bg-[#f3f8fb]"
                    }`}
                  >
                    <td className="px-5 py-5 font-bold text-[#0693c7]">
                      {nameOf(u)}
                    </td>
                    <td className="px-4 py-5 text-[#021820]">{u.email}</td>
                    <td className="px-4 py-5 text-[#021820]">{roleOf(u)}</td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-block min-w-[112px] rounded-md px-3 py-1.5 text-center text-xs font-medium ${
                          STATUS_STYLES[u.status] ||
                          "bg-[#f3f6f8] text-[#637a8a]"
                        }`}
                      >
                        {u.status}
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
              ? "0 members"
              : `Showing ${pageStart + 1}–${pageStart + pageRows.length} of ${plural(visible.length, "member")}`}
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
