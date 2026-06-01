import { useState } from "react";
import { useListAptitudes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scroll, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  "Energia Amaldiçoada": { border: "border-violet-500/30", bg: "bg-violet-500/5", text: "text-violet-400", badge: "text-violet-400 border-violet-400/30 bg-violet-400/10" },
  "Controle e Leitura": { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", badge: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
  "Domínio": { border: "border-red-500/30", bg: "bg-red-500/5", text: "text-red-400", badge: "text-red-400 border-red-400/30 bg-red-400/10" },
  "Barreira": { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-400", badge: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  "Energia Reversa": { border: "border-green-500/30", bg: "bg-green-500/5", text: "text-green-400", badge: "text-green-400 border-green-400/30 bg-green-400/10" },
  "Especiais": { border: "border-pink-500/30", bg: "bg-pink-500/5", text: "text-pink-400", badge: "text-pink-400 border-pink-400/30 bg-pink-400/10" },
};

type Aptitude = { id: number; name: string; category: string; level: number; description: string; prerequisite?: string | null };

function AptitudeCard({ apt }: { apt: Aptitude }) {
  const [expanded, setExpanded] = useState(false);
  const colors = CATEGORY_COLORS[apt.category] || { border: "border-border/40", bg: "bg-card/20", text: "text-muted-foreground", badge: "text-muted-foreground border-border/40" };
  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} transition-all cursor-pointer`} onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center justify-between p-3 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${colors.border} ${colors.text}`}>{apt.level}</div>
          <span className="font-medium text-sm">{apt.name}</span>
          {apt.prerequisite && <span className="text-xs text-muted-foreground hidden sm:inline truncate">Req: {apt.prerequisite}</span>}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">{apt.description}</p>
          {apt.prerequisite && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="font-medium">Pré-requisito:</span><span>{apt.prerequisite}</span></div>}
        </div>
      )}
    </div>
  );
}

export default function Aptitudes() {
  const { data: aptitudes, isLoading } = useListAptitudes();
  const byCategory = aptitudes?.reduce((acc, apt) => {
    if (!acc[apt.category]) acc[apt.category] = [];
    acc[apt.category].push(apt);
    return acc;
  }, {} as Record<string, Aptitude[]>);

  const categoryOrder = ["Energia Amaldiçoada", "Controle e Leitura", "Domínio", "Barreira", "Energia Reversa", "Especiais"];
  const sorted = byCategory ? categoryOrder.filter((c) => byCategory[c]).map((c) => ({ category: c, apts: byCategory[c] })) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aptidões Amaldiçoadas</h1>
        <p className="text-muted-foreground mt-1">Catálogo de aptidões do sistema — clique em uma aptidão para ver os detalhes.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {categoryOrder.map((cat) => {
          const colors = CATEGORY_COLORS[cat];
          return <span key={cat} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colors?.badge}`}>{cat}</span>;
        })}
      </div>
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (<div key={i} className="space-y-3"><Skeleton className="h-6 w-48" /><div className="space-y-2">{[1, 2, 3].map((j) => <Skeleton key={j} className="h-12 rounded-lg" />)}</div></div>))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sorted.map(({ category, apts }) => {
            const colors = CATEGORY_COLORS[category] || { text: "text-muted-foreground" };
            return (
              <Card key={category} className="border-border/50 bg-card/30">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className={`text-base flex items-center gap-2 ${colors.text}`}>
                    <Scroll className="h-4 w-4" />{category}
                    <Badge variant="outline" className="ml-auto text-xs font-normal text-muted-foreground">{apts.length} aptidões</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  {apts.map((apt) => <AptitudeCard key={apt.id} apt={apt} />)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-card/20 border-dashed border-border">
          <Scroll className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhuma aptidão encontrada.</p>
          <p className="text-sm text-muted-foreground mt-1">As aptidões serão carregadas em breve.</p>
        </div>
      )}
    </div>
  );
}
