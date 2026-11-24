import logoUrl from '../assets/logo.png'

/**
 * Oversized EnovAcc mark used as the shared hero watermark. It is mounted once
 * inside the persistent blue panel, so it never remounts or flickers while the
 * panel contracts/expands between landing and login.
 */
export default function BackgroundArrows() {
  return (
    <>
      <link rel="preload" as="image" href={logoUrl} fetchPriority="high" />
      <img
        src={logoUrl}
        alt=""
        aria-hidden="true"
        draggable="false"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="auth-watermark select-none"
      />
    </>
  )
}
