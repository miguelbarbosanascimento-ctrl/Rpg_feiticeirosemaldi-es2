import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const domainsTable = pgTable("domain_expansions", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  appearance: text("appearance"),
  barrier: text("barrier"),
  guaranteedEffect: text("guaranteed_effect"),
  conditions: text("conditions"),
  activationPhrase: text("activation_phrase"),
  buffs: text("buffs"),
  debuffs: text("debuffs"),
  cost: integer("cost").notNull().default(10),
  ownerCharacterId: integer("owner_character_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDomainSchema = createInsertSchema(domainsTable).omit({ id: true, userId: true, createdAt: true });
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domainsTable.$inferSelect;
