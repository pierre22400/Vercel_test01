"use server"

import { db } from "@/lib/db"
import { dossiers, type Dossier } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { parseCsv } from "@/lib/dossiers/csv"
import { isEtat, isPriorite, isOverdue, type Etat, type Priorite } from "@/lib/dossiers/constants"

export type DossierInput = {
  numero: string
  nom: string
  responsable: string
  dateCreation: string
  dateLimite: string | null
  priorite: Priorite
  etat: Etat
  commentaire: string
}

function validateInput(input: Partial<DossierInput>): string[] {
  const errors: string[] = []
  if (!input.numero || !input.numero.trim()) errors.push("Le numéro de dossier est obligatoire.")
  if (!input.nom || !input.nom.trim()) errors.push("Le nom du dossier est obligatoire.")
  if (!input.responsable || !input.responsable.trim()) errors.push("Le responsable est obligatoire.")
  if (!input.dateCreation || Number.isNaN(new Date(input.dateCreation).getTime())) {
    errors.push("La date de création est invalide.")
  }
  if (input.dateLimite && Number.isNaN(new Date(input.dateLimite).getTime())) {
    errors.push("La date limite est invalide.")
  }
  if (input.priorite && !isPriorite(input.priorite)) errors.push("La priorité est invalide.")
  if (input.etat && !isEtat(input.etat)) errors.push("L'état est invalide.")
  return errors
}

export async function getDossiers(): Promise<Dossier[]> {
  return db.select().from(dossiers).orderBy(dossiers.dateCreation)
}

export async function getStats() {
  const rows = await db.select().from(dossiers)
  const stats = {
    aTraiter: 0,
    enCours: 0,
    enAttente: 0,
    termine: 0,
    enRetard: 0,
  }
  for (const d of rows) {
    if (d.etat === "a_traiter") stats.aTraiter++
    if (d.etat === "en_cours") stats.enCours++
    if (d.etat === "en_attente") stats.enAttente++
    if (d.etat === "termine") stats.termine++
    if (isOverdue(d.dateLimite, d.etat as Etat)) stats.enRetard++
  }
  return stats
}

export async function createDossier(input: DossierInput) {
  const errors = validateInput(input)
  if (errors.length > 0) return { success: false as const, errors }

  await db.insert(dossiers).values({
    numero: input.numero.trim(),
    nom: input.nom.trim(),
    responsable: input.responsable.trim(),
    dateCreation: input.dateCreation,
    dateLimite: input.dateLimite || null,
    priorite: input.priorite,
    etat: input.etat,
    commentaire: input.commentaire?.trim() || "",
  })

  revalidatePath("/")
  return { success: true as const, errors: [] }
}

export async function updateDossier(id: number, input: DossierInput) {
  const errors = validateInput(input)
  if (errors.length > 0) return { success: false as const, errors }

  await db
    .update(dossiers)
    .set({
      numero: input.numero.trim(),
      nom: input.nom.trim(),
      responsable: input.responsable.trim(),
      dateCreation: input.dateCreation,
      dateLimite: input.dateLimite || null,
      priorite: input.priorite,
      etat: input.etat,
      commentaire: input.commentaire?.trim() || "",
      updatedAt: new Date(),
    })
    .where(eq(dossiers.id, id))

  revalidatePath("/")
  return { success: true as const, errors: [] }
}

export async function markDossierDone(id: number) {
  await db
    .update(dossiers)
    .set({ etat: "termine", updatedAt: new Date() })
    .where(eq(dossiers.id, id))
  revalidatePath("/")
}

export async function deleteDossier(id: number) {
  await db.delete(dossiers).where(eq(dossiers.id, id))
  revalidatePath("/")
}

type ImportRowError = { line: number; message: string }

export async function importDossiersCsv(csvText: string): Promise<{
  insertedCount: number
  errors: ImportRowError[]
  totalRows: number
}> {
  const rows = parseCsv(csvText)
  if (rows.length === 0) {
    return { insertedCount: 0, errors: [{ line: 0, message: "Le fichier est vide." }], totalRows: 0 }
  }

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const dataRows = rows.slice(1)

  const colIndex = (name: string) => header.indexOf(name)
  const idx = {
    numero: colIndex("numero"),
    nom: colIndex("nom"),
    responsable: colIndex("responsable"),
    dateCreation: colIndex("date_creation"),
    dateLimite: colIndex("date_limite"),
    priorite: colIndex("priorite"),
    etat: colIndex("etat"),
    commentaire: colIndex("commentaire"),
  }

  if (idx.numero === -1 || idx.nom === -1 || idx.responsable === -1 || idx.dateCreation === -1) {
    return {
      insertedCount: 0,
      totalRows: dataRows.length,
      errors: [
        {
          line: 1,
          message:
            "Colonnes manquantes. Le fichier doit contenir au minimum : numero, nom, responsable, date_creation.",
        },
      ],
    }
  }

  const errors: ImportRowError[] = []
  const toInsert: (typeof dossiers.$inferInsert)[] = []

  dataRows.forEach((row, i) => {
    const lineNumber = i + 2 // account for header line and 1-based numbering
    const get = (index: number) => (index >= 0 && index < row.length ? row[index]?.trim() ?? "" : "")

    const numero = get(idx.numero)
    const nom = get(idx.nom)
    const responsable = get(idx.responsable)
    const dateCreationRaw = get(idx.dateCreation)
    const dateLimiteRaw = idx.dateLimite >= 0 ? get(idx.dateLimite) : ""
    const prioriteRaw = idx.priorite >= 0 ? get(idx.priorite).toLowerCase() : "normale"
    const etatRaw = idx.etat >= 0 ? get(idx.etat).toLowerCase() : "a_traiter"
    const commentaire = idx.commentaire >= 0 ? get(idx.commentaire) : ""

    const rowErrors: string[] = []
    if (!numero) rowErrors.push("numéro manquant")
    if (!nom) rowErrors.push("nom manquant")
    if (!responsable) rowErrors.push("responsable manquant")

    const dateCreation = dateCreationRaw
    if (!dateCreation || Number.isNaN(new Date(dateCreation).getTime())) {
      rowErrors.push("date de création invalide (format attendu : AAAA-MM-JJ)")
    }

    let dateLimite: string | null = null
    if (dateLimiteRaw) {
      if (Number.isNaN(new Date(dateLimiteRaw).getTime())) {
        rowErrors.push("date limite invalide (format attendu : AAAA-MM-JJ)")
      } else {
        dateLimite = dateLimiteRaw
      }
    }

    const priorite = prioriteRaw || "normale"
    if (!isPriorite(priorite)) {
      rowErrors.push(`priorité invalide "${prioriteRaw}" (attendu : faible, normale ou urgente)`)
    }

    const etat = etatRaw || "a_traiter"
    if (!isEtat(etat)) {
      rowErrors.push(`état invalide "${etatRaw}" (attendu : a_traiter, en_cours, en_attente ou termine)`)
    }

    if (rowErrors.length > 0) {
      errors.push({ line: lineNumber, message: rowErrors.join(", ") })
      return
    }

    toInsert.push({
      numero,
      nom,
      responsable,
      dateCreation,
      dateLimite,
      priorite: priorite as Priorite,
      etat: etat as Etat,
      commentaire,
    })
  })

  if (toInsert.length > 0) {
    await db.insert(dossiers).values(toInsert)
    revalidatePath("/")
  }

  return { insertedCount: toInsert.length, errors, totalRows: dataRows.length }
}
