import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { useMagnetic } from '@/hooks/useMagnetic';

interface Props {
  children: ReactNode;
  className?: string;
  strength?: number;
  range?: number;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  href?: string;
  type?: 'button' | 'submit';
  'aria-label'?: string;
  disabled?: boolean;
}

/**
 * Button wrapper with magnetic pull toward the cursor. Renders <a> if href, else <button>.
 * Skips effect on touch devices (handled inside useMagnetic).
 */
export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  range = 80,
  onClick,
  href,
  type = 'button',
  disabled,
  ...rest
}: Props) {
  const ref = useMagnetic(strength, range);
  const btnRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const spawnRipple = (e: MouseEvent<HTMLElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 650);
  };

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-white/30"
          style={{
            left: r.x - 1,
            top: r.y - 1,
            width: 2,
            height: 2,
            animation: 'magnetic-ripple 0.6s ease-out forwards',
          }}
        />
      ))}
    </>
  );

  const sharedProps = {
    className:
      'relative inline-flex items-center justify-center overflow-hidden will-change-transform ' +
      className,
    onMouseDown: spawnRipple,
    onClick,
  };

  if (href && !disabled) {
    return (
      <div ref={ref} className="inline-block will-change-transform">
        <a
          ref={(el) => {
            btnRef.current = el;
          }}
          href={href}
          {...sharedProps}
          {...rest}
        >
          {inner}
        </a>
      </div>
    );
  }

  return (
    <div ref={ref} className="inline-block will-change-transform">
      <button
        ref={(el) => {
          btnRef.current = el;
        }}
        type={type}
        disabled={disabled}
        {...sharedProps}
        {...rest}
      >
        {inner}
      </button>
    </div>
  );
}
