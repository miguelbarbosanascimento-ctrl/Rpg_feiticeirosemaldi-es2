import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateCharacter, useListTechniques } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Save, User, Swords, Zap, Scroll, Package, Plus, X } from "lucide-react";
import { AtributosHexagon, type BaseStat } from "@/components/atributos";

const ORIGENS = [
  "Feiticeiro Jujutsu",
  "Usuário de Maldição",
  "Maldição Desperta",
  "Semi-Maldição",
  "Maldição Encarnada",
  "Caçador",
];

const CLANS = [
  "Nenhuma",
  "Gojo",
  "Zenin",
  "Kamo",
  "Inumaki",
  "Outro",
];

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

const APTIDOES_DISPONIVEIS = [
  { id: "reforco", nome: "Reforço Amaldiçoado", categoria: "Energia Amaldiçoada" },
  { id: "cura-ea", nome: "Cura Amaldiçoada", categoria: "Energia Amaldiçoada" },
  { id: "armamento", nome: "Armamento Amaldiçoado", categoria: "Energia Amaldiçoada" },
  { id: "sensibilidade", nome: "Sensibilidade Amaldiçoada", categoria: "Controle e Leitura" },
  { id: "leitura", nome: "Leitura de Técnica", categoria: "Controle e Leitura" },
  { id: "controle", nome: "Controle Refinado", categoria: "Controle e Leitura" },
  { id: "dominio-1", nome: "Aptidão de Domínio I", categoria: "Domínio" },
  { id: "dominio-2", nome: "Aptidão de Domínio II", categoria: "Domínio" },
  { id: "dominio-3", nome: "Aptidão de Domínio III", categoria: "Domínio" },
  { id: "barreira-1", nome: "Barreira Simples", categoria: "Barreira" },
  { id: "barreira-2", nome: "Barreira Refinada", categoria: "Barreira" },
  { id: "barreira-3", nome: "Barreira de Captura", categoria: "Barreira" },
  { id: "reversa-1", nome: "Cura Reversa I", categoria: "Energia Reversa" },
  { id: "reversa-2", nome: "Cura Reversa II", categoria: "Energia Reversa" },
  { id: "reversa-3", nome: "Técnica Reversa", categoria: "Energia Reversa" },
  { id: "voto", nome: "Voto de Restrição", categoria: "Especiais" },
  { id: "liberacao", nome: "Liberação Máxima", categoria: "Especiais" },
];

// Perícias: nome, atributo associado, carga (penalidade), somenteTreinada
const PERICIAS = [
  { nome: "Acrobacia", atributo: "DEX", carga: true, somenteTreinada: false },
  { nome: "Adestramento", atributo: "CAR", carga: false, somenteTreinada: true },
  { nome: "Arcanismo", atributo: "INT", carga: false, somenteTreinada: true },
  { nome: "Atletismo", atributo: "FOR", carga: false, somenteTreinada: false },
  { nome: "Atuação", atributo: "CAR", carga: false, somenteTreinada: false },
  { nome: "Ciências", atributo: "INT", carga: false, somenteTreinada: true },
  { nome: "Crime", atributo: "DEX", carga: true, somenteTreinada: true },
  { nome: "Diplomacia", atributo: "CAR", carga: false, somenteTreinada: false },
  { nome: "Enganação", atributo: "CAR", carga: false, somenteTreinada: false },
  { nome: "Fortitude", atributo: "CON", carga: false, somenteTreinada: false },
  { nome: "Furtividade", atributo: "DEX", carga: true, somenteTreinada: false },
  { nome: "Iniciativa", atributo: "DEX", carga: false, somenteTreinada: false },
  { nome: "Intimidação", atributo: "CAR", carga: false, somenteTreinada: false },
  { nome: "Intuição", atributo: "SAB", carga: false, somenteTreinada: false },
  { nome: "Investigação", atributo: "INT", carga: false, somenteTreinada: false },
  { nome: "Luta", atributo: "FOR", carga: false, somenteTreinada: false },
  { nome: "Medicina", atributo: "INT", carga: false, somenteTreinada: true },
  { nome: "Ocultismo", atributo: "INT", carga: false, somenteTreinada: true },
  { nome: "Percepção", atributo: "SAB", carga: false, somenteTreinada: false },
  { nome: "Pontaria", atributo: "DEX", carga: false, somenteTreinada: false },
  { nome: "Reflexos", atributo: "DEX", carga: false, somenteTreinada: false },
  { nome: "Religião", atributo: "SAB", carga: false, somenteTreinada: true },
  { nome: "Sobrevivência", atributo: "SAB", carga: false, somenteTreinada: false },
  { nome: "Tática", atributo: "INT", carga: false, somenteTreinada: true },
  { nome: "Vontade", atributo: "SAB", carga: false, somenteTreinada: false },
];

// Equipamentos do Livro Básico de Feiticeiros e Maldições
const EQUIPAMENTOS_PRESET: Array<{ categoria: string; itens: Array<{ nome: string; buff: string }> }> = [
  {
    categoria: "Armas Corpo-a-Corpo",
    itens: [
      { nome: "Catana", buff: "Dano 1d10 cortante. Versátil." },
      { nome: "Catana Amaldiçoada", buff: "Dano 1d10 cortante. Pode imbuir energia amaldiçoada para +1d6." },
      { nome: "Martelo", buff: "Dano 1d8 contundente. Versátil." },
      { nome: "Lança", buff: "Dano 1d6 perfurante. Alcance estendido." },
      { nome: "Adaga", buff: "Dano 1d4 perfurante. Leve, arremessável." },
      { nome: "Tonfa", buff: "Dano 1d6 contundente. +1 em testes de defesa." },
      { nome: "Bastão Bo", buff: "Dano 1d8 contundente. Duas mãos." },
      { nome: "Nunchaku", buff: "Dano 1d6 contundente. +1 iniciativa." },
      { nome: "Espada Longa", buff: "Dano 1d10 cortante. Versátil 1d12 com duas mãos." },
      { nome: "Espada Curta", buff: "Dano 1d6 perfurante. Acuidade." },
    ],
  },
  {
    categoria: "Armas à Distância",
    itens: [
      { nome: "Arco Longo", buff: "Dano 1d8 perfurante. Alcance 36m." },
      { nome: "Besta de Mão", buff: "Dano 1d6 perfurante. Recarga." },
      { nome: "Pistola", buff: "Dano 2d6 perfurante. Alcance 18m." },
      { nome: "Rifle", buff: "Dano 2d10 perfurante. Alcance 90m. Duas mãos." },
      { nome: "Pregos Amaldiçoados (10)", buff: "Munição para Boneco de Palha. Causa 1d8 por prego." },
    ],
  },
  {
    categoria: "Uniformes e Armaduras",
    itens: [
      { nome: "Uniforme de Feiticeiro", buff: "CA 11 + DEX. Sem penalidade." },
      { nome: "Uniforme Reforçado", buff: "CA 12 + DEX (máx +3). Resistência leve a dano físico." },
      { nome: "Armadura Leve", buff: "CA 13 + DEX (máx +2). +1 em testes de Fortitude." },
      { nome: "Uniforme Cerimonial", buff: "CA 10 + DEX. +2 em testes de Diplomacia e Persuasão." },
    ],
  },
  {
    categoria: "Escudos",
    itens: [
      { nome: "Escudo Pequeno", buff: "+1 CA. Permite uso de arma de uma mão." },
      { nome: "Escudo Grande", buff: "+2 CA. Reduz movimento em 1,5m." },
      { nome: "Escudo Amaldiçoado", buff: "+2 CA. Pode bloquear 1 técnica/dia." },
    ],
  },
  {
    categoria: "Ferramentas Amaldiçoadas",
    itens: [
      { nome: "Papel Selado", buff: "Permite armazenar 1 técnica para uso posterior." },
      { nome: "Talismã de Proteção", buff: "+1 em testes de resistência contra técnicas." },
      { nome: "Sal Amaldiçoado", buff: "Repele maldições de 4° grau. 5 doses." },
      { nome: "Amuleto de Barreira", buff: "Cria barreira de 1,5m por 1 turno. 1 uso/dia." },
      { nome: "Anel da Concentração", buff: "+1 em testes de Vontade e Controle." },
      { nome: "Bracelete Amaldiçoado", buff: "Armazena 5 PE adicionais que recarregam a cada descanso longo." },
      { nome: "Boneco de Palha", buff: "Componente obrigatório da técnica Boneco de Palha." },
    ],
  },
  {
    categoria: "Kits e Suprimentos",
    itens: [
      { nome: "Kit Médico", buff: "Permite estabilizar feridos e curar 1d4 PV (3 usos)." },
      { nome: "Kit de Ladrão", buff: "+2 em testes de Crime para abrir fechaduras." },
      { nome: "Kit de Disfarce", buff: "+2 em testes de Dissimulação." },
      { nome: "Mochila Aventureira", buff: "Comporta itens essenciais para uma missão." },
      { nome: "Lanterna", buff: "Ilumina até 6m. Bateria dura 8h." },
      { nome: "Corda de 15m", buff: "Resistente, suporta até 200kg." },
      { nome: "Rações de Viagem (5)", buff: "Alimento para 5 dias." },
    ],
  },
];

function calcModifier(score: number): number {
  return score;
}

function fmtMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

type CustomStat = { name: string; value: number };

// Cor escalonada por valor de treino: 0 cinza, 5 verde, 10 azul, 15 vermelho, 20 roxo, 25 branco
function trainingColor(value: number): string {
  if (value >= 25) return "text-white";
  if (value >= 20) return "text-purple-400";
  if (value >= 15) return "text-red-400";
  if (value >= 10) return "text-blue-400";
  if (value >= 5) return "text-green-400";
  return "text-muted-foreground/60";
}

type Ability = {
  nome: string;
  nivel: string;
  conjuracao: string;
  alcance: string;
  alvo: string;
  duracao: string;
  custoEnergia: string;
  dano: string;
  tipoDano: string;
  teste: string;
  descricao: string;
};

type EquipItem = {
  nome: string;
  buff: string;
};

type SkillState = {
  treinada: boolean;
  outros: number;
};

export default function CharacterForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { mutate: createCharacter, isPending } = useCreateCharacter();
  const { data: techniques } = useListTechniques();
  const [activeTab, setActiveTab] = useState("identidade");

  const [form, setForm] = useState({
    name: "",
    level: 1,
    origin: "",
    clanHeritage: "Nenhuma",
    clanCustom: "",
    specializations: [] as string[],
    grade: "4° Grau",
    backstory: "",
    personality: "",
    technique: "",
    technique_description: "",
    strength: 1,
    dexterity: 1,
    constitution: 1,
    intelligence: 1,
    wisdom: 1,
    charisma: 1,
    armorClass: 10,
    selectedAptitudes: [] as string[],
    skillsMap: {} as Record<string, SkillState>,
    equipmentItems: [] as EquipItem[],
    equipmentCategory: "",
    customEquipment: { nome: "", buff: "" },
    abilities: [] as Ability[],
    customStats: [] as CustomStat[],
    notes: "",
  });

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleAptitude = (nome: string) => {
    setForm((prev) => ({
      ...prev,
      selectedAptitudes: prev.selectedAptitudes.includes(nome)
        ? prev.selectedAptitudes.filter((a) => a !== nome)
        : [...prev.selectedAptitudes, nome],
    }));
  };

  const toggleSpecialization = (esp: string) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(esp)
        ? prev.specializations.filter((s) => s !== esp)
        : [...prev.specializations, esp],
    }));
  };

  const getAtributoValor = (abbr: string): number => {
    switch (abbr) {
      case "FOR": return form.strength;
      case "DEX": return form.dexterity;
      case "CON": return form.constitution;
      case "INT": return form.intelligence;
      case "SAB": return form.wisdom;
      case "CAR": return form.charisma;
      default: return 1;
    }
  };

  const masteryBonus = Math.ceil((form.level + 3) / 4);

  const calcBonusPericia = (pericia: typeof PERICIAS[number]) => {
    const state = form.skillsMap[pericia.nome];
    const treinada = state?.treinada ?? false;
    const outros = state?.outros ?? 0;
    const atrMod = calcModifier(getAtributoValor(pericia.atributo));
    return atrMod + (treinada ? masteryBonus : 0) + outros;
  };

  const setSkill = (nome: string, partial: Partial<SkillState>) => {
    setForm((prev) => ({
      ...prev,
      skillsMap: {
        ...prev.skillsMap,
        [nome]: { treinada: prev.skillsMap[nome]?.treinada ?? false, outros: prev.skillsMap[nome]?.outros ?? 0, ...partial },
      },
    }));
  };

  const addAbility = (preset?: Partial<Ability>) => {
    setForm((prev) => ({
      ...prev,
      abilities: [...prev.abilities, {
        nome: "",
        nivel: "0",
        conjuracao: "Ação Comum",
        alcance: "",
        alvo: "",
        duracao: "Imediata",
        custoEnergia: "0",
        dano: "",
        tipoDano: "",
        teste: "",
        descricao: "",
        ...preset,
      }],
    }));
  };

  const UNIVERSAL_PRESETS: { label: string; data: Partial<Ability> }[] = [
    {
      label: "Reforço de Energia Amaldiçoada",
      data: {
        nome: "Reforço de Energia Amaldiçoada",
        nivel: "1",
        conjuracao: "Ação Bônus",
        alcance: "Pessoal",
        alvo: "Si mesmo",
        duracao: "3 turnos",
        custoEnergia: "2",
        dano: "+1d6",
        tipoDano: "",
        teste: "",
        descricao: "Reveste o corpo em energia amaldiçoada. +1d6 de dano físico e +2 em CA por 3 turnos. Base do combate corpo a corpo de feiticeiros.",
      },
    },
    {
      label: "Lampejo Negro (Black Flash)",
      data: {
        nome: "Lampejo Negro (Black Flash)",
        nivel: "2",
        conjuracao: "Ação Comum",
        alcance: "Corpo a corpo",
        alvo: "Uma criatura",
        duracao: "Imediata",
        custoEnergia: "3",
        dano: "Ataque base × 2.5",
        tipoDano: "Contundente",
        teste: "Rolar 1d20: 18+ é Lampejo",
        descricao: "Acerto crítico espacial. Aplica energia amaldiçoada no impacto físico dentro de uma janela menor que 0.000001s. Em 1d20 ≥ 18, dano é multiplicado por 2.5. Quatro Lampejos seguidos colocam o usuário no Zone (próximos 3 ataques são Lampejos garantidos).",
      },
    },
    {
      label: "Técnica Reversa (RCE)",
      data: {
        nome: "Técnica Amaldiçoada Reversa",
        nivel: "3",
        conjuracao: "Ação Comum",
        alcance: "Toque",
        alvo: "Si mesmo ou aliado",
        duracao: "Imediata",
        custoEnergia: "4",
        dano: "Cura 6d8",
        tipoDano: "",
        teste: "",
        descricao: "Inverte a polaridade da energia negativa para gerar energia positiva. Cura 6d8 PV e remove uma condição negativa menor. Único método sobrenatural de cura disponível para feiticeiros.",
      },
    },
    {
      label: "Expansão de Domínio",
      data: {
        nome: "Expansão de Domínio",
        nivel: "5",
        conjuracao: "Ação Comum",
        alcance: "Cúpula de 15-25m",
        alvo: "Todos no domínio",
        duracao: "3 turnos",
        custoEnergia: "10",
        dano: "8d10 a 12d12",
        tipoDano: "Amaldiçoado",
        teste: "Acerto garantido dentro",
        descricao: "Manifesta o domínio inato do usuário. Cria uma cúpula amaldiçoada com acerto garantido do efeito assinatura. Após o uso: 1 nível de exaustão e -3 PE máximos pelo dia. Uso restrito: 1x por descanso longo.",
      },
    },
    {
      label: "Cortina Simples",
      data: {
        nome: "Cortina Simples (Barreira)",
        nivel: "1",
        conjuracao: "1 Minuto",
        alcance: "20m de raio",
        alvo: "Área",
        duracao: "1 hora",
        custoEnergia: "2",
        dano: "",
        tipoDano: "",
        teste: "",
        descricao: "Cúpula invisível que esconde atividade amaldiçoada de olhos comuns. Não impede passagem física. Útil para conter combates em áreas urbanas.",
      },
    },
    {
      label: "Barreira de Contenção",
      data: {
        nome: "Barreira de Contenção",
        nivel: "2",
        conjuracao: "Ação Comum",
        alcance: "12m de raio",
        alvo: "Área",
        duracao: "Concentração até 5 turnos",
        custoEnergia: "4",
        dano: "2d8",
        tipoDano: "Amaldiçoado",
        teste: "",
        descricao: "Cúpula sólida (CA 18, 80 PV). Bloqueia entrada e saída; quem tenta atravessar leva 2d8 de dano amaldiçoado.",
      },
    },
  ];

  const updateAbility = (i: number, partial: Partial<Ability>) => {
    setForm((prev) => {
      const newAbs = [...prev.abilities];
      newAbs[i] = { ...newAbs[i], ...partial };
      return { ...prev, abilities: newAbs };
    });
  };

  const removeAbility = (i: number) => {
    setForm((prev) => ({ ...prev, abilities: prev.abilities.filter((_, idx) => idx !== i) }));
  };

  const toggleEquipment = (item: EquipItem) => {
    setForm((prev) => {
      const exists = prev.equipmentItems.find((e) => e.nome === item.nome);
      return {
        ...prev,
        equipmentItems: exists
          ? prev.equipmentItems.filter((e) => e.nome !== item.nome)
          : [...prev.equipmentItems, item],
      };
    });
  };

  const addCustomEquipment = () => {
    if (!form.customEquipment.nome.trim()) {
      toast({ title: "Informe o nome do item.", variant: "destructive" });
      return;
    }
    if (!form.customEquipment.buff.trim()) {
      toast({ title: "Todo item precisa de um buff/efeito.", variant: "destructive" });
      return;
    }
    setForm((prev) => ({
      ...prev,
      equipmentItems: [...prev.equipmentItems, { ...prev.customEquipment }],
      customEquipment: { nome: "", buff: "" },
    }));
  };

  const removeEquipment = (nome: string) => {
    setForm((prev) => ({ ...prev, equipmentItems: prev.equipmentItems.filter((e) => e.nome !== nome) }));
  };

  const tabs = [
    { id: "identidade", label: "Identidade", icon: User },
    { id: "atributos", label: "Atributos", icon: Swords },
    { id: "pericias", label: "Perícias", icon: Scroll },
    { id: "tecnica", label: "Técnica", icon: Zap },
    { id: "aptidoes", label: "Aptidões", icon: Scroll },
    { id: "equipamentos", label: "Equipamentos", icon: Package },
  ];

  const currentIndex = tabs.findIndex((t) => t.id === activeTab);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === tabs.length - 1;

  const maxHp = 10 + form.constitution + (form.level - 1) * 5;
  const maxEnergy = 10 + form.wisdom + (form.level - 1) * 5;

  const updateCustomStat = (idx: number, value: number) => {
    setForm((p) => ({ ...p, customStats: p.customStats.map((s, i) => (i === idx ? { ...s, value } : s)) }));
  };

  const removeCustomStat = (idx: number) => {
    setForm((p) => ({ ...p, customStats: p.customStats.filter((_, i) => i !== idx) }));
  };

  function handleSubmit() {
    if (!form.name.trim()) {
      toast({ title: "Nome obrigatório", description: "Dê um nome ao seu personagem.", variant: "destructive" });
      setActiveTab("identidade");
      return;
    }
    if (!form.origin) {
      toast({ title: "Origem obrigatória", description: "Escolha a origem do personagem.", variant: "destructive" });
      setActiveTab("identidade");
      return;
    }
    if (form.specializations.length === 0) {
      toast({ title: "Especialização obrigatória", description: "Selecione ao menos uma especialização.", variant: "destructive" });
      setActiveTab("identidade");
      return;
    }
    if (form.clanHeritage === "Outro" && !form.clanCustom.trim()) {
      toast({ title: "Informe o nome do clã", description: "Você escolheu 'Outro' — escreva o nome do clã.", variant: "destructive" });
      setActiveTab("identidade");
      return;
    }

    const finalClan = form.clanHeritage === "Outro"
      ? form.clanCustom
      : form.clanHeritage !== "Nenhuma"
      ? form.clanHeritage
      : undefined;

    const trainedSkills = Object.entries(form.skillsMap)
      .filter(([, v]) => v.treinada)
      .map(([k]) => k);

    createCharacter(
      {
        data: {
          name: form.name,
          level: form.level,
          origin: form.origin,
          clanHeritage: finalClan,
          specialization: form.specializations.join(", "),
          grade: form.grade,
          backstory: form.backstory || undefined,
          personality: form.personality || undefined,
          technique: form.technique || undefined,
          technique_description: form.technique_description || undefined,
          strength: form.strength,
          dexterity: form.dexterity,
          constitution: form.constitution,
          intelligence: form.intelligence,
          wisdom: form.wisdom,
          charisma: form.charisma,
          armorClass: form.armorClass,
          aptitudes: form.selectedAptitudes.length > 0 ? JSON.stringify(form.selectedAptitudes) : undefined,
          customStats: form.customStats.length > 0 ? JSON.stringify(form.customStats) : undefined,
          skills: trainedSkills.length > 0 ? JSON.stringify(trainedSkills) : undefined,
          equipment: form.equipmentItems.length > 0 ? JSON.stringify(form.equipmentItems.map(e => `${e.nome} — ${e.buff}`)) : undefined,
          abilities: form.abilities.length > 0 ? JSON.stringify(form.abilities.filter(a => a.nome).map(a => {
            const parts = [a.nome];
            if (a.nivel) parts.push(`Nível ${a.nivel}`);
            if (a.custoEnergia && a.custoEnergia !== "0") parts.push(`Custo: ${a.custoEnergia} PE`);
            if (a.dano) parts.push(`Dano: ${a.dano}${a.tipoDano ? " " + a.tipoDano : ""}`);
            if (a.teste) parts.push(`Teste: ${a.teste}`);
            if (a.alcance) parts.push(`Alcance: ${a.alcance}`);
            if (a.descricao) parts.push(a.descricao);
            return parts.join(" | ");
          })) : undefined,
          notes: form.notes || undefined,
        },
      },
      {
        onSuccess: (data) => {
          toast({ title: "Ficha criada!", description: `${form.name} foi registrado com sucesso.` });
          navigate(`/fichas/${data.id}`);
        },
        onError: () => {
          toast({ title: "Erro ao criar ficha", description: "Tente novamente.", variant: "destructive" });
        },
      }
    );
  }

  const aptidoesPorCategoria = APTIDOES_DISPONIVEIS.reduce(
    (acc, apt) => {
      if (!acc[apt.categoria]) acc[apt.categoria] = [];
      acc[apt.categoria].push(apt);
      return acc;
    },
    {} as Record<string, typeof APTIDOES_DISPONIVEIS>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ── CINEMATIC HEADER ── */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-primary/[0.05] to-background p-6 md:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-45"
            style={{ background: "radial-gradient(circle, hsl(265 85% 50% / 0.4), transparent 70%)" }}
          />
          <div
            className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full blur-3xl opacity-35"
            style={{ background: "radial-gradient(circle, hsl(355 80% 45% / 0.3), transparent 70%)" }}
          />
          <div
            aria-hidden
            className="absolute inset-y-0 right-2 md:right-8 flex items-center select-none font-jp font-black leading-none text-[18vw] md:text-[12vw] opacity-[0.05]"
            style={{ color: "hsl(265 85% 70%)" }}
          >
            契
          </div>
        </div>
        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-jp text-xs tracking-[0.5em] text-primary/80">新術師</span>
            <span className="h-px w-12 bg-gradient-to-r from-primary/60 to-transparent" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider text-cursed">
            FORJAR NOVO FEITICEIRO
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            Preencha as informações do seu feiticeiro. Os campos marcados com <span className="text-destructive">*</span> são obrigatórios. A energia responde à intenção.
          </p>
        </div>
      </section>

      {/* ── PROGRESS / TAB STRIP ── */}
      <div className="relative">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
          {tabs.map((tab, i) => {
            const isActive = activeTab === tab.id;
            const isDone = i < currentIndex;
            return (
              <div key={tab.id} className="flex items-center gap-1 flex-1 min-w-fit">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-md text-xs font-display tracking-wider uppercase transition-all whitespace-nowrap border ${
                    isActive
                      ? "text-white border-primary/70 bg-gradient-to-br from-primary/30 to-primary/10 shadow-[0_0_18px_hsl(265_85%_62%_/_0.4)]"
                      : isDone
                      ? "text-primary/80 border-primary/30 bg-primary/[0.04] hover:border-primary/50"
                      : "text-muted-foreground border-border/40 hover:text-foreground hover:border-border"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold tabular-nums ${
                      isActive
                        ? "bg-primary text-white shadow-[0_0_10px_hsl(265_85%_62%)]"
                        : isDone
                        ? "bg-primary/30 text-primary"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
                {i < tabs.length - 1 && (
                  <div
                    className={`h-px flex-1 min-w-[12px] transition-colors ${
                      isDone ? "bg-gradient-to-r from-primary/60 to-primary/20" : "bg-border/40"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
          {tabs.map((t) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
        </TabsList>

        {/* ── IDENTIDADE ── */}
        <TabsContent value="identidade">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Identidade do Personagem
              </CardTitle>
              <CardDescription>Informações básicas de quem é este feiticeiro.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome do personagem"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="bg-background/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Nível</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={form.level}
                      onChange={(e) => set("level", Number(e.target.value))}
                      className="bg-background/60 w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Maestria: <strong className="text-foreground">+{masteryBonus}</strong>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Grau</Label>
                  <Select value={form.grade} onValueChange={(v) => set("grade", v)}>
                    <SelectTrigger className="bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRAUS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Origem *</Label>
                  <Select value={form.origin} onValueChange={(v) => set("origin", v)}>
                    <SelectTrigger className="bg-background/60">
                      <SelectValue placeholder="Selecione a origem..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGENS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Herança de Clã</Label>
                  <Select value={form.clanHeritage} onValueChange={(v) => set("clanHeritage", v)}>
                    <SelectTrigger className="bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLANS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.clanHeritage === "Outro" && (
                    <Input
                      placeholder="Digite o nome do clã..."
                      value={form.clanCustom}
                      onChange={(e) => set("clanCustom", e.target.value)}
                      className="bg-background/60 mt-2"
                    />
                  )}
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <Label>Especializações * <span className="text-xs text-muted-foreground font-normal">(selecione uma ou mais)</span></Label>
                    {form.specializations.length > 0 && (
                      <span className="text-xs text-primary">{form.specializations.length} selecionada(s)</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ESPECIALIZACOES.map((esp) => {
                      const selected = form.specializations.includes(esp);
                      return (
                        <button
                          key={esp}
                          type="button"
                          onClick={() => toggleSpecialization(esp)}
                          className={`px-3 py-2 rounded-md text-sm font-medium border transition-all text-left flex items-center gap-2 ${
                            selected
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${selected ? "border-primary bg-primary" : "border-border/60"}`}>
                            {selected && <span className="text-[10px] text-white font-bold leading-none">✓</span>}
                          </div>
                          {esp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator className="border-border/40" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Histórico e Personalidade
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="personality">Traços de Personalidade</Label>
                  <Textarea
                    id="personality"
                    placeholder="Como o personagem age, fala, pensa?"
                    value={form.personality}
                    onChange={(e) => set("personality", e.target.value)}
                    className="bg-background/60 resize-none h-20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="backstory">História</Label>
                  <Textarea
                    id="backstory"
                    placeholder="De onde veio este feiticeiro? O que o moldou?"
                    value={form.backstory}
                    onChange={(e) => set("backstory", e.target.value)}
                    className="bg-background/60 resize-none h-28"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ATRIBUTOS ── */}
        <TabsContent value="atributos">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Swords className="h-5 w-5 text-primary" />
                Atributos e Combate
              </CardTitle>
              <CardDescription>
                Cada atributo começa em 1 e funciona como modificador direto (estilo C.R.I.S). Use os botões + / − ou digite o valor.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 text-center">
                  Atributos Base — clique no número para editar
                </h3>
                <AtributosHexagon
                  baseStats={[
                    { abbr: "FOR", label: "Força", value: form.strength, onChange: (v) => set("strength", v) },
                    { abbr: "DEX", label: "Destreza", value: form.dexterity, onChange: (v) => set("dexterity", v) },
                    { abbr: "CON", label: "Constituição", value: form.constitution, onChange: (v) => set("constitution", v) },
                    { abbr: "INT", label: "Inteligência", value: form.intelligence, onChange: (v) => set("intelligence", v) },
                    { abbr: "SAB", label: "Sabedoria", value: form.wisdom, onChange: (v) => set("wisdom", v) },
                    { abbr: "CAR", label: "Carisma", value: form.charisma, onChange: (v) => set("charisma", v) },
                  ] as BaseStat[]}
                  customStats={form.customStats}
                  onCustomStatChange={updateCustomStat}
                  onCustomStatRemove={removeCustomStat}
                  onAddCustomStat={(name) => {
                    if (form.customStats.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
                      toast({ title: "Atributo já existe", variant: "destructive" });
                      return;
                    }
                    setForm((p) => ({ ...p, customStats: [...p.customStats, { name, value: 1 }] }));
                  }}
                />
              </div>

              <Separator className="border-border/40" />

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Estatísticas de Combate
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">PV Máximo</div>
                    <div className="text-3xl font-bold text-red-400">{maxHp}</div>
                    <div className="text-xs text-muted-foreground mt-1">10 + CON + (nível-1)×5</div>
                  </div>
                  <div className="p-4 border border-primary/30 rounded-lg bg-primary/5 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">PE Máximo</div>
                    <div className="text-3xl font-bold text-primary">{maxEnergy}</div>
                    <div className="text-xs text-muted-foreground mt-1">10 + SAB + (nível-1)×5</div>
                  </div>
                  <div className="p-4 border border-border/50 rounded-lg bg-card/30 space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Classe de Armadura
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.armorClass}
                      onChange={(e) => set("armorClass", Number(e.target.value))}
                      className="bg-background/60 text-center text-xl font-bold h-10"
                    />
                  </div>
                  <div className="p-4 border border-border/50 rounded-lg bg-card/30 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Bônus Maestria</div>
                    <div className="text-3xl font-bold">+{masteryBonus}</div>
                    <div className="text-xs text-muted-foreground mt-1">Nível {form.level}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PERÍCIAS ── */}
        <TabsContent value="pericias">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scroll className="h-5 w-5 text-primary" />
                Perícias
              </CardTitle>
              <CardDescription>
                Marque as perícias treinadas (somam o bônus de maestria). Adicione bônus extras em "Outros" se necessário.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border border-border/40 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_60px_70px_50px_60px] sm:grid-cols-[1fr_70px_70px_80px_80px] text-xs font-bold uppercase tracking-wider text-muted-foreground bg-card/60 border-b border-border/40">
                  <div className="px-3 py-2">Perícia</div>
                  <div className="px-2 py-2 text-center">Atrib.</div>
                  <div className="px-2 py-2 text-center">Bônus</div>
                  <div className="px-2 py-2 text-center">Treino</div>
                  <div className="px-2 py-2 text-center">Outros</div>
                </div>

                {PERICIAS.map((p) => {
                  const state = form.skillsMap[p.nome] ?? { treinada: false, outros: 0 };
                  const bonus = calcBonusPericia(p);
                  const colorClass = trainingColor(state.outros);

                  return (
                    <div
                      key={p.nome}
                      className="grid grid-cols-[1fr_60px_70px_50px_60px] sm:grid-cols-[1fr_70px_70px_80px_80px] items-center border-b border-border/20 last:border-b-0 hover:bg-card/40 transition-colors"
                    >
                      <div className={`px-3 py-2 text-sm font-medium flex items-center gap-1 ${colorClass}`}>
                        {p.nome}
                        {p.carga && <span className="text-red-400 text-xs" title="Penalidade de carga">+</span>}
                        {p.somenteTreinada && <span className="text-muted-foreground text-xs" title="Somente treinada">*</span>}
                      </div>
                      <div className="px-2 py-2 text-center text-xs font-mono text-muted-foreground">
                        ({p.atributo})
                      </div>
                      <div className="px-2 py-2 text-center">
                        <span className={`text-sm font-bold font-mono ${bonus > 0 ? "text-primary" : bonus < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                          {fmtMod(bonus)}
                        </span>
                      </div>
                      <div className="px-2 py-2 flex justify-center">
                        <Checkbox
                          checked={state.treinada}
                          onCheckedChange={(v) => setSkill(p.nome, { treinada: !!v })}
                        />
                      </div>
                      <div className="px-2 py-2">
                        <Input
                          type="number"
                          value={state.outros || 0}
                          onChange={(e) => setSkill(p.nome, { outros: Number(e.target.value) || 0 })}
                          className={`h-7 text-center text-xs font-mono font-bold bg-background/60 px-1 ${colorClass}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                <span><span className="text-red-400 font-bold">+</span> Penalidade de carga</span>
                <span><span className="text-muted-foreground font-bold">*</span> Somente treinada</span>
                <span className="flex items-center gap-2">
                  Treino:
                  <span className="text-muted-foreground/60 font-bold">0</span>
                  <span className="text-green-400 font-bold">5</span>
                  <span className="text-blue-400 font-bold">10</span>
                  <span className="text-red-400 font-bold">15</span>
                  <span className="text-purple-400 font-bold">20</span>
                  <span className="text-white font-bold">25</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TÉCNICA ── */}
        <TabsContent value="tecnica">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Técnica Amaldiçoada
              </CardTitle>
              <CardDescription>
                A técnica inata define o arsenal do feiticeiro. Escolha uma existente ou crie a sua.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <Label className="mb-3 block">Técnicas da Enciclopédia Amaldiçoada</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {techniques?.filter(t => !t.isCustom).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        set("technique", t.name);
                        set("technique_description", t.description);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        form.technique === t.name
                          ? "border-primary bg-primary/10"
                          : "border-border/40 bg-card/30 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{t.name}</span>
                        <Badge variant="outline" className="text-xs">{t.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      set("technique", "Técnica Original");
                      set("technique_description", "");
                    }}
                    className={`p-3 rounded-lg border text-left transition-all border-dashed ${
                      form.technique === "Técnica Original"
                        ? "border-primary bg-primary/10"
                        : "border-border/40 bg-card/30 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">+ Técnica Original</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Criar uma técnica inata única para o personagem.</p>
                  </button>
                </div>
              </div>

              {form.technique && (
                <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <div className="space-y-1.5">
                    <Label>Nome da Técnica</Label>
                    <Input
                      value={form.technique}
                      onChange={(e) => set("technique", e.target.value)}
                      className="bg-background/60"
                      placeholder="Nome da técnica inata..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Descrição e Funcionamento Básico</Label>
                    <Textarea
                      value={form.technique_description}
                      onChange={(e) => set("technique_description", e.target.value)}
                      className="bg-background/60 resize-none h-28"
                      placeholder="Como a técnica funciona? Quais são seus fundamentos?"
                    />
                  </div>

                  {/* Habilidades detalhadas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Habilidades, Movimentos e Universais</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addAbility()} className="gap-1 text-xs">
                        <Plus className="h-3 w-3" /> Adicionar Habilidade
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Inclua aqui as habilidades da técnica inata + movimentos universais (Reforço, Lampejo Negro, Técnica Reversa, Expansão de Domínio, Barreiras). Todo personagem começa com 2 habilidades de nível 0 ou 1.
                    </p>

                    <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/[0.04]">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary/80">Adicionar Habilidade Universal</p>
                      <div className="flex flex-wrap gap-1.5">
                        {UNIVERSAL_PRESETS.map((preset) => (
                          <Button
                            key={preset.label}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addAbility(preset.data)}
                            className="h-7 text-xs gap-1 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                          >
                            <Plus className="h-3 w-3" /> {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {form.abilities.length === 0 && (
                      <div className="text-center py-6 border border-dashed border-border/40 rounded-lg text-sm text-muted-foreground">
                        Clique em "Adicionar Habilidade" para começar.
                      </div>
                    )}

                    {form.abilities.map((ab, i) => (
                      <Card key={i} className="bg-card/40 border-border/40">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b border-border/30">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Habilidade {i + 1}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAbility(i)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Nome</Label>
                              <Input
                                value={ab.nome}
                                onChange={(e) => updateAbility(i, { nome: e.target.value })}
                                className="bg-background/60 h-8"
                                placeholder="Ex: Disparo de Pregos"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Nível</Label>
                              <Select value={ab.nivel} onValueChange={(v) => updateAbility(i, { nivel: v })}>
                                <SelectTrigger className="bg-background/60 h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["0", "1", "2", "3", "4", "5"].map((n) => <SelectItem key={n} value={n}>Nível {n}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Conjuração</Label>
                              <Select value={ab.conjuracao} onValueChange={(v) => updateAbility(i, { conjuracao: v })}>
                                <SelectTrigger className="bg-background/60 h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["Ação Comum", "Ação Bônus", "Reação", "Ação Livre", "1 Minuto", "10 Minutos"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Alcance</Label>
                              <Input
                                value={ab.alcance}
                                onChange={(e) => updateAbility(i, { alcance: e.target.value })}
                                className="bg-background/60 h-8"
                                placeholder="9 m"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Alvo</Label>
                              <Input
                                value={ab.alvo}
                                onChange={(e) => updateAbility(i, { alvo: e.target.value })}
                                className="bg-background/60 h-8"
                                placeholder="Uma criatura"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Duração</Label>
                              <Input
                                value={ab.duracao}
                                onChange={(e) => updateAbility(i, { duracao: e.target.value })}
                                className="bg-background/60 h-8"
                                placeholder="Imediata"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs flex items-center gap-1">
                                <span className="text-primary">PE</span> Custo de Energia
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                value={ab.custoEnergia}
                                onChange={(e) => updateAbility(i, { custoEnergia: e.target.value })}
                                className="bg-background/60 h-8 font-mono"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs flex items-center gap-1">
                                <span className="text-red-400">Dados de Dano</span>
                              </Label>
                              <Input
                                value={ab.dano}
                                onChange={(e) => updateAbility(i, { dano: e.target.value })}
                                className="bg-background/60 h-8 font-mono"
                                placeholder="2d8, 1d10..."
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo de Dano</Label>
                              <Select value={ab.tipoDano || "nenhum"} onValueChange={(v) => updateAbility(i, { tipoDano: v === "nenhum" ? "" : v })}>
                                <SelectTrigger className="bg-background/60 h-8"><SelectValue placeholder="Tipo..." /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="nenhum">Nenhum</SelectItem>
                                  {["Cortante", "Perfurante", "Contundente", "Força", "Fogo", "Frio", "Elétrico", "Ácido", "Veneno", "Psíquico", "Necrótico", "Radiante", "Trovão"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Teste de Ataque ou Resistência</Label>
                            <Input
                              value={ab.teste}
                              onChange={(e) => updateAbility(i, { teste: e.target.value })}
                              className="bg-background/60 h-8"
                              placeholder="Ex: Teste de Pontaria | Resistência de Reflexos"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Descrição / Efeito</Label>
                            <Textarea
                              value={ab.descricao}
                              onChange={(e) => updateAbility(i, { descricao: e.target.value })}
                              className="bg-background/60 resize-none h-20 text-sm"
                              placeholder="Descreva o efeito da habilidade em detalhes, incluindo condições, áreas de efeito, etc."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas Adicionais / Votos de Restrição</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className="bg-background/60 resize-none h-20"
                  placeholder="Votos de restrição, peculiaridades da técnica, notas do narrador..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APTIDÕES ── */}
        <TabsContent value="aptidoes">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scroll className="h-5 w-5 text-primary" />
                Aptidões Amaldiçoadas
              </CardTitle>
              <CardDescription>
                Selecione as aptidões do personagem. Elas definem o domínio da energia amaldiçoada.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {form.selectedAptitudes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border border-primary/20 rounded-lg bg-primary/5">
                  <span className="text-xs text-muted-foreground self-center mr-1">Selecionadas:</span>
                  {form.selectedAptitudes.map((a) => (
                    <Badge key={a} variant="secondary" className="cursor-pointer" onClick={() => toggleAptitude(a)}>
                      {a} ×
                    </Badge>
                  ))}
                </div>
              )}

              {Object.entries(aptidoesPorCategoria).map(([categoria, apts]) => (
                <div key={categoria}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-border/40" />
                    {categoria}
                    <span className="h-px flex-1 bg-border/40" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {apts.map((apt) => (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={() => toggleAptitude(apt.nome)}
                        className={`p-3 rounded-lg border text-left transition-all text-sm ${
                          form.selectedAptitudes.includes(apt.nome)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/40 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {apt.nome}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EQUIPAMENTOS ── */}
        <TabsContent value="equipamentos">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Equipamentos e Inventário
              </CardTitle>
              <CardDescription>
                Selecione itens do livro ou crie os seus. Todo item precisa ter um buff (efeito/benefício).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Itens selecionados */}
              {form.equipmentItems.length > 0 && (
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                    Itens Selecionados ({form.equipmentItems.length})
                  </div>
                  <div className="space-y-2">
                    {form.equipmentItems.map((item) => (
                      <div key={item.nome} className="flex items-start gap-3 p-2.5 rounded-md bg-background/40 border border-border/30">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold">{item.nome}</div>
                          <div className="text-xs text-muted-foreground">{item.buff}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEquipment(item.nome)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catálogo do livro - seletor de categoria */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Adicionar do Catálogo
                </Label>
                <Select
                  value={form.equipmentCategory}
                  onValueChange={(v) => set("equipmentCategory", v)}
                >
                  <SelectTrigger className="bg-background/60">
                    <SelectValue placeholder="Clique para escolher uma categoria de itens..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPAMENTOS_PRESET.map((cat) => (
                      <SelectItem key={cat.categoria} value={cat.categoria}>
                        {cat.categoria} ({cat.itens.length} itens)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {form.equipmentCategory && (() => {
                  const cat = EQUIPAMENTOS_PRESET.find((c) => c.categoria === form.equipmentCategory);
                  if (!cat) return null;
                  return (
                    <div className="border border-border/40 rounded-lg bg-card/20 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                        {cat.categoria}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.itens.map((item) => {
                          const selected = !!form.equipmentItems.find((e) => e.nome === item.nome);
                          return (
                            <button
                              key={item.nome}
                              type="button"
                              onClick={() => toggleEquipment(item)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selected
                                  ? "border-primary bg-primary/10"
                                  : "border-border/40 bg-card/40 hover:border-primary/30"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`text-sm font-semibold ${selected ? "text-primary" : ""}`}>
                                  {item.nome}
                                </span>
                                {selected && <span className="text-primary text-xs shrink-0">✓</span>}
                              </div>
                              <p className="text-xs text-muted-foreground">{item.buff}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <Separator className="border-border/40" />

              {/* Custom item */}
              <div className="p-4 border border-dashed border-border/60 rounded-lg bg-card/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Outro / Item Personalizado
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2">
                  <Input
                    value={form.customEquipment.nome}
                    onChange={(e) => set("customEquipment", { ...form.customEquipment, nome: e.target.value })}
                    className="bg-background/60"
                    placeholder="Nome do item..."
                  />
                  <Input
                    value={form.customEquipment.buff}
                    onChange={(e) => set("customEquipment", { ...form.customEquipment, buff: e.target.value })}
                    className="bg-background/60"
                    placeholder="Buff/efeito do item (obrigatório)..."
                  />
                  <Button type="button" onClick={addCustomEquipment} className="gap-1">
                    <Plus className="h-4 w-4" /> Adicionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Todos os itens precisam de um buff (descrição do efeito, bônus ou benefício mecânico).
                </p>
              </div>

              {/* Resumo final */}
              <div className="p-4 border border-border/40 rounded-lg bg-card/30 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Resumo da Ficha
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Nome:</span> <strong>{form.name || "—"}</strong></div>
                  <div><span className="text-muted-foreground">Nível:</span> <strong>{form.level}</strong></div>
                  <div><span className="text-muted-foreground">Origem:</span> <strong>{form.origin || "—"}</strong></div>
                  <div><span className="text-muted-foreground">Grau:</span> <strong>{form.grade}</strong></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Especializações:</span> <strong>{form.specializations.join(", ") || "—"}</strong></div>
                  <div><span className="text-muted-foreground">Técnica:</span> <strong>{form.technique || "—"}</strong></div>
                  <div><span className="text-muted-foreground">PV/PE:</span> <strong>{maxHp}/{maxEnergy}</strong></div>
                </div>
                {form.selectedAptitudes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.selectedAptitudes.map((a) => (
                      <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setActiveTab(tabs[currentIndex - 1]?.id)}
          disabled={isFirst}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar Ficha"}
          </Button>
        ) : (
          <Button onClick={() => setActiveTab(tabs[currentIndex + 1]?.id)} className="gap-2">
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
