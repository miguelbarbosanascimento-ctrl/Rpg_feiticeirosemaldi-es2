import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shikigamisTable = pgTable("shikigamis", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  appearance: text("appearance"),
  type: text("type").notNull().default("Comum"),
  rank: text("rank").notNull().default("C"),
  hp: integer("hp").notNull().default(10),
  energy: integer("energy").notNull().default(10),
  abilities: text("abilities"),
  techniques: text("techniques"),
  relationship: text("relationship"),
  ownerCharacterId: integer("owner_character_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertShikigamiSchema = createInsertSchema(shikigamisTable).omit({ id: true, userId: true, createdAt: true });
export type InsertShikigami = z.infer<typeof insertShikigamiSchema>;
export type Shikigami = typeof shikigamisTable.$inferSelect;
