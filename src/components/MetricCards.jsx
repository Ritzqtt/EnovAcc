export default function MetricCards({ items = [] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map(([label, value, note]) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-xl border border-[#dce5ea] bg-white p-5"
        >
          <p className="text-xs leading-[18px] text-[#637a8a]">{label}</p>
          <p className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold leading-[44px] text-[#021820]">
            {value}
          </p>
          <p className="text-xs leading-[18px] text-[#637a8a]">{note}</p>
        </div>
      ))}
    </div>
  );
}
