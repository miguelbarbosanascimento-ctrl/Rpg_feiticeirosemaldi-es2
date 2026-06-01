import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, aptitudesTable } from "@workspace/db";
import { ListAptitudesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/aptitudes", async (req, res): Promise<void> => {
  const query = ListAptitudesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const aptitudes = query.data.category
    ? await db.select().from(aptitudesTable).where(eq(aptitudesTable.category, query.data.category)).orderBy(aptitudesTable.level, aptitudesTable.name)
    : await db.select().from(aptitudesTable).orderBy(aptitudesTable.category, aptitudesTable.level, aptitudesTable.name);

  res.json(aptitudes.map(a => ({
    id: a.id,
    name: a.name,
    category: a.category,
    level: a.level,
    description: a.description,
    prerequisite: a.prerequisite ?? null,
  })));
});

export default router;
