import { Link, useLocation } from "wouter";
import {
  Users,
  BookOpen,
  ScrollText,
  PlusCircle,
  Menu,
  Sparkles,
  Home,
  Cat,
  Target,
  Skull,
  Scroll,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ReactNode } from "react";
import { CursedBackground } from "./cursed-background";
import { CursedLogo } from "./cursed-logo";
import { DiceRoller } from "./dice-roller";
import { Show, useUser, useClerk } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Fichas", href: "/dashboard", icon: Users },
  { name: "Nova Ficha", href: "/fichas/nova", icon: PlusCircle },
  { name: "Técnicas", href: "/tecnicas", icon: BookOpen },
  { name: "Aptidões", href: "/aptidoes", icon: ScrollText },
  { name: "Shikigamis", href: "/shikigamis", icon: Cat },
  { name: "Domínios", href: "/dominios", icon: Target },
];

const masterNavigation = [
  { name: "Bosses", href: "/bosses", icon: Skull },
  { name: "Campanhas", href: "/campanhas", icon: Scroll },
];

function isRouteActive(location: string, href: string) {
  if (href === "/") return location === "/";
  return location === href || location.startsWith(href + "/");
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const renderNavItem = (item: { name: string; href: string; icon: typeof Home }, onSelect?: () => void, accent: "primary" | "destructive" = "primary") => {
    const isActive = isRouteActive(location, item.href);
    const activeBg = accent === "destructive"
      ? "text-white bg-gradient-to-r from-destructive/30 via-destructive/10 to-transparent border border-destructive/40 shadow-[0_0_18px_hsl(355_80%_52%_/_0.25)]"
      : "text-white bg-gradient-to-r from-primary/30 via-primary/10 to-transparent border border-primary/40 shadow-[0_0_18px_hsl(265_85%_62%_/_0.25)]";
    const idleBg = accent === "destructive"
      ? "text-muted-foreground hover:text-white hover:bg-destructive/5 border border-transparent hover:border-destructive/20"
      : "text-muted-foreground hover:text-white hover:bg-primary/5 border border-transparent hover:border-primary/20";
    const activeBar = accent === "destructive"
      ? "bg-gradient-to-b from-transparent via-destructive to-transparent shadow-[0_0_8px_hsl(355_80%_52%)]"
      : "bg-gradient-to-b from-transparent via-primary to-transparent shadow-[0_0_8px_hsl(265_85%_62%)]";
    const iconActive = accent === "destructive"
      ? "text-destructive drop-shadow-[0_0_6px_hsl(355_80%_52%)]"
      : "text-primary drop-shadow-[0_0_6px_hsl(265_85%_62%)]";
    const iconHover = accent === "destructive" ? "group-hover:text-destructive" : "group-hover:text-primary";
    return (
      <Link key={item.name} href={item.href} onClick={onSelect}>
        <span className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all cursor-pointer overflow-hidden ${isActive ? activeBg : idleBg}`}>
          {isActive && <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] ${activeBar}`} />}
          <item.icon className={`h-4 w-4 transition-all ${isActive ? iconActive : iconHover}`} />
          <span className="tracking-wide">{item.name}</span>
          {isActive && <Sparkles className={`ml-auto h-3 w-3 animate-pulse ${accent === "destructive" ? "text-destructive" : "text-primary"}`} />}
        </span>
      </Link>
    );
  };

  const NavItems = ({ onSelect }: { onSelect?: () => void }) => (
    <>
      {navigation.map((item) => renderNavItem(item, onSelect, "primary"))}
      <div className="mt-4 mb-1 px-3 flex items-center gap-2">
        <span className="font-jp text-[10px] tracking-[0.4em] text-destructive/70">術師</span>
        <span className="h-px flex-1 bg-destructive/20" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/80">Mestre</span>
      </div>
      {masterNavigation.map((item) => renderNavItem(item, onSelect, "destructive"))}
    </>
  );

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
      <CursedBackground />

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        {/* Top HUD bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-primary/15 glass px-4 sm:px-6">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden border-primary/30 bg-background/40 hover:bg-primary/10 hover:border-primary/50">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 glass-strong border-r border-primary/20">
              <Link href="/">
                <span className="flex items-center gap-2 cursor-pointer mb-8 mt-2">
                  <CursedLogo size={32} />
                  <div className="flex flex-col leading-tight">
                    <span className="font-display text-base font-bold text-cursed">Feiticeiros</span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">& Maldições</span>
                  </div>
                </span>
              </Link>
              <nav className="grid gap-1.5">
                <NavItems />
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/">
            <span className="flex items-center gap-3 cursor-pointer group">
              <span className="relative">
                <CursedLogo size={34} className="transition-transform duration-500 group-hover:rotate-180" />
              </span>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="font-display text-base font-bold tracking-wider text-cursed">
                  FEITICEIROS
                </span>
                <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                  & Maldições
                </span>
              </div>
            </span>
          </Link>

          {/* JP accent on the right */}
          <div className="ml-auto hidden sm:flex items-center gap-3 text-muted-foreground/60">
            <span className="font-jp text-xs tracking-widest">呪術師</span>
            <span className="h-4 w-px bg-primary/30" />
            <span className="text-[10px] uppercase tracking-[0.3em]">Sistema de Fichas</span>
          </div>

          <div className="ml-auto sm:ml-4 flex items-center">
            <AuthMenu />
          </div>
        </header>

        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="hidden w-60 border-r border-primary/15 glass md:flex md:flex-col">
            <nav className="grid gap-1.5 p-3 text-sm">
              <NavItems />
            </nav>
            <div className="mt-auto p-4 border-t border-primary/10">
              <div className="rounded-md glass p-3 text-[11px] leading-relaxed text-muted-foreground">
                <div className="font-jp text-primary mb-1 text-glow-violet">呪い</div>
                <p className="italic">
                  "A energia amaldiçoada nasce das emoções negativas dos humanos."
                </p>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto max-w-7xl animate-flicker">{children}</div>
          </main>
        </div>
      </div>

      <DiceRoller />
    </div>
  );
}

function AuthMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <>
      <Show when="signed-out">
        <Link href="/sign-in">
          <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-purple-700 hover:from-primary hover:to-purple-600 border border-primary/50 shadow-[0_0_14px_hsl(265_85%_62%_/_0.4)] text-white font-display tracking-wider">
            <LogIn className="h-4 w-4" />
            Entrar
          </Button>
        </Link>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md glass border border-primary/20">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/40 to-destructive/30 border border-primary/40 flex items-center justify-center text-xs font-display font-bold text-white">
              {(user?.firstName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0) || "F").toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground max-w-[150px] truncate">
              {user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Feiticeiro"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </Show>
    </>
  );
}

void UserIcon;
