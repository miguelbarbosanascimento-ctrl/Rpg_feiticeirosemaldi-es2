import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useGetCharacter, useUpdateCharacter, useDeleteCharacter, getListCharactersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Pencil, Save, Trash2, Zap, Scroll, Package, User, Printer, Share2,
  Check, Loader2, Camera, Heart, Shield, Eye, Footprints, Dice5, Sparkles, Skull,
  BookOpen, Wand2,
} from "lucide-react";
import { AtributosHexagon, BarraStatus, DefesaCard, type BaseStat, type CustomStat } from "@/components/atributos";

// ============================================================================
// Helpers
// ============================================================================

function parseCustomStats(raw: string | null | undefined): CustomStat[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((s) => s && typeof s.name === "string")
      .map((s) => ({ name: s.name, value: Number(s.value) || 0 }));
  } catch {
    return [];
  }
}

function parseJsonField(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return raw ? [raw] : [];
  }
}

const UNIVERSAL_PRESETS: { label: string; raw: string }[] = [
  { label: "Reforço de Energia", raw: "Reforço de Energia | Nível 1 | Custo: 5 PE | Alcance: Pessoal | Aumenta dano físico em 1d6 por 1 minuto." },
  { label: "Lampejo Negro", raw: "Lampejo Negro | Nível 3 | Custo: 8 PE | Dano: +2d8 amaldiçoado | Teste: DEX | Crítico instantâneo se rolar 20 natural; multiplica dano por 2.5." },
  { label: "Técnica Reversa", raw: "Técnica Reversa | Nível 4 | Custo: 12 PE | Alcance: Toque | Cura 2d8 + mod CON pontos de vida. Requer Energia Positiva." },
  { label: "Expansão de Domínio", raw: "Expansão de Domínio | Nível 6 | Custo: 25 PE | Alcance: 9m raio | Manifesta domínio interno; acerto garantido de técnica em todos os alvos por 3 turnos." },
  { label: "Cortina Simples", raw: "Cortina Simples | Nível 2 | Custo: 5 PE | Alcance: 6m raio | Cria barreira que oculta da percepção de não-feiticeiros." },
  { label: "Barreira de Contenção", raw: "Barreira de Contenção | Nível 3 | Custo: 10 PE | Alcance: 9m raio | Sela área; impede entrada e saída por 10 minutos." },
];

function AutoSaveIndicator({ state }: { state: "idle" | "dirty" | "saving" | "saved" }) {
  if (state === "idle") return null;
  const cfg = {
    dirty: { icon: <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />, text: "Alterações pendentes...", cls: "text-yellow-400" },
    saving: { icon: <Loader2 className="h-3 w-3 animate-spin" />, text: "Salvando...", cls: "text-primary" },
    saved: { icon: <Check className="h-3 w-3" />, text: "Salvo", cls: "text-green-400" },
  }[state];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cfg.cls} animate-in fade-in`}>
      {cfg.icon}
      <span>{cfg.text}</span>
    </span>
  );
}

// Presets shared with the character creator form
const ORIGENS = [
  "Feiticeiro Jujutsu",
  "Usuário de Maldição",
  "Maldição Desperta",
  "Semi-Maldição",
  "Maldição Encarnada",
  "Caçador",
];
const CLANS = ["Gojo", "Zenin", "Kamo", "Inumaki"];
const ESPECIALIZACOES = [
  "Lutador",
  "Especialista em Técnica",
  "Especialista em Combate",
  "Médico",
  "Estrategista",
  "Elementalista",
  "Invocador",
  "Manipulador",
  "Guardião",
];
const GRAUS = [
  "4° Grau",
  "3° Grau",
  "2° Grau",
  "1° Grau",
  "Semi-Grau Especial",
  "Grau Especial",
];

function gradeColor(grade: string) {
  if (grade.includes("Especial")) return "from-red-500/30 to-red-700/10 text-red-300 border-red-400/50";
  if (grade.includes("1°")) return "from-orange-500/30 to-orange-700/10 text-orange-300 border-orange-400/50";
  if (grade.includes("2°")) return "from-amber-500/30 to-amber-700/10 text-amber-300 border-amber-400/50";
  if (grade.includes("3°")) return "from-cyan-500/30 to-cyan-700/10 text-cyan-300 border-cyan-400/50";
  return "from-muted/30 to-muted/10 text-muted-foreground border-border/40";
}

// Resize image client-side and return data URL (JPEG, ~600px max edge, q=0.85)
/** Compress and resize an image file to a small JPEG data URL without blocking the main thread. */
async function fileToDataUrl(file: File): Promise<string> {
  // Use createObjectURL — doesn't block the thread unlike readAsDataURL on large files
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Falha ao carregar imagem"));
      image.src = objectUrl;
    });
    const maxEdge = 480;
    const scale = Math.min(1, maxEdge / Math.max(img.width || 1, img.height || 1));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas não disponível");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ============================================================================
// Main
// ============================================================================

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const numId = parseInt(id ?? "0", 10);

  const queryClient = useQueryClient();
  const { data: character, isLoading } = useGetCharacter(numId);
  const { mutate: updateCharacter, isPending: isUpdating } = useUpdateCharacter();
  const { mutate: deleteCharacter, isPending: isDeleting } = useDeleteCharacter();

  const [editingText, setEditingText] = useState(false);
  // numeric / always-on
  const [editHp, setEditHp] = useState(0);
  const [editEnergy, setEditEnergy] = useState(0);
  const [editSoul, setEditSoul] = useState(10);
  const [editLevel, setEditLevel] = useState(1);
  const [editExperience, setEditExperience] = useState(0);
  const [editArmorClass, setEditArmorClass] = useState(10);
  const [editAttention, setEditAttention] = useState(10);
  const [editMaxHp, setEditMaxHp] = useState(0);
  const [editMaxEnergy, setEditMaxEnergy] = useState(0);
  const [editMaxSoul, setEditMaxSoul] = useState(0);
  const [editName, setEditName] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editOrigin, setEditOrigin] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editClanHeritage, setEditClanHeritage] = useState("");
  const [editStr, setEditStr] = useState(1);
  const [editDex, setEditDex] = useState(1);
  const [editCon, setEditCon] = useState(1);
  const [editInt, setEditInt] = useState(1);
  const [editWis, setEditWis] = useState(1);
  const [editCha, setEditCha] = useState(1);
  const [editCustomStats, setEditCustomStats] = useState<CustomStat[]>([]);
  const [editAbilities, setEditAbilities] = useState<string[]>([]);

  // text fields (always editable when in textEdit mode)
  const [editNotes, setEditNotes] = useState("");
  const [editPersonality, setEditPersonality] = useState("");
  const [editBackstory, setEditBackstory] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editSchool, setEditSchool] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [editAppearance, setEditAppearance] = useState("");
  const [editIdeals, setEditIdeals] = useState("");
  const [editBonds, setEditBonds] = useState("");
  const [editComplications, setEditComplications] = useState("");
  const [editInnateDomain, setEditInnateDomain] = useState("");
  const [editMovement, setEditMovement] = useState("9m");
  const [editHitDice, setEditHitDice] = useState("1d8");
  const [editResistances, setEditResistances] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | null>(null);

  const [autoSaveState, setAutoSaveState] = useState<"idle" | "dirty" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const writeRevisionRef = useRef(0);
  const lastAppliedRevisionRef = useRef(0);
  const initializedRef = useRef(false);
  const seededSkipRef = useRef(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const lastSentPhotoRef = useRef<string | null>(null);

  useEffect(() => {
    initializedRef.current = false;
    seededSkipRef.current = false;
    writeRevisionRef.current = 0;
    lastAppliedRevisionRef.current = 0;
  }, [numId]);

  useEffect(() => {
    if (!character || initializedRef.current) return;
    setEditHp(character.hp);
    setEditEnergy(character.energy);
    setEditSoul(character.soulIntegrity ?? 10);
    setEditLevel(character.level);
    setEditExperience(character.experience);
    setEditArmorClass(character.armorClass);
    setEditAttention(character.attention ?? 10);
    setEditStr(character.strength);
    setEditDex(character.dexterity);
    setEditCon(character.constitution);
    setEditInt(character.intelligence);
    setEditWis(character.wisdom);
    setEditCha(character.charisma);
    setEditCustomStats(parseCustomStats(character.customStats));
    setEditAbilities(parseJsonField(character.abilities));
    setEditNotes(character.notes ?? "");
    setEditPersonality(character.personality ?? "");
    setEditBackstory(character.backstory ?? "");
    setEditAge(character.age ?? "");
    setEditHeight(character.height ?? "");
    setEditWeight(character.weight ?? "");
    setEditSchool(character.school ?? "");
    setEditOccupation(character.occupation ?? "");
    setEditAppearance(character.appearance ?? "");
    setEditIdeals(character.ideals ?? "");
    setEditBonds(character.bonds ?? "");
    setEditComplications(character.complications ?? "");
    setEditInnateDomain(character.innateDomain ?? "");
    setEditMovement((character.movement as string | undefined) ?? "9m");
    setEditHitDice((character.hitDice as string | undefined) ?? `${character.level}d8`);
    setEditResistances(character.resistances ?? "");
    setEditPhotoUrl(character.photoUrl ?? null);
    lastSentPhotoRef.current = character.photoUrl ?? null;
    setEditMaxHp(character.maxHp ?? (10 + character.constitution + (character.level - 1) * 5));
    setEditMaxEnergy(character.maxEnergy ?? (10 + character.wisdom + (character.level - 1) * 5));
    setEditMaxSoul(character.maxSoulIntegrity ?? (10 + character.charisma + (character.level - 1) * 2));
    setEditName(character.name);
    setEditGrade(character.grade);
    setEditOrigin(character.origin);
    setEditSpecialization(character.specialization);
    setEditClanHeritage(character.clanHeritage ?? "");
    initializedRef.current = true;
  }, [character]);

  function performUpdate(rev: number) {
    const safeLevel = Math.max(1, Math.min(20, editLevel || 1));
    const newMaxHp = Math.max(1, editMaxHp || 1);
    const newMaxEnergy = Math.max(1, editMaxEnergy || 1);
    const newMaxSoul = Math.max(1, editMaxSoul || 1);
    // Allow values to exceed max (overheal / temp buffs, CRIS-style). Only floor at 0.
    const persistedHp = Math.max(0, editHp);
    const persistedEnergy = Math.max(0, editEnergy);
    const persistedSoul = Math.max(0, editSoul);
    const payload: Record<string, unknown> = {
      hp: persistedHp,
      energy: persistedEnergy,
      soulIntegrity: persistedSoul,
      maxSoulIntegrity: newMaxSoul,
      notes: editNotes,
      personality: editPersonality,
      backstory: editBackstory,
      level: safeLevel,
      experience: Math.max(0, editExperience),
      armorClass: editArmorClass,
      attention: editAttention,
      strength: editStr,
      dexterity: editDex,
      constitution: editCon,
      intelligence: editInt,
      wisdom: editWis,
      charisma: editCha,
      maxHp: newMaxHp,
      maxEnergy: newMaxEnergy,
      customStats: JSON.stringify(editCustomStats),
      abilities: JSON.stringify(editAbilities.filter((a) => a.trim())),
      age: editAge,
      height: editHeight,
      weight: editWeight,
      school: editSchool,
      occupation: editOccupation,
      appearance: editAppearance,
      ideals: editIdeals,
      bonds: editBonds,
      complications: editComplications,
      innateDomain: editInnateDomain,
      movement: editMovement || "9m",
      hitDice: editHitDice || `${safeLevel}d8`,
      resistances: editResistances,
      name: editName || character?.name || "",
      grade: editGrade || character?.grade || "",
      origin: editOrigin || character?.origin || "",
      specialization: editSpecialization || character?.specialization || "",
      clanHeritage: editClanHeritage,
    };
    // Only include photoUrl when it actually changed to avoid resending large data URL on every keystroke.
    const currentPhoto = editPhotoUrl ?? "";
    const lastPhoto = lastSentPhotoRef.current ?? "";
    if (currentPhoto !== lastPhoto) {
      payload.photoUrl = currentPhoto;
    }
    updateCharacter(
      { id: numId, data: payload as Parameters<typeof updateCharacter>[0]["data"] },
      {
        onSuccess: () => {
          if (currentPhoto !== lastPhoto) {
            lastSentPhotoRef.current = currentPhoto;
            // Photo changed — invalidate the dashboard list so it shows the new photo immediately
            queryClient.invalidateQueries({ queryKey: getListCharactersQueryKey() });
          }
          if (rev <= lastAppliedRevisionRef.current) return;
          lastAppliedRevisionRef.current = rev;
          if (rev === writeRevisionRef.current) {
            setAutoSaveState("saved");
            setTimeout(() => setAutoSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
          }
        },
        onError: () => setAutoSaveState("dirty"),
      },
    );
  }

  useEffect(() => {
    if (!initializedRef.current) return;
    if (!seededSkipRef.current) {
      seededSkipRef.current = true;
      return;
    }
    writeRevisionRef.current += 1;
    const rev = writeRevisionRef.current;
    setAutoSaveState("dirty");
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaveState("saving");
      performUpdate(rev);
    }, 900);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editHp, editEnergy, editSoul, editNotes, editPersonality, editBackstory,
    editLevel, editExperience, editArmorClass, editAttention,
    editStr, editDex, editCon, editInt, editWis, editCha,
    editCustomStats, editAbilities,
    editAge, editHeight, editWeight, editSchool, editOccupation, editAppearance,
    editIdeals, editBonds, editComplications, editInnateDomain,
    editMovement, editHitDice, editResistances, editPhotoUrl,
    editMaxHp, editMaxEnergy, editMaxSoul,
    editName, editGrade, editOrigin, editSpecialization, editClanHeritage,
  ]);

  function addCustomStat(name: string) {
    if (editCustomStats.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Atributo já existe", variant: "destructive" });
      return;
    }
    setEditCustomStats([...editCustomStats, { name, value: 1 }]);
  }

  function flushAndCloseText() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    writeRevisionRef.current += 1;
    performUpdate(writeRevisionRef.current);
    setEditingText(false);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx 8MB)", variant: "destructive" });
      return;
    }
    setUploadingPhoto(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setEditPhotoUrl(dataUrl);
    } catch {
      toast({ title: "Falha ao processar imagem", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: character?.name ?? "Ficha", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copiado!", description: "Compartilhe com seu mestre ou grupo." });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copiado!" });
      } catch {
        toast({ title: "Não foi possível copiar o link", variant: "destructive" });
      }
    }
  }

  function handleDelete() {
    deleteCharacter(
      { id: numId },
      {
        onSuccess: () => {
          toast({ title: "Ficha excluída." });
          navigate("/");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-10 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">Personagem não encontrado.</p>
        <Link href="/"><Button variant="outline" className="mt-4">Voltar ao Dashboard</Button></Link>
      </div>
    );
  }

  const aptitudes = parseJsonField(character.aptitudes);
  const skills = parseJsonField(character.skills);
  const equipment = parseJsonField(character.equipment);
  const abilities = parseJsonField(character.abilities);

  const maxHp = editMaxHp || (10 + editCon + (editLevel - 1) * 5);
  const maxEnergy = editMaxEnergy || (10 + editWis + (editLevel - 1) * 5);
  const maxSoul = editMaxSoul || (10 + editCha + (editLevel - 1) * 2);
  const formulaHp = 10 + editCon + (editLevel - 1) * 5;
  const formulaEnergy = 10 + editWis + (editLevel - 1) * 5;
  const formulaSoul = 10 + editCha + (editLevel - 1) * 2;
  const modFor = Math.floor((editStr - 10) / 2);
  const modDex = Math.floor((editDex - 10) / 2);
  const iniciativa = editDex;

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-500">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Fichas
          </Button>
        </Link>
        <div className="flex gap-2 items-center">
          <AutoSaveIndicator state={autoSaveState} />
          {editingText ? (
            <Button variant="outline" size="sm" onClick={flushAndCloseText} disabled={isUpdating} className="gap-2">
              <Save className="h-4 w-4" /> Concluir edição
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 text-muted-foreground hover:text-primary print:hidden">
                <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Compartilhar</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-2 text-muted-foreground hover:text-primary print:hidden">
                <Printer className="h-4 w-4" /> <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditingText(true)} className="gap-2 print:hidden">
                <Pencil className="h-4 w-4" /> Editar textos
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive print:hidden">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border/60">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir ficha?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A ficha de <strong>{character.name}</strong> será permanentemente excluída.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                      {isDeleting ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* === CINEMATIC PROFILE HEADER === */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 via-card/60 to-background/40 backdrop-blur-xl">
        {/* Animated glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 animate-domain"
               style={{ background: "radial-gradient(circle, hsl(265 85% 50% / 0.6), transparent 70%)" }} />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-domain"
               style={{ background: "radial-gradient(circle, hsl(355 80% 45% / 0.5), transparent 70%)", animationDelay: "2s" }} />
          <div className="absolute inset-0 bg-cursed-grid opacity-20" />
        </div>

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
          {/* Photo with frame */}
          <div className="relative shrink-0 group">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-primary via-purple-600 to-destructive opacity-60 blur-md animate-pulse-glow" />
            <div className="absolute inset-0 -m-1 rounded-full border-2 border-primary/40" />

            <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden border-2 border-primary/70 bg-card/80 shadow-[0_0_40px_hsl(265_85%_50%_/_0.5)]">
              {editPhotoUrl ? (
                <img src={editPhotoUrl} alt={character.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-6xl font-display font-bold bg-gradient-to-br from-primary/30 to-destructive/20 text-white/60">
                  {character.name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Inner overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Upload button */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                title="Alterar foto"
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <>
                    <Camera className="h-7 w-7 text-primary" />
                    <span className="text-[10px] uppercase tracking-widest text-white/90">Trocar foto</span>
                  </>
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Floating remove button */}
            {editPhotoUrl && (
              <button
                type="button"
                onClick={() => setEditPhotoUrl(null)}
                className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-destructive/90 hover:bg-destructive border border-destructive-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                title="Remover foto"
              >
                <Trash2 className="h-3.5 w-3.5 text-white" />
              </button>
            )}

            {/* JP sigil under photo */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-jp text-xs tracking-[0.4em] text-primary/70 whitespace-nowrap bg-background/80 px-2 rounded">
              術師
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0 space-y-3 text-center md:text-left">
            <div className="space-y-1">
              <div className="font-jp text-xs tracking-[0.5em] text-primary/60">FEITICEIRO</div>
              <ClickToEditInline
                value={editName}
                onChange={setEditName}
                placeholder="Nome do feiticeiro"
                className="font-display text-4xl md:text-5xl font-bold tracking-wide text-cursed leading-tight"
                inputClassName="font-display text-4xl md:text-5xl font-bold tracking-wide leading-tight bg-background/60 border-primary/40 h-auto py-1 px-2"
              />
            </div>

            {/* Grade pill */}
            <PresetPicker
              value={editGrade}
              onChange={setEditGrade}
              presets={GRAUS}
              label="Grau de Feiticeiro"
              placeholder="Definir grau"
              renderTrigger={(val, open) => (
                <button
                  type="button"
                  onClick={open}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-display tracking-wider text-xs uppercase bg-gradient-to-r ${gradeColor(val || "4° Grau")} hover:brightness-125 transition-all cursor-pointer`}
                  title="Clique para mudar o grau"
                >
                  <Skull className="h-3 w-3 shrink-0" />
                  {val || "Definir grau"}
                </button>
              )}
            />

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start items-center">
              <PresetTag color="violet" value={editOrigin} onChange={setEditOrigin}
                presets={ORIGENS} label="Origem" placeholder="Origem" />
              <PresetTag color="cyan" value={editSpecialization} onChange={setEditSpecialization}
                presets={ESPECIALIZACOES} label="Especialização" placeholder="Especialização" />
              <PresetTag color="red" value={editClanHeritage} onChange={setEditClanHeritage}
                presets={CLANS} label="Clã / Família" placeholder="Clã / Família" prefix="Clã " />
              {editSchool && <Tag color="muted">{editSchool}</Tag>}
            </div>

            {/* Level / XP / Maestria mini bar */}
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Nv</span>
                <Input type="number" min={1} max={20} value={editLevel}
                  onChange={(e) => setEditLevel(Number(e.target.value) || 1)}
                  className="w-14 h-7 text-center font-bold text-sm bg-background/60 border-primary/30" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</span>
                <Input type="number" min={0} value={editExperience}
                  onChange={(e) => setEditExperience(Number(e.target.value) || 0)}
                  className="w-20 h-7 text-sm bg-background/60 border-primary/30" />
              </div>
              <span className="text-xs text-muted-foreground">
                Maestria <strong className="text-primary">+{Math.ceil((editLevel + 3) / 4)}</strong>
              </span>
            </div>
          </div>

          {/* Vital bars */}
          <div className="w-full md:w-80 space-y-2 shrink-0">
            <BarraStatus label="Pontos de Vida" value={editHp} max={maxHp} color="red" onChange={setEditHp} onMaxChange={setEditMaxHp} />
            <BarraStatus label="Pontos de Energia" value={editEnergy} max={maxEnergy} color="primary" onChange={setEditEnergy} onMaxChange={setEditMaxEnergy} />
            <BarraStatus label="Integridade da Alma" value={editSoul} max={maxSoul} color="primary" onChange={setEditSoul} onMaxChange={setEditMaxSoul} />
          </div>
        </div>
      </div>

      {/* === TABS === */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-card/40 border border-border/40 backdrop-blur p-1.5 rounded-xl">
          <TabTrigger value="overview" icon={User}>Visão Geral</TabTrigger>
          <TabTrigger value="status" icon={Shield}>Status</TabTrigger>
          <TabTrigger value="techniques" icon={Zap}>Técnicas</TabTrigger>
          <TabTrigger value="domain" icon={Wand2}>Domínio</TabTrigger>
          <TabTrigger value="inventory" icon={Package}>Inventário</TabTrigger>
          <TabTrigger value="aptitudes" icon={Sparkles}>Aptidões</TabTrigger>
          <TabTrigger value="history" icon={BookOpen}>História</TabTrigger>
          <TabTrigger value="notes" icon={Scroll}>Anotações</TabTrigger>
        </TabsList>

        {/* ===== VISÃO GERAL ===== */}
        <TabsContent value="overview" className="space-y-5 mt-5 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Identity panel */}
            <Card className="border-border/50 bg-card/40 backdrop-blur lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" /> Identidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingText ? (
                  <div className="grid grid-cols-2 gap-2">
                    <FieldInput label="Idade" value={editAge} onChange={setEditAge} placeholder="17" />
                    <FieldInput label="Altura" value={editHeight} onChange={setEditHeight} placeholder="1,75m" />
                    <FieldInput label="Peso" value={editWeight} onChange={setEditWeight} placeholder="65kg" />
                    <FieldInput label="Escola" value={editSchool} onChange={setEditSchool} placeholder="Tóquio" />
                    <FieldInput label="Ocupação" value={editOccupation} onChange={setEditOccupation} placeholder="Estudante" />
                    <FieldInput label="Deslocamento" value={editMovement} onChange={setEditMovement} placeholder="9m" />
                  </div>
                ) : (
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <InfoLine label="Idade" value={editAge} />
                    <InfoLine label="Altura" value={editHeight} />
                    <InfoLine label="Peso" value={editWeight} />
                    <InfoLine label="Escola" value={editSchool} />
                    <InfoLine label="Ocupação" value={editOccupation} />
                    <InfoLine label="Deslocamento" value={editMovement} />
                  </dl>
                )}
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="border-border/50 bg-card/40 backdrop-blur lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-primary" /> Aparência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClickToEditTextarea
                  forceEditing={editingText}
                  value={editAppearance}
                  onChange={setEditAppearance}
                  display={editAppearance}
                  placeholder="Descreva traços físicos, vestimenta, marcas..."
                  emptyLabel="Clique para descrever a aparência"
                  rows={4}
                />

              </CardContent>
            </Card>
          </div>

          {/* Atributos */}
          <Card className="border-border/50 bg-card/40 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Atributos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AtributosHexagon
                baseStats={[
                  { abbr: "FOR", label: "Força", value: editStr, onChange: setEditStr },
                  { abbr: "DEX", label: "Destreza", value: editDex, onChange: setEditDex },
                  { abbr: "CON", label: "Constituição", value: editCon, onChange: setEditCon },
                  { abbr: "INT", label: "Inteligência", value: editInt, onChange: setEditInt },
                  { abbr: "SAB", label: "Sabedoria", value: editWis, onChange: setEditWis },
                  { abbr: "PRE", label: "Presença", value: editCha, onChange: setEditCha },
                ] as BaseStat[]}
                customStats={editCustomStats}
                onCustomStatChange={(idx, v) =>
                  setEditCustomStats(editCustomStats.map((s, i) => (i === idx ? { ...s, value: v } : s)))
                }
                onCustomStatRemove={(idx) => setEditCustomStats(editCustomStats.filter((_, i) => i !== idx))}
                onAddCustomStat={addCustomStat}
              />
              {skills.length > 0 && (
                <div className="mt-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Perícias Dominadas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-md border border-primary/30 bg-primary/5 text-primary/90">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== STATUS ===== */}
        <TabsContent value="status" className="space-y-5 mt-5 focus-visible:outline-none">
          <div className="grid gap-4 md:grid-cols-2">
            <StatusPanel icon={Heart} label="Pontos de Vida" color="red">
              <BarraStatus label="PV atual" value={editHp} max={maxHp} color="red" onChange={setEditHp} onMaxChange={setEditMaxHp} />
              <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-[10px] text-muted-foreground">Fórmula: 10 + CON + (Nv-1)×5 = <strong className="text-foreground/80">{formulaHp}</strong></p>
                {maxHp !== formulaHp && (
                  <button type="button" onClick={() => setEditMaxHp(formulaHp)}
                    className="text-[10px] px-2 py-0.5 rounded border border-border/40 hover:border-primary/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                    Recalcular
                  </button>
                )}
              </div>
            </StatusPanel>

            <StatusPanel icon={Zap} label="Pontos de Energia" color="primary">
              <BarraStatus label="PE atual" value={editEnergy} max={maxEnergy} color="primary" onChange={setEditEnergy} onMaxChange={setEditMaxEnergy} />
              <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-[10px] text-muted-foreground">Fórmula: 10 + SAB + (Nv-1)×5 = <strong className="text-foreground/80">{formulaEnergy}</strong></p>
                {maxEnergy !== formulaEnergy && (
                  <button type="button" onClick={() => setEditMaxEnergy(formulaEnergy)}
                    className="text-[10px] px-2 py-0.5 rounded border border-border/40 hover:border-primary/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                    Recalcular
                  </button>
                )}
              </div>
            </StatusPanel>

            <StatusPanel icon={Sparkles} label="Integridade da Alma" color="primary">
              <BarraStatus label="Integridade" value={editSoul} max={maxSoul} color="primary" onChange={setEditSoul} onMaxChange={setEditMaxSoul} />
              <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-[10px] text-muted-foreground">Fórmula: 10 + PRE + (Nv-1)×2 = <strong className="text-foreground/80">{formulaSoul}</strong></p>
                {maxSoul !== formulaSoul && (
                  <button type="button" onClick={() => setEditMaxSoul(formulaSoul)}
                    className="text-[10px] px-2 py-0.5 rounded border border-border/40 hover:border-primary/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                    Recalcular
                  </button>
                )}
              </div>
            </StatusPanel>

            <StatusPanel icon={Shield} label="Defesas e Reflexos" color="cyan">
              <DefesaCard ca={editArmorClass} iniciativa={iniciativa} onCaChange={setEditArmorClass} />
            </StatusPanel>

            <StatusPanel icon={Eye} label="Atenção" color="cyan">
              <div className="flex items-center gap-3">
                <Input type="number" min={0} value={editAttention}
                  onChange={(e) => setEditAttention(Number(e.target.value) || 0)}
                  className="w-20 h-12 text-center text-2xl font-bold bg-background/60 border-cyan-400/30" />
                <p className="text-xs text-muted-foreground">Percepção passiva contra surpresa, ilusão e ocultação.</p>
              </div>
            </StatusPanel>

            <StatusPanel icon={Footprints} label="Deslocamento" color="muted">
              <Input value={editMovement} onChange={(e) => setEditMovement(e.target.value)}
                className="bg-background/60 text-sm font-mono" placeholder="9m" disabled={!editingText} />
              <p className="text-[10px] mt-2 text-muted-foreground">Distância percorrida por ação de movimento.</p>
            </StatusPanel>

            <StatusPanel icon={Dice5} label="Dados de Vida" color="red">
              <Input value={editHitDice} onChange={(e) => setEditHitDice(e.target.value)}
                className="bg-background/60 text-sm font-mono" placeholder="1d8" disabled={!editingText} />
              <p className="text-[10px] mt-2 text-muted-foreground">Use durante descansos curtos para recuperar PV.</p>
            </StatusPanel>

            <StatusPanel icon={Shield} label="Resistências" color="violet">
              <ClickToEditTextarea
                forceEditing={editingText}
                value={editResistances}
                onChange={setEditResistances}
                display={editResistances}
                placeholder="Ex: Amaldiçoado, Fogo, Veneno..."
                emptyLabel="Clique para adicionar resistências"
                rows={3}
              />

            </StatusPanel>
          </div>

          {/* Quick modifier summary */}
          <Card className="border-border/50 bg-card/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Modificadores Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
                {[
                  { l: "FOR", v: editStr, m: Math.floor((editStr - 10) / 2) },
                  { l: "DEX", v: editDex, m: modDex },
                  { l: "CON", v: editCon, m: Math.floor((editCon - 10) / 2) },
                  { l: "INT", v: editInt, m: Math.floor((editInt - 10) / 2) },
                  { l: "SAB", v: editWis, m: Math.floor((editWis - 10) / 2) },
                  { l: "PRE", v: editCha, m: Math.floor((editCha - 10) / 2) },
                ].map((x) => (
                  <div key={x.l} className="p-2 rounded-lg bg-background/40 border border-border/30">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{x.l}</div>
                    <div className="font-mono text-lg font-bold text-foreground">{x.v}</div>
                    <div className={`text-xs font-mono ${x.m >= 0 ? "text-primary" : "text-destructive"}`}>
                      {x.m >= 0 ? "+" : ""}{x.m}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground text-center">
                Iniciativa <strong className="text-foreground font-mono">+{modDex}</strong>
                <span className="mx-2">•</span>
                Dano corpo a corpo <strong className="text-foreground font-mono">+{modFor}</strong>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TÉCNICAS ===== */}
        <TabsContent value="techniques" className="space-y-5 mt-5 focus-visible:outline-none">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-transparent backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-primary">{character.technique || "Sem técnica inata"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {character.technique_description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{character.technique_description}</p>
              )}

              {editingText ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Habilidades, Movimentos e Universais</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditAbilities([...editAbilities, ""])} className="h-7 text-xs">
                      + Em branco
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {UNIVERSAL_PRESETS.map((p) => (
                      <Button key={p.label} type="button" variant="outline" size="sm"
                        onClick={() => setEditAbilities([...editAbilities, p.raw])}
                        className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                        + {p.label}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {editAbilities.map((ab, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <Textarea value={ab}
                          onChange={(e) => setEditAbilities(editAbilities.map((x, i) => (i === idx ? e.target.value : x)))}
                          className="bg-background/60 text-xs resize-none h-20 font-mono"
                          placeholder="Nome | Nível X | Custo: Y PE | Dano: ZdW | Descrição..." />
                        <Button type="button" variant="ghost" size="sm"
                          onClick={() => setEditAbilities(editAbilities.filter((_, i) => i !== idx))}
                          className="h-7 px-2 text-destructive hover:text-destructive shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    {editAbilities.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">Nenhuma habilidade. Use os botões acima.</p>
                    )}
                  </div>
                </div>
              ) : abilities.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Habilidades, Movimentos e Universais</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {abilities.map((ab, idx) => <AbilityCard key={`${ab}-${idx}`} raw={ab} />)}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== DOMÍNIO ===== */}
        <TabsContent value="domain" className="space-y-5 mt-5 focus-visible:outline-none">
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-purple-950/30 via-card/40 to-transparent backdrop-blur">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30"
                 style={{ background: "radial-gradient(circle, hsl(265 85% 50% / 0.6), transparent 70%)" }} />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="h-4 w-4 text-primary" /> Expansão de Domínio Inata
                <span className="font-jp text-xs tracking-widest text-primary/60 ml-2">領域展開</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ClickToEditTextarea
                forceEditing={editingText}
                value={editInnateDomain}
                onChange={setEditInnateDomain}
                display={editInnateDomain}
                placeholder="Nome do domínio, aparência, efeito garantido, condições de ativação..."
                emptyLabel="Clique para definir o domínio inato — ou use o criador abaixo"
                rows={6}
              />

              <div className="flex gap-2 pt-2 border-t border-border/30">
                <Link href="/dominios">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/40 hover:bg-primary/10">
                    <Wand2 className="h-3.5 w-3.5" /> Criador de Domínios
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== INVENTÁRIO ===== */}
        <TabsContent value="inventory" className="space-y-5 mt-5 focus-visible:outline-none">
          <Card className="border-border/50 bg-card/40 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-primary" /> Equipamentos e Ferramentas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equipment.length === 0 ? (
                <p className="text-sm italic text-muted-foreground/60">Inventário vazio. Edite na tela de criação para adicionar.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {equipment.map((item) => (
                    <div key={item} className="flex items-center gap-2 p-3 rounded-lg bg-background/40 border border-border/40 text-sm hover:border-primary/30 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {skills.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Perícias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-md border border-primary/30 bg-primary/5 text-primary/90">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== APTIDÕES ===== */}
        <TabsContent value="aptitudes" className="space-y-5 mt-5 focus-visible:outline-none">
          <Card className="border-border/50 bg-card/40 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Aptidões Amaldiçoadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aptitudes.length === 0 ? (
                <p className="text-sm italic text-muted-foreground/60">Nenhuma aptidão escolhida.</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {aptitudes.map((apt) => (
                    <div key={apt} className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/30 text-sm">
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground">{apt}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-border/30">
                <Link href="/aptidoes">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/40 hover:bg-primary/10">
                    <BookOpen className="h-3.5 w-3.5" /> Ver catálogo completo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== HISTÓRIA ===== */}
        <TabsContent value="history" className="space-y-5 mt-5 focus-visible:outline-none">
          <div className="grid gap-5 lg:grid-cols-2">
            <NarrativeCard icon={User} label="Personalidade"
              editing={editingText} value={editPersonality} onChange={setEditPersonality}
              display={editPersonality} placeholder="Traços de personalidade, maneirismos, hábitos..." />
            <NarrativeCard icon={Scroll} label="História"
              editing={editingText} value={editBackstory} onChange={setEditBackstory}
              display={editBackstory} placeholder="Origem, eventos marcantes, motivações..." rows={6} />
            <NarrativeCard icon={Sparkles} label="Ideais"
              editing={editingText} value={editIdeals} onChange={setEditIdeals}
              display={editIdeals} placeholder="Crenças, valores, o que move o personagem..." />
            <NarrativeCard icon={Heart} label="Ligações"
              editing={editingText} value={editBonds} onChange={setEditBonds}
              display={editBonds} placeholder="Pessoas, lugares ou objetos importantes..." />
            <NarrativeCard icon={Skull} label="Complicações"
              editing={editingText} value={editComplications} onChange={setEditComplications}
              display={editComplications} placeholder="Defeitos, traumas, segredos, fraquezas..." />
          </div>
        </TabsContent>

        {/* ===== NOTAS ===== */}
        <TabsContent value="notes" className="space-y-5 mt-5 focus-visible:outline-none">
          <Card className="border-border/50 bg-card/40 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Scroll className="h-3.5 w-3.5 text-primary" /> Anotações Livres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClickToEditTextarea
                forceEditing={editingText}
                value={editNotes}
                onChange={setEditNotes}
                display={editNotes}
                placeholder="Notas, votos de restrição, observações da campanha, segredos do personagem..."
                emptyLabel="Clique para começar a anotar"
                rows={8}
              />

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Small subcomponents
// ============================================================================

function TabTrigger({ value, icon: Icon, children }: { value: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="gap-1.5 text-xs uppercase tracking-wider font-display data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_12px_hsl(265_85%_62%_/_0.35)] data-[state=active]:border-primary/40 border border-transparent rounded-lg px-3 h-8"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </TabsTrigger>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: "violet" | "cyan" | "red" | "muted" }) {
  const cls = {
    violet: "bg-primary/15 border-primary/40 text-primary",
    cyan: "bg-cyan-400/10 border-cyan-400/40 text-cyan-300",
    red: "bg-destructive/15 border-destructive/40 text-red-300",
    muted: "bg-card/60 border-border/50 text-muted-foreground",
  }[color];
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${cls}`}>
      {children}
    </span>
  );
}

function StatusPanel({ icon: Icon, label, color, children }: {
  icon: React.ElementType; label: string; color: "red" | "primary" | "cyan" | "violet" | "muted"; children: React.ReactNode;
}) {
  const ring = {
    red: "border-destructive/30 shadow-[0_0_24px_hsl(355_80%_45%_/_0.15)]",
    primary: "border-primary/30 shadow-[0_0_24px_hsl(265_85%_50%_/_0.15)]",
    cyan: "border-cyan-400/30 shadow-[0_0_24px_hsl(200_90%_55%_/_0.15)]",
    violet: "border-purple-400/30 shadow-[0_0_24px_hsl(265_85%_62%_/_0.15)]",
    muted: "border-border/40",
  }[color];
  const iconColor = {
    red: "text-destructive", primary: "text-primary", cyan: "text-cyan-300",
    violet: "text-purple-300", muted: "text-muted-foreground",
  }[color];
  return (
    <Card className={`bg-card/40 backdrop-blur ${ring}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} /> {label}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FieldInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-8 text-sm bg-background/60" />
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <>
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground self-center">{label}</dt>
      <dd className="text-sm text-foreground font-medium">{value || <span className="text-muted-foreground/50 italic">—</span>}</dd>
    </>
  );
}

function NarrativeCard({
  icon: Icon, label, editing, value, onChange, display, placeholder, rows = 4,
}: {
  icon: React.ElementType; label: string; editing: boolean;
  value: string; onChange: (v: string) => void;
  display: string | null | undefined; placeholder: string; rows?: number;
}) {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" /> {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ClickToEditTextarea
          forceEditing={editing}
          value={value}
          onChange={onChange}
          display={display}
          placeholder={placeholder}
          rows={rows}
        />
      </CardContent>
    </Card>
  );
}

/** Popover picker that shows preset buttons + an "Outro" custom input. */
function PresetPicker({
  value,
  onChange,
  presets,
  label,
  placeholder,
  renderTrigger,
}: {
  value: string;
  onChange: (v: string) => void;
  presets: string[];
  label: string;
  placeholder: string;
  renderTrigger: (val: string, open: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isCustom = value !== "" && !presets.includes(value);
  const [customDraft, setCustomDraft] = useState(isCustom ? value : "");

  useEffect(() => {
    if (open) setCustomDraft(isCustom ? value : "");
  }, [open, value, isCustom]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  function commitCustom() {
    const v = customDraft.trim();
    if (v) {
      onChange(v);
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span>{renderTrigger(value, () => setOpen(true))}</span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 bg-card/95 backdrop-blur border-primary/30">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        <div className="flex flex-col gap-1 mb-3">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => pick(p)}
              className={`text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                value === p
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "hover:bg-primary/10 text-foreground border border-transparent"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Outro {isCustom && "(atual)"}</Label>
          <div className="flex gap-1.5">
            <Input
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitCustom(); }
              }}
              placeholder={placeholder}
              className="h-8 text-sm bg-background/60"
              autoFocus={isCustom}
            />
            <Button type="button" size="sm" onClick={commitCustom} disabled={!customDraft.trim()} className="h-8 px-3">
              Usar
            </Button>
          </div>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => pick("")}
            className="mt-3 text-[10px] text-muted-foreground hover:text-destructive transition-colors w-full text-center"
          >
            Limpar
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Editable tag pill backed by a PresetPicker — colored chip that opens a presets+custom popover. */
function PresetTag({
  color,
  value,
  onChange,
  presets,
  label,
  placeholder,
  prefix = "",
}: {
  color: "violet" | "cyan" | "red";
  value: string;
  onChange: (v: string) => void;
  presets: string[];
  label: string;
  placeholder: string;
  prefix?: string;
}) {
  const colorMap = {
    violet: "border-violet-400/40 bg-violet-500/10 text-violet-200",
    cyan: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
    red: "border-red-400/40 bg-red-500/10 text-red-200",
  }[color];

  return (
    <PresetPicker
      value={value}
      onChange={onChange}
      presets={presets}
      label={label}
      placeholder={placeholder}
      renderTrigger={(val, open) => (
        val ? (
          <button
            type="button"
            onClick={open}
            className={`text-xs px-2.5 py-0.5 rounded-full border ${colorMap} hover:brightness-125 transition-all cursor-pointer`}
            title="Clique para alterar"
          >
            {prefix}{val}
          </button>
        ) : (
          <button
            type="button"
            onClick={open}
            className="text-xs px-2.5 py-0.5 rounded-full border border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground/60 italic inline-flex items-center gap-1 transition-colors"
            title="Clique para escolher"
          >
            <Pencil className="h-2.5 w-2.5" /> {placeholder}
          </button>
        )
      )}
    />
  );
}

/** Single-line click-to-edit text input: displays value as text, becomes Input on click. */
function ClickToEditInline({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, value]);

  function commit() {
    onChange(draft.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        placeholder={placeholder}
        className={inputClassName}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setEditing(true); } }}
      className={`group inline-flex items-center gap-1.5 rounded-md hover:bg-primary/5 px-1 -mx-1 transition-colors cursor-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className ?? ""}`}
      title="Clique para editar"
    >
      {value ? (
        <span>{value}</span>
      ) : (
        <span className="italic text-muted-foreground/60 normal-case font-normal tracking-normal text-sm flex items-center gap-1">
          <Pencil className="h-3 w-3" /> {placeholder}
        </span>
      )}
    </span>
  );
}

/** Editable tag pill: shows colored chip; click to edit inline. */
function EditableTag({
  color,
  value,
  onChange,
  placeholder,
  prefix = "",
}: {
  color: "violet" | "cyan" | "red";
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  prefix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, value]);

  function commit() {
    onChange(draft.trim());
    setEditing(false);
  }

  const colorMap = {
    violet: "border-violet-400/40 bg-violet-500/10 text-violet-200 focus-within:border-violet-300/80",
    cyan: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200 focus-within:border-cyan-300/80",
    red: "border-red-400/40 bg-red-500/10 text-red-200 focus-within:border-red-300/80",
  }[color];

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        placeholder={placeholder}
        className={`text-xs px-2.5 py-0.5 rounded-full border outline-none w-40 ${colorMap}`}
      />
    );
  }

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`text-xs px-2.5 py-0.5 rounded-full border border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground/60 italic inline-flex items-center gap-1 transition-colors`}
        title="Clique para adicionar"
      >
        <Pencil className="h-2.5 w-2.5" /> {placeholder}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`text-xs px-2.5 py-0.5 rounded-full border ${colorMap} hover:brightness-125 transition-all cursor-text`}
      title="Clique para editar"
    >
      {prefix}{value}
    </button>
  );
}

/** Inline click-to-edit textarea: shows text/placeholder until clicked, then becomes editable. */
function ClickToEditTextarea({
  forceEditing = false,
  value,
  onChange,
  display,
  placeholder,
  rows = 4,
  emptyLabel = "Clique para adicionar",
  textareaClass,
}: {
  forceEditing?: boolean;
  value: string;
  onChange: (v: string) => void;
  display: string | null | undefined;
  placeholder: string;
  rows?: number;
  emptyLabel?: string;
  textareaClass?: string;
}) {
  const [localEditing, setLocalEditing] = useState(false);
  const editing = forceEditing || localEditing;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Autofocus when entering local edit mode
  useEffect(() => {
    if (localEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [localEditing]);

  const heightCls = textareaClass ?? (rows >= 8 ? "h-64" : rows === 6 ? "h-32" : rows >= 4 ? "h-24" : "h-20");

  if (editing) {
    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setLocalEditing(false)}
        className={`bg-background/60 resize-none text-sm ${heightCls}`}
        placeholder={placeholder}
      />
    );
  }

  if (display) {
    return (
      <button
        type="button"
        onClick={() => setLocalEditing(true)}
        className="block w-full text-left rounded-md -m-1 p-1 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-text"
        title="Clique para editar"
      >
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{display}</p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLocalEditing(true)}
      className="group flex items-center gap-2 w-full text-left rounded-md border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/[0.04] px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-text"
      title="Clique para adicionar"
    >
      <Pencil className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary/80 transition-colors shrink-0" />
      <span className="text-xs italic text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
        {emptyLabel}
      </span>
    </button>
  );
}

function AbilityCard({ raw }: { raw: string }) {
  const parts = raw.split(" | ");
  const nome = parts[0] ?? raw;
  const rest = parts.slice(1);
  const meta: { value: string; cls: string }[] = [];
  let descricao = "";
  for (const p of rest) {
    if (p.startsWith("Nível ")) meta.push({ value: p, cls: "border-primary/40 bg-primary/10 text-primary" });
    else if (p.startsWith("Custo: ")) meta.push({ value: p.replace("Custo: ", ""), cls: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" });
    else if (p.startsWith("Dano: ")) meta.push({ value: p.replace("Dano: ", ""), cls: "border-destructive/40 bg-destructive/10 text-red-300" });
    else if (p.startsWith("Teste: ")) meta.push({ value: p, cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" });
    else if (p.startsWith("Alcance: ")) meta.push({ value: p, cls: "border-border/40 bg-card/40 text-muted-foreground" });
    else descricao = descricao ? `${descricao} ${p}` : p;
  }
  return (
    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 via-primary/[0.03] to-transparent border border-primary/20 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-2 mb-2">
        <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <h4 className="font-semibold text-sm text-white">{nome}</h4>
      </div>
      {meta.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {meta.map((m, mi) => (
            <span key={mi} className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${m.cls}`}>
              {m.value}
            </span>
          ))}
        </div>
      )}
      {descricao && <p className="text-xs leading-relaxed text-muted-foreground pl-6">{descricao}</p>}
    </div>
  );
}
