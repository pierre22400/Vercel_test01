-- Bootstrap PostgreSQL autonome pour le prototype v0.
CREATE TABLE IF NOT EXISTS dossiers (
  id SERIAL PRIMARY KEY, numero TEXT NOT NULL, nom TEXT NOT NULL, responsable TEXT NOT NULL,
  date_creation DATE NOT NULL, date_limite DATE, priorite TEXT NOT NULL DEFAULT 'normale',
  etat TEXT NOT NULL DEFAULT 'a_traiter', commentaire TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO dossiers (numero, nom, responsable, date_creation, date_limite, priorite, etat, commentaire)
SELECT * FROM (VALUES
  ('D-2026-001','Renouvellement contrat fournisseur','Claire Martin','2026-08-01','2026-09-15','urgente','en_cours','À négocier avant échéance.'),
  ('D-2026-002','Mise à jour assurance','Nadia Benali','2026-08-03','2026-08-20','urgente','a_traiter','Attestation à transmettre.'),
  ('D-2026-003','Audit sécurité','Thomas Leroy','2026-08-06',NULL,'normale','en_attente','En attente du rapport externe.'),
  ('D-2026-004','Commande matériel','Claire Martin','2026-08-08','2026-09-30','faible','a_traiter',''),
  ('D-2026-005','Déclaration annuelle','Nadia Benali','2026-07-15','2026-08-10','urgente','en_cours','Date limite dépassée pour test visuel.'),
  ('D-2026-006','Formation équipe','Thomas Leroy','2026-08-12','2026-10-01','normale','termine','Formation réalisée.'),
  ('D-2026-007','Révision procédure qualité','Claire Martin','2026-08-18',NULL,'normale','en_attente',''),
  ('D-2026-008','Suivi prestataire','Nadia Benali','2026-08-22','2026-09-05','faible','a_traiter','')
) AS seed(numero,nom,responsable,date_creation,date_limite,priorite,etat,commentaire)
WHERE NOT EXISTS (SELECT 1 FROM dossiers);
