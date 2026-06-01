import { Router, type IRouter } from "express";
import { and, eq, ilike } from "drizzle-orm";
import { db, charactersTable } from "@workspace/db";
import {
  ListCharactersQueryParams,
  CreateCharacterBody,
  GetCharacterParams,
  UpdateCharacterParams,
  UpdateCharacterBody,
  DeleteCharacterParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/characters", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const query = ListCharactersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [eq(charactersTable.userId, userId)];
  if (query.data.search) {
    conditions.push(ilike(charactersTable.name, `%${query.data.search}%`));
  }
  if (query.data.origin) {
    conditions.push(eq(charactersTable.origin, query.data.origin));
  }
  if (query.data.specialization) {
    conditions.push(eq(charactersTable.specialization, query.data.specialization));
  }

  const characters = await db
    .select()
    .from(charactersTable)
    .where(and(...conditions))
    .orderBy(charactersTable.createdAt);

  res.json(characters.map(mapCharacterSummary));
});

router.post("/characters", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = CreateCharacterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const maxHp = data.maxHp ?? 10 + (data.constitution ?? 1) + ((data.level ?? 1) - 1) * 5;
  const maxEnergy = data.maxEnergy ?? 10 + (data.wisdom ?? 1) + ((data.level ?? 1) - 1) * 5;
  const masteryBonus = Math.ceil(((data.level ?? 1) + 3) / 4);
  const maxSoulIntegrity = data.maxSoulIntegrity ?? 10 + (data.charisma ?? 1) + ((data.level ?? 1) - 1) * 2;

  const [character] = await db.insert(charactersTable).values({
    userId,
    name: data.name,
    level: data.level ?? 1,
    origin: data.origin,
    clanHeritage: data.clanHeritage ?? null,
    specialization: data.specialization,
    grade: data.grade ?? "4° Grau",
    backstory: data.backstory ?? null,
    personality: data.personality ?? null,
    technique: data.technique ?? null,
    techniqueDescription: data.technique_description ?? null,
    strength: data.strength ?? 1,
    dexterity: data.dexterity ?? 1,
    constitution: data.constitution ?? 1,
    intelligence: data.intelligence ?? 1,
    wisdom: data.wisdom ?? 1,
    charisma: data.charisma ?? 1,
    hp: data.hp ?? maxHp,
    maxHp,
    energy: data.energy ?? maxEnergy,
    maxEnergy,
    armorClass: data.armorClass ?? 10,
    masteryBonus,
    skills: data.skills ?? null,
    equipment: data.equipment ?? null,
    aptitudes: data.aptitudes ?? null,
    abilities: data.abilities ?? null,
    customStats: data.customStats ?? null,
    notes: data.notes ?? null,
    photoUrl: data.photoUrl ?? null,
    age: data.age ?? null,
    height: data.height ?? null,
    weight: data.weight ?? null,
    school: data.school ?? null,
    occupation: data.occupation ?? null,
    appearance: data.appearance ?? null,
    ideals: data.ideals ?? null,
    bonds: data.bonds ?? null,
    complications: data.complications ?? null,
    innateDomain: data.innateDomain ?? null,
    soulIntegrity: data.soulIntegrity ?? maxSoulIntegrity,
    maxSoulIntegrity,
    attention: data.attention ?? 10 + (data.wisdom ?? 1),
    movement: data.movement ?? "9m",
    hitDice: data.hitDice ?? `${data.level ?? 1}d8`,
    resistances: data.resistances ?? null,
  }).returning();

  res.status(201).json(mapCharacter(character));
});

router.get("/characters/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = GetCharacterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(and(eq(charactersTable.id, params.data.id), eq(charactersTable.userId, userId)));
  if (!character) {
    res.status(404).json({ error: "Personagem não encontrado" });
    return;
  }

  res.json(mapCharacter(character));
});

router.patch("/characters/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = UpdateCharacterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCharacterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.experience !== undefined) updateData.experience = data.experience;
  if (data.origin !== undefined) updateData.origin = data.origin;
  if (data.clanHeritage !== undefined) updateData.clanHeritage = data.clanHeritage;
  if (data.specialization !== undefined) updateData.specialization = data.specialization;
  if (data.grade !== undefined) updateData.grade = data.grade;
  if (data.backstory !== undefined) updateData.backstory = data.backstory;
  if (data.personality !== undefined) updateData.personality = data.personality;
  if (data.technique !== undefined) updateData.technique = data.technique;
  if (data.technique_description !== undefined) updateData.techniqueDescription = data.technique_description;
  if (data.strength !== undefined) updateData.strength = data.strength;
  if (data.dexterity !== undefined) updateData.dexterity = data.dexterity;
  if (data.constitution !== undefined) updateData.constitution = data.constitution;
  if (data.intelligence !== undefined) updateData.intelligence = data.intelligence;
  if (data.wisdom !== undefined) updateData.wisdom = data.wisdom;
  if (data.charisma !== undefined) updateData.charisma = data.charisma;
  if (data.hp !== undefined) updateData.hp = data.hp;
  if (data.maxHp !== undefined) updateData.maxHp = data.maxHp;
  if (data.energy !== undefined) updateData.energy = data.energy;
  if (data.maxEnergy !== undefined) updateData.maxEnergy = data.maxEnergy;
  if (data.armorClass !== undefined) updateData.armorClass = data.armorClass;
  if (data.skills !== undefined) updateData.skills = data.skills;
  if (data.equipment !== undefined) updateData.equipment = data.equipment;
  if (data.aptitudes !== undefined) updateData.aptitudes = data.aptitudes;
  if (data.abilities !== undefined) updateData.abilities = data.abilities;
  if (data.customStats !== undefined) updateData.customStats = data.customStats;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
  if (data.age !== undefined) updateData.age = data.age;
  if (data.height !== undefined) updateData.height = data.height;
  if (data.weight !== undefined) updateData.weight = data.weight;
  if (data.school !== undefined) updateData.school = data.school;
  if (data.occupation !== undefined) updateData.occupation = data.occupation;
  if (data.appearance !== undefined) updateData.appearance = data.appearance;
  if (data.ideals !== undefined) updateData.ideals = data.ideals;
  if (data.bonds !== undefined) updateData.bonds = data.bonds;
  if (data.complications !== undefined) updateData.complications = data.complications;
  if (data.innateDomain !== undefined) updateData.innateDomain = data.innateDomain;
  if (data.soulIntegrity !== undefined) updateData.soulIntegrity = data.soulIntegrity;
  if (data.maxSoulIntegrity !== undefined) updateData.maxSoulIntegrity = data.maxSoulIntegrity;
  if (data.attention !== undefined) updateData.attention = data.attention;
  if (data.movement !== undefined) updateData.movement = data.movement;
  if (data.hitDice !== undefined) updateData.hitDice = data.hitDice;
  if (data.resistances !== undefined) updateData.resistances = data.resistances;

  const [character] = await db
    .update(charactersTable)
    .set(updateData)
    .where(and(eq(charactersTable.id, params.data.id), eq(charactersTable.userId, userId)))
    .returning();

  if (!character) {
    res.status(404).json({ error: "Personagem não encontrado" });
    return;
  }

  res.json(mapCharacter(character));
});

router.delete("/characters/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = DeleteCharacterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [character] = await db
    .delete(charactersTable)
    .where(and(eq(charactersTable.id, params.data.id), eq(charactersTable.userId, userId)))
    .returning();

  if (!character) {
    res.status(404).json({ error: "Personagem não encontrado" });
    return;
  }

  res.sendStatus(204);
});

function mapCharacterSummary(c: typeof charactersTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    level: c.level,
    origin: c.origin,
    specialization: c.specialization,
    grade: c.grade,
    technique: c.technique ?? null,
    hp: c.hp,
    maxHp: c.maxHp,
    energy: c.energy,
    maxEnergy: c.maxEnergy,
    armorClass: c.armorClass,
    photoUrl: c.photoUrl ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

function mapCharacter(c: typeof charactersTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    level: c.level,
    experience: c.experience,
    origin: c.origin,
    clanHeritage: c.clanHeritage ?? null,
    specialization: c.specialization,
    grade: c.grade,
    backstory: c.backstory ?? null,
    personality: c.personality ?? null,
    technique: c.technique ?? null,
    technique_description: c.techniqueDescription ?? null,
    strength: c.strength,
    dexterity: c.dexterity,
    constitution: c.constitution,
    intelligence: c.intelligence,
    wisdom: c.wisdom,
    charisma: c.charisma,
    hp: c.hp,
    maxHp: c.maxHp,
    energy: c.energy,
    maxEnergy: c.maxEnergy,
    armorClass: c.armorClass,
    masteryBonus: c.masteryBonus,
    skills: c.skills ?? null,
    equipment: c.equipment ?? null,
    aptitudes: c.aptitudes ?? null,
    abilities: c.abilities ?? null,
    customStats: c.customStats ?? null,
    notes: c.notes ?? null,
    photoUrl: c.photoUrl ?? null,
    age: c.age ?? null,
    height: c.height ?? null,
    weight: c.weight ?? null,
    school: c.school ?? null,
    occupation: c.occupation ?? null,
    appearance: c.appearance ?? null,
    ideals: c.ideals ?? null,
    bonds: c.bonds ?? null,
    complications: c.complications ?? null,
    innateDomain: c.innateDomain ?? null,
    soulIntegrity: c.soulIntegrity,
    maxSoulIntegrity: c.maxSoulIntegrity,
    attention: c.attention,
    movement: c.movement,
    hitDice: c.hitDice,
    resistances: c.resistances ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export default router;
