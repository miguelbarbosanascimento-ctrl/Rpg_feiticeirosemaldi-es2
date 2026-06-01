import { useState } from "react";
import { useListShikigamis, useCreateShikigami, useDeleteShikigami, getListShikigamisQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Cat, Heart, Zap, Sparkles } from "lucide-react";

const TYPES = ["Comum", "Especial", "Herdado", "Personalizado"];
const RANKS = ["E", "D", "C", "B", "A", "S", "Especial"];
const RANK_COLOR: Record<string, string> = {
  E: "hsl(0 0% 50%)", D: "hsl(200 60% 55%)", C: "hsl(160 60% 50%)",
  B: "hsl(45 80% 55%)", A: "hsl(20 85% 55%)", S: "hsl(355 80% 52%)", Especial: "hsl(265 85% 62%)",
};

export default function ShikigamisPage() {
  const { data, isLoading } = useListShikigamis();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", appearance: "", type: "Comum", rank: "C", hp: 10, energy: 10, abilities: "", techniques: "", relationship: "" });

  const { mutate: create, isPending: creating } = useCreateShikigami({
    mutation: {
      onSuccess: () => {
        toast({ title: "Shikigami invocado." });
        qc.invalidateQueries({ queryKey: getListShikigamisQueryKey() });
        setOpen(false);
        setForm({ name: "", appearance: "", type: "Comum", rank: "C", hp: 10, energy: 10, abilities: "", techniques: "", relationship: "" });
      },
      onError: () => toast({ title: "Erro ao criar shikigami", variant: "destructive" }),
    },
  });

  const { mutate: remove } = useDeleteShikigami({
    mutation: {
      onSuccess: () => { toast({ title: "Shikigami dispersado." }); qc.invalidateQueries({ queryKey: getListShikigamisQueryKey() }); },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-jp text-xs tracking-[0.4em] text-primary/70">式神</span>
            <span className="h-px w-12 bg-primary/30" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider text-cursed">SHIKIGAMIS</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl">Invocações vinculadas ao usuário. Criaturas de energia amaldiçoada que servem ao feiticeiro através de pactos e técnicas herdadas.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-purple-700 hover:to-purple-600 border border-primary/50 shadow-[0_0_20px_hsl(265_85%_62%_/_0.4)] font-display tracking-wider">
              <Plus className="h-4 w-4" /> Invocar Shikigami
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-primary/30 max-w-lg">
            <DialogHeader><DialogTitle className="font-display tracking-wider text-cursed">NOVA INVOCAÇÃO</DialogTitle></DialogHeader>
            <div className="grid gap-3 mt-2">
              <Field label="Nome"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Mahoraga, Nue, Sapo Gigante..." className="bg-background/60" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Grau">
                  <Select value={form.rank} onValueChange={(v) => setForm({ ...form, rank: v })}>
                    <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                    <SelectContent>{RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="PV"><Input type="number" min={1} value={form.hp} onChange={(e) => setForm({ ...form, hp: Number(e.target.value) })} className="bg-background/60" /></Field>
                <Field label="PE"><Input type="number" min={0} value={form.energy} onChange={(e) => setForm({ ...form, energy: Number(e.target.value) })} className="bg-background/60" /></Field>
              </div>
              <Field label="Aparência"><Textarea rows={2} value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} placeholder="Descreva a forma física da invocação..." className="bg-background/60 resize-none" /></Field>
              <Field label="Habilidades"><Textarea rows={2} value={form.abilities} onChange={(e) => setForm({ ...form, abilities: e.target.value })} placeholder="Adaptação, Voo, Devoração de Cadáveres..." className="bg-background/60 resize-none" /></Field>
              <Field label="Técnicas próprias"><Textarea rows={2} value={form.techniques} onChange={(e) => setForm({ ...form, techniques: e.target.value })} placeholder="Ataques amaldiçoados, golpes especiais..." className="bg-background/60 resize-none" /></Field>
              <Field label="Vínculo com o feiticeiro"><Input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="Ex: Servo eterno, pacto de sangue..." className="bg-background/60" /></Field>
              <Button onClick={() => create({ data: { ...form, appearance: form.appearance || undefined, abilities: form.abilities || undefined, techniques: form.techniques || undefined, relationship: form.relationship || undefined } })} disabled={creating || !form.name} className="bg-primary hover:bg-primary/90 mt-2 font-display tracking-wider">
                {creating ? "Invocando..." : "Selar Invocação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => {
            const color = RANK_COLOR[s.rank] ?? "hsl(265 85% 62%)";
            return (
              <div key={s.id} className="group relative glass rounded-xl p-5 hover-lift overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-lg border flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}33, transparent)`, borderColor: `${color}55`, color }}>
                        <Cat className="h-5 w-5" />
                      </div>
                      <div><h3 className="font-display tracking-wide">{s.name}</h3><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.type}</p></div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded border font-display tracking-widest" style={{ color, borderColor: `${color}66`, background: `${color}11` }}>{s.rank}</span>
                  </div>
                  {s.appearance && <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">"{s.appearance}"</p>}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-destructive/30 bg-destructive/5"><Heart className="h-3 w-3 text-destructive" /><span className="text-muted-foreground">PV</span><strong className="ml-auto text-destructive">{s.hp}</strong></div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-primary/30 bg-primary/5"><Zap className="h-3 w-3 text-primary" /><span className="text-muted-foreground">PE</span><strong className="ml-auto text-primary">{s.energy}</strong></div>
                  </div>
                  {s.abilities && <div className="mb-2"><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> Habilidades</p><p className="text-xs line-clamp-2">{s.abilities}</p></div>}
                  {s.techniques && <div className="mb-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Técnicas</p><p className="text-xs line-clamp-2">{s.techniques}</p></div>}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    {s.relationship ? <span className="text-[10px] text-muted-foreground italic truncate">{s.relationship}</span> : <span />}
                    <button onClick={() => remove({ id: s.id })} className="ml-auto text-muted-foreground hover:text-destructive transition-colors" title="Dispersar"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Cat className="h-12 w-12 text-primary/40 mx-auto mb-4" />
          <h3 className="font-display tracking-wider text-lg">Nenhum shikigami invocado</h3>
          <p className="text-sm text-muted-foreground mt-2">Sele seu primeiro pacto com uma criatura amaldiçoada.</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
