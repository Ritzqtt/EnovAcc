export default function Logo() {
  return (
    <a
      href="#top"
      aria-label="EnovAcc home"
      className="group inline-flex items-center gap-2 rounded-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-brand-ocean"
    >
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-7 w-7 shrink-0 select-none object-contain brightness-0 invert"
      />

      <span className="text-[24px] font-bold italic leading-none tracking-[-0.02em]">
        EnovAcc
      </span>
    </a>
  )
}
