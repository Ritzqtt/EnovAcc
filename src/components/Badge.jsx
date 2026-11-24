const BADGE_TONE = {
  Posted: "bg-[#e7f4ed] text-[#187854]",
  Matched: "bg-[#e7f4ed] text-[#187854]",
  Paid: "bg-[#e7f4ed] text-[#187854]",
  Active: "bg-[#e7f4ed] text-[#187854]",
  Pending: "bg-[#fff2d7] text-[#996514]",
  Outstanding: "bg-[#fff2d7] text-[#996514]",
  Unmatched: "bg-[#fff2d7] text-[#996514]",
  Inactive: "bg-[#f3f6f8] text-[#637a8a]",
};

/** Pill used for status columns and integration cards. */
export default function Badge({ label, wide = true }) {
  const tone = BADGE_TONE[label] ?? "bg-[#e9f4f8] text-[#0693c7]";
  return (
    <span
      className={`inline-flex h-7 items-center justify-center rounded-md px-2 text-xs ${
        wide ? "w-[112px]" : ""
      } ${tone}`}
    >
      {label}
    </span>
  );
}
