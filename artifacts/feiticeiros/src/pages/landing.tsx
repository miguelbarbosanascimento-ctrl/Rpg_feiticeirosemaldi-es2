import { Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  useListCharacters,
  useListTechniques,
  useListAptitudes,
} from "@workspace/api-client-react";
import { Show, useAuth } from "@clerk/react";
import {
  PlusCircle,
  Users,
  BookOpen,
  ScrollText,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Skull,
  LogIn,
  Eye,
  Flame,
  Swords,
} from "lucide-react";

const PHRASES = [
  "Da escuridão das emoções humanas, nasce a maldição.",
  "Apenas os feiticeiros podem ver e exorcizar as maldições.",
  "Domínio. Técnica. Sacrifício.",
  "A energia amaldiçoada flui em todos. Poucos a dominam.",
  "Onde há medo, há técnica. Onde há ódio, há poder.",
  "O domínio não se invoca. O domínio se impõe.",
];

const MARQUEE_TERMS = [
  "呪術", "領域展開", "縛り", "術式", "反転術式", "黒閃", "呪霊", "祓除",
  "Energia Amaldiçoada", "Expansão de Domínio", "Voto de Restrição",
  "Técnica Inata", "Reversão", "Flash Negro", "Exorcismo",
];

export default function Landing() {
  const { isSignedIn } = useAuth();
  const { data: characters } = useListCharacters(undefined, {
    query: { enabled: !!isSignedIn, queryKey: ["landing-characters", isSignedIn] },
  });
  const { data: techniquesData } = useListTechniques({}, {
    query: { queryKey: ["landing-techniques"] },
  });
  const { data: aptitudesData } = useListAptitudes(undefined, {
    query: { queryKey: ["landing-aptitudes"] },
  });

  const featured = (characters ?? []).slice(0, 3);
  const techCount = Array.isArray(techniquesData) ? techniquesData.length : 0;
  const aptCount = Array.isArray(aptitudesData) ? aptitudesData.length : 0;

  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % PHRASES.length), 6500);
    return () => clearInterval(t);
  }, []);
  const phrase = PHRASES[phraseIdx];

  return (
    <div className="space-y-24 md:space-y-32">
      <section className="relative -mt-6 md:-mt-10 pb-20 md:pb-28">
        <HeroBackdrop />
        <div className="relative z-10 flex flex-col items-center gap-7 max-w-5xl mx-auto text-center pt-10 md:pt-20">
          <CursedSeal />
          <div className="font-jp text-xs md:text-sm tracking-[0.7em] text-primary/85 text-glow-violet animate-flicker">
            呪術廻戦 — TTRPG
          </div>
          <h1 className="font-display font-bold leading-[1.02] tracking-wide">
            <span className="block text-[clamp(2.6rem,7.5vw,5.6rem)] text-cursed animate-title-flicker">FEITICEIROS</span>
            <span className="block text-[clamp(1.6rem,4.5vw,3.4rem)] mt-1">
              <span className="text-muted-foreground/60 mr-3 font-serif italic">&</span>
              <span className="text-destructive text-glow-red">MALDIÇÕES</span>
            </span>
          </h1>
          <div className="flex items-center gap-4 text-primary/70">
            <span className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-primary/50 to-primary/80" />
            <span className="relative">
              <Eye className="h-4 w-4 text-primary" />
              <span className="absolute inset-0 blur-md opacity-70"><Eye className="h-4 w-4 text-primary" /></span>
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-muted-foreground/80">Sistema Oficial de Fichas</span>
            <span className="relative">
              <Eye className="h-4 w-4 text-destructive" />
              <span className="absolute inset-0 blur-md opacity-70"><Eye className="h-4 w-4 text-destructive" /></span>
            </span>
            <span className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent via-destructive/50 to-destructive/80" />
          </div>
          <p key={phraseIdx} className="max-w-2xl text-base md:text-xl text-muted-foreground/90 italic font-serif animate-phrase min-h-[3rem] md:min-h-[3.5rem] px-4">
            &laquo;{phrase}&raquo;
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Show when="signed-out">
              <Link href="/sign-up">
                <CTASpan primary icon={<Sparkles className="h-5 w-5" />}>Forjar Pacto</CTASpan>
              </Link>
              <Link href="/sign-in">
                <CTASpan icon={<LogIn className="h-5 w-5" />}>Entrar</CTASpan>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/fichas/nova">
                <CTASpan primary icon={<PlusCircle className="h-5 w-5" />}>Criar Feiticeiro</CTASpan>
              </Link>
              <Link href="/dashboard">
                <CTASpan icon={<Users className="h-5 w-5" />}>Minhas Fichas</CTASpan>
              </Link>
            </Show>
            <Link href="/tecnicas">
              <Button size="lg" variant="ghost" className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 font-display tracking-wider px-6 h-12">
                <BookOpen className="h-5 w-5" /> Livro de Técnicas
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3 text-[11px] md:text-xs">
            <StatChip kanji="術" label="Técnicas" value={techCount || "—"} color="violet" />
            <StatChip kanji="能" label="Aptidões" value={aptCount || "—"} color="cyan" />
            <StatChip kanji="領" label="Domínios" value="∞" color="red" />
            <StatChip kanji="呪" label="Maldição" value="ATIVA" color="violet" />
          </div>
        </div>
      </section>

      <section className="-mt-12 md:-mt-16 relative">
        <div className="relative overflow-hidden border-y border-primary/15 bg-gradient-to-r from-background via-primary/[0.04] to-background py-3">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {[...MARQUEE_TERMS, ...MARQUEE_TERMS].map((t, i) => (
              <span key={i} className={`font-jp text-sm tracking-[0.4em] ${i % 3 === 0 ? "text-primary/70" : i % 3 === 1 ? "text-destructive/60" : "text-muted-foreground/60"}`}>
                {t}<span className="ml-8 text-muted-foreground/30">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-2">
        <SectionHeader kanji="術式" title="O QUE O SISTEMA OFERECE" subtitle="Tudo o que um feiticeiro precisa, em uma ficha." />
        <div className="grid gap-5 md:grid-cols-3 mt-8">
          <FeatureCard icon={<Zap className="h-6 w-6" />} title="Técnica Amaldiçoada" jp="呪術" description="Técnicas inatas, herdadas, de barreira e expansões de domínio com efeito garantido." color="violet" />
          <FeatureCard icon={<Shield className="h-6 w-6" />} title="Atributos Automáticos" jp="能力" description="PV, PE, defesa, iniciativa e modificadores calculados em tempo real." color="cyan" />
          <FeatureCard icon={<Skull className="h-6 w-6" />} title="Mestre & Bestiário" jp="災禍" description="Catalogue maldições, monte campanhas e vincule jogadores aos seus arcos." color="red" />
        </div>
      </section>

      <Show when="signed-in">
        <section className="space-y-6 max-w-6xl mx-auto px-2">
          <div className="flex items-end justify-between gap-4 border-b border-primary/15 pb-3">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="font-display text-xl md:text-2xl tracking-wider">SEUS FEITICEIROS</h2>
              <span className="font-jp text-xs tracking-[0.4em] text-muted-foreground/50 hidden md:inline">術師</span>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5" />
              <div className="relative">
                <ScrollText className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                <h3 className="font-display tracking-wider text-lg">Nenhuma ficha ainda</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2 mb-5">A energia amaldiçoada está calma. Crie o primeiro feiticeiro para começar a campanha.</p>
                <Link href="/fichas/nova">
                  <Button className="gap-2 bg-primary hover:bg-primary/90 glow-violet-sm">
                    <PlusCircle className="h-4 w-4" /> Criar primeiro feiticeiro
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((char) => (
                <Link key={char.id} href={`/fichas/${char.id}`}>
                  <div className="group relative glass rounded-xl p-5 cursor-pointer hover-lift h-full overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity bg-primary" />
                    <div className="absolute top-3 right-3 text-[10px] font-jp text-primary/40 tracking-widest">術師</div>
                    <div className="relative flex items-start gap-3 mb-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/30 to-destructive/30 border-2 border-primary/40 flex items-center justify-center text-xl font-display font-bold text-white shrink-0 group-hover:shadow-[0_0_18px_hsl(265_85%_62%_/_0.65)] transition-all">
                        {char.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display tracking-wide text-base truncate group-hover:text-primary transition-colors">{char.name}</h3>
                        <p className="text-xs text-muted-foreground">Nv. {char.level} · {char.grade}</p>
                      </div>
                    </div>
                    <div className="relative flex flex-wrap gap-1.5 mb-3">
                      <Tag>{char.origin}</Tag>
                      <Tag>{char.specialization}</Tag>
                    </div>
                    <div className="relative space-y-2 text-[11px]">
                      <Bar label="PV" cur={char.hp || 0} max={char.maxHp || 1} color="hsl(355 80% 52%)" />
                      <Bar label="PE" cur={char.energy || 0} max={char.maxEnergy || 1} color="hsl(265 85% 62%)" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </Show>

      <Show when="signed-in">
        <section className="max-w-6xl mx-auto px-2">
          <div className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 via-background to-primary/10 p-8 md:p-10">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl bg-destructive/20" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl bg-primary/20" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="font-jp text-xs tracking-[0.5em] text-destructive/80 mb-2">術師領域</div>
                <h3 className="font-display text-2xl md:text-3xl tracking-wider mb-2">FERRAMENTAS DO MESTRE</h3>
                <p className="text-muted-foreground max-w-2xl">Catalogue maldições com ficha completa, monte campanhas, vincule jogadores e organize sessões.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/bosses">
                  <Button className="gap-2 bg-destructive/90 hover:bg-destructive text-white font-display tracking-wider px-5">
                    <Swords className="h-4 w-4" /> Bestiário
                  </Button>
                </Link>
                <Link href="/campanhas">
                  <Button variant="outline" className="gap-2 border-destructive/40 hover:border-destructive hover:bg-destructive/10 font-display tracking-wider px-5">
                    <ScrollText className="h-4 w-4" /> Campanhas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Show>

      <footer className="text-center py-12 border-t border-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="relative">
          <div className="font-jp text-2xl tracking-[0.6em] text-muted-foreground/40 mb-3">呪術廻戦</div>
          <p className="text-xs text-muted-foreground/60">
            Sistema &laquo;Feiticeiros & Maldições&raquo; por Setsugiri · Inspirado em Jujutsu Kaisen
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeroBackdrop() {
  const isCompact = typeof window !== "undefined" && window.matchMedia?.("(max-width: 768px)").matches;
  const count = isCompact ? 8 : 14;
  const embers = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const s = (n: number) => ((Math.sin((i + 1) * n * 12.9898) + 1) / 2);
      return { left: s(1.1) * 100, size: 2 + s(2.3) * 4, delay: s(3.7) * 12, duration: 16 + s(4.9) * 14, drift: -50 + s(5.3) * 100, op: 0.5 + s(6.7) * 0.45, hue: s(7.1) < 0.6 ? 265 : 355 };
    }), [count]);

  return (
    <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/3 left-0 w-[140%] h-[140%] animate-mist" style={{ background: "radial-gradient(ellipse 40% 30% at 30% 40%, hsl(265 85% 50% / 0.28), transparent 60%), radial-gradient(ellipse 35% 25% at 70% 60%, hsl(355 80% 45% / 0.2), transparent 65%)", filter: "blur(40px)" }} />
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none" aria-hidden>
        <svg viewBox="0 0 200 280" className="h-[85vh] md:h-[95vh] w-auto opacity-[0.07]" style={{ filter: "drop-shadow(0 0 60px hsl(265 85% 50% / 0.4))" }}>
          <defs>
            <linearGradient id="finger-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" /><stop offset="50%" stopColor="#7e22ce" /><stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id="wrap-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" /><stop offset="100%" stopColor="#7e22ce" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path d="M 100 20 C 78 22, 70 45, 72 75 L 70 130 C 68 165, 72 200, 80 235 C 84 255, 92 268, 100 270 C 108 268, 116 255, 120 235 C 128 200, 132 165, 130 130 L 128 75 C 130 45, 122 22, 100 20 Z" fill="url(#finger-grad)" stroke="#c084fc" strokeWidth="0.8" />
          <path d="M 86 30 C 90 24, 110 24, 114 30 L 112 52 C 108 56, 92 56, 88 52 Z" fill="#1e0033" opacity="0.8" />
          {[60, 85, 115, 145, 180, 215, 250].map((y, i) => (
            <path key={i} d={`M ${72 + (i % 2) * 2} ${y} Q 100 ${y + 6}, ${128 - (i % 2) * 2} ${y - 2}`} fill="none" stroke="url(#wrap-grad)" strokeWidth="2.2" opacity="0.75" />
          ))}
          <line x1="76" y1="105" x2="124" y2="105" stroke="#1e0033" strokeWidth="1" opacity="0.5" />
          <line x1="74" y1="160" x2="126" y2="160" stroke="#1e0033" strokeWidth="1" opacity="0.5" />
          <path d="M 80 260 Q 100 280 120 260" fill="none" stroke="#e11d48" strokeWidth="2" opacity="0.6" />
        </svg>
      </div>
      {embers.map((e, i) => (
        <span key={i} className="absolute bottom-0 rounded-full" style={{
          left: `${e.left}%`, width: `${e.size}px`, height: `${e.size}px`,
          background: `radial-gradient(circle, hsl(${e.hue} 95% 70% / 1) 0%, hsl(${e.hue} 95% 55% / 0.5) 60%, transparent 100%)`,
          boxShadow: `0 0 ${e.size * 4}px hsl(${e.hue} 95% 60% / 0.75)`,
          animation: `ember-rise ${e.duration}s linear ${e.delay}s infinite`,
          ["--e-x" as any]: `${e.drift}px`, ["--e-op" as any]: e.op,
        }} />
      ))}
      <div className="absolute inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(265 100% 70% / 0.5), transparent)", animation: "scan-line 9s ease-in-out infinite" }} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function CursedSeal() {
  const eyePositions = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    return { x: 100 + Math.cos(angle) * 62, y: 100 + Math.sin(angle) * 62, rot: i * 60 };
  });
  return (
    <div className="relative h-[200px] w-[200px] md:h-[240px] md:w-[240px] flex items-center justify-center">
      <div className="absolute inset-0 rounded-full blur-3xl bg-primary/35 animate-pulse-glow" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-slow-spin" aria-hidden>
        <defs>
          <linearGradient id="ring-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" /><stop offset="100%" stopColor="#e11d48" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="eye-iris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f5d0fe" stopOpacity="1" /><stop offset="35%" stopColor="#a855f7" stopOpacity="1" /><stop offset="100%" stopColor="#3b0764" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="eye-core" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" /><stop offset="20%" stopColor="#e9d5ff" stopOpacity="1" /><stop offset="60%" stopColor="#7e22ce" stopOpacity="1" /><stop offset="100%" stopColor="#1e0033" stopOpacity="1" />
          </radialGradient>
          <filter id="eye-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="url(#ring-a)" strokeWidth="1.2" strokeDasharray="2 8" opacity="0.85" />
        {[0, 90, 180, 270].map((a) => (<line key={a} x1="100" y1="2" x2="100" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.9" transform={`rotate(${a} 100 100)`} />))}
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-3 animate-slow-spin-rev" aria-hidden>
        <circle cx="100" cy="100" r="82" fill="none" stroke="hsl(265 85% 62% / 0.55)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="hsl(355 80% 55% / 0.35)" strokeWidth="0.6" strokeDasharray="4 6" />
        <polygon points="100,30 161,135 39,135" fill="none" stroke="hsl(265 90% 70% / 0.45)" strokeWidth="0.7" />
        <polygon points="100,170 39,65 161,65" fill="none" stroke="hsl(355 80% 60% / 0.35)" strokeWidth="0.7" />
        {[30, 90, 150, 210, 270, 330].map((a) => (
          <circle key={a} cx={100 + Math.cos((a - 90) * Math.PI / 180) * 82} cy={100 + Math.sin((a - 90) * Math.PI / 180) * 82} r="1.4" fill="#fbbf24" opacity="0.85" />
        ))}
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0" aria-hidden>
        {eyePositions.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`} filter="url(#eye-glow)">
            <ellipse cx="0" cy="0" rx="11" ry="5.5" fill="#0a0014" stroke="hsl(265 85% 62%)" strokeWidth="0.7" />
            <circle cx="0" cy="0" r="3.6" fill="url(#eye-iris)" />
            <circle cx="0" cy="0" r="1.2" fill="#fff" opacity="0.95" />
            <circle cx="-1.2" cy="-1.2" r="0.6" fill="#fff" opacity="0.8" />
          </g>
        ))}
      </svg>
      <div className="relative h-[44%] w-[44%] flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 drop-shadow-[0_0_18px_hsl(265_85%_55%_/_0.6)]" aria-hidden>
          <circle cx="50" cy="50" r="44" fill="url(#eye-core)" stroke="hsl(265 85% 62% / 0.7)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="hsl(280 90% 70% / 0.6)" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="hsl(280 90% 80% / 0.5)" strokeWidth="0.5" strokeDasharray="2 3" />
          <circle cx="50" cy="50" r="8" fill="#0a0014" />
          <circle cx="50" cy="50" r="3" fill="#fff" />
          <circle cx="46" cy="46" r="1.5" fill="#fff" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

type CTASpanProps = { children: React.ReactNode; icon: React.ReactNode; primary?: boolean };
const CTASpan = forwardRef<HTMLSpanElement, CTASpanProps>(function CTASpan({ children, icon, primary }, ref) {
  if (primary) {
    return (
      <span ref={ref} className="group relative inline-flex items-center gap-2 h-12 px-7 rounded-md font-display tracking-wider text-white bg-gradient-to-r from-primary via-purple-600 to-destructive border border-primary/60 shadow-[0_0_28px_hsl(265_85%_62%_/_0.5),inset_0_0_18px_hsl(265_85%_62%_/_0.3)] hover:shadow-[0_0_44px_hsl(265_85%_62%_/_0.85),inset_0_0_24px_hsl(355_80%_52%_/_0.35)] transition-all duration-300 overflow-hidden cursor-pointer">
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)] bg-[length:200%_100%] group-hover:bg-[position:-100%_0] duration-700" />
        <span className="relative flex items-center gap-2">{icon}{children}<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
      </span>
    );
  }
  return (
    <span ref={ref} className="group inline-flex items-center gap-2 h-12 px-6 rounded-md font-display tracking-wider text-foreground border border-primary/40 hover:border-primary/80 hover:bg-primary/10 transition-all cursor-pointer">
      {icon}{children}
    </span>
  );
});

function StatChip({ kanji, label, value, color }: { kanji: string; label: string; value: number | string; color: "violet" | "cyan" | "red" }) {
  const c = { violet: "hsl(265 85% 62%)", cyan: "hsl(200 90% 55%)", red: "hsl(355 80% 52%)" }[color];
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md" style={{ background: `linear-gradient(90deg, ${c}11, transparent)`, borderColor: `${c}55` }}>
      <span className="font-jp text-[11px]" style={{ color: c }}>{kanji}</span>
      <span className="text-muted-foreground uppercase tracking-[0.2em] text-[10px]">{label}</span>
      <span className="font-display font-bold tracking-wider" style={{ color: c }}>{value}</span>
    </div>
  );
}

function SectionHeader({ kanji, title, subtitle }: { kanji: string; title: string; subtitle: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="font-jp text-xs tracking-[0.6em] text-primary/70">{kanji}</div>
      <h2 className="font-display text-2xl md:text-3xl tracking-wider">{title}</h2>
      <p className="text-sm text-muted-foreground/80">{subtitle}</p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
        <span className="h-1 w-1 rounded-full bg-primary shadow-[0_0_10px_hsl(265_85%_62%)]" />
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, jp, description, color }: { icon: React.ReactNode; title: string; jp: string; description: string; color: "violet" | "cyan" | "red" }) {
  const ringColor = { violet: "hsl(265 85% 62%)", cyan: "hsl(200 90% 55%)", red: "hsl(355 80% 52%)" }[color];
  return (
    <div className="group relative glass rounded-xl p-6 hover-lift overflow-hidden transition-all hover:border-primary/50">
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-25 group-hover:opacity-70 transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${ringColor}, transparent 70%)` }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, transparent, ${ringColor}0a 50%, transparent)` }} />
      <div className="relative flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-lg flex items-center justify-center border group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${ringColor}33, transparent)`, borderColor: `${ringColor}66`, color: ringColor, boxShadow: `0 0 22px ${ringColor}55` }}>{icon}</div>
        <span className="font-jp text-xs tracking-[0.4em] text-muted-foreground/60">{jp}</span>
      </div>
      <h3 className="relative font-display tracking-wider text-base mb-2 text-foreground">{title}</h3>
      <p className="relative text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary/90">{children}</span>;
}

function Bar({ label, cur, max, color }: { label: string; cur: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (cur / Math.max(1, max)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-muted-foreground">
        <span className="font-bold tracking-wider" style={{ color }}>{label}</span>
        <span className="font-mono">{cur}/{max}</span>
      </div>
      <div className="h-1.5 w-full bg-background/60 overflow-hidden rounded-full border border-border/40">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 10px ${color}88` }} />
      </div>
    </div>
  );
}

void ArrowRight;
