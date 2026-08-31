"use client"

import { DownloadIcon, PlusIcon, SearchIcon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ETATS, ETAT_LABELS, PRIORITES, PRIORITE_LABELS } from "@/lib/dossiers/constants"

export type SortOption =
  | "date_limite_asc"
  | "date_creation_desc"
  | "priorite_desc"
  | "nom_asc"

const SORT_LABELS: Record<SortOption, string> = {
  date_limite_asc: "Date limite (plus proche)",
  date_creation_desc: "Date de création (récent)",
  priorite_desc: "Priorité (urgent d'abord)",
  nom_asc: "Nom (A à Z)",
}

export function DossiersToolbar({
  search,
  onSearchChange,
  etatFilter,
  onEtatFilterChange,
  prioriteFilter,
  onPrioriteFilterChange,
  sort,
  onSortChange,
  onNew,
  onImport,
  onExport,
}: {
  search: string
  onSearchChange: (value: string) => void
  etatFilter: string
  onEtatFilterChange: (value: string) => void
  prioriteFilter: string
  onPrioriteFilterChange: (value: string) => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
  onNew: () => void
  onImport: () => void
  onExport: () => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <InputGroup className="sm:max-w-xs">
          <InputGroupInput
            placeholder="Rechercher un dossier..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>

        <Select
          value={etatFilter}
          onValueChange={(v) => onEtatFilterChange(v ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="État">
              {(value: string) =>
                value === "all"
                  ? "Tous les états"
                  : ETAT_LABELS[value as keyof typeof ETAT_LABELS] ?? "État"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tous les états</SelectItem>
              {ETATS.map((e) => (
                <SelectItem key={e} value={e}>
                  {ETAT_LABELS[e]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={prioriteFilter}
          onValueChange={(v) => onPrioriteFilterChange(v ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priorité">
              {(value: string) =>
                value === "all"
                  ? "Toutes priorités"
                  : PRIORITE_LABELS[value as keyof typeof PRIORITE_LABELS] ??
                    "Priorité"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Toutes priorités</SelectItem>
              {PRIORITES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => v && onSortChange(v as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Trier par">
              {(value: SortOption) => SORT_LABELS[value] ?? "Trier par"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onImport}>
          <UploadIcon data-icon="inline-start" />
          Importer
        </Button>
        <Button variant="outline" onClick={onExport}>
          <DownloadIcon data-icon="inline-start" />
          Exporter
        </Button>
        <Button onClick={onNew}>
          <PlusIcon data-icon="inline-start" />
          Nouveau dossier
        </Button>
      </div>
    </div>
  )
}
