"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { CsvImportDialog } from "@/components/csv-import-dialog"
import { DeleteDossierDialog } from "@/components/delete-dossier-dialog"
import { DossierDetailDialog } from "@/components/dossier-detail-dialog"
import { DossierFormDialog } from "@/components/dossier-form-dialog"
import { DossiersTable } from "@/components/dossiers-table"
import { DossiersToolbar, type SortOption } from "@/components/dossiers-toolbar"
import { StatsCards } from "@/components/stats-cards"
import { markDossierDone } from "@/app/actions/dossiers"
import { toCsv } from "@/lib/dossiers/csv"
import { isOverdue, type Etat, type Priorite } from "@/lib/dossiers/constants"
import type { Dossier } from "@/lib/db/schema"

/**
 * Bannière pédagogique : ce composant client applique les filtres et le tri
 * uniquement à la liste reçue du serveur, puis coordonne les dialogues et exports.
 */

const PRIORITE_RANK: Record<Priorite, number> = { urgente: 0, normale: 1, faible: 2 }

type Stats = { aTraiter: number; enCours: number; enAttente: number; termine: number; enRetard: number }

export function DossiersApp({ dossiers, stats }: { dossiers: Dossier[]; stats: Stats }) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [etatFilter, setEtatFilter] = React.useState("all")
  const [prioriteFilter, setPrioriteFilter] = React.useState("all")
  const [overdueOnly, setOverdueOnly] = React.useState(false)
  const [sort, setSort] = React.useState<SortOption>("date_limite_asc")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Dossier | null>(null)
  const [viewing, setViewing] = React.useState<Dossier | null>(null)
  const [deleting, setDeleting] = React.useState<Dossier | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    let result = dossiers.filter((d) => {
      if (etatFilter !== "all" && d.etat !== etatFilter) return false
      if (prioriteFilter !== "all" && d.priorite !== prioriteFilter) return false
      if (overdueOnly && !isOverdue(d.dateLimite, d.etat as Etat)) return false
      if (!query) return true
      return d.numero.toLowerCase().includes(query) || d.nom.toLowerCase().includes(query) ||
        d.responsable.toLowerCase().includes(query) || d.commentaire.toLowerCase().includes(query)
    })
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "date_limite_asc":
          if (!a.dateLimite && !b.dateLimite) return 0
          if (!a.dateLimite) return 1
          if (!b.dateLimite) return -1
          return a.dateLimite.localeCompare(b.dateLimite)
        case "date_creation_desc": return b.dateCreation.localeCompare(a.dateCreation)
        case "priorite_desc": return PRIORITE_RANK[a.priorite as Priorite] - PRIORITE_RANK[b.priorite as Priorite]
        case "nom_asc": return a.nom.localeCompare(b.nom, "fr")
        default: return 0
      }
    })
    return result
  }, [dossiers, search, etatFilter, overdueOnly, prioriteFilter, sort])

  /** Exporte exactement les lignes que l'utilisateur voit après filtrage et tri. */
  function handleExport() {
    const headers = ["numero", "nom", "responsable", "date_creation", "date_limite", "priorite", "etat", "commentaire"]
    const rows = filtered.map((d) => [d.numero, d.nom, d.responsable, d.dateCreation, d.dateLimite ?? "", d.priorite, d.etat, d.commentaire])
    const blob = new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `dossiers-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url)
    toast.success(`${rows.length} dossier(s) exporté(s)`)
  }

  /** Marque un dossier terminé puis rafraîchit la vue serveur revalidée. */
  async function handleMarkDone(dossier: Dossier) {
    await markDossierDone(dossier.id)
    toast.success("Dossier marqué comme terminé", { description: `${dossier.numero} — ${dossier.nom}` })
    router.refresh()
  }

  const hasFilters = search.trim().length > 0 || etatFilter !== "all" || prioriteFilter !== "all" || overdueOnly
  return (
    <div className="flex flex-col gap-6">
      <StatsCards stats={stats} />
      <DossiersToolbar search={search} onSearchChange={setSearch} etatFilter={etatFilter} onEtatFilterChange={setEtatFilter} prioriteFilter={prioriteFilter} onPrioriteFilterChange={setPrioriteFilter} overdueOnly={overdueOnly} onOverdueOnlyChange={setOverdueOnly} sort={sort} onSortChange={setSort} onNew={() => setCreateOpen(true)} onImport={() => setImportOpen(true)} onExport={handleExport} />
      <DossiersTable dossiers={filtered} hasFilters={hasFilters} onView={setViewing} onEdit={setEditing} onDelete={setDeleting} onMarkDone={handleMarkDone} />
      <DossierFormDialog open={createOpen} onOpenChange={setCreateOpen} dossier={null} />
      <DossierFormDialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} dossier={editing} />
      <DossierDetailDialog dossier={viewing} onOpenChange={(open) => !open && setViewing(null)} onEdit={(d) => { setViewing(null); setEditing(d) }} />
      <DeleteDossierDialog dossier={deleting} onOpenChange={() => setDeleting(null)} />
      <CsvImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
