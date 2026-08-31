"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  createDossier,
  updateDossier,
  type DossierInput,
} from "@/app/actions/dossiers"
import {
  ETATS,
  ETAT_LABELS,
  PRIORITES,
  PRIORITE_LABELS,
} from "@/lib/dossiers/constants"
import type { Dossier } from "@/lib/db/schema"
import { cn } from "@/lib/utils"

/**
 * Bannière pédagogique : ce dialogue transforme les saisies utilisateur en un
 * contrat DossierInput validé par les actions serveur avant toute écriture en base.
 */

/** Convertit une date JavaScript en date ISO attendue par PostgreSQL. */
function toIsoDate(date: Date | undefined): string {
  if (!date) return ""
  return format(date, "yyyy-MM-dd")
}

/** Convertit une date ISO persistée en date utilisable par le calendrier. */
function fromIsoDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

type FormState = {
  numero: string
  nom: string
  responsable: string
  dateCreation: Date | undefined
  dateLimite: Date | undefined
  priorite: DossierInput["priorite"]
  etat: DossierInput["etat"]
  commentaire: string
}

/** Produit les valeurs initiales d'un nouveau dossier. */
function emptyState(): FormState {
  return {
    numero: "",
    nom: "",
    responsable: "",
    dateCreation: new Date(),
    dateLimite: undefined,
    priorite: "normale",
    etat: "a_traiter",
    commentaire: "",
  }
}

/** Produit les valeurs de formulaire correspondant à un dossier existant. */
function fromDossier(d: Dossier): FormState {
  return {
    numero: d.numero,
    nom: d.nom,
    responsable: d.responsable,
    dateCreation: fromIsoDate(d.dateCreation),
    dateLimite: fromIsoDate(d.dateLimite),
    priorite: d.priorite as DossierInput["priorite"],
    etat: d.etat as DossierInput["etat"],
    commentaire: d.commentaire,
  }
}

/** Affiche un formulaire isolé pour créer ou modifier un dossier. */
export function DossierFormDialog({
  open,
  onOpenChange,
  dossier,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  dossier: Dossier | null
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])
  const [form, setForm] = React.useState<FormState>(() =>
    dossier ? fromDossier(dossier) : emptyState()
  )

  const isEdit = Boolean(dossier)

  /** Valide et persiste la création ou la modification demandée. */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setErrors([])

    const input: DossierInput = {
      numero: form.numero,
      nom: form.nom,
      responsable: form.responsable,
      dateCreation: toIsoDate(form.dateCreation),
      dateLimite: form.dateLimite ? toIsoDate(form.dateLimite) : null,
      priorite: form.priorite,
      etat: form.etat,
      commentaire: form.commentaire,
    }

    const result = isEdit
      ? await updateDossier(dossier!.id, input)
      : await createDossier(input)

    setPending(false)

    if (!result.success) {
      setErrors(result.errors)
      return
    }

    toast.success(isEdit ? "Dossier modifié" : "Dossier créé", {
      description: `${input.numero} — ${input.nom}`,
    })
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Modifier le dossier" : "Nouveau dossier"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Mettez à jour les informations du dossier."
                : "Renseignez les informations du nouveau dossier."}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto py-4">
            <FieldGroup>
              {errors.length > 0 && (
                <FieldError>
                  <ul className="ml-4 list-disc">
                    {errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </FieldError>
              )}

              <Field orientation="responsive">
                <FieldLabel htmlFor="numero">Numéro de dossier</FieldLabel>
                <Input
                  id="numero"
                  value={form.numero}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, numero: e.target.value }))
                  }
                  placeholder="D-2024-001"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="nom">Nom du dossier</FieldLabel>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nom: e.target.value }))
                  }
                  placeholder="Litige contractuel — Société X"
                  required
                />
              </Field>

              <Field orientation="responsive">
                <FieldLabel htmlFor="responsable">Responsable</FieldLabel>
                <Input
                  id="responsable"
                  value={form.responsable}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, responsable: e.target.value }))
                  }
                  placeholder="Nom du responsable"
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Date de création</FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start font-normal"
                        />
                      }
                    >
                      <CalendarIcon data-icon="inline-start" />
                      {form.dateCreation
                        ? format(form.dateCreation, "dd/MM/yyyy", {
                            locale: fr,
                          })
                        : "Choisir"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.dateCreation}
                        onSelect={(d) =>
                          setForm((f) => ({ ...f, dateCreation: d }))
                        }
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field>
                  <FieldLabel>Date limite</FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start font-normal",
                            !form.dateLimite && "text-muted-foreground"
                          )}
                        />
                      }
                    >
                      <CalendarIcon data-icon="inline-start" />
                      {form.dateLimite
                        ? format(form.dateLimite, "dd/MM/yyyy", {
                            locale: fr,
                          })
                        : "Aucune"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.dateLimite}
                        onSelect={(d) =>
                          setForm((f) => ({ ...f, dateLimite: d }))
                        }
                        locale={fr}
                      />
                      {form.dateLimite && (
                        <div className="border-t p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              setForm((f) => ({ ...f, dateLimite: undefined }))
                            }
                          >
                            Effacer la date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Priorité</FieldLabel>
                  <Select
                    value={form.priorite}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        priorite: v as DossierInput["priorite"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: DossierInput["priorite"]) =>
                          PRIORITE_LABELS[value] ?? "Priorité"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PRIORITES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITE_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>État</FieldLabel>
                  <Select
                    value={form.etat}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        etat: v as DossierInput["etat"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: DossierInput["etat"]) =>
                          ETAT_LABELS[value] ?? "État"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ETATS.map((e) => (
                          <SelectItem key={e} value={e}>
                            {ETAT_LABELS[e]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="commentaire">Commentaire</FieldLabel>
                <Textarea
                  id="commentaire"
                  value={form.commentaire}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, commentaire: e.target.value }))
                  }
                  placeholder="Notes, contexte, prochaines étapes..."
                  rows={3}
                />
                <FieldDescription>Facultatif.</FieldDescription>
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer le dossier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
