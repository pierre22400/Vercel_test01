# Lancer le prototype hors de v0

1. Installe Node.js 20+, puis `corepack pnpm install --frozen-lockfile`.
2. Copie `.env.example` vers `.env.local` et renseigne `DATABASE_URL`.
3. Initialise une base vide : `psql "$DATABASE_URL" -f db/bootstrap.sql`.
4. Démarre l'application : `pnpm dev`.

Contrôles : création, modification, clôture, suppression, recherche dans le commentaire, filtre **En retard**, export de la liste affichée et import CSV invalide.
