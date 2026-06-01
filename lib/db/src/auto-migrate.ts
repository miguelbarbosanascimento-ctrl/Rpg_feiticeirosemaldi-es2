import { pool } from "./index";

const DDL = `
CREATE TABLE IF NOT EXISTS "characters" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text,
  "name" text NOT NULL,
  "level" integer DEFAULT 1 NOT NULL,
  "experience" integer DEFAULT 0 NOT NULL,
  "origin" text NOT NULL,
  "clan_heritage" text,
  "specialization" text NOT NULL,
  "grade" text DEFAULT '4° Grau' NOT NULL,
  "backstory" text,
  "personality" text,
  "technique" text,
  "technique_description" text,
  "strength" integer DEFAULT 1 NOT NULL,
  "dexterity" integer DEFAULT 1 NOT NULL,
  "constitution" integer DEFAULT 1 NOT NULL,
  "intelligence" integer DEFAULT 1 NOT NULL,
  "wisdom" integer DEFAULT 1 NOT NULL,
  "charisma" integer DEFAULT 1 NOT NULL,
  "hp" integer DEFAULT 10 NOT NULL,
  "max_hp" integer DEFAULT 10 NOT NULL,
  "energy" integer DEFAULT 10 NOT NULL,
  "max_energy" integer DEFAULT 10 NOT NULL,
  "armor_class" integer DEFAULT 10 NOT NULL,
  "mastery_bonus" integer DEFAULT 2 NOT NULL,
  "skills" text,
  "equipment" text,
  "aptitudes" text,
  "abilities" text,
  "custom_stats" text,
  "notes" text,
  "photo_url" text,
  "age" text,
  "height" text,
  "weight" text,
  "school" text,
  "occupation" text,
  "appearance" text,
  "ideals" text,
  "bonds" text,
  "complications" text,
  "innate_domain" text,
  "soul_integrity" integer DEFAULT 10 NOT NULL,
  "max_soul_integrity" integer DEFAULT 10 NOT NULL,
  "attention" integer DEFAULT 10 NOT NULL,
  "movement" text DEFAULT '9m' NOT NULL,
  "hit_dice" text DEFAULT '1d8' NOT NULL,
  "resistances" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "techniques" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "category" text NOT NULL,
  "description" text NOT NULL,
  "source" text,
  "abilities" text,
  "is_custom" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "aptitudes" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "category" text NOT NULL,
  "level" integer DEFAULT 1 NOT NULL,
  "description" text NOT NULL,
  "prerequisite" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "shikigamis" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text,
  "name" text NOT NULL,
  "appearance" text,
  "type" text DEFAULT 'Comum' NOT NULL,
  "rank" text DEFAULT 'C' NOT NULL,
  "hp" integer DEFAULT 10 NOT NULL,
  "energy" integer DEFAULT 10 NOT NULL,
  "abilities" text,
  "techniques" text,
  "relationship" text,
  "owner_character_id" integer,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "domain_expansions" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text,
  "name" text NOT NULL,
  "appearance" text,
  "barrier" text,
  "guaranteed_effect" text,
  "conditions" text,
  "activation_phrase" text,
  "buffs" text,
  "debuffs" text,
  "cost" integer DEFAULT 10 NOT NULL,
  "owner_character_id" integer,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "bosses" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text,
  "name" text NOT NULL,
  "photo_url" text,
  "vd" integer DEFAULT 10 NOT NULL,
  "category" text DEFAULT 'Maldição' NOT NULL,
  "size" text DEFAULT 'Médio' NOT NULL,
  "grade" text DEFAULT '3° Grau' NOT NULL,
  "domain" text,
  "description" text,
  "appearance" text,
  "strength" integer DEFAULT 10 NOT NULL,
  "dexterity" integer DEFAULT 10 NOT NULL,
  "constitution" integer DEFAULT 10 NOT NULL,
  "intelligence" integer DEFAULT 10 NOT NULL,
  "wisdom" integer DEFAULT 10 NOT NULL,
  "charisma" integer DEFAULT 10 NOT NULL,
  "hp" integer DEFAULT 50 NOT NULL,
  "max_hp" integer DEFAULT 50 NOT NULL,
  "energy" integer DEFAULT 20 NOT NULL,
  "max_energy" integer DEFAULT 20 NOT NULL,
  "armor_class" integer DEFAULT 12 NOT NULL,
  "attention" integer DEFAULT 10 NOT NULL,
  "movement" text DEFAULT '9m' NOT NULL,
  "hit_dice" text DEFAULT '4d10' NOT NULL,
  "abilities" text,
  "innate_technique" text,
  "technique_description" text,
  "weaknesses" text,
  "resistances" text,
  "loot" text,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "campaigns" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text,
  "name" text NOT NULL,
  "cover_url" text,
  "synopsis" text,
  "setting" text,
  "status" text DEFAULT 'Em andamento' NOT NULL,
  "current_arc" text,
  "next_session" text,
  "party_name" text,
  "player_character_ids" text,
  "boss_ids" text,
  "session_log" text,
  "npcs" text,
  "locations" text,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
`;

export async function autoMigrate(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(DDL);
  } finally {
    client.release();
  }
}
