import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aptitudesTable = pgTable("aptitudes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  level: integer("level").notNull().default(1),
  description: text("description").notNull(),
  prerequisite: text("prerequisite"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAptitudeSchema = createInsertSchema(aptitudesTable).omit({ id: true, createdAt: true });
export type InsertAptitude = z.infer<typeof insertAptitudeSchema>;
export type Aptitude = typeof aptitudesTable.$inferSelect;
