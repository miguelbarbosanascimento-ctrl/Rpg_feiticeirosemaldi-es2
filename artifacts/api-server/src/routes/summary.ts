import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, charactersTable, techniquesTable } from "@workspace/db";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;

  const [charStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      avgLevel: sql<number>`coalesce(avg(level)::numeric(5,1), 0)::float`,
      maxLevel: sql<number>`coalesce(max(level), 0)::int`,
      mostCommonOrigin: sql<string | null>`
        (SELECT origin FROM characters WHERE user_id = ${userId} GROUP BY origin ORDER BY count(*) DESC LIMIT 1)
      `,
      mostCommonSpec: sql<string | null>`
        (SELECT specialization FROM characters WHERE user_id = ${userId} GROUP BY specialization ORDER BY count(*) DESC LIMIT 1)
      `,
    })
    .from(charactersTable)
    .where(eq(charactersTable.userId, userId));

  const [techStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
    })
    .from(techniquesTable);

  res.json({
    totalCharacters: charStats?.total ?? 0,
    totalTechniques: techStats?.total ?? 0,
    averageLevel: charStats?.avgLevel ?? 0,
    highestLevel: charStats?.maxLevel ?? 0,
    mostCommonOrigin: charStats?.mostCommonOrigin ?? null,
    mostCommonSpecialization: charStats?.mostCommonSpec ?? null,
  });
});

router.get("/summary/origins", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const results = await db
    .select({
      origin: charactersTable.origin,
      count: sql<number>`count(*)::int`,
    })
    .from(charactersTable)
    .where(eq(charactersTable.userId, userId))
    .groupBy(charactersTable.origin)
    .orderBy(sql`count(*) desc`);

  res.json(results);
});

router.get("/summary/specializations", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const results = await db
    .select({
      specialization: charactersTable.specialization,
      count: sql<number>`count(*)::int`,
    })
    .from(charactersTable)
    .where(eq(charactersTable.userId, userId))
    .groupBy(charactersTable.specialization)
    .orderBy(sql`count(*) desc`);

  res.json(results);
});

export default router;
