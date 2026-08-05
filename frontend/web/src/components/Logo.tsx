interface Props {
  variant: 'brand' | 'aurora';
  size?: number;
}

/**
 * Animated lightning-bolt logo. SVG with a subtle gradient fill and gentle pulse glow.
 */
export function LogoMark({ variant = 'brand', size = 18 }: Props) {
  const gradientId = `logo-grad-${variant}`;
  const stop1 = variant === 'brand' ? '#10b981' : '#10b981';
  const stop2 = variant === 'brand' ? '#34d399' : '#0ea5e9';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-white"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="100%" stopColor={stop2} />
        </linearGradient>
      </defs>
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-brand to-emerald-400 shadow-lg shadow-brand/20" style={{ width: size, height: size }}>
        <LogoMark variant="brand" size={size * 0.55} />
      </div>
      <span className="text-xl font-bold tracking-tight text-white">UptimeMonitor</span>
    </div>
  );
}