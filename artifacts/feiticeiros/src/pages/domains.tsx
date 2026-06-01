import { useState } from "react";
import { useListDomains, useCreateDomain, useDeleteDomain, getListDomainsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Target, Zap, Shield, Sparkles } from "lucide-react";

export default function DomainsPage() {
  const { data, isLoading } = useListDomains();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", appearance: "", barrier: "", guaranteedEffect: "", conditions: "", activationPhrase: "", buffs: "", debuffs: "", cost: 10 });

  const { mutate: create, isPending: creating } = useCreateDomain({
    mutation: {
      onSuccess: () => {
        toast({ title: "Domínio selado." });
        qc.invalidateQueries({ queryKey: getListDomainsQueryKey() });
        setOpen(false);
        setForm({ name: "", appearance: "", barrier: "", guaranteedEffect: "", conditions: "", activationPhrase: "", buffs: "", debuffs: "", cost: 10 });
      },
      onError: () => toast({ title: "Erro ao criar domínio", variant: "destructive" }),
    },
  });

  const { mutate: remove } = useDeleteDomain({
    mutation: {
      onSuccess: () => { toast({ title: "Domínio desfeito." }); qc.invalidateQueries({ queryKey: getListDomainsQueryKey() }); },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-jp text-xs tracking-[0.4em] text-primary/70">領域展開</span>
            <span className="h-px w-12 bg-primary/30" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider text-cursed">EXPANSÃO DE DOMÍNIO</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl">Manifestação suprema da técnica amaldiçoada. Uma barreira interna onde a técnica do feiticeiro torna-se absoluta.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-destructive to-red-700 hover:to-red-600 border border-destructive/50 shadow-[0_0_25px_hsl(355_80%_52%_/_0.5)] font-display tracking-wider">
              <Plus className="h-4 w-4" /> Forjar Domínio
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-destructive/30 max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display tracking-wider text-cursed">NOVA EXPANSÃO DE DOMÍNIO</DialogTitle></DialogHeader>
            <div className="grid gap-3 mt-2">
              <Field label="Nome do Domínio"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Santuário Maligno, Vazio Inviolável..." className="bg-background/60" /></Field>
              <Field label="Frase de Ativação"><Input value={form.activationPhrase} onChange={(e) => setForm({ ...form, activationPhrase: e.target.value })} placeholder="Ex: Expansão de Domínio: ..." className="bg-background/60 font-jp" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Custo de PE"><Input type="number" min={1} value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} className="bg-background/60" /></Field>
                <Field label="Aparência da Barreira"><Input value={form.barrier} onChange={(e) => setForm({ ...form, barrier: e.target.value })} placeholder="Cor, forma, símbolos..." className="bg-background/60" /></Field>
              </div>
              <Field label="Aparência Interna"><Textarea rows={2} value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} placeholder="O cenário dentro do domínio..." className="bg-background/60 resize-none" /></Field>
              <Field label="Efeito Garantido"><Textarea rows={2} value={form.guaranteedEffect} onChange={(e) => setForm({ ...form, guaranteedEffect: e.target.value })} placeholder="Ataque ou efeito que SEMPRE acerta dentro do domínio..." className="bg-background/60 resize-none" /></Field>
              <Field label="Condições / Restrições"><Textarea rows={2} value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="Limitações, votos, duração..." className="bg-background/60 resize-none" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bônus ao Usuário"><Textarea rows={2} value={form.buffs} onChange={(e) => setForm({ ...form, buffs: e.target.value })} placeholder="Buffs dentro do domínio..." className="bg-background/60 resize-none" /></Field>
                <Field label="Penalidade aos Inimigos"><Textarea rows={2} value={form.debuffs} onChange={(e) => setForm({ ...form, debuffs: e.target.value })} placeholder="Debuffs aplicados..." className="bg-background/60 resize-none" /></Field>
              </div>
              <Button onClick={() => create({ data: { ...form, appearance: form.appearance || undefined, barrier: form.barrier || undefined, guaranteedEffect: form.guaranteedEffect || undefined, conditions: form.conditions || undefined, activationPhrase: form.activationPhrase || undefined, buffs: form.buffs || undefined, debuffs: form.debuffs || undefined } })} disabled={creating || !form.name} className="bg-destructive hover:bg-destructive/90 mt-2 font-display tracking-wider">
                {creating ? "Selando..." : "Selar Domínio"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1, 2].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((d) => (
            <div key={d.id} className="group relative glass rounded-xl p-6 hover-lift overflow-hidden seal-border">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-primary/5 pointer-events-none" />
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30 bg-destructive group-hover:opacity-60 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-primary" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center justify-center text-destructive"><Target className="h-6 w-6" /></div>
                    <div>
                      <h3 className="font-display text-lg tracking-wide text-cursed">{d.name}</h3>
                      {d.activationPhrase && <p className="font-jp text-[11px] text-primary/80 italic mt-0.5">"{d.activationPhrase}"</p>}
                    </div>
                  </div>
                  <button onClick={() => remove({ id: d.id })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <span className="px-2 py-1 rounded border border-primary/30 bg-primary/5 text-primary flex items-center gap-1"><Zap className="h-3 w-3" /> {d.cost} PE</span>
                  {d.barrier && <span className="px-2 py-1 rounded border border-border/40 bg-card/30 text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> {d.barrier}</span>}
                </div>
                {d.appearance && <p className="text-xs text-muted-foreground italic mb-3 leading-relaxed">"{d.appearance}"</p>}
                {d.guaranteedEffect && (
                  <div className="mb-2 p-2 rounded border border-destructive/30 bg-destructive/5">
                    <p className="text-[10px] uppercase tracking-wider text-destructive mb-1 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Efeito Garantido</p>
                    <p className="text-xs">{d.guaranteedEffect}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {d.buffs && <Block label="Bônus" content={d.buffs} color="text-primary" />}
                  {d.debuffs && <Block label="Penalidade" content={d.debuffs} color="text-destructive" />}
                </div>
                {d.conditions && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Condições</p>
                    <p className="text-xs text-muted-foreground">{d.conditions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Target className="h-12 w-12 text-destructive/40 mx-auto mb-4" />
          <h3 className="font-display tracking-wider text-lg">Nenhum domínio forjado</h3>
          <p className="text-sm text-muted-foreground mt-2">A manifestação suprema da técnica amaldiçoada aguarda.</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}

function Block({ label, content, color }: { label: string; content: string; color: string }) {
  return (
    <div className="p-2 rounded border border-border/40 bg-card/20">
      <p className={`text-[10px] uppercase tracking-wider mb-1 ${color}`}>{label}</p>
      <p className="text-xs leading-relaxed">{content}</p>
    </div>
  );
}
