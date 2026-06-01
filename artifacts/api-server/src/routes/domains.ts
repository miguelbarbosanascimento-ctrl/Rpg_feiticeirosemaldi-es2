import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, domainsTable } from "@workspace/db";
import { CreateDomainBody, DeleteDomainParams } from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

function map(d: typeof domainsTable.$inferSelect) {
  return {
    id: d.id,
    name: d.name,
    appearance: d.appearance ?? null,
    barrier: d.barrier ?? null,
    guaranteedEffect: d.guaranteedEffect ?? null,
    conditions: d.conditions ?? null,
    activationPhrase: d.activationPhrase ?? null,
    buffs: d.buffs ?? null,
    debuffs: d.debuffs ?? null,
    cost: d.cost,
    ownerCharacterId: d.ownerCharacterId ?? null,
    createdAt: d.createdAt.toISOString(),
  };
}

router.get("/domains", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db.select().from(domainsTable).where(eq(domainsTable.userId, userId)).orderBy(domainsTable.name);
  res.json(rows.map(map));
});

router.post("/domains", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = CreateDomainBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(domainsTable).values({
    userId,
    name: parsed.data.name,
    appearance: parsed.data.appearance ?? null,
    barrier: parsed.data.barrier ?? null,
    guaranteedEffect: parsed.data.guaranteedEffect ?? null,
    conditions: parsed.data.conditions ?? null,
    activationPhrase: parsed.data.activationPhrase ?? null,
    buffs: parsed.data.buffs ?? null,
    debuffs: parsed.data.debuffs ?? null,
    cost: parsed.data.cost ?? 10,
    ownerCharacterId: parsed.data.ownerCharacterId ?? null,
  }).returning();
  res.status(201).json(map(row));
});

router.delete("/domains/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = DeleteDomainParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const deleted = await db.delete(domainsTable)
    .where(and(eq(domainsTable.id, params.data.id), eq(domainsTable.userId, userId)))
    .returning({ id: domainsTable.id });
  if (deleted.length === 0) { res.status(404).json({ error: "Domínio não encontrado" }); return; }
  res.status(204).send();
});

export default router;
