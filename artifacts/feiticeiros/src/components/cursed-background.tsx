import { useMemo } from "react";

type Particle = {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
  hue: number;
};

export function CursedBackground({ density = 28 }: { density?: number }) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: density }, (_, i) => {
      const seed = (i + 1) * 9301;
      const r = (n: number) => ((Math.sin(seed * n) + 1) / 2);
      return {
        left: r(1.7) * 100,
        size: 2 + r(2.3) * 5,
        delay: r(3.1) * 18,
        duration: 14 + r(4.7) * 16,
        drift: -60 + r(5.9) * 120,
        opacity: 0.25 + r(6.3) * 0.55,
        hue: r(7.7) < 0.55 ? 265 : r(7.7) < 0.85 ? 280 : 355,
      };
    });
  }, [density]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-cursed-grid opacity-30" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 25%, transparent 0%, hsl(260 30% 3% / 0.55) 75%, hsl(260 40% 2%) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "256px 256px",
        }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-[-10vh] rounded-full"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, hsl(${p.hue} 90% 65% / 1) 0%, hsl(${p.hue} 90% 55% / 0.4) 60%, transparent 100%)`,
            boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue} 90% 60% / 0.45)`,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            ["--p-drift" as any]: `${p.drift}px`,
            ["--p-opacity" as any]: p.opacity * 0.85,
          }}
        />
      ))}
      <div
        className="absolute -left-40 top-1/3 w-[480px] h-[480px] rounded-full blur-[100px] animate-domain"
        style={{ background: "radial-gradient(circle, hsl(265 85% 50% / 0.30), transparent 70%)" }}
      />
      <div
        className="absolute -right-40 bottom-0 w-[520px] h-[520px] rounded-full blur-[110px] animate-domain"
        style={{ background: "radial-gradient(circle, hsl(355 80% 45% / 0.22), transparent 70%)", animationDelay: "2s" }}
      />
      <div
        className="absolute -top-64 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[90px] animate-domain"
        style={{ background: "radial-gradient(ellipse, hsl(275 90% 55% / 0.18), transparent 65%)", animationDelay: "4s" }}
      />
    </div>
  );
}
