import logoUrl from "../../assets/logo.png";

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
  );
}
