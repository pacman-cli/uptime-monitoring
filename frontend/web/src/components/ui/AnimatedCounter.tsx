import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  /** Decimal places (default 0) */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Duration in ms (default 1800) */
  duration?: number;
}

/**
 * Reveals the number with eased count-up when scrolled into view.
 * Renders as a <span> with tabular-nums for crisp transitions.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  duration = 1800,
}: Props) {
  const { ref, value: val } = useCountUp(value, { duration });
  const formatted = val.toFixed(decimals);

  return (
    <span ref={ref} className={cn('counter-value inline-block', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
