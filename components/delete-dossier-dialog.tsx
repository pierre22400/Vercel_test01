"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteDossier } from "@/app/actions/dossiers"
import type { Dossier } from "@/lib/db/schema"

export function DeleteDossierDialog({
  dossier,
  onOpenChange,
}: {
  dossier: Dossier | null
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  async function handleDelete() {
    if (!dossier) return
    setPending(true)
    await deleteDossier(dossier.id)
    setPending(false)
    toast.success("Dossier supprimé", {
      description: `${dossier.numero} — ${dossier.nom}`,
    })
    onOpenChange(false)
    router.refresh()
  }

  return (
    <AlertDialog
      open={Boolean(dossier)}
      onOpenChange={(open) => !open && onOpenChange(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce dossier ?</AlertDialogTitle>
          <AlertDialogDescription>
            {dossier
              ? `Le dossier "${dossier.numero} — ${dossier.nom}" sera définitivement supprimé. Cette action est irréversible.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
