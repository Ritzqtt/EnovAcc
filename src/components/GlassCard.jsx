const tones = {
  card: 'border-white/45 bg-white/[0.12]',
  panel: 'border-white/35 bg-white/[0.05]',
}

/**
 * Reusable frosted-glass surface.
 * Size, radius, blur and spacing are supplied by the consumer.
 */
export default function GlassCard({
  children,
  className = '',
  tone = 'card',
  ...props
}) {
  return (
    <div
      className={`border ${tones[tone] ?? tones.card} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
