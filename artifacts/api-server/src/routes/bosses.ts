import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, bossesTable } from "@workspace/db";
import {
  CreateBossBody,
  GetBossParams,
  UpdateBossParams,
  UpdateBossBody,
  DeleteBossParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const MAX_IMAGE_DATA_URL = 2_000_000;

function validateImage(raw: unknown, field: string): { ok: true } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") return { ok: true };
  if (typeof raw !== "string") return { ok: false, error: `${field} inválido` };
  if (raw.length > MAX_IMAGE_DATA_URL) return { ok: false, error: `${field} excede tamanho máximo (~2MB)` };
  return { ok: true };
}

const router: IRouter = Router();

function mapSummary(b: typeof bossesTable.$inferSelect) {
  return {
    id: b.id,
    name: b.name,
    photoUrl: b.photoUrl ?? null,
    vd: b.vd,
    category: b.category,
    size: b.size,
    grade: b.grade,
    hp: b.hp,
    maxHp: b.maxHp,
    innateTechnique: b.innateTechnique ?? null,
    createdAt: b.createdAt.toISOString(),
  };
}

function map(b: typeof bossesTable.$inferSelect) {
  return {
    id: b.id,
    name: b.name,
    photoUrl: b.photoUrl ?? null,
    vd: b.vd,
    category: b.category,
    size: b.size,
    grade: b.grade,
    domain: b.domain ?? null,
    description: b.description ?? null,
    appearance: b.appearance ?? null,
    strength: b.strength,
    dexterity: b.dexterity,
    constitution: b.constitution,
    intelligence: b.intelligence,
    wisdom: b.wisdom,
    charisma: b.charisma,
    hp: b.hp,
    maxHp: b.maxHp,
    energy: b.energy,
    maxEnergy: b.maxEnergy,
    armorClass: b.armorClass,
    attention: b.attention,
    movement: b.movement,
    hitDice: b.hitDice,
    abilities: b.abilities ?? null,
    innateTechnique: b.innateTechnique ?? null,
    techniqueDescription: b.techniqueDescription ?? null,
    weaknesses: b.weaknesses ?? null,
    resistances: b.resistances ?? null,
    loot: b.loot ?? null,
    notes: b.notes ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

router.get("/bosses", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db.select().from(bossesTable).where(eq(bossesTable.userId, userId)).orderBy(bossesTable.vd);
  res.json(rows.map(mapSummary));
});

router.post("/bosses", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = CreateBossBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const photo = validateImage(d.photoUrl, "photoUrl");
  if (!photo.ok) { res.status(400).json({ error: photo.error }); return; }
  const con = d.constitution ?? 10;
  const wis = d.wisdom ?? 10;
  const maxHp = d.maxHp ?? 30 + con * 2;
  const maxEnergy = d.maxEnergy ?? 10 + wis;
  const [row] = await db.insert(bossesTable).values({
    userId,
    name: d.name,
    photoUrl: d.photoUrl ?? null,
    vd: d.vd ?? 10,
    category: d.category ?? "Maldição",
    size: d.size ?? "Médio",
    grade: d.grade ?? "3° Grau",
    domain: d.domain ?? null,
    description: d.description ?? null,
    appearance: d.appearance ?? null,
    strength: d.strength ?? 10,
    dexterity: d.dexterity ?? 10,
    constitution: con,
    intelligence: d.intelligence ?? 10,
    wisdom: wis,
    charisma: d.charisma ?? 10,
    hp: d.hp ?? maxHp,
    maxHp,
    energy: d.energy ?? maxEnergy,
    maxEnergy,
    armorClass: d.armorClass ?? 12,
    attention: d.attention ?? 10 + wis,
    movement: d.movement ?? "9m",
    hitDice: d.hitDice ?? "4d10",
    abilities: d.abilities ?? null,
    innateTechnique: d.innateTechnique ?? null,
    techniqueDescription: d.techniqueDescription ?? null,
    weaknesses: d.weaknesses ?? null,
    resistances: d.resistances ?? null,
    loot: d.loot ?? null,
    notes: d.notes ?? null,
  }).returning();
  res.status(201).json(map(row));
});

router.get("/bosses/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = GetBossParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.select().from(bossesTable)
    .where(and(eq(bossesTable.id, params.data.id), eq(bossesTable.userId, userId)));
  if (!row) { res.status(404).json({ error: "Boss não encontrado" }); return; }
  res.json(map(row));
});

router.patch("/bosses/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = UpdateBossParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateBossBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  if (d.photoUrl !== undefined) {
    const r = validateImage(d.photoUrl, "photoUrl");
    if (!r.ok) { res.status(400).json({ error: r.error }); return; }
  }
  const updateData: Record<string, unknown> = {};
  const passthrough: (keyof typeof d)[] = [
    "name","photoUrl","vd","category","size","grade","domain","description","appearance",
    "strength","dexterity","constitution","intelligence","wisdom","charisma",
    "hp","maxHp","energy","maxEnergy","armorClass","attention","movement","hitDice",
    "abilities","innateTechnique","techniqueDescription","weaknesses","resistances","loot","notes",
  ];
  for (const k of passthrough) {
    if (d[k] !== undefined) updateData[k] = d[k];
  }
  const [row] = await db.update(bossesTable).set(updateData)
    .where(and(eq(bossesTable.id, params.data.id), eq(bossesTable.userId, userId)))
    .returning();
  if (!row) { res.status(404).json({ error: "Boss não encontrado" }); return; }
  res.json(map(row));
});

router.delete("/bosses/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = DeleteBossParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const deleted = await db.delete(bossesTable)
    .where(and(eq(bossesTable.id, params.data.id), eq(bossesTable.userId, userId)))
    .returning({ id: bossesTable.id });
  if (deleted.length === 0) { res.status(404).json({ error: "Boss não encontrado" }); return; }
  res.status(204).send();
});

export default router;
