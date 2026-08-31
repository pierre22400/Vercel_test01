import { DossiersApp } from "@/components/dossiers-app"
import { getDossiers, getStats } from "@/app/actions/dossiers"

export default async function Home() {
  const [dossiers, stats] = await Promise.all([getDossiers(), getStats()])

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-6">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Suivi de dossiers
          </h1>
          <p className="text-sm text-muted-foreground">
            Créez, suivez et priorisez vos dossiers en un seul endroit.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <DossiersApp dossiers={dossiers} stats={stats} />
      </main>
    </div>
  )
}
