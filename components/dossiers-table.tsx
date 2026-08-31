"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  CheckCircle2Icon,
  EyeIcon,
  InboxIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import { EtatBadge, OverdueTag, PrioriteBadge } from "@/components/dossier-badges"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { isOverdue, type Etat, type Priorite } from "@/lib/dossiers/constants"
import { cn } from "@/lib/utils"
import type { Dossier } from "@/lib/db/schema"

function formatDate(value: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return format(d, "dd/MM/yyyy", { locale: fr })
}

export function DossiersTable({
  dossiers,
  hasFilters,
  onView,
  onEdit,
  onDelete,
  onMarkDone,
}: {
  dossiers: Dossier[]
  hasFilters: boolean
  onView: (dossier: Dossier) => void
  onEdit: (dossier: Dossier) => void
  onDelete: (dossier: Dossier) => void
  onMarkDone: (dossier: Dossier) => void
}) {
  if (dossiers.length === 0) {
    return (
      <Empty className="border">
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>Aucun dossier</EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? "Aucun dossier ne correspond à votre recherche ou vos filtres."
            : "Créez votre premier dossier pour commencer le suivi."}
        </EmptyDescription>
      </Empty>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Nom du dossier</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Date limite</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead>État</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {dossiers.map((dossier) => {
            const overdue = isOverdue(dossier.dateLimite, dossier.etat as Etat)
            return (
              <TableRow
                key={dossier.id}
                className={cn(
                  "cursor-pointer",
                  overdue && "bg-destructive/5 hover:bg-destructive/10"
                )}
                onClick={() => onView(dossier)}
              >
                <TableCell className="font-medium text-foreground">
                  {dossier.numero}
                </TableCell>
                <TableCell className="max-w-64 truncate">{dossier.nom}</TableCell>
                <TableCell className="text-muted-foreground">
                  {dossier.responsable}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cn(overdue && "font-medium text-destructive")}
                    >
                      {formatDate(dossier.dateLimite)}
                    </span>
                    {overdue && <OverdueTag />}
                  </div>
                </TableCell>
                <TableCell>
                  <PrioriteBadge priorite={dossier.priorite as Priorite} />
                </TableCell>
                <TableCell>
                  <EtatBadge etat={dossier.etat as Etat} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" aria-label="Actions" />
                      }
                    >
                      <MoreHorizontalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onView(dossier)}>
                          <EyeIcon data-icon="inline-start" />
                          Voir le détail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(dossier)}>
                          <PencilIcon data-icon="inline-start" />
                          Modifier
                        </DropdownMenuItem>
                        {dossier.etat !== "termine" && (
                          <DropdownMenuItem onClick={() => onMarkDone(dossier)}>
                            <CheckCircle2Icon data-icon="inline-start" />
                            Marquer comme terminé
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(dossier)}
                      >
                        <Trash2Icon data-icon="inline-start" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
