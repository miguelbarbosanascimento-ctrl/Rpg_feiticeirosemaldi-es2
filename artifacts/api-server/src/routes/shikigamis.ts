import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, shikigamisTable } from "@workspace/db";
import { CreateShikigamiBody, DeleteShikigamiParams } from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

function map(s: typeof shikigamisTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    appearance: s.appearance ?? null,
    type: s.type,
    rank: s.rank,
    hp: s.hp,
    energy: s.energy,
    abilities: s.abilities ?? null,
    techniques: s.techniques ?? null,
    relationship: s.relationship ?? null,
    ownerCharacterId: s.ownerCharacterId ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/shikigamis", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db.select().from(shikigamisTable).where(eq(shikigamisTable.userId, userId)).orderBy(shikigamisTable.name);
  res.json(rows.map(map));
});

router.post("/shikigamis", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = CreateShikigamiBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(shikigamisTable).values({
    userId,
    name: parsed.data.name,
    appearance: parsed.data.appearance ?? null,
    type: parsed.data.type ?? "Comum",
    rank: parsed.data.rank ?? "C",
    hp: parsed.data.hp ?? 10,
    energy: parsed.data.energy ?? 10,
    abilities: parsed.data.abilities ?? null,
    techniques: parsed.data.techniques ?? null,
    relationship: parsed.data.relationship ?? null,
    ownerCharacterId: parsed.data.ownerCharacterId ?? null,
  }).returning();
  res.status(201).json(map(row));
});

router.delete("/shikigamis/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = DeleteShikigamiParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const deleted = await db.delete(shikigamisTable)
    .where(and(eq(shikigamisTable.id, params.data.id), eq(shikigamisTable.userId, userId)))
    .returning({ id: shikigamisTable.id });
  if (deleted.length === 0) { res.status(404).json({ error: "Shikigami não encontrado" }); return; }
  res.status(204).send();
});

export default router;
