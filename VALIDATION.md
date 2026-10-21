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
