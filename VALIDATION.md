# Vérification — édition 1.3.2 — 21 octobre 2026

## Résultat

- 17 tests Node réussis, syntaxe JavaScript vérifiée : recherche, favoris, ordre des 12 essentiels, 109 fiches, accueil à quatre raccourcis, gammes, gabarits, cache isolé et présentation accessible des icônes.
- Commit applicatif : `14fdeb0728a5cab4b7f3ff2ce1d98ebab5f915e5`. Workflow Pages terminé avec succès. Site : https://bidibulle50.github.io/guide-des-gaz/.
- Accueil et 14 fichiers applicatifs servis en HTTPS : réponses 200, octets identiques à la copie testée. TLS vérifié.
- Rapport détaillé : [validation/deployment-2026-10-21.json](validation/deployment-2026-10-21.json).

## Parcours du site public

- Activation de la nouvelle édition par « Actualiser ». Mention « Hors ligne disponible » affichée.
- Accueil : quatre raccourcis O₂, N₂, Ar, CO₂, recherche, liens ARCAL et ALIGAL, accès aux listes complètes.
- « Voir les 12 essentiels » : 12 fiches prioritaires ; « Tous » : 12 prioritaires puis 97 autres fiches. Navigation et ouverture des listes remettent le défilement en haut.
- Recherche ALIGAL depuis Favoris : 12 résultats sur l’ensemble du catalogue, sans confinement aux favoris. Recherche ARCAL contrôlée pendant la recette de la refonte : 15 résultats.
- Fiche Prime : applications avant composition, sources, FDS et identification conservées, aucune photo de bouteille. Favori conservé après rechargement et activation de mise à jour, puis favori de test retiré.
- Thèmes clair et sombre capturés ; automatique restauré. Aucune erreur ou alerte dans la console applicative. Icônes décoratives exclues du nom accessible.
- Focus : contour interne supprimé, contour du conteneur arrondi à 16 pixels.

## Périmètre et limites

Les 64 fiches encyclopédiques et 45 références commerciales restent documentées. Catalogue commercial partiel ; six des dix gammes répertoriées n’ont pas de composition de produit dans cette édition. Aucune propriété ou classification d’un mélange n’est déduite des constituants.

Les liens FDS, références ONU et couleurs restent ceux de l’édition 1.2. Quatre références ARCAL disposent de FDS individuelles vérifiées (deux URL distinctes), les autres fiches dirigent vers le portail fournisseur. Une FDS externe nécessite Internet. Les états et conditionnements doivent être confirmés dans la FDS du produit livré. La couleur ne remplace pas l’étiquette. Aucune nouvelle vérification des propriétés physiques n’est revendiquée pour cette refonte.

Les deux essais d’illustrations de bouteilles générées sont conservés hors application et ne sont ni publiés ni mis en cache. Icônes Feather 4.29.2 sous MIT, avis dans `THIRD_PARTY_LICENSES.md`.

## Limite de recette mobile

L’accès à l’aperçu local a été refusé ; aucun contournement. Le navigateur public fournit une fenêtre de 1233 × 1234 CSS px, un contenu de 1218 px de large et des captures de 1218 × 1219 pixels à densité 1. Le réglage mobile demandé n’a pas été appliqué par l’outil. L’inspection large ne constitue pas une recette iPhone ni une comparaison de fidélité au même viewport.

Voir `design-qa.md` : revue des cinq surfaces visuelles, corrections d’icônes et de marque contrôlées ; comparaison mobile formelle bloquée par l’outil. Restent à vérifier : Safari iOS, clavier ouvert, installation à l’écran d’accueil, accessibilité complète et réouverture après coupure réseau réelle. L’état du cache et les tests isolés ne remplacent pas ce dernier essai.

## Recette iPhone

1. Ouvrir le site, appliquer « Actualiser » si proposé, vérifier l’édition 1.3.2.
2. Ouvrir un raccourci, les 12 essentiels, puis ARCAL et ALIGAL. Vérifier la recherche avec clavier ouvert.
3. Ajouter un favori, recharger ; contrôler les thèmes.
4. Attendre « Hors ligne disponible », installer sur l’écran d’accueil, couper les réseaux et rouvrir plusieurs fiches.
5. Rétablir Internet pour ouvrir les FDS et sources ; les données locales peuvent être effacées par iOS.
