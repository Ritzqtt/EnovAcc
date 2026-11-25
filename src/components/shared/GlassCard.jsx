const tones = {
  card: "border-white/45 bg-white/[0.12]",
  panel: "border-white/35 bg-white/[0.05]",
};

export default function GlassCard({
  children,
  className = "",
  tone = "card",
  ...props
}) {
  return (
    <div
      className={`border ${tones[tone] ?? tones.card} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
