import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ETAT_LABELS,
  PRIORITE_LABELS,
  type Etat,
  type Priorite,
} from "@/lib/dossiers/constants"

export function PrioriteBadge({ priorite }: { priorite: Priorite }) {
  if (priorite === "urgente") {
    return <Badge variant="destructive">{PRIORITE_LABELS[priorite]}</Badge>
  }
  if (priorite === "faible") {
    return <Badge variant="outline">{PRIORITE_LABELS[priorite]}</Badge>
  }
  return <Badge variant="secondary">{PRIORITE_LABELS[priorite]}</Badge>
}

export function EtatBadge({ etat }: { etat: Etat }) {
  if (etat === "termine") {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        {ETAT_LABELS[etat]}
      </Badge>
    )
  }
  if (etat === "en_cours") {
    return <Badge variant="default">{ETAT_LABELS[etat]}</Badge>
  }
  if (etat === "en_attente") {
    return (
      <Badge
        variant="outline"
        className="border-warning/40 bg-warning/15 text-warning-foreground"
      >
        {ETAT_LABELS[etat]}
      </Badge>
    )
  }
  return <Badge variant="outline">{ETAT_LABELS[etat]}</Badge>
}

export function OverdueTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-destructive",
        className
      )}
    >
      <AlertTriangle className="size-3.5" />
      En retard
    </span>
  )
}
