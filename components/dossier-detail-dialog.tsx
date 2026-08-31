"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { PencilIcon } from "lucide-react"

import { EtatBadge, OverdueTag, PrioriteBadge } from "@/components/dossier-badges"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { isOverdue, type Etat, type Priorite } from "@/lib/dossiers/constants"
import type { Dossier } from "@/lib/db/schema"

function formatDate(value: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return format(d, "dd MMMM yyyy", { locale: fr })
}

export function DossierDetailDialog({
  dossier,
  onOpenChange,
  onEdit,
}: {
  dossier: Dossier | null
  onOpenChange: (open: boolean) => void
  onEdit: (dossier: Dossier) => void
}) {
  const overdue = dossier
    ? isOverdue(dossier.dateLimite, dossier.etat as Etat)
    : false

  return (
    <Dialog
      open={Boolean(dossier)}
      onOpenChange={(open) => !open && onOpenChange(false)}
    >
      <DialogContent className="sm:max-w-md">
        {dossier && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {dossier.numero}
                {overdue && <OverdueTag />}
              </DialogTitle>
              <DialogDescription>{dossier.nom}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-2">
                <EtatBadge etat={dossier.etat as Etat} />
                <PrioriteBadge priorite={dossier.priorite as Priorite} />
              </div>

              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-muted-foreground">Responsable</dt>
                  <dd className="font-medium text-foreground">
                    {dossier.responsable}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Date de création</dt>
                  <dd className="font-medium text-foreground">
                    {formatDate(dossier.dateCreation)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Date limite</dt>
                  <dd
                    className={
                      overdue
                        ? "font-medium text-destructive"
                        : "font-medium text-foreground"
                    }
                  >
                    {formatDate(dossier.dateLimite)}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="mb-1 text-muted-foreground">Commentaire</p>
                <p className="text-pretty rounded-lg border border-border bg-muted/40 p-3 text-foreground">
                  {dossier.commentaire || "Aucun commentaire."}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
              <Button onClick={() => onEdit(dossier)}>
                <PencilIcon data-icon="inline-start" />
                Modifier
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
