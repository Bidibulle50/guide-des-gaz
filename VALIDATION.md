# Vérification — édition 1.4.1 — 21 octobre 2026

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

1. Appliquer « Actualiser » si proposé et vérifier l’édition 1.4.1 dans Repères.
2. Ouvrir ARCAL, Chrome et R1-5 ; consulter utilisations, formats et FDS. Rechercher un gaz avec le clavier ouvert.
3. Ajouter un favori, recharger, vérifier les thèmes.
4. Attendre « Hors ligne disponible », installer sur l’écran d’accueil, couper les réseaux et rouvrir plusieurs fiches.
5. Rétablir Internet pour ouvrir FDS et sources.
