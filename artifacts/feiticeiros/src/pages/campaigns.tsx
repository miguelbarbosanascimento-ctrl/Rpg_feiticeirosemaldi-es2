import { useState, useRef } from "react";
import {
  useListCampaigns, useCreateCampaign, useDeleteCampaign, useGetCampaign, useUpdateCampaign,
  useListCharacters, useListBosses, getListCampaignsQueryKey, getGetCampaignQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ScrollText, ArrowLeft, Camera, Calendar, Users, Skull, BookOpen } from "lucide-react";

const STATUSES = ["Em andamento", "Pausada", "Concluída", "Planejamento"];
const STATUS_COLOR: Record<string, string> = {
  "Em andamento": "hsl(160 60% 50%)", "Pausada": "hsl(45 80% 55%)",
  "Concluída": "hsl(265 85% 62%)", "Planejamento": "hsl(200 60% 55%)",
};

async function fileToCompressedDataUrl(file: File, maxEdge = 800): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = () => reject(new Error("read")); r.readAsDataURL(file);
  });
  const img = document.createElement("img");
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error("img")); img.src = raw; });
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); if (!ctx) return raw;
  ctx.drawImage(img, 0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.78);
}

export default function CampaignsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  if (selectedId !== null) return <CampaignDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  return <CampaignList onSelect={setSelectedId} />;
}

function CampaignList({ onSelect }: { onSelect: (id: number) => void }) {
  const { data, isLoading } = useListCampaigns();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", synopsis: "", setting: "", status: "Em andamento", partyName: "" });

  const { mutate: create, isPending: creating } = useCreateCampaign({
    mutation: {
      onSuccess: () => { toast({ title: "Campanha forjada." }); qc.invalidateQueries({ queryKey: getListCampaignsQueryKey() }); setOpen(false); setForm({ name: "", synopsis: "", setting: "", status: "Em andamento", partyName: "" }); },
      onError: () => toast({ title: "Erro ao criar campanha", variant: "destructive" }),
    },
  });

  const { mutate: remove } = useDeleteCampaign({
    mutation: { onSuccess: () => { toast({ title: "Campanha arquivada." }); qc.invalidateQueries({ queryKey: getListCampaignsQueryKey() }); } },
  });

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 glass p-6 md:p-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 20% 30%, hsl(265 85% 62% / 0.4), transparent 50%), radial-gradient(circle at 80% 70%, hsl(355 80% 52% / 0.15), transparent 50%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-jp text-xs tracking-[0.4em] text-primary/80">遠征</span>
              <span className="h-px w-12 bg-primary/30" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Mesa do Mestre</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider text-cursed">CAMPANHAS</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">Organize suas mesas, jogadores, agentes e ameaças em uma só ficha viva. Acompanhe arcos, sessões e ganchos de história.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-purple-700 hover:to-purple-600 border border-primary/50 shadow-[0_0_20px_hsl(265_85%_62%_/_0.4)] font-display tracking-wider">
                <Plus className="h-4 w-4" /> Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-primary/30 max-w-lg">
              <DialogHeader><DialogTitle className="font-display tracking-wider text-cursed">NOVA EXPEDIÇÃO</DialogTitle></DialogHeader>
              <div className="grid gap-3 mt-2">
                <Field label="Nome da campanha"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: O Incidente de Shibuya..." className="bg-background/60" /></Field>
                <Field label="Nome do grupo (opcional)"><Input value={form.partyName} onChange={(e) => setForm({ ...form, partyName: e.target.value })} placeholder="Ex: Brigada do Crepúsculo" className="bg-background/60" /></Field>
                <Field label="Cenário"><Input value={form.setting} onChange={(e) => setForm({ ...form, setting: e.target.value })} placeholder="Ex: Tóquio Moderna, 1999..." className="bg-background/60" /></Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </Field>
                <Field label="Sinopse"><Textarea rows={3} value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} placeholder="A premissa central, o gancho inicial, o tom da mesa..." className="bg-background/60 resize-none" /></Field>
                <Button onClick={() => create({ data: { name: form.name, synopsis: form.synopsis || undefined, setting: form.setting || undefined, status: form.status, partyName: form.partyName || undefined } })} disabled={creating || !form.name} className="bg-primary hover:bg-primary/90 mt-2 font-display tracking-wider">
                  {creating ? "Forjando..." : "Forjar Campanha"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">{[1, 2].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}</div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {data.map((c) => {
            const color = STATUS_COLOR[c.status] ?? "hsl(265 85% 62%)";
            return (
              <button key={c.id} onClick={() => onSelect(c.id)} className="group relative overflow-hidden rounded-xl border border-border/40 glass hover:border-primary/40 transition-all hover-lift text-left">
                <div className="relative h-32 overflow-hidden">
                  {c.coverUrl ? <img src={c.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : (
                    <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 50%, ${color}55, transparent 60%), linear-gradient(135deg, hsl(260 25% 8%), hsl(260 30% 14%))` }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded border font-display tracking-widest backdrop-blur-md" style={{ color, borderColor: `${color}66`, background: `${color}22` }}>{c.status}</span>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); if (confirm(`Arquivar "${c.name}"?`)) remove({ id: c.id }); }} className="absolute top-3 left-3 p-1.5 rounded glass-strong text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl tracking-wide mb-1 text-cursed">{c.name}</h3>
                  {c.partyName && <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Users className="h-3 w-3" /> {c.partyName}</p>}
                  {c.currentArc && <p className="text-xs text-primary mb-2 flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {c.currentArc}</p>}
                  {c.synopsis && <p className="text-xs text-muted-foreground italic line-clamp-2">{c.synopsis}</p>}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <ScrollText className="h-12 w-12 text-primary/40 mx-auto mb-4" />
          <h3 className="font-display tracking-wider text-lg">Nenhuma campanha registrada</h3>
          <p className="text-sm text-muted-foreground mt-2">Crie sua primeira mesa e comece a tecer o destino dos seus jogadores.</p>
        </div>
      )}
    </div>
  );
}

function CampaignDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data: c, isLoading } = useGetCampaign(id);
  const { data: allCharacters } = useListCharacters();
  const { data: allBosses } = useListBosses();
  const qc = useQueryClient();
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const { mutate: update, isPending: saving } = useUpdateCampaign({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetCampaignQueryKey(id) }); qc.invalidateQueries({ queryKey: getListCampaignsQueryKey() }); },
    },
  });

  if (isLoading || !c) return <div className="space-y-4"><Skeleton className="h-12 w-48" /><Skeleton className="h-64 rounded-xl" /></div>;

  function save(data: Parameters<typeof update>[0]["data"]) { update({ id, data }); }

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const url = await fileToCompressedDataUrl(file); save({ coverUrl: url }); toast({ title: "Capa atualizada." }); }
    catch { toast({ title: "Erro ao processar imagem", variant: "destructive" }); }
  }

  const playerIds: number[] = c.playerCharacterIds ? safeParseIds(c.playerCharacterIds) : [];
  const bossIds: number[] = c.bossIds ? safeParseIds(c.bossIds) : [];
  const players = (allCharacters ?? []).filter((ch) => playerIds.includes(ch.id));
  const bosses = (allBosses ?? []).filter((b) => bossIds.includes(b.id));
  const availableCharacters = (allCharacters ?? []).filter((ch) => !playerIds.includes(ch.id));
  const availableBosses = (allBosses ?? []).filter((b) => !bossIds.includes(b.id));

  function togglePlayer(charId: number) { save({ playerCharacterIds: JSON.stringify(playerIds.includes(charId) ? playerIds.filter((x) => x !== charId) : [...playerIds, charId]) }); }
  function toggleBoss(bossId: number) { save({ bossIds: JSON.stringify(bossIds.includes(bossId) ? bossIds.filter((x) => x !== bossId) : [...bossIds, bossId]) }); }

  const color = STATUS_COLOR[c.status] ?? "hsl(265 85% 62%)";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Voltar às campanhas</Button>
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 glass-strong">
        <div className="relative h-56 md:h-64 overflow-hidden group">
          {c.coverUrl ? <img src={c.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" /> : (
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 50%, ${color}66, transparent 60%), linear-gradient(135deg, hsl(260 25% 8%), hsl(260 30% 14%))` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
          <button onClick={() => coverInputRef.current?.click()} className="absolute top-4 right-4 px-3 py-2 rounded-lg glass-strong border border-primary/30 text-xs text-foreground/80 hover:text-foreground hover:border-primary/60 transition-all flex items-center gap-2">
            <Camera className="h-3.5 w-3.5" /> Foto de capa
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-jp text-xs tracking-[0.4em] text-primary/80">遠征</span>
              <span className="h-px w-12 bg-primary/30" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{c.setting || "Cenário não definido"}</span>
            </div>
            <input value={c.name} onChange={(e) => save({ name: e.target.value })} className="w-full bg-transparent font-display text-3xl md:text-5xl font-bold tracking-wider text-cursed outline-none" />
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded border font-display tracking-widest" style={{ color, borderColor: `${color}66`, background: `${color}22` }}>{c.status}</span>
              {c.partyName && <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Users className="h-3 w-3" /> {c.partyName}</span>}
              {saving && <span className="text-xs text-muted-foreground">Salvando…</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickInfo icon={BookOpen} label="Arco atual" value={c.currentArc ?? ""} onChange={(v) => save({ currentArc: v })} placeholder="Ex: O Festival das Maldições" />
        <QuickInfo icon={Calendar} label="Próxima sessão" value={c.nextSession ?? ""} onChange={(v) => save({ nextSession: v })} placeholder="Ex: Sex 25/Mai 20h" />
        <QuickInfoSelect icon={ScrollText} label="Status" value={c.status} options={STATUSES} onChange={(v) => save({ status: v })} />
      </div>

      <Tabs defaultValue="agentes" className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 bg-background/40 border border-border/40 h-auto p-1">
          <TabsTrigger value="agentes" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-display tracking-wider">Jogadores</TabsTrigger>
          <TabsTrigger value="ameacas" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-display tracking-wider">Ameaças</TabsTrigger>
          <TabsTrigger value="historia" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-display tracking-wider">História</TabsTrigger>
          <TabsTrigger value="mundo" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-display tracking-wider">Mundo</TabsTrigger>
          <TabsTrigger value="notas" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-display tracking-wider">Notas</TabsTrigger>
        </TabsList>
        <TabsContent value="agentes" className="mt-5 space-y-4">
          <SectionTitle icon={Users}>Personagens dos Jogadores ({players.length})</SectionTitle>
          {players.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {players.map((p) => (
                <div key={p.id} className="rounded-lg border border-primary/20 glass p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0"><p className="font-display tracking-wide truncate">{p.name}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{p.origin} · {p.specialization} · Nv {p.level}</p></div>
                  <button onClick={() => togglePlayer(p.id)} className="text-muted-foreground hover:text-destructive" title="Remover"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm italic text-muted-foreground/60">Nenhum jogador na campanha ainda.</p>}
          {availableCharacters.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Adicionar ficha</p>
              <div className="flex flex-wrap gap-2">
                {availableCharacters.map((p) => (
                  <button key={p.id} onClick={() => togglePlayer(p.id)} className="text-xs px-3 py-1.5 rounded border border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary/50 transition-colors flex items-center gap-1.5">
                    <Plus className="h-3 w-3" /> {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="ameacas" className="mt-5 space-y-4">
          <SectionTitle icon={Skull}>Ameaças da Campanha ({bosses.length})</SectionTitle>
          {bosses.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {bosses.map((b) => (
                <div key={b.id} className="rounded-lg border border-destructive/20 glass p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-3">
                    {b.photoUrl ? <img src={b.photoUrl} alt="" className="h-10 w-10 rounded object-cover shrink-0" /> : <div className="h-10 w-10 rounded bg-destructive/10 flex items-center justify-center shrink-0"><Skull className="h-5 w-5 text-destructive/60" /></div>}
                    <div className="min-w-0"><p className="font-display tracking-wide truncate">{b.name}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">VD {b.vd} · {b.grade}</p></div>
                  </div>
                  <button onClick={() => toggleBoss(b.id)} className="text-muted-foreground hover:text-destructive" title="Remover"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm italic text-muted-foreground/60">Nenhuma ameaça vinculada à campanha.</p>}
          {availableBosses.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Adicionar ameaça</p>
              <div className="flex flex-wrap gap-2">
                {availableBosses.map((b) => (
                  <button key={b.id} onClick={() => toggleBoss(b.id)} className="text-xs px-3 py-1.5 rounded border border-destructive/30 bg-destructive/5 hover:bg-destructive/15 hover:border-destructive/50 transition-colors flex items-center gap-1.5">
                    <Plus className="h-3 w-3" /> {b.name} <span className="text-muted-foreground">(VD {b.vd})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {(allBosses ?? []).length === 0 && <p className="text-xs text-muted-foreground">Crie inimigos na seção <strong>Bosses</strong> para vinculá-los aqui.</p>}
        </TabsContent>
        <TabsContent value="historia" className="mt-5 space-y-4">
          <TextBlock label="Sinopse" value={c.synopsis ?? ""} onChange={(v) => save({ synopsis: v })} placeholder="A premissa central, o gancho inicial, o tom da mesa..." rows={4} />
          <TextBlock label="Diário de Sessões" value={c.sessionLog ?? ""} onChange={(v) => save({ sessionLog: v })} placeholder="Sessão 1: ... | Sessão 2: ..." rows={10} />
        </TabsContent>
        <TabsContent value="mundo" className="mt-5 space-y-4">
          <TextBlock label="Cenário" value={c.setting ?? ""} onChange={(v) => save({ setting: v })} placeholder="Época, lugar, regras especiais do mundo..." rows={3} />
          <TextBlock label="NPCs Importantes" value={c.npcs ?? ""} onChange={(v) => save({ npcs: v })} placeholder="Liste mestres, aliados, mentores, antagonistas secundários..." rows={6} />
          <TextBlock label="Locais & Pontos de Interesse" value={c.locations ?? ""} onChange={(v) => save({ locations: v })} placeholder="Academia, esconderijos, zonas amaldiçoadas..." rows={6} />
        </TabsContent>
        <TabsContent value="notas" className="mt-5 space-y-4">
          <TextBlock label="Notas do Mestre" value={c.notes ?? ""} onChange={(v) => save({ notes: v })} placeholder="Reviravoltas planejadas, segredos, callbacks, ganchos..." rows={12} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function safeParseIds(s: string): number[] {
  try { const arr = JSON.parse(s); return Array.isArray(arr) ? arr.filter((x) => typeof x === "number") : []; } catch { return []; }
}

function QuickInfo({ icon: Icon, label, value, onChange, placeholder }: { icon: typeof Users; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="rounded-xl border border-border/40 glass p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2"><Icon className="h-3 w-3" /> {label}</div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-background/60" />
    </div>
  );
}

function QuickInfoSelect({ icon: Icon, label, value, options, onChange }: { icon: typeof Users; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-border/40 glass p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2"><Icon className="h-3 w-3" /> {label}</div>
      <Select value={value} onValueChange={onChange}><SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger><SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
    </div>
  );
}

function TextBlock({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="rounded-xl border border-border/40 glass p-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{label}</p>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="bg-background/60 resize-none" />
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return <div className="flex items-center gap-2 mb-2"><Icon className="h-4 w-4 text-primary" /><h3 className="font-display tracking-wider text-lg">{children}</h3></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
