import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CharacterForm from "@/pages/character-form";
import CharacterSheet from "@/pages/character-sheet";
import Techniques from "@/pages/techniques";
import Aptitudes from "@/pages/aptitudes";
import Shikigamis from "@/pages/shikigamis";
import Domains from "@/pages/domains";
import Bosses from "@/pages/bosses";
import Campaigns from "@/pages/campaigns";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(265 85% 62%)",
    colorForeground: "hsl(0 0% 96%)",
    colorMutedForeground: "hsl(0 0% 65%)",
    colorDanger: "hsl(355 80% 52%)",
    colorBackground: "hsl(260 25% 8%)",
    colorInput: "hsl(260 25% 12%)",
    colorInputForeground: "hsl(0 0% 96%)",
    colorNeutral: "hsl(265 30% 30%)",
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card/95 backdrop-blur rounded-xl w-[440px] max-w-full overflow-hidden border border-primary/30 shadow-[0_0_60px_hsl(265_85%_62%_/_0.35)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-display text-2xl tracking-wider text-white",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-white",
    socialButtonsBlockButton: "border-primary/30 bg-background/40 hover:bg-primary/10 hover:border-primary/60 text-white",
    formFieldLabel: "text-foreground/90",
    formFieldInput: "bg-background/60 border-primary/20 text-foreground",
    formButtonPrimary: "bg-gradient-to-r from-primary to-purple-700 hover:from-primary hover:to-purple-600 border border-primary/50 shadow-[0_0_20px_hsl(265_85%_62%_/_0.5)] text-white font-display tracking-wider",
    footerActionLink: "text-primary hover:text-primary/80",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    dividerLine: "bg-primary/20",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-emerald-400",
    alert: "bg-destructive/10 border border-destructive/40",
    alertText: "text-destructive-foreground",
    otpCodeFieldInput: "bg-background/60 border-primary/20 text-foreground",
    logoBox: "justify-center mb-2",
    logoImage: "h-12 w-12",
    main: "gap-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(265_85%_62%_/_0.18),transparent_60%),radial-gradient(circle_at_70%_70%,hsl(355_80%_52%_/_0.12),transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(265_85%_62%)_1px,transparent_1px),linear-gradient(90deg,hsl(265_85%_62%)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(265_85%_62%_/_0.18),transparent_60%),radial-gradient(circle_at_70%_70%,hsl(355_80%_52%_/_0.12),transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(265_85%_62%)_1px,transparent_1px),linear-gradient(90deg,hsl(265_85%_62%)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/dashboard">
              <RequireAuth><Dashboard /></RequireAuth>
            </Route>
            <Route path="/fichas/nova">
              <RequireAuth><CharacterForm /></RequireAuth>
            </Route>
            <Route path="/fichas/:id">
              <RequireAuth><CharacterSheet /></RequireAuth>
            </Route>
            <Route path="/tecnicas" component={Techniques} />
            <Route path="/aptidoes" component={Aptitudes} />
            <Route path="/shikigamis">
              <RequireAuth><Shikigamis /></RequireAuth>
            </Route>
            <Route path="/dominios">
              <RequireAuth><Domains /></RequireAuth>
            </Route>
            <Route path="/bosses">
              <RequireAuth><Bosses /></RequireAuth>
            </Route>
            <Route path="/campanhas">
              <RequireAuth><Campaigns /></RequireAuth>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bem-vindo de volta, feiticeiro",
            subtitle: "Entre para acessar suas fichas",
          },
        },
        signUp: {
          start: {
            title: "Você quer fazer um vínculo?",
            subtitle: "Crie sua conta para começar",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <AppRoutes />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
