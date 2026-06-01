import { Router, type IRouter } from "express";
import healthRouter from "./health";
import charactersRouter from "./characters";
import techniquesRouter from "./techniques";
import aptitudesRouter from "./aptitudes";
import summaryRouter from "./summary";
import shikigamisRouter from "./shikigamis";
import domainsRouter from "./domains";
import bossesRouter from "./bosses";
import campaignsRouter from "./campaigns";

const router: IRouter = Router();

router.use(healthRouter);
router.use(charactersRouter);
router.use(techniquesRouter);
router.use(aptitudesRouter);
router.use(summaryRouter);
router.use(shikigamisRouter);
router.use(domainsRouter);
router.use(bossesRouter);
router.use(campaignsRouter);

export default router;
