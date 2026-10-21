# Vérification — édition 1.7.2 — 22 octobre 2026

- Références utilisateur reprises pour accueil, catalogue et quatre rubriques de fiche. Le pictogramme de clé puis le masque générique ont été remplacés par une torche de soudage avec étincelles, Noun Project #147374, domaine public indiqué sur la page primaire. Dessin conservé, marges transparentes recadrées ; affichage local de 30 × 25 px et cache inclus.
- **38 tests réussis, zéro échec** : recherche, risques, favoris, 115 fiches, quatre onglets, 21 ARCAL et 76 conditionnements, présélection Soudage, cache isolé. Syntaxes JavaScript vérifiées.
- Commit applicatif `d4d3c829a6ec9ce11849f014a6d0ff09a99fee74`. Workflow Pages `39684587732` terminé avec succès. L’accueil et **22 fichiers** servis en HTTPS ont été comparés aux octets locaux : identiques. Preuve : `validation/deployment-2026-10-22.json`.
- Navigateur public : activation 1.7.1 → 1.7.2, édition affichée, cache « Hors ligne disponible », torche visible et bleue lorsque Soudage est actif, ouverture du guide ARCAL. Aucune erreur ni alerte console. Mesure de l’icône : 30 × 25 CSS px ; masque chargé depuis le site. Aucun débordement horizontal sur la page finale bureau.
- Contrôle responsive du même site dans un document intégré : largeurs réelles **390 et 320 CSS px**. Accueil 390 × 940, catalogue 390 × 1000, O₂ 390/320 × 2100 ; quatre onglets inspectés et point critique lisible sur deux lignes à 320 px. Comparaisons source/rendu enregistrées dans le workspace ; les grandes fiches sont capturées par régions, sans prétendre à une capture complète Safari.
- Références, données chimiques et limites documentaires précisées dans `SOURCES.md` et `design-qa.md`. Les 64 gaz, 51 produits, règles de soudage et formats ARCAL sont conservés. Le catalogue reste partiel.
- **Limites** : pas de test sur Safari iOS, de clavier iPhone, d’installation native ni de réouverture après coupure réelle du réseau. Le cadre intégré sans barre de défilement est une surface de contrôle, pas un appareil iOS ; certaines parties longues nécessitent plusieurs captures. Les FDS et sources externes nécessitent Internet. Dépôt et site restent publics.

## Fichiers principaux

`app.js`, `styles.css`, `ui-icons.js`, `icons/welding-torch.png`, `data/gases.json`, `sw.js`, `package.json`, assets sous licence et documentation. Aucune photographie de fabricant ni donnée interne ajoutée.

## Recette iPhone restante

1. Choisir « Actualiser » si proposé, puis vérifier l’édition 1.7.2.
2. Vérifier la torche Soudage, la recherche avec clavier ouvert, les quatre rubriques et le défilement jusqu’aux sources.
3. Attendre « Hors ligne disponible », couper les réseaux et rouvrir plusieurs fiches depuis l’écran d’accueil.
4. Rétablir Internet pour consulter FDS et sources.

---

## Historique antérieur

# Vérification — édition 1.6.0 — 21 octobre 2026

- Refonte des 115 fiches selon la maquette Oxygène approuvée : quatre rubriques accessibles, synthèse et FDS prioritaires, usages en dessous. Toutes les données existantes sont conservées ; seules les trois applications détaillées O₂ et la version sont ajoutées au catalogue.
- **34 tests réussis, zéro échec**, dont quatre nouveaux tests des 115 fiches et des interactions d’onglets/focus ; syntaxe JavaScript vérifiée. Les simulations ne constituent pas une preuve Safari iOS.
- Commit applicatif `06a4199f58683b37bdcbe3153c108fffa8ea8289`, workflow Pages `39679203101` réussi. Accueil et 15 fichiers applicatifs HTTPS comparés aux octets locaux : identiques.
- Navigateur public : actualisation 1.5.1 → 1.6.0, fiches O₂ et Chrome, quatre onglets, Home au clavier, favori persisté puis retiré, recherche SKU, sources dépliables, thèmes clair et automatique, six conditionnements Chrome avec focus de destination. Aucune erreur ni alerte console. Cache confirmé par « Hors ligne disponible ».
- Captures inspectées : O₂ sombre/clair, Chrome formats. **Viewport bureau uniquement : 1233 × 1234 CSS px, densité 1**. Aucun rendu iPhone effectif ni coupure réseau réelle testé ; recette mobile et fidélité au viewport de la maquette encore en attente. Le rapport `design-qa.md` conserve donc `final result: blocked` pour cette validation mobile.
- Principaux fichiers modifiés : `app.js`, `styles.css`, `data/gases.json`, `sw.js`, `package.json`, `tests/templates.test.js`, documentation.
- Dépôt et site toujours publics. Aucun document interne, logo ni nouvelle photographie ajouté ; aucune modification des autorisations ou de l’authentification.

## Recette iPhone restante

1. Appliquer « Actualiser » et vérifier l’édition 1.6.0 dans Repères.
2. Ouvrir Oxygène, utiliser les quatre rubriques, vérifier les bords des formules et la lisibilité à 320/390 px et avec texte agrandi.
3. Ouvrir Chrome, Formats, pression & chapeau ; vérifier les six références. Tester une recherche avec le clavier ouvert et un favori après rechargement.
4. Attendre « Hors ligne disponible », fermer puis rouvrir la PWA après coupure des réseaux ; ouvrir plusieurs fiches.
5. Rétablir Internet pour les FDS et sources externes.

---

## Historique 1.5.1

# Vérification — édition 1.5.1 — 21 octobre 2026

## Ajouts 1.5 / correctif 1.5.1

- Onglet Soudage : matériau → procédé → besoin → pistes ARCAL. Dix familles de matériaux, règles documentées pour 21 produits ; conditions de fil et de mode automatique visibles puis confirmables.
- **30 tests uniques réussis** en 1.5.0 ; après le correctif CSS/version 1.5.1, les **12 tests ciblés cache et gabarits** sont de nouveau réussis. Aucune modification des règles de sélection entre ces versions.
- Commit applicatif final : `acf63ffb67f8c3f804a6b8344d7e850e64879c65`. Workflow Pages `39671710034` terminé avec succès ; accueil et **15 fichiers** applicatifs identiques aux octets locaux.
- Formules : avant correction, 16 dépassements dans une colonne de 48 px. Après correction : **64 formules mesurées, aucun rognage** ; colonne 72 px, largeur maximale du texte 60,85 px au viewport contrôlé. Taille normale 26 px, formules longues 16 px ; indices et texte scientifique inchangés.
- Navigateur public : aluminium → MIG → usages courants affiche Prime, 31, He20 et He70 conditionnel. Confirmation du mode automatique contrôlée. Acier carbone → MAG → cadence : Speed conserve la condition fil plein ; confirmation, puis ouverture de Speed et de ses 11 conditionnements réussies.
- Cas matériau inconnu : questions de qualification, aucune proposition. Navigation, état actif Soudage et absence de débordement horizontal contrôlés. Console sans erreur / alerte. Thème automatique conservé.
- Captures réelles inspectées : `Guide-des-gaz-1.5-soudage.jpg`, `Guide-des-gaz-1.5-aluminium-mig.jpg` (1218 × 1219 pixels), `Guide-des-gaz-1.5.1-formules.jpg` (1233 × 1234 pixels), dans les outputs du workspace. Fenêtre 1233 × 1234 CSS px, densité 1 ; viewport bureau uniquement. La différence de capture native ne constitue pas un viewport mobile.
- Les vérifications Safari iPhone et coupure réseau réelle restent à faire. Aucun document interne ajouté ; aucun changement de visibilité : dépôt et application toujours publics.

Les résultats 1.4 ci-dessous détaillent la vérification initiale des fiches et ses limites, toujours applicables.

## Résultat

- **23 tests Node réussis**, syntaxe JavaScript vérifiée. Recherche, favoris, 115 fiches, gabarits, 21 profils ARCAL, références de conditionnement, exceptions de sécurité et cycle de cache isolé.
- Commit applicatif : `22c1a959d8f8e5dd30254a1f3b2e039bbb7dae7d`. Workflow GitHub Pages `39669065806` terminé avec succès.
- Site : https://bidibulle50.github.io/guide-des-gaz/ ; accueil et **14 fichiers applicatifs** servis en HTTPS, réponses 200 et octets identiques aux fichiers testés. TLS vérifié.
- Données : 21 pages produit ARCAL actuelles et leurs 21 PDF techniques liés lus dans le navigateur normal. **76 lignes de conditionnement comparées aux tableaux**, sans croisement de tailles, chapeaux et pressions.
- Les 64 fiches encyclopédiques et 30 produits hors ARCAL sont identiques à l’édition précédente. 51 produits commerciaux au total ; catalogue global toujours partiel.
- Preuves : `validation/deployment-2026-10-21.json` et `validation/arcal-sources-2026-10-21.json`.

## Parcours vérifiés sur le site public

- « Actualiser » active la nouvelle édition, confirmée 1.4.1 dans Repères. « Hors ligne disponible » affiché. Le favori Chrome et le thème clair persistent pendant l’activation du nouveau cache et le rechargement.
- Gamme ARCAL : 21 références, 4 Référents puis 17 Techniques. Fiche Chrome : utilisations détaillées, 6 conditionnements, composition, FDS, UN 1956, ogive RAL 6018 et sources datées.
- Recherche de `I2531M20E2A001` : un résultat, Chrome, parmi les 115 fiches. Tests isolés : procédés, Duplex et distinction CO / Co également contrôlés.
- Boutons « Formats & chapeaux » et « FDS & ONU » : destination à 20 px du haut, route de fiche conservée. Ouverture du détail Raccordements contrôlée.
- ARCAL 31 : V2.0 du 5 octobre 2026, deux bouteilles, chapeau non précisé. R1-5 : inflammabilité, UN 1954 / 1F, rouge RAL 3000, AFNOR E à gauche. Ancien lien He20µC `#gaz/arcal-he20microc` conservé et ouvert avec succès.
- Thèmes clair et sombre inspectés visuellement ; aucun débordement horizontal au viewport fourni. Console applicative : aucune erreur ni alerte.
- Favori de test retiré et préférence automatique restaurée. Aucun visuel fabricant redistribué ; aucune image de bouteille ajoutée.

## Sources et limites métier

Les notes des fiches distinguent les désaccords de source (M24-7, He70, M11) et les informations manquantes. Aucune dimension physique de chapeau, propriété physique de mélange ou recommandation de réglage n’est calculée. Le type commercial de tête vient de la ligne de conditionnement ; les raccords décrits globalement ne prouvent pas l’équipement de chaque SKU.

Le contenu gazeux en m³ est annoncé par le fabricant : les conditions de référence ne sont pas précisées dans ces tableaux, donc aucune conversion. Disponibilité, stock et conditions contractuelles non vérifiés. Les utilisations ne constituent pas un DMOS ni une qualification du soudage.

Liens FDS relevés sur les 21 pages ; seules les quatre fiches dont la note le précise disposent d’un document individuellement identifié (deux URL distinctes). La révision des autres FDS n’a pas été contrôlée ; certains liens source utilisent HTTP. Les documents et sites externes nécessitent Internet et ne sont pas enregistrés hors ligne. Pas d’affiliation ou validation d’Air Liquide.

## Limite mobile et hors ligne réel

L’aperçu local avait été refusé ; aucun contournement. Le navigateur public fournit une fenêtre de 1233 × 1234 CSS px, contenu de 1218 px et capture de 1218 × 1219 pixels, densité 1. Aucun viewport iPhone effectif n’a pu être obtenu. Cette inspection ne valide ni Safari iOS, ni le clavier iPhone, ni l’installation à l’écran d’accueil, ni l’accessibilité complète.

Le cache complet est confirmé par l’application et son cycle est testé dans un environnement isolé. **Une réouverture après coupure réseau réelle n’a pas été vérifiée.** iOS peut supprimer le cache et les préférences. Voir `design-qa.md` pour la portée de la revue visuelle.

## Recette iPhone restant à effectuer

1. Appliquer « Actualiser » si proposé et vérifier l’édition 1.5.1 dans Repères.
2. Vérifier C₂H₆ et les formules longues dans le catalogue, puis ouvrir Soudage, ARCAL, Chrome et R1-5 ; consulter utilisations, formats et FDS. Rechercher un gaz avec le clavier ouvert.
3. Ajouter un favori, recharger, vérifier les thèmes.
4. Attendre « Hors ligne disponible », installer sur l’écran d’accueil, couper les réseaux et rouvrir plusieurs fiches.
5. Rétablir Internet pour ouvrir FDS et sources.
