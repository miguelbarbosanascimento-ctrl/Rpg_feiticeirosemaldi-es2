import { useListCharacters, useGetDashboardSummary } from "@workspace/api-client-react";
import type { CharacterSummary } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, Users, Activity, TrendingUp, BookOpen, Sparkles, Flame, Eye, Heart, Zap, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: characters, isLoading: isCharactersLoading } = useListCharacters();

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-primary/[0.06] to-background p-6 md:p-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-50" style={{ background: "radial-gradient(circle, hsl(265 85% 50% / 0.45), transparent 70%)" }} />
          <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: "radial-gradient(circle, hsl(355 80% 45% / 0.35), transparent 70%)" }} />
          <div aria-hidden className="absolute inset-y-0 right-4 md:right-12 flex items-center select-none font-jp font-black leading-none text-[22vw] md:text-[14vw] opacity-[0.05]" style={{ color: "hsl(265 85% 70%)" }}>術</div>
          <div className="absolute inset-x-0 h-px" style={{ top: "30%", background: "linear-gradient(90deg, transparent, hsl(265 100% 70% / 0.4), transparent)" }} />
        </div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-jp text-xs tracking-[0.5em] text-primary/80">術師名簿</span>
              <span className="h-px w-12 bg-gradient-to-r from-primary/60 to-transparent" />
              <Eye className="h-3 w-3 text-primary/70" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-wider text-cursed animate-title-flicker">CENTRAL DO NARRADOR</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl">Visão geral das maldições e feiticeiros sob seu domínio. Vigie a energia. Comande a sala.</p>
          </div>
          <Link href="/fichas/nova">
            <span className="group relative inline-flex items-center gap-2 h-12 px-7 rounded-md font-display tracking-wider text-white cursor-pointer bg-gradient-to-r from-primary via-purple-600 to-destructive border border-primary/60 shadow-[0_0_28px_hsl(265_85%_62%_/_0.5),inset_0_0_18px_hsl(265_85%_62%_/_0.3)] hover:shadow-[0_0_44px_hsl(265_85%_62%_/_0.85),inset_0_0_24px_hsl(355_80%_52%_/_0.35)] transition-all duration-300 overflow-hidden">
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)] bg-[length:200%_100%] group-hover:bg-[position:-100%_0] duration-700" />
              <PlusCircle className="relative h-5 w-5" />
              <span className="relative">Forjar Feiticeiro</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} title="Total de Fichas" jp="数" value={summary?.totalCharacters ?? 0} loading={isSummaryLoading} accent="violet" />
        <StatCard icon={<BookOpen className="h-5 w-5" />} title="Técnicas Registradas" jp="術" value={summary?.totalTechniques ?? 0} loading={isSummaryLoading} accent="cyan" />
        <StatCard icon={<Activity className="h-5 w-5" />} title="Nível Médio" jp="平均" value={summary?.averageLevel?.toFixed(1) ?? "0.0"} loading={isSummaryLoading} accent="violet" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} title="Nível Máximo" jp="最大" value={summary?.highestLevel ?? 0} loading={isSummaryLoading} accent="red" />
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3 border-b border-primary/15 pb-3">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="font-display text-xl md:text-2xl tracking-wider">FICHAS ATIVAS</h2>
            <span className="font-jp text-xs tracking-[0.4em] text-muted-foreground/50 hidden md:inline">活動中</span>
          </div>
          {characters && characters.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">{characters.length} {characters.length === 1 ? "feiticeiro" : "feiticeiros"}</span>
          )}
        </div>
        {isCharactersLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-5">
                <Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2 mb-4" /><Skeleton className="h-2 w-full mb-2" /><Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : characters && characters.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((char) => <CharacterPosterCard key={char.id} char={char} />)}
          </div>
        ) : (
          <div className="relative glass rounded-xl p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-destructive/5 pointer-events-none" />
            <div aria-hidden className="absolute inset-0 flex items-center justify-center select-none font-jp font-black leading-none text-[12rem] opacity-[0.04]" style={{ color: "hsl(265 85% 70%)" }}>空</div>
            <div className="relative">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full border-2 border-primary/40 flex items-center justify-center bg-primary/5 animate-pulse-glow">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display tracking-wider text-lg">Nenhum feiticeiro encontrado... ainda.</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 mb-6">A energia amaldiçoada está calma. Forje sua primeira ficha e comece a campanha.</p>
              <Link href="/fichas/nova">
                <Button className="gap-2 bg-primary hover:bg-primary/90 glow-violet-sm font-display tracking-wider px-6">
                  <PlusCircle className="h-4 w-4" /> Criar Personagem
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function CharacterPosterCard({ char }: { char: CharacterSummary }) {
  const initial = char.name.charAt(0).toUpperCase();
  const hp = char.hp ?? 0;
  const maxHp = char.maxHp || 1;
  const energy = char.energy ?? 0;
  const maxEnergy = char.maxEnergy || 1;
  const hpPct = Math.min(100, (hp / maxHp) * 100);
  const enPct = Math.min(100, (energy / maxEnergy) * 100);
  const hpOver = hp > maxHp;
  const enOver = energy > maxEnergy;

  return (
    <Link href={`/fichas/${char.id}`} className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      <article className="group relative h-full rounded-xl overflow-hidden border border-border/40 hover:border-primary/60 transition-all duration-500 cursor-pointer bg-gradient-to-b from-background/90 to-background hover:shadow-[0_0_40px_hsl(265_85%_50%_/_0.35)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary/25 via-background to-destructive/20">
          {char.photoUrl ? (
            <img src={char.photoUrl} alt={char.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-black text-[12rem] leading-none text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(180deg, hsl(265 85% 70%) 0%, hsl(280 70% 40%) 50%, hsl(355 75% 35%) 100%)", filter: "drop-shadow(0 0 25px hsl(265 85% 50% / 0.4))" }}>{initial}</span>
              <span aria-hidden className="absolute inset-0 flex items-center justify-center font-jp font-black text-[18rem] leading-none opacity-[0.05] text-primary select-none">術</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/10 pointer-events-none" />
          <div aria-hidden className="absolute inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ top: "50%", background: "linear-gradient(90deg, transparent, hsl(265 100% 70% / 0.7), transparent)", boxShadow: "0 0 12px hsl(265 100% 70% / 0.6)" }} />
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-background/70 backdrop-blur-sm px-2 py-1 shadow-[0_0_12px_hsl(265_85%_50%_/_0.3)]">
              <span className="font-jp text-[10px] text-primary/80 tracking-widest">階級</span>
              <span className="font-display text-[11px] tracking-wider text-primary uppercase">{char.grade}</span>
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <div className="relative h-12 w-12 rounded-full border-2 border-primary/60 bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-[0_0_18px_hsl(265_85%_50%_/_0.5)]">
              <div className="absolute inset-0 rounded-full blur-md bg-primary/40 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center leading-none">
                <div className="font-jp text-[8px] text-primary/70 tracking-widest">Nv</div>
                <div className="font-display text-base font-bold text-white tabular-nums">{char.level}</div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 right-3 font-jp text-[10px] tracking-[0.5em] text-primary/40 pointer-events-none">術師</div>
          <div className="absolute inset-x-0 bottom-0 p-4 pt-10">
            <h3 className="font-display tracking-wide text-lg md:text-xl font-bold text-white truncate group-hover:text-primary transition-colors drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{char.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-[10px] uppercase tracking-[0.2em] text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
              <span className="text-primary font-semibold">{char.origin}</span>
              <span className="text-white/40">·</span>
              <span>{char.specialization}</span>
            </div>
          </div>
        </div>
        <div className="relative p-4 border-t border-primary/15 bg-background/60">
          <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-2.5">
            <PosterBar icon={<Heart className="h-3 w-3" />} label="PV" cur={hp} max={maxHp} pct={hpPct} over={hpOver} color="hsl(355 80% 55%)" />
            <PosterBar icon={<Zap className="h-3 w-3" />} label="PE" cur={energy} max={maxEnergy} pct={enPct} over={enOver} color="hsl(265 85% 62%)" />
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[10px] tracking-wider">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="h-3 w-3 text-primary/60" />
              <span className="font-mono tabular-nums text-foreground/80">CA {char.armorClass ?? "—"}</span>
            </div>
            <span className="font-jp text-primary/50 tracking-[0.3em]">開く</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PosterBar({ icon, label, cur, max, pct, over, color }: { icon: React.ReactNode; label: string; cur: number; max: number; pct: number; over: boolean; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 font-bold tracking-widest" style={{ color }}>{icon}{label}</span>
        <span className={`font-mono tabular-nums ${over ? "text-amber-300" : "text-muted-foreground"}`}>
          {cur}<span className="text-muted-foreground/40">/{max}</span>
          {over && <span className="ml-1 text-amber-400">+{cur - max}</span>}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full border border-border/40 bg-background/60">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 10px ${color}99` }} />
        {over && <div className="absolute inset-0 rounded-full opacity-60 animate-pulse" style={{ boxShadow: `inset 0 0 6px hsl(45 95% 60%)` }} />}
      </div>
    </div>
  );
}

function StatCard({ icon, title, jp, value, loading, accent }: { icon: React.ReactNode; title: string; jp: string; value: number | string; loading: boolean; accent: "violet" | "cyan" | "red" }) {
  const color = { violet: "hsl(265 85% 62%)", cyan: "hsl(200 90% 55%)", red: "hsl(355 80% 52%)" }[accent];
  return (
    <div className="group relative glass rounded-xl p-5 hover-lift overflow-hidden border border-border/40 hover:border-primary/40 transition-all">
      <div className="absolute -top-14 -right-14 w-36 h-36 rounded-full blur-3xl opacity-25 group-hover:opacity-70 transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div aria-hidden className="absolute -bottom-3 -right-1 font-jp font-black leading-none text-[5rem] opacity-[0.06] select-none pointer-events-none" style={{ color }}>{jp}</div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-md flex items-center justify-center border group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${color}33, transparent)`, borderColor: `${color}55`, color, boxShadow: `0 0 18px ${color}33` }}>{icon}</div>
          <span className="font-jp text-[10px] tracking-[0.4em] text-muted-foreground/60">{jp}</span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">{title}</p>
        {loading ? <Skeleton className="h-9 w-20" /> : (
          <div className="font-display text-4xl font-bold tabular-nums" style={{ color, textShadow: `0 0 22px ${color}55` }}>{value}</div>
        )}
      </div>
    </div>
  );
}
