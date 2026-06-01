import { useState, useRef } from "react";
import {
  useListBosses, useCreateBoss, useDeleteBoss, useGetBoss, useUpdateBoss,
  getListBossesQueryKey, getGetBossQueryKey,
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
import { Plus, Trash2, Skull, Heart, Zap, Shield, Eye, ArrowLeft, Camera, Swords, Crown, Image as ImageIcon, Upload } from "lucide-react";

const CATEGORIES = ["Maldição", "Espírito Amaldiçoado", "Feiticeiro Inimigo", "Relíquia", "Boss", "Híbrido"];
const SIZES = ["Pequeno", "Médio", "Grande", "Enorme", "Colossal"];
const GRADES = ["4° Grau", "3° Grau", "2° Grau", "1° Grau", "Especial Grau"];
const GRADE_COLOR: Record<string, string> = {
  "4° Grau": "hsl(200 60% 55%)", "3° Grau": "hsl(160 60% 50%)",
  "2° Grau": "hsl(45 80% 55%)", "1° Grau": "hsl(20 85% 55%)", "Especial Grau": "hsl(355 80% 52%)",
};

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(file);
  });
  const img = document.createElement("img");
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error("img")); img.src = raw; });
  const maxEdge = 480;
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return raw;
  ctx.drawImage(img, 0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.8);
}

export default function BossesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  if (selectedId !== null) return <BossDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  return <BossList onSelect={setSelectedId} />;
}

function BossList({ onSelect }: { onSelect: (id: number) => void }) {
  const { data, isLoading } = useListBosses();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({ name: "", vd: 10, category: "Maldição", size: "Médio", grade: "3° Grau", description: "", appearance: "", photoUrl: "" });

  const { mutate: create, isPending: creating } = useCreateBoss({
    mutation: {
      onSuccess: () => {
        toast({ title: "Ameaça registrada na enciclopédia." });
        qc.invalidateQueries({ queryKey: getListBossesQueryKey() });
        setOpen(false);
        setForm({ name: "", vd: 10, category: "Maldição", size: "Médio", grade: "3° Grau", description: "", appearance: "", photoUrl: "" });
      },
      onError: () => toast({ title: "Erro ao criar boss", variant: "destructive" }),
    },
  });

  const { mutate: remove } = useDeleteBoss({
    mutation: { onSuccess: () => { toast({ title: "Boss exorcizado." }); qc.invalidateQueries({ queryKey: getListBossesQueryKey() }); } },
  });

  const filtered = (data ?? []).filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const url = await fileToCompressedDataUrl(file); setForm((f) => ({ ...f, photoUrl: url })); }
    catch { toast({ title: "Erro ao processar imagem", variant: "destructive" }); }
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-destructive/30 glass p-6 md:p-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 20% 30%, hsl(355 80% 52% / 0.3), transparent 50%), radial-gradient(circle at 80% 70%, hsl(265 85% 62% / 0.2), transparent 50%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-jp text-xs tracking-[0.4em] text-destructive/80">呪霊</span>
              <span className="h-px w-12 bg-destructive/30" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Ferramenta do Mestre</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider text-cursed">BOSSES & AMEAÇAS</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">Catálogo de inimigos para suas mesas. Crie maldições, espíritos amaldiçoados, feiticeiros adversários e bosses com fichas completas para encontros.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-destructive to-red-700 hover:to-red-600 border border-destructive/50 shadow-[0_0_20px_hsl(355_80%_52%_/_0.4)] font-display tracking-wider">
                <Plus className="h-4 w-4" /> Forjar Ameaça
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-destructive/30 max-w-lg">
              <DialogHeader><DialogTitle className="font-display tracking-wider text-cursed">NOVA AMEAÇA</DialogTitle></DialogHeader>
              <div className="grid gap-3 mt-2">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => photoInputRef.current?.click()} className="relative h-20 w-20 rounded-lg border-2 border-dashed border-destructive/40 bg-background/60 hover:border-destructive/70 transition-colors flex items-center justify-center overflow-hidden shrink-0">
                    {form.photoUrl ? <img src={form.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <ImageIcon className="h-6 w-6 text-destructive/60" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground">Foto opcional. Será comprimida para 480px.</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => photoInputRef.current?.click()} className="gap-2"><Upload className="h-3 w-3" /> Escolher imagem</Button>
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>
                <Field label="Nome"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Sukuna, Mahito, Cabeça-de-Dedo..." className="bg-background/60" /></Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="VD"><Input type="number" min={1} value={form.vd} onChange={(e) => setForm({ ...form, vd: Number(e.target.value) })} className="bg-background/60" /></Field>
                  <Field label="Tamanho">
                    <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v })}><SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger><SelectContent>{SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  </Field>
                  <Field label="Grau">
                    <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v })}><SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger><SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                  </Field>
                </div>
                <Field label="Categoria">
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </Field>
                <Field label="Descrição curta"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="O que é este ser? De onde vem? O que quer?" className="bg-background/60 resize-none" /></Field>
                <Field label="Aparência"><Textarea rows={2} value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} placeholder="Traços físicos marcantes..." className="bg-background/60 resize-none" /></Field>
                <Button onClick={() => create({ data: { name: form.name, vd: form.vd, category: form.category, size: form.size, grade: form.grade, description: form.description || undefined, appearance: form.appearance || undefined, photoUrl: form.photoUrl || undefined } })} disabled={creating || !form.name} className="bg-destructive hover:bg-destructive/90 mt-2 font-display tracking-wider">
                  {creating ? "Selando..." : "Selar Ameaça"}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">Atributos detalhados, técnica e habilidades podem ser editados depois na ficha.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Input placeholder="Buscar ameaça..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-background/60 max-w-sm" />
        {data && <span className="text-xs text-muted-foreground">{filtered.length} de {data.length}</span>}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((b) => {
            const color = GRADE_COLOR[b.grade] ?? "hsl(355 80% 52%)";
            return (
              <button key={b.id} onClick={() => onSelect(b.id)} className="group w-full text-left relative overflow-hidden rounded-xl border border-border/40 glass hover:border-destructive/40 transition-all hover-lift">
                <div className="flex items-stretch gap-0 min-h-[110px]">
                  <div className="w-32 md:w-44 shrink-0 relative overflow-hidden bg-background/40">
                    {b.photoUrl ? <img src={b.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: `radial-gradient(circle, ${color}33, transparent 70%)` }}><Skull className="h-10 w-10 opacity-50" style={{ color }} /></div>
                    )}
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background/90 to-transparent" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-display text-lg tracking-wide truncate">{b.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border font-display tracking-widest shrink-0" style={{ color, borderColor: `${color}66`, background: `${color}11` }}>{b.grade}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">VD: <strong className="text-destructive">{b.vd}</strong> · {b.category} · {b.size}</p>
                    {b.innateTechnique && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">{b.innateTechnique}</p>}
                  </div>
                  <div className="flex items-center gap-2 pr-4">
                    <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded border border-destructive/30 bg-destructive/5">
                      <Heart className="h-3 w-3 text-destructive" /><strong className="text-xs text-destructive">{b.hp}/{b.maxHp}</strong>
                    </div>
                    <Button size="sm" variant="ghost" className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/40 font-display tracking-wider">Ficha</Button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); if (confirm(`Exorcizar "${b.name}"?`)) remove({ id: b.id }); }} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Excluir">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Skull className="h-12 w-12 text-destructive/40 mx-auto mb-4" />
          <h3 className="font-display tracking-wider text-lg">Nenhuma ameaça registrada</h3>
          <p className="text-sm text-muted-foreground mt-2">Crie seu primeiro inimigo para popular o catálogo do mestre.</p>
        </div>
      )}
    </div>
  );
}

function BossDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data: boss, isLoading } = useGetBoss(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const { mutate: update, isPending: saving } = useUpdateBoss({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetBossQueryKey(id) }); qc.invalidateQueries({ queryKey: getListBossesQueryKey() }); },
    },
  });

  if (isLoading || !boss) return <div className="space-y-4"><Skeleton className="h-12 w-48" /><Skeleton className="h-64 rounded-xl" /></div>;

  function save(data: Parameters<typeof update>[0]["data"]) { update({ id, data }); }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const url = await fileToCompressedDataUrl(file); save({ photoUrl: url }); toast({ title: "Foto atualizada." }); }
    catch { toast({ title: "Erro ao processar imagem", variant: "destructive" }); }
  }

  const color = GRADE_COLOR[boss.grade] ?? "hsl(355 80% 52%)";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Voltar ao catálogo</Button>
      <div className="relative overflow-hidden rounded-2xl border border-destructive/30 glass-strong">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: `radial-gradient(ellipse at 20% 30%, ${color}55, transparent 60%), radial-gradient(ellipse at 80% 70%, hsl(265 85% 62% / 0.2), transparent 55%)` }} />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 p-6 md:p-8">
          <div className="relative shrink-0">
            <div className="absolute -inset-2 rounded-full blur-2xl opacity-60" style={{ background: color }} />
            <button onClick={() => photoInputRef.current?.click()} className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden border-4 group cursor-pointer" style={{ borderColor: color, boxShadow: `0 0 40px ${color}99` }}>
              {boss.photoUrl ? <img src={boss.photoUrl} alt={boss.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60"><Skull className="h-16 w-16" style={{ color }} /></div>
              )}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors flex items-center justify-center">
                <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="font-jp text-xs tracking-[0.4em] text-destructive/80">呪霊</span>
              <span className="h-px w-12 bg-destructive/30" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{boss.category}</span>
            </div>
            <input value={boss.name} onChange={(e) => save({ name: e.target.value })} className="w-full bg-transparent font-display text-3xl md:text-5xl font-bold tracking-wider text-cursed outline-none border-b border-transparent focus:border-destructive/40 transition-colors text-center md:text-left" />
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Tag color={color}>Grau: {boss.grade}</Tag>
              <Tag color="hsl(355 80% 52%)">VD: {boss.vd}</Tag>
              <Tag color="hsl(265 85% 62%)">{boss.size}</Tag>
            </div>
            {boss.description && <p className="text-sm text-muted-foreground italic max-w-2xl">"{boss.description}"</p>}
            <div className="flex items-center gap-2 justify-center md:justify-start text-xs text-muted-foreground">{saving && <span>Salvando…</span>}</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 bg-background/40 border border-border/40 h-auto p-1">
          <TabsTrigger value="status" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive font-display tracking-wider">Status</TabsTrigger>
          <TabsTrigger value="atributos" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive font-display tracking-wider">Atributos</TabsTrigger>
          <TabsTrigger value="tecnica" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive font-display tracking-wider">Técnica</TabsTrigger>
          <TabsTrigger value="notas" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive font-display tracking-wider">Notas</TabsTrigger>
        </TabsList>
        <TabsContent value="status" className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <StatPanel icon={Heart} color="hsl(355 80% 52%)" label="Pontos de Vida" current={boss.hp} max={boss.maxHp} onCurrent={(v) => save({ hp: v })} onMax={(v) => save({ maxHp: v, hp: Math.min(boss.hp, v) })} />
            <StatPanel icon={Zap} color="hsl(265 85% 62%)" label="Energia Amaldiçoada" current={boss.energy} max={boss.maxEnergy} onCurrent={(v) => save({ energy: v })} onMax={(v) => save({ maxEnergy: v, energy: Math.min(boss.energy, v) })} />
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <MiniStat icon={Shield} label="CA" value={boss.armorClass} onChange={(v) => save({ armorClass: v })} />
            <MiniStat icon={Eye} label="Atenção" value={boss.attention} onChange={(v) => save({ attention: v })} />
            <MiniStringStat icon={Swords} label="Deslocamento" value={boss.movement} onChange={(v) => save({ movement: v })} />
            <MiniStringStat icon={Crown} label="Dados de Vida" value={boss.hitDice} onChange={(v) => save({ hitDice: v })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextBlock label="Resistências" value={boss.resistances ?? ""} onChange={(v) => save({ resistances: v })} placeholder="Ex: Amaldiçoado, Fogo, Veneno..." />
            <TextBlock label="Fraquezas" value={boss.weaknesses ?? ""} onChange={(v) => save({ weaknesses: v })} placeholder="Ex: Luz solar, energia positiva..." />
          </div>
        </TabsContent>
        <TabsContent value="atributos" className="mt-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AttrBox label="Força" abbr="FOR" value={boss.strength} onChange={(v) => save({ strength: v })} />
            <AttrBox label="Destreza" abbr="DES" value={boss.dexterity} onChange={(v) => save({ dexterity: v })} />
            <AttrBox label="Constituição" abbr="CON" value={boss.constitution} onChange={(v) => save({ constitution: v })} />
            <AttrBox label="Inteligência" abbr="INT" value={boss.intelligence} onChange={(v) => save({ intelligence: v })} />
            <AttrBox label="Sabedoria" abbr="SAB" value={boss.wisdom} onChange={(v) => save({ wisdom: v })} />
            <AttrBox label="Presença" abbr="PRE" value={boss.charisma} onChange={(v) => save({ charisma: v })} />
          </div>
          <TextBlock label="Aparência" value={boss.appearance ?? ""} onChange={(v) => save({ appearance: v })} placeholder="Detalhes físicos, escala, anomalias visuais..." rows={4} />
        </TabsContent>
        <TabsContent value="tecnica" className="mt-5 space-y-4">
          <TextBlock label="Técnica Inata" value={boss.innateTechnique ?? ""} onChange={(v) => save({ innateTechnique: v })} placeholder="Nome da técnica amaldiçoada..." rows={1} />
          <TextBlock label="Descrição da Técnica" value={boss.techniqueDescription ?? ""} onChange={(v) => save({ techniqueDescription: v })} placeholder="Como funciona, custos de PE, alcance..." rows={6} />
          <TextBlock label="Habilidades & Ataques" value={boss.abilities ?? ""} onChange={(v) => save({ abilities: v })} placeholder="Liste ataques, dano, condições..." rows={6} />
          <TextBlock label="Expansão de Domínio" value={boss.domain ?? ""} onChange={(v) => save({ domain: v })} placeholder="Nome, efeito garantido, condições..." rows={4} />
        </TabsContent>
        <TabsContent value="notas" className="mt-5 space-y-4">
          <TextBlock label="Despojos / Loot" value={boss.loot ?? ""} onChange={(v) => save({ loot: v })} placeholder="Recompensas ao derrotar..." rows={4} />
          <TextBlock label="Notas do Mestre" value={boss.notes ?? ""} onChange={(v) => save({ notes: v })} placeholder="Táticas, segredos, ganchos de história..." rows={8} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatPanel({ icon: Icon, color, label, current, max, onCurrent, onMax }: { icon: typeof Heart; color: string; label: string; current: number; max: number; onCurrent: (v: number) => void; onMax: (v: number) => void }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  return (
    <div className="rounded-xl border glass p-4" style={{ borderColor: `${color}40` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-display tracking-wider" style={{ color }}><Icon className="h-4 w-4" /> {label}</div>
        <div className="flex items-center gap-1 text-sm">
          <input type="number" value={current} onChange={(e) => onCurrent(Number(e.target.value))} className="w-16 bg-background/60 border border-border/50 rounded px-2 py-1 text-right tabular-nums" />
          <span className="text-muted-foreground">/</span>
          <input type="number" value={max} onChange={(e) => onMax(Number(e.target.value))} className="w-16 bg-background/60 border border-border/50 rounded px-2 py-1 text-right tabular-nums" />
        </div>
      </div>
      <div className="h-2 rounded-full bg-background/60 overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, boxShadow: `0 0 12px ${color}88` }} />
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, onChange }: { icon: typeof Shield; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-lg border border-border/40 glass p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1"><Icon className="h-3 w-3" /> {label}</div>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-transparent font-display text-2xl text-cursed outline-none tabular-nums" />
    </div>
  );
}

function MiniStringStat({ icon: Icon, label, value, onChange }: { icon: typeof Shield; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-lg border border-border/40 glass p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1"><Icon className="h-3 w-3" /> {label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent font-display text-lg text-cursed outline-none" />
    </div>
  );
}

function AttrBox({ label, abbr, value, onChange }: { label: string; abbr: string; value: number; onChange: (v: number) => void }) {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="relative rounded-xl border border-destructive/30 glass p-4 text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="font-jp text-xs text-destructive/60 mt-0.5">{abbr}</p>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-transparent text-center font-display text-4xl text-cursed outline-none tabular-nums my-1" />
      <p className="text-xs text-muted-foreground">Mod: <span className="text-destructive font-bold">{mod >= 0 ? `+${mod}` : mod}</span></p>
    </div>
  );
}

function TextBlock({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="rounded-xl border border-border/40 glass p-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{label}</p>
      {rows === 1 ? <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-background/60" /> : <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="bg-background/60 resize-none" />}
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className="text-[10px] font-bold px-2.5 py-1 rounded border font-display tracking-widest" style={{ color, borderColor: `${color}66`, background: `${color}11` }}>{children}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
