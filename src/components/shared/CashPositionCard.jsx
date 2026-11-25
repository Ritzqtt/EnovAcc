export default function CashPositionCard({
  amount = '₱50.67M',
  caption = 'Updated across operating accounts',
  className = '',
}) {
  return (
    <div
      className={`cash-card flex h-full w-full flex-col justify-between rounded-lg bg-white p-3 shadow-xl sm:p-[22px] ${className}`}
    >
      <p className="cash-label text-[8px] font-semibold uppercase leading-none tracking-[0.04em] text-[#0a85c0] sm:text-[9px]">
        Connected cash position
      </p>

      <div>
        <p className="cash-value text-[26px] font-bold leading-none tracking-[-0.01em] text-[#00305f] sm:text-[32px]">
          {amount}
        </p>
        <p className="cash-caption mt-1.5 text-[7.5px] leading-snug text-[#7a8794] sm:text-[9px]">
          {caption}
        </p>
      </div>
    </div>
  )
}
