import { useState } from "react";

const card = "rounded-xl border border-[#dce5ea] bg-white";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

/**
 * Tabbed financial statements.
 * tabs: [{ name, title, sub, rows: [[label, value, kind]], note?: { big, line1, line2 } }]
 * kind === "total" renders the highlighted total row.
 */
export default function ReportTabs({ company, tabs = [] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  if (!tab) return null;

  return (
    <>
      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.name}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`flex h-[42px] w-[175px] items-center justify-center rounded-lg text-[13px] font-bold leading-5 ${focusRing} ${
              i === active
                ? "bg-[#02355d] text-white"
                : "bg-white text-[#637a8a]"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <section
        role="tabpanel"
        className={`${card} flex flex-col gap-3 p-8`}
      >
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          {company}
        </p>
        <div>
          <h2 className="text-[19px] font-bold leading-7 text-[#021820]">
            {tab.title}
          </h2>
          <p className="text-xs leading-[18px] text-[#637a8a]">{tab.sub}</p>
        </div>
        <hr className="h-px w-full border-0 bg-[#dce5ea]" />

        {tab.rows.map(([label, value, kind]) =>
          kind === "total" ? (
            <div
              key={label}
              className="flex h-[52px] items-center justify-between gap-4 rounded-lg bg-[#e9f4f8] p-3 text-[13px] font-bold leading-5 text-[#021820]"
            >
              <p>{label}</p>
              <p>{value}</p>
            </div>
          ) : (
            <div
              key={label}
              className="flex h-10 items-center justify-between gap-4 text-sm leading-[22px] text-[#021820]"
            >
              <p>{label}</p>
              <p>{value}</p>
            </div>
          )
        )}

        {tab.note && (
          <div className="flex items-center gap-6 rounded-lg bg-gradient-to-r from-[#02355d] to-[#046fc3] p-5">
            <p className="text-4xl font-bold leading-[44px] text-white">
              {tab.note.big}
            </p>
            <div className="text-xs leading-[18px] text-[#a7bfce]">
              <p>{tab.note.line1}</p>
              <p>{tab.note.line2}</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
