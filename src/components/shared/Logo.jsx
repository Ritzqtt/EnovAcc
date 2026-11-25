import logoUrl from "../../assets/logo.png";

export default function Logo({
  href = "#top",
  onClick,
  className = "",
  style,
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={style}
      aria-label="EnovAcc home"
      className={`group inline-flex items-center gap-2 rounded-sm font-bold italic leading-none tracking-[-0.02em] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-brand-ocean ${className}`}
    >
      <img
        src={logoUrl}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-7 w-7 shrink-0 select-none object-contain brightness-0 invert"
      />

      <span className="leading-none">EnovAcc</span>
    </a>
  );
}
