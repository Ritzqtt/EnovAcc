/**
 * Oversized EnovAcc mark used as the hero watermark. The white-filtered
 * logo is cropped by the hero edges and sits behind the floating cards.
 */
export default function BackgroundArrows({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      <img
        src="/logo.png"
        alt=""
        draggable="false"
        className="hero-watermark select-none"
      />
    </div>
  )
}
