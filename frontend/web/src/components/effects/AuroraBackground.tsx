/**
 * Aurora background: animated radial gradient blobs + a faint drifting grid.
 * Pure CSS — zero JS cost. Respects reduced motion via globals.css overrides.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Animated gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-slate-900 to-background bg-[length:200%_200%] animate-gradient-shift opacity-80" />

      {/* Drifting grid */}
      <div className="absolute inset-0 bg-grid-faint bg-grid animate-grid-drift opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Aurora blob 1 — brand */}
      <div className="absolute -top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-brand/15 blur-3xl" />

      {/* Aurora blob 2 — sky */}
      <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-sky-500/15 blur-3xl" />

      {/* Aurora blob 3 — violet */}
      <div className="absolute bottom-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-violet-500/10 blur-3xl" />

      {/* Subtle noise grain for depth */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}