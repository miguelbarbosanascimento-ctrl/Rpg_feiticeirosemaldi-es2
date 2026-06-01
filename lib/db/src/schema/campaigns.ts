import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  coverUrl: text("cover_url"),
  synopsis: text("synopsis"),
  setting: text("setting"),
  status: text("status").notNull().default("Em andamento"),
  currentArc: text("current_arc"),
  nextSession: text("next_session"),
  partyName: text("party_name"),
  playerCharacterIds: text("player_character_ids"),
  bossIds: text("boss_ids"),
  sessionLog: text("session_log"),
  npcs: text("npcs"),
  locations: text("locations"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
