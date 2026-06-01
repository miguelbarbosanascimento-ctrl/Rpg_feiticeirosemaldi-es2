import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bossesTable = pgTable("bosses", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  vd: integer("vd").notNull().default(10),
  category: text("category").notNull().default("Maldição"),
  size: text("size").notNull().default("Médio"),
  grade: text("grade").notNull().default("3° Grau"),
  domain: text("domain"),
  description: text("description"),
  appearance: text("appearance"),
  strength: integer("strength").notNull().default(10),
  dexterity: integer("dexterity").notNull().default(10),
  constitution: integer("constitution").notNull().default(10),
  intelligence: integer("intelligence").notNull().default(10),
  wisdom: integer("wisdom").notNull().default(10),
  charisma: integer("charisma").notNull().default(10),
  hp: integer("hp").notNull().default(50),
  maxHp: integer("max_hp").notNull().default(50),
  energy: integer("energy").notNull().default(20),
  maxEnergy: integer("max_energy").notNull().default(20),
  armorClass: integer("armor_class").notNull().default(12),
  attention: integer("attention").notNull().default(10),
  movement: text("movement").notNull().default("9m"),
  hitDice: text("hit_dice").notNull().default("4d10"),
  abilities: text("abilities"),
  innateTechnique: text("innate_technique"),
  techniqueDescription: text("technique_description"),
  weaknesses: text("weaknesses"),
  resistances: text("resistances"),
  loot: text("loot"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBossSchema = createInsertSchema(bossesTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export type InsertBoss = z.infer<typeof insertBossSchema>;
export type Boss = typeof bossesTable.$inferSelect;
