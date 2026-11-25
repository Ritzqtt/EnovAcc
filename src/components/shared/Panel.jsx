const card = "rounded-xl border border-[#dce5ea] bg-white";
const btnSecondary =
  "flex h-11 items-center justify-center rounded-lg border border-[#dce5ea] bg-white px-4 text-[13px] font-bold leading-5 text-[#02355d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]";

function Panel({ panel }) {
  if (panel.type === "list")
    return (
      <div className={`${card} flex flex-col gap-4 p-6`}>
        <div>
          <h2 className="text-[19px] font-bold leading-7 text-[#021820]">
            {panel.title}
          </h2>
          <p className="text-xs leading-[18px] text-[#637a8a]">
            {panel.subtitle}
          </p>
        </div>
        {panel.items.map(([label, value]) => (
          <div
            key={label}
            className="flex h-10 items-center justify-between gap-4 text-sm leading-[22px] text-[#021820]"
          >
            <p>{label}</p>
            <p>{value}</p>
          </div>
        ))}
      </div>
    );

  if (panel.type === "highlight")
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-[#02355d] p-6 font-bold text-white">
        <p className="text-[10px] leading-4 text-[#a7bfce]">{panel.kicker}</p>
        <p className="text-[19px] leading-7">{panel.title}</p>
        <p className="text-4xl leading-[44px]">{panel.value}</p>
        <p className="text-xs font-normal leading-[18px] text-[#a7bfce]">
          {panel.note}
        </p>
        <button type="button" className={`${btnSecondary} w-[185px]`}>
          {panel.button}
        </button>
      </div>
    );

  if (panel.type === "calc")
    return (
      <div className={`${card} flex flex-col gap-4 p-6`}>
        <h2 className="text-[19px] font-bold leading-7 text-[#021820]">
          {panel.title}
        </h2>
        {panel.rows.map(([label, value]) => (
          <div
            key={label}
            className="flex h-10 items-center justify-between gap-4 text-sm leading-[22px] text-[#021820]"
          >
            <p>{label}</p>
            <p>{value}</p>
          </div>
        ))}
        <div className="flex h-[52px] items-center justify-between gap-4 rounded-lg bg-[#e9f4f8] p-3 text-[13px] font-bold leading-5 text-[#021820]">
          <p>{panel.total[0]}</p>
          <p>{panel.total[1]}</p>
        </div>
      </div>
    );

  if (panel.type === "notice")
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-[#e9f4f8] p-5">
        <p className="text-[13px] font-bold leading-5 text-[#0693c7]">
          {panel.title}
        </p>
        <p className="text-xs leading-[18px] text-[#637a8a]">{panel.text}</p>
      </div>
    );

  return null;
}

export default function PanelGroup({ panels = [] }) {
  const twoUp = panels.length > 1 && panels.every((p) => p.type !== "notice");

  return (
    <div
      className={
        twoUp ? "grid items-start gap-6 lg:grid-cols-2" : "flex flex-col gap-6"
      }
    >
      {panels.map((p, i) => (
        <Panel key={i} panel={p} />
      ))}
    </div>
  );
}
