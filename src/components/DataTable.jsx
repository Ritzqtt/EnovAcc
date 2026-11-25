import { useMemo, useState } from "react";
import { Icon } from "./AppShell";
import Badge from "./Badge";

const card = "rounded-xl border border-[#dce5ea] bg-white";
const btnSecondary =
  "flex h-11 items-center justify-center rounded-lg border border-[#dce5ea] bg-white px-4 text-[13px] font-bold leading-5 text-[#02355d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

export default function DataTable({
  title,
  filterBy = "",
  columns = [],
  rows = [],
  moduleLabel,
  onRowAction,
}) {
  const n = columns.length;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All records");

  const filterIdx = columns.findIndex(
    (c) => c[0].toLowerCase() === filterBy.toLowerCase(),
  );

  const options = useMemo(
    () => (filterIdx < 0 ? [] : [...new Set(rows.map((r) => r[filterIdx]))]),
    [rows, filterIdx],
  );

  const visible = rows.filter((r) => {
    const matchesFilter = filter === "All records" || r[filterIdx] === filter;
    const matchesQuery = r
      .slice(0, n)
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const gridStyle = {
    gridTemplateColumns: columns.map((c) => `minmax(0, ${c[1]}fr)`).join(" "),
  };

  function exportCsv() {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [
      columns.map((c) => esc(c[0])).join(","),
      ...visible.map((r) => r.slice(0, n).map(esc).join(",")),
    ];
    const blob = new Blob(["\ufeff" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={`${card} overflow-hidden`}>
      {}
      <div className="flex flex-wrap items-center gap-4 p-5">
        <h2 className="text-[19px] font-bold leading-7 text-[#021820]">
          {title}
        </h2>

        <label className="flex h-9 w-[368px] max-w-full items-center gap-2 rounded-lg bg-[#f3f6f8] px-2 text-[#637a8a] focus-within:outline focus-within:outline-2 focus-within:outline-[#0693c7]">
          <Icon name="search" className="h-4 w-4 shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records"
            aria-label={`Search ${title}`}
            className="w-full bg-transparent text-xs leading-[18px] text-[#021820] outline-none placeholder:text-[#637a8a]"
          />
        </label>

        {options.length > 0 && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label={`Filter by ${filterBy}`}
            className="h-7 cursor-pointer rounded-md bg-[#e9f4f8] px-2 text-xs text-[#0693c7] outline-none focus-visible:outline-2 focus-visible:outline-[#0693c7]"
          >
            <option>All records</option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={exportCsv}
          className={`${btnSecondary} w-[100px] px-0`}
        >
          Export
        </button>
      </div>

      {}
      <div className="overflow-x-auto">
        <div className="min-w-[880px]" role="table" aria-label={title}>
          <div
            role="row"
            style={gridStyle}
            className="grid gap-4 bg-[#f3f6f8] p-4 text-[10px] font-bold leading-4 text-[#637a8a]"
          >
            {columns.map(([name]) => (
              <p key={name} role="columnheader">
                {name}
              </p>
            ))}
          </div>

          {visible.map((r, i) => (
            <div
              key={`${r[0]}-${i}`}
              role="row"
              style={gridStyle}
              className={`grid min-h-[62px] items-center gap-4 p-4 ${
                r[n] ? "bg-[#e9f4f8]" : "bg-white"
              }`}
            >
              {columns.map(([name, , type], c) => {
                const value = r[c];
                if (type === "code")
                  return (
                    <p
                      key={name}
                      role="cell"
                      className="text-[13px] font-bold leading-5 text-[#0693c7]"
                    >
                      {value}
                    </p>
                  );
                if (type === "ref")
                  return (
                    <p
                      key={name}
                      role="cell"
                      className="text-xs leading-[18px] text-[#0693c7]"
                    >
                      {value}
                    </p>
                  );
                if (type === "badge")
                  return (
                    <div key={name} role="cell">
                      <Badge label={value} />
                    </div>
                  );
                if (type === "link")
                  return (
                    <div key={name} role="cell">
                      <button
                        type="button"
                        onClick={() =>
                          onRowAction?.(moduleLabel, r.slice(0, n))
                        }
                        className="text-left text-xs leading-[18px] text-[#0693c7] hover:underline"
                      >
                        {value}
                      </button>
                    </div>
                  );
                return (
                  <p
                    key={name}
                    role="cell"
                    className="text-xs leading-[18px] text-[#021820]"
                  >
                    {value}
                  </p>
                );
              })}
            </div>
          ))}

          {visible.length === 0 && (
            <p className="p-6 text-center text-xs text-[#637a8a]">
              No matching records.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 text-xs leading-[18px] text-[#637a8a]">
        <p>{`${visible.length} records · ${filter}`}</p>
        <p>Page 1 of 1</p>
      </div>
    </section>
  );
}
