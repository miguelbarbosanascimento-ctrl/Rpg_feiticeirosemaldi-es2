import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, campaignsTable } from "@workspace/db";
import {
  CreateCampaignBody,
  GetCampaignParams,
  UpdateCampaignParams,
  UpdateCampaignBody,
  DeleteCampaignParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const MAX_IMAGE_DATA_URL = 2_000_000;

function validateIdList(raw: unknown, field: string): { ok: true; value: string | null } | { ok: false; error: string } {
  if (raw === undefined) return { ok: true, value: null };
  if (raw === null || raw === "") return { ok: true, value: null };
  if (typeof raw !== "string") return { ok: false, error: `${field} deve ser uma string JSON` };
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return { ok: false, error: `${field} deve ser um array` };
    if (!arr.every((x) => typeof x === "number" && Number.isInteger(x) && x > 0)) {
      return { ok: false, error: `${field} deve conter apenas IDs inteiros positivos` };
    }
    return { ok: true, value: JSON.stringify(arr) };
  } catch {
    return { ok: false, error: `${field} contém JSON inválido` };
  }
}

function validateImage(raw: unknown, field: string): { ok: true } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") return { ok: true };
  if (typeof raw !== "string") return { ok: false, error: `${field} inválido` };
  if (raw.length > MAX_IMAGE_DATA_URL) return { ok: false, error: `${field} excede tamanho máximo (~2MB)` };
  return { ok: true };
}

const router: IRouter = Router();

function mapSummary(c: typeof campaignsTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    coverUrl: c.coverUrl ?? null,
    status: c.status,
    currentArc: c.currentArc ?? null,
    partyName: c.partyName ?? null,
    synopsis: c.synopsis ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

function map(c: typeof campaignsTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    coverUrl: c.coverUrl ?? null,
    synopsis: c.synopsis ?? null,
    setting: c.setting ?? null,
    status: c.status,
    currentArc: c.currentArc ?? null,
    nextSession: c.nextSession ?? null,
    partyName: c.partyName ?? null,
    playerCharacterIds: c.playerCharacterIds ?? null,
    bossIds: c.bossIds ?? null,
    sessionLog: c.sessionLog ?? null,
    npcs: c.npcs ?? null,
    locations: c.locations ?? null,
    notes: c.notes ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

router.get("/campaigns", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db.select().from(campaignsTable)
    .where(eq(campaignsTable.userId, userId))
    .orderBy(campaignsTable.createdAt);
  res.json(rows.map(mapSummary));
});

router.post("/campaigns", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const players = validateIdList(d.playerCharacterIds, "playerCharacterIds");
  if (!players.ok) { res.status(400).json({ error: players.error }); return; }
  const bosses = validateIdList(d.bossIds, "bossIds");
  if (!bosses.ok) { res.status(400).json({ error: bosses.error }); return; }
  const cover = validateImage(d.coverUrl, "coverUrl");
  if (!cover.ok) { res.status(400).json({ error: cover.error }); return; }
  const [row] = await db.insert(campaignsTable).values({
    userId,
    name: d.name,
    coverUrl: d.coverUrl ?? null,
    synopsis: d.synopsis ?? null,
    setting: d.setting ?? null,
    status: d.status ?? "Em andamento",
    currentArc: d.currentArc ?? null,
    nextSession: d.nextSession ?? null,
    partyName: d.partyName ?? null,
    playerCharacterIds: players.value,
    bossIds: bosses.value,
    sessionLog: d.sessionLog ?? null,
    npcs: d.npcs ?? null,
    locations: d.locations ?? null,
    notes: d.notes ?? null,
  }).returning();
  res.status(201).json(map(row));
});

router.get("/campaigns/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = GetCampaignParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.select().from(campaignsTable)
    .where(and(eq(campaignsTable.id, params.data.id), eq(campaignsTable.userId, userId)));
  if (!row) { res.status(404).json({ error: "Campanha não encontrada" }); return; }
  res.json(map(row));
});

router.patch("/campaigns/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = UpdateCampaignParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateCampaignBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data as Record<string, unknown>;
  if (d.playerCharacterIds !== undefined) {
    const r = validateIdList(d.playerCharacterIds, "playerCharacterIds");
    if (!r.ok) { res.status(400).json({ error: r.error }); return; }
    d.playerCharacterIds = r.value ?? undefined;
  }
  if (d.bossIds !== undefined) {
    const r = validateIdList(d.bossIds, "bossIds");
    if (!r.ok) { res.status(400).json({ error: r.error }); return; }
    d.bossIds = r.value ?? undefined;
  }
  if (d.coverUrl !== undefined) {
    const r = validateImage(d.coverUrl, "coverUrl");
    if (!r.ok) { res.status(400).json({ error: r.error }); return; }
  }
  const updateData: Record<string, unknown> = {};
  const passthrough = [
    "name","coverUrl","synopsis","setting","status","currentArc","nextSession",
    "partyName","playerCharacterIds","bossIds","sessionLog","npcs","locations","notes",
  ];
  for (const k of passthrough) {
    if (d[k] !== undefined) updateData[k] = d[k];
  }
  const [row] = await db.update(campaignsTable).set(updateData)
    .where(and(eq(campaignsTable.id, params.data.id), eq(campaignsTable.userId, userId)))
    .returning();
  if (!row) { res.status(404).json({ error: "Campanha não encontrada" }); return; }
  res.json(map(row));
});

router.delete("/campaigns/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = DeleteCampaignParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const deleted = await db.delete(campaignsTable)
    .where(and(eq(campaignsTable.id, params.data.id), eq(campaignsTable.userId, userId)))
    .returning({ id: campaignsTable.id });
  if (deleted.length === 0) { res.status(404).json({ error: "Campanha não encontrada" }); return; }
  res.status(204).send();
});

export default router;
