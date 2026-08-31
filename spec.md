# Test v0 Free — Application de suivi de dossiers

Je voudrais une petite application web pour suivre des dossiers en cours dans une petite entreprise.

L'objectif est de remplacer un tableau Excel devenu difficile à utiliser.

Chaque dossier comporte :

- un numéro de dossier ;
- un nom ou intitulé ;
- le nom de la personne qui s'en occupe ;
- une date de création ;
- une date limite facultative ;
- un niveau de priorité : faible, normale ou urgente ;
- un état : à traiter, en cours, en attente ou terminé ;
- un commentaire libre.

Sur la page principale, je veux voir immédiatement :

- combien de dossiers restent à traiter ;
- combien sont en cours ;
- combien sont en attente ;
- combien sont terminés ;
- combien ont dépassé leur date limite.

Je veux ensuite une liste claire de tous les dossiers.

Je dois pouvoir :

- ajouter un dossier ;
- modifier un dossier ;
- supprimer un dossier après confirmation ;
- marquer rapidement un dossier comme terminé ;
- rechercher un dossier par son numéro, son nom ou son commentaire ;
- filtrer les dossiers par état ;
- filtrer les dossiers par priorité ;
- afficher uniquement les dossiers en retard ;
- trier les dossiers par date limite, priorité ou date de création.

Les dossiers urgents doivent être faciles à repérer visuellement.

Les dossiers dont la date limite est dépassée doivent également être clairement signalés.

Quand je clique sur un dossier, je veux voir toutes ses informations et pouvoir les modifier simplement.

Je voudrais aussi pouvoir importer une liste de dossiers depuis un fichier CSV.

Si certaines lignes du fichier importé sont incorrectes ou incomplètes, l'application ne doit pas planter. Elle doit expliquer simplement quelles lignes posent problème.

Je veux pouvoir exporter la liste actuellement affichée dans un fichier CSV.

Ajoute quelques dossiers d'exemple pour que l'application puisse être testée immédiatement après sa création.

Les informations doivent rester présentes lorsque je recharge la page.

Je ne veux pas une interface compliquée.

Elle doit être agréable, sobre, lisible et utilisable par quelqu'un qui n'est pas informaticien.

Elle doit fonctionner correctement sur ordinateur et rester utilisable sur téléphone.

Je ne veux pas avoir à choisir de technologie, de base de données ou de framework. Fais les choix techniques les plus simples adaptés à cette petite application.

Je veux une application réellement utilisable, et pas seulement une maquette graphique.

Avant de considérer le travail terminé, vérifie les principales fonctions de l'application et corrige les erreurs que tu constates.
