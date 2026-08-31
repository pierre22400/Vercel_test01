import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Hourglass,
  Loader,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Stats = {
  aTraiter: number
  enCours: number
  enAttente: number
  termine: number
  enRetard: number
}

export function StatsCards({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "À traiter",
      value: stats.aTraiter,
      icon: CircleDashed,
      tone: "text-foreground",
    },
    {
      label: "En cours",
      value: stats.enCours,
      icon: Loader,
      tone: "text-primary",
    },
    {
      label: "En attente",
      value: stats.enAttente,
      icon: Hourglass,
      tone: "text-warning-foreground",
    },
    {
      label: "Terminés",
      value: stats.termine,
      icon: CheckCircle2,
      tone: "text-muted-foreground",
    },
    {
      label: "En retard",
      value: stats.enRetard,
      icon: AlertTriangle,
      tone: "text-destructive",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <item.icon className={cn("size-4", item.tone)} />
          </div>
          <span className={cn("font-heading text-2xl font-semibold", item.tone)}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
