"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FileWarning, Loader2Icon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { importDossiersCsv } from "@/app/actions/dossiers"

/**
 * Bannière pédagogique : ce dialogue lit un fichier CSV choisi par l'utilisateur,
 * transmet son texte à l'action serveur et présente les succès et erreurs par ligne.
 */

type ImportResult = {
  insertedCount: number
  totalRows: number
  errors: { line: number; message: string }[]
}

/** Affiche l'import CSV et son compte rendu détaillé. */
export function CsvImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [pending, setPending] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<ImportResult | null>(null)

  /** Lit et importe le fichier sélectionné sans interrompre les lignes valides. */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setPending(true)
    setResult(null)

    try {
      const text = await file.text()
      const res = await importDossiersCsv(text)
      setResult(res)
      if (res.insertedCount > 0) {
        toast.success(`${res.insertedCount} dossier(s) importé(s)`)
        router.refresh()
      }
    } catch {
      toast.error("Impossible de lire le fichier CSV.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des dossiers (CSV)</DialogTitle>
          <DialogDescription>
            Colonnes attendues : numero, nom, responsable, date_creation
            (AAAA-MM-JJ), date_limite, priorite, etat, commentaire.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
          >
            {pending ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <UploadIcon data-icon="inline-start" />
            )}
            {fileName ?? "Choisir un fichier CSV"}
          </Button>

          {result && (
            <div className="flex flex-col gap-3 rounded-lg border border-border p-3 text-sm">
              <p>
                <span className="font-medium text-foreground">
                  {result.insertedCount}
                </span>{" "}
                dossier(s) importé(s) sur {result.totalRows} ligne(s) lue(s).
              </p>
              {result.errors.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="flex items-center gap-1.5 font-medium text-destructive">
                    <FileWarning className="size-4" />
                    {result.errors.length} ligne(s) en erreur
                  </p>
                  <ul className="ml-1 flex max-h-40 flex-col gap-1 overflow-y-auto text-muted-foreground">
                    {result.errors.map((err) => (
                      <li key={err.line}>
                        Ligne {err.line} : {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!result && !pending && (
            <Empty className="border">
              <EmptyMedia variant="icon">
                <UploadIcon />
              </EmptyMedia>
              <EmptyTitle>Aucun fichier sélectionné</EmptyTitle>
              <EmptyDescription>
                Le fichier doit être au format CSV avec un en-tête de colonnes.
              </EmptyDescription>
            </Empty>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
