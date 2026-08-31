export const PRIORITES = ["faible", "normale", "urgente"] as const
export type Priorite = (typeof PRIORITES)[number]

export const ETATS = ["a_traiter", "en_cours", "en_attente", "termine"] as const
export type Etat = (typeof ETATS)[number]

export const PRIORITE_LABELS: Record<Priorite, string> = {
  faible: "Faible",
  normale: "Normale",
  urgente: "Urgente",
}

export const ETAT_LABELS: Record<Etat, string> = {
  a_traiter: "À traiter",
  en_cours: "En cours",
  en_attente: "En attente",
  termine: "Terminé",
}

export function isPriorite(value: string): value is Priorite {
  return (PRIORITES as readonly string[]).includes(value)
}

export function isEtat(value: string): value is Etat {
  return (ETATS as readonly string[]).includes(value)
}

export function isOverdue(dateLimite: string | null, etat: Etat): boolean {
  if (!dateLimite || etat === "termine") return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limite = new Date(dateLimite)
  return limite.getTime() < today.getTime()
}
