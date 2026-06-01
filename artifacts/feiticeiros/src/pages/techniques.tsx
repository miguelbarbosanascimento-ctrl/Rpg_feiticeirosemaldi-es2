import { useState } from "react";
import { useListTechniques, useCreateTechnique } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, BookOpen, Zap } from "lucide-react";

const CATEGORIES = ["Todas", "Técnica Inata", "Técnica Herdada", "Técnica Especial", "Técnica Original"];
const CATEGORY_COLORS: Record<string, string> = {
  "Técnica Inata": "text-purple-400 border-purple-400/30 bg-purple-400/10",
  "Técnica Herdada": "text-blue-400 border-blue-400/30 bg-blue-400/10",
  "Técnica Especial": "text-amber-400 border-amber-400/30 bg-amber-400/10",
  "Técnica Original": "text-green-400 border-green-400/30 bg-green-400/10",
};

export default function Techniques() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [selected, setSelected] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const { data: techniques, isLoading, refetch } = useListTechniques(
    category !== "Todas" || search ? { search: search || undefined, category: category !== "Todas" ? category : undefined } : {}
  );

  const { mutate: createTechnique, isPending } = useCreateTechnique();
  const [newTech, setNewTech] = useState({ name: "", category: "Técnica Original", description: "", abilities: "" });

  function handleCreate() {
    if (!newTech.name.trim() || !newTech.description.trim()) { toast({ title: "Preencha nome e descrição.", variant: "destructive" }); return; }
    createTechnique(
      { data: { name: newTech.name, category: newTech.category, description: newTech.description, abilities: newTech.abilities || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Técnica criada!", description: `${newTech.name} foi adicionada à biblioteca.` });
          setNewTech({ name: "", category: "Técnica Original", description: "", abilities: "" });
          setOpenDialog(false);
          refetch();
        },
      }
    );
  }

  const selectedTech = techniques?.find((t) => t.id === selected);
  const abilities: unknown[] = (() => {
    if (!selectedTech?.abilities) return [];
    try {
      const parsed: unknown = JSON.parse(selectedTech.abilities);
      if (Array.isArray(parsed)) return parsed.filter((e) => e !== null && (typeof e === "string" || typeof e === "object"));
      if (typeof parsed === "string" && parsed.trim()) return [parsed];
      return [];
    } catch { return [selectedTech.abilities]; }
  })();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Técnicas</h1>
          <p className="text-muted-foreground mt-1">Técnicas amaldiçoadas da Enciclopédia Amaldiçoada e técnicas originais.</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Nova Técnica</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/60 max-w-lg">
            <DialogHeader><DialogTitle>Criar Técnica Original</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={newTech.name} onChange={(e) => setNewTech({ ...newTech, name: e.target.value })} className="bg-background/60" placeholder="Nome da técnica..." />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={newTech.category} onValueChange={(v) => setNewTech({ ...newTech, category: v })}>
                  <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.filter((c) => c !== "Todas").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Textarea value={newTech.description} onChange={(e) => setNewTech({ ...newTech, description: e.target.value })} className="bg-background/60 resize-none h-24" placeholder="Como a técnica funciona?" />
              </div>
              <div className="space-y-1.5">
                <Label>Habilidades (separadas por vírgula)</Label>
                <Input value={newTech.abilities} onChange={(e) => setNewTech({ ...newTech, abilities: e.target.value })} className="bg-background/60" placeholder="Habilidade 1, Habilidade 2..." />
              </div>
              <Button onClick={handleCreate} disabled={isPending} className="w-full">{isPending ? "Salvando..." : "Criar Técnica"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar técnica..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${category === c ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/30"}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : techniques && techniques.length > 0 ? (
            techniques.map((t) => (
              <button key={t.id} onClick={() => setSelected(t.id)} className={`w-full p-3 rounded-lg border text-left transition-all ${selected === t.id ? "border-primary bg-primary/10" : "border-border/40 bg-card/30 hover:border-primary/30"}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm">{t.name}</span>
                  {t.isCustom && <Badge variant="outline" className="text-xs shrink-0 text-green-400 border-green-400/30">Original</Badge>}
                </div>
                <span className={`inline-block text-xs px-2 py-0.5 rounded border ${CATEGORY_COLORS[t.category] || "text-muted-foreground border-border/30"}`}>{t.category}</span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card/30 border-dashed border-border">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
              <p className="text-sm text-muted-foreground">Nenhuma técnica encontrada.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedTech ? (
            <Card className="border-border/50 bg-card/50 sticky top-24">
              <CardHeader className="border-b border-border/40">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{selectedTech.name}</CardTitle>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded border ${CATEGORY_COLORS[selectedTech.category] || "text-muted-foreground border-border/30"}`}>{selectedTech.category}</span>
                    {selectedTech.isCustom && <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">Original</Badge>}
                  </div>
                </div>
                {selectedTech.source && <p className="text-xs text-muted-foreground">Fonte: {selectedTech.source}</p>}
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Descrição</h4>
                  <p className="text-sm leading-relaxed">{selectedTech.description}</p>
                </div>
                {abilities.length > 0 && (
                  <>
                    <Separator className="border-border/40" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Habilidades / Ataques</h4>
                      <div className="space-y-3">
                        {abilities.map((ab: unknown, i: number) => {
                          if (typeof ab === "string") return (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                              <Zap className="h-3.5 w-3.5 text-primary shrink-0" /><span className="text-sm">{ab}</span>
                            </div>
                          );
                          const a = ab as { name?: string; damage?: string; energyCost?: number; description?: string };
                          return (
                            <div key={i} className="p-3 rounded-lg bg-gradient-to-br from-primary/10 via-primary/[0.03] to-transparent border border-primary/20 hover:border-primary/40 transition-colors">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Zap className="h-4 w-4 text-primary shrink-0" />
                                  <h5 className="font-display tracking-wide text-sm text-white truncate">{a.name}</h5>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {a.damage && <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-destructive/40 bg-destructive/10 text-red-300 uppercase tracking-wider">{a.damage}</span>}
                                  {typeof a.energyCost === "number" && <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 uppercase tracking-wider">{a.energyCost} PE</span>}
                                </div>
                              </div>
                              {a.description && <p className="text-xs leading-relaxed text-muted-foreground pl-6">{a.description}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center border rounded-lg bg-card/20 border-dashed border-border/40">
              <Zap className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-sm text-muted-foreground">Selecione uma técnica para ver os detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
