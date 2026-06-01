import { Router, type IRouter } from "express";
import { and, eq, ilike } from "drizzle-orm";
import { db, techniquesTable } from "@workspace/db";
import {
  ListTechniquesQueryParams,
  CreateTechniqueBody,
  GetTechniqueParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/techniques", async (req, res): Promise<void> => {
  const query = ListTechniquesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];

  if (query.data.search) {
    conditions.push(ilike(techniquesTable.name, `%${query.data.search}%`));
  }
  if (query.data.category) {
    conditions.push(eq(techniquesTable.category, query.data.category));
  }

  const techniques = conditions.length > 0
    ? await db.select().from(techniquesTable).where(and(...conditions)).orderBy(techniquesTable.name)
    : await db.select().from(techniquesTable).orderBy(techniquesTable.name);

  res.json(techniques.map(mapTechnique));
});

router.post("/techniques", async (req, res): Promise<void> => {
  const parsed = CreateTechniqueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [technique] = await db.insert(techniquesTable).values({
    name: parsed.data.name,
    category: parsed.data.category,
    description: parsed.data.description,
    source: parsed.data.source ?? null,
    abilities: parsed.data.abilities ?? null,
    isCustom: true,
  }).returning();

  res.status(201).json(mapTechnique(technique));
});

router.get("/techniques/:id", async (req, res): Promise<void> => {
  const params = GetTechniqueParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [technique] = await db.select().from(techniquesTable).where(eq(techniquesTable.id, params.data.id));
  if (!technique) {
    res.status(404).json({ error: "Técnica não encontrada" });
    return;
  }

  res.json(mapTechnique(technique));
});

function mapTechnique(t: typeof techniquesTable.$inferSelect) {
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    source: t.source ?? null,
    abilities: t.abilities ?? null,
    isCustom: t.isCustom,
  };
}

export default router;
