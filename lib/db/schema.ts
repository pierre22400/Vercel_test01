import { pgTable, serial, text, date, timestamp } from "drizzle-orm/pg-core"

export const dossiers = pgTable("dossiers", {
  id: serial("id").primaryKey(),
  numero: text("numero").notNull(),
  nom: text("nom").notNull(),
  responsable: text("responsable").notNull(),
  dateCreation: date("date_creation", { mode: "string" }).notNull(),
  dateLimite: date("date_limite", { mode: "string" }),
  priorite: text("priorite").notNull().default("normale"), // faible | normale | urgente
  etat: text("etat").notNull().default("a_traiter"), // a_traiter | en_cours | en_attente | termine
  commentaire: text("commentaire").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Dossier = typeof dossiers.$inferSelect
export type NewDossier = typeof dossiers.$inferInsert
