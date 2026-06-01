export function CursedLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="cursed-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="cursed-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" stroke="url(#cursed-line)" strokeWidth="1.5" opacity="0.7" />
      <circle cx="32" cy="32" r="24" stroke="url(#cursed-line)" strokeWidth="0.8" opacity="0.4" />
      <circle cx="32" cy="32" r="14" fill="url(#cursed-glow)" opacity="0.85" />
      <g stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" opacity="0.95">
        <line x1="32" y1="6" x2="32" y2="14" />
        <line x1="32" y1="50" x2="32" y2="58" />
        <line x1="6" y1="32" x2="14" y2="32" />
        <line x1="50" y1="32" x2="58" y2="32" />
      </g>
      <circle cx="32" cy="32" r="3" fill="#fff" />
      <circle cx="32" cy="32" r="1.4" fill="#7c1d6f" />
    </svg>
  );
}
