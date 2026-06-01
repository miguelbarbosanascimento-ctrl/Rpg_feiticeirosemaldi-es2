import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Shield, Swords, X, Plus, Pencil } from "lucide-react";

export type CustomStat = { name: string; value: number };

function ringFor(value: number): string {
  if (value >= 8) return "from-purple-500/40 to-purple-700/15 border-purple-400/70 shadow-purple-500/20";
  if (value >= 5) return "from-red-500/40 to-red-700/15 border-red-400/70 shadow-red-500/20";
  if (value >= 3) return "from-primary/40 to-primary/10 border-primary/70 shadow-primary/20";
  return "from-muted/30 to-muted/10 border-border/60 shadow-black/10";
}

export function AtributoCircle({
  label,
  abbr,
  value,
  onChange,
  onRemove,
  size = "md",
}: {
  label: string;
  abbr: string;
  value: number;
  onChange?: (v: number) => void;
  onRemove?: () => void;
  size?: "sm" | "md";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editable = !!onChange;
  const sizeCls = size === "sm" ? "w-16 h-16" : "w-[5.5rem] h-[5.5rem]";
  const numCls = size === "sm" ? "text-xl" : "text-3xl";

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, value]);

  function commit() {
    const n = Math.max(0, Math.min(99, Number(draft) || 0));
    onChange?.(n);
    setEditing(false);
  }

  return (
    <div className="relative group flex flex-col items-center gap-1.5 select-none">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover atributo ${label}`}
          className="absolute -top-1 -right-1 z-20 w-5 h-5 rounded-full bg-destructive/90 text-white text-[10px] md:opacity-60 md:group-hover:opacity-100 transition-opacity hover:bg-destructive flex items-center justify-center shadow"
          title="Remover atributo"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <div className={`relative ${sizeCls} rounded-full bg-gradient-to-br ${ringFor(value)} border-2 shadow-lg flex items-center justify-center transition-transform hover:scale-[1.04]`}>
        <span className="absolute top-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{abbr}</span>
        {editing && editable ? (
          <input
            ref={inputRef}
            type="number"
            min={0}
            max={99}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commit(); }
              if (e.key === "Escape") { setDraft(String(value)); setEditing(false); }
            }}
            className={`w-12 mt-2 bg-transparent text-center ${numCls} font-bold text-white outline-none border-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          />
        ) : (
          <button
            type="button"
            disabled={!editable}
            onClick={() => editable && setEditing(true)}
            className={`mt-2 ${numCls} font-bold text-white leading-none ${editable ? "cursor-pointer hover:text-primary transition-colors" : "cursor-default"}`}
            title={editable ? "Clique para editar" : undefined}
          >
            {value}
          </button>
        )}
        {editable && !editing && (
          <>
            <button
              type="button"
              aria-label={`Diminuir ${label}`}
              onClick={() => onChange?.(Math.max(0, value - 1))}
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/90 border border-border/70 hover:bg-destructive/30 hover:border-destructive/60 text-base font-bold leading-none flex items-center justify-center md:opacity-70 md:group-hover:opacity-100 transition-opacity"
            >−</button>
            <button
              type="button"
              aria-label={`Aumentar ${label}`}
              onClick={() => onChange?.(Math.min(99, value + 1))}
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/90 border border-border/70 hover:bg-primary/30 hover:border-primary/60 text-base font-bold leading-none flex items-center justify-center md:opacity-70 md:group-hover:opacity-100 transition-opacity"
            >+</button>
          </>
        )}
      </div>
      <span className="text-[11px] font-medium text-foreground/90 text-center max-w-[6rem] truncate uppercase tracking-wide">{label}</span>
    </div>
  );
}

export type BaseStat = { abbr: string; label: string; value: number; onChange?: (v: number) => void };

export function AtributosHexagon({
  baseStats,
  customStats,
  onCustomStatChange,
  onCustomStatRemove,
  onAddCustomStat,
}: {
  baseStats: BaseStat[];
  customStats: CustomStat[];
  onCustomStatChange?: (idx: number, v: number) => void;
  onCustomStatRemove?: (idx: number) => void;
  onAddCustomStat?: (name: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const six = baseStats.slice(0, 6);

  const positions = six.map((_, i) => {
    const angle = (-90 + i * 60) * (Math.PI / 180);
    return {
      left: 200 + Math.cos(angle) * 140 - 44,
      top: 180 + Math.sin(angle) * 140 - 44,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:hidden">
        {six.map((s) => (
          <AtributoCircle key={s.abbr} label={s.label} abbr={s.abbr} value={s.value} onChange={s.onChange} />
        ))}
        {customStats.map((cs, idx) => (
          <AtributoCircle
            key={`m-${cs.name}-${idx}`}
            label={cs.name}
            abbr={cs.name.slice(0, 3).toUpperCase()}
            value={cs.value}
            onChange={onCustomStatChange ? (v) => onCustomStatChange(idx, v) : undefined}
            onRemove={onCustomStatRemove ? () => onCustomStatRemove(idx) : undefined}
          />
        ))}
      </div>

      <div className="hidden md:block relative mx-auto" style={{ width: 400, height: 360 }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-primary/15 bg-gradient-radial from-primary/[0.04] to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-primary/25 flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground/70 font-semibold">Atributos</span>
        </div>
        {six.map((s, i) => (
          <div key={s.abbr} className="absolute" style={positions[i]}>
            <AtributoCircle label={s.label} abbr={s.abbr} value={s.value} onChange={s.onChange} />
          </div>
        ))}
      </div>

      {customStats.length > 0 && (
        <div className="hidden md:flex flex-wrap justify-center gap-4 pt-2 border-t border-border/30">
          {customStats.map((cs, idx) => (
            <AtributoCircle
              key={`d-${cs.name}-${idx}`}
              label={cs.name}
              abbr={cs.name.slice(0, 3).toUpperCase()}
              value={cs.value}
              onChange={onCustomStatChange ? (v) => onCustomStatChange(idx, v) : undefined}
              onRemove={onCustomStatRemove ? () => onCustomStatRemove(idx) : undefined}
            />
          ))}
        </div>
      )}

      {onAddCustomStat && (
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-center max-w-md mx-auto">
          <Input
            placeholder="Nome do atributo (ex: Sorte, Honra, Sanidade...)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (newName.trim()) { onAddCustomStat(newName.trim()); setNewName(""); }
              }
            }}
            className="bg-background/60 h-9 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { if (newName.trim()) { onAddCustomStat(newName.trim()); setNewName(""); } }}
            className="gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>
      )}
    </div>
  );
}

export function BarraStatus({
  label,
  value,
  max,
  color,
  onChange,
  onMaxChange,
}: {
  label: string;
  value: number;
  max: number;
  color: "red" | "primary" | "amber";
  onChange?: (v: number) => void;
  onMaxChange?: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [editingMax, setEditingMax] = useState(false);
  const [maxDraft, setMaxDraft] = useState(String(max));
  const editable = !!onChange;
  const maxEditable = !!onMaxChange;

  useEffect(() => {
    if (editingMax) setMaxDraft(String(max));
  }, [editingMax, max]);

  function commitMax() {
    const n = Math.max(1, Number(maxDraft) || 1);
    onMaxChange?.(n);
    setEditingMax(false);
  }

  const overflow = value > max;
  const pct = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));

  const colorMap = {
    red: { text: "text-red-400", bar: "bg-gradient-to-r from-red-700 to-red-400", border: "border-red-500/40", glow: "shadow-red-500/20", overflowText: "text-amber-300", overflowBar: "from-amber-500 via-red-400 to-amber-300", overflowGlow: "shadow-[0_0_18px_hsl(45_95%_60%_/_0.55)]" },
    primary: { text: "text-primary", bar: "bg-gradient-to-r from-purple-700 to-primary", border: "border-primary/40", glow: "shadow-primary/20", overflowText: "text-fuchsia-300", overflowBar: "from-fuchsia-500 via-primary to-fuchsia-300", overflowGlow: "shadow-[0_0_18px_hsl(290_95%_65%_/_0.55)]" },
    amber: { text: "text-amber-400", bar: "bg-gradient-to-r from-amber-700 to-amber-400", border: "border-amber-500/40", glow: "shadow-amber-500/20", overflowText: "text-amber-200", overflowBar: "from-amber-500 via-amber-300 to-white", overflowGlow: "shadow-[0_0_18px_hsl(45_95%_70%_/_0.6)]" },
  }[color];

  useEffect(() => {
    if (editing) setDraft(String(value));
  }, [editing, value]);

  function commit() {
    const n = Math.max(0, Number(draft) || 0);
    onChange?.(n);
    setEditing(false);
  }

  const adjust = (delta: number) => onChange?.(Math.max(0, value + delta));

  return (
    <div className={`rounded-lg border ${overflow ? "border-amber-400/50" : colorMap.border} bg-card/30 px-3 py-2 shadow ${overflow ? colorMap.overflowGlow : colorMap.glow} transition-colors`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-bold uppercase tracking-[0.22em] ${colorMap.text}`}>{label}</span>
        {maxEditable ? (
          editingMax ? (
            <input
              autoFocus
              type="number"
              min={1}
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value)}
              onBlur={commitMax}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitMax(); }
                if (e.key === "Escape") { setMaxDraft(String(max)); setEditingMax(false); }
              }}
              className="w-16 h-5 text-[10px] font-mono bg-background/80 border border-primary/40 rounded text-center text-white outline-none focus:border-primary/80 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingMax(true)}
              className={`group text-[10px] font-mono px-1.5 py-0.5 rounded border border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors inline-flex items-center gap-1 ${overflow ? colorMap.overflowText : "text-muted-foreground"}`}
              title="Clique para editar o máximo"
            >
              <Pencil className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
              {overflow ? `+${value - max} acima` : `máx ${max}`}
            </button>
          )
        ) : (
          <span className={`text-[10px] font-mono ${overflow ? colorMap.overflowText : "text-muted-foreground"}`}>
            {overflow ? `+${value - max} acima` : `máx ${max}`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {editable && (
          <>
            <button type="button" onClick={() => adjust(-5)} className="w-6 h-6 rounded bg-card/60 border border-border/50 hover:bg-destructive/20 hover:border-destructive/50 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" title="-5">
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => adjust(-1)} className="w-6 h-6 rounded bg-card/60 border border-border/50 hover:bg-destructive/20 hover:border-destructive/50 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" title="-1">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        <div className={`flex-1 relative h-7 rounded-md bg-secondary/40 overflow-hidden border ${overflow ? "border-amber-400/40" : "border-border/40"}`}>
          <div className={`absolute inset-y-0 left-0 ${colorMap.bar} transition-all`} style={{ width: `${pct}%` }} />
          {overflow && (
            <div className={`absolute inset-0 bg-gradient-to-r ${colorMap.overflowBar} opacity-90 animate-pulse-glow`} style={{ mixBlendMode: "screen" }} />
          )}
          {editing && editable ? (
            <input
              autoFocus
              type="number"
              min={0}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") { setDraft(String(value)); setEditing(false); }
              }}
              className="absolute inset-0 w-full bg-transparent text-center text-sm font-bold font-mono text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          ) : (
            <button
              type="button"
              disabled={!editable}
              onClick={() => editable && setEditing(true)}
              className={`absolute inset-0 w-full text-center text-sm font-bold font-mono ${overflow ? "text-amber-100 drop-shadow-[0_0_6px_rgba(252,211,77,0.85)]" : "text-white"} ${editable ? "cursor-pointer" : "cursor-default"}`}
              title={editable ? "Clique para editar (pode passar do máximo)" : undefined}
            >
              {value} / {max}
            </button>
          )}
        </div>
        {editable && (
          <>
            <button type="button" onClick={() => adjust(1)} className="w-6 h-6 rounded bg-card/60 border border-border/50 hover:bg-primary/20 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" title="+1">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => adjust(5)} className="w-6 h-6 rounded bg-card/60 border border-border/50 hover:bg-primary/20 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" title="+5">
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function DefesaCard({
  ca,
  iniciativa,
  onCaChange,
}: {
  ca: number;
  iniciativa: number;
  onCaChange?: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(ca));
  const editable = !!onCaChange;

  useEffect(() => { if (editing) setDraft(String(ca)); }, [editing, ca]);

  function commit() {
    const n = Math.max(0, Math.min(99, Number(draft) || 0));
    onCaChange?.(n);
    setEditing(false);
  }

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex-1 rounded-lg border border-border/40 bg-card/30 px-3 py-2 flex items-center gap-3">
        <Shield className="h-6 w-6 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Defesa</div>
          {editing && editable ? (
            <input
              autoFocus
              type="number"
              min={0}
              max={99}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") { setDraft(String(ca)); setEditing(false); }
              }}
              className="w-16 bg-transparent text-xl font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          ) : (
            <button
              type="button"
              disabled={!editable}
              onClick={() => editable && setEditing(true)}
              className={`text-xl font-bold ${editable ? "cursor-pointer hover:text-primary transition-colors" : "cursor-default"}`}
            >
              {ca}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 rounded-lg border border-border/40 bg-card/30 px-3 py-2 flex items-center gap-3">
        <Swords className="h-6 w-6 text-muted-foreground shrink-0" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Iniciativa</div>
          <div className="text-xl font-bold">{iniciativa >= 0 ? `+${iniciativa}` : iniciativa}</div>
        </div>
      </div>
    </div>
  );
}
