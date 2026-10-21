# Design QA — édition 1.3.2

Source visual truth: `outputs/Guide-des-gaz-maquette-3.png` (workspace), 853 × 1844 pixels, cible 390 × 844 CSS px.

Implementation screenshots: `outputs/Guide-des-gaz-1.3-clair.png`, `outputs/Guide-des-gaz-1.3-sombre.png`, `outputs/Guide-des-gaz-1.3-commercial.png` (workspace). Rendu du site public, thème clair/sombre, accueil sans requête et fiche Prime.

Viewport: fenêtre 1233 × 1234 CSS px, contenu 1218 px, devicePixelRatio 1 ; capture 1218 × 1219 pixels. Aucun viewport mobile n’a pu être obtenu. La comparaison `outputs/Guide-des-gaz-1.3-comparaison.png` place maquette et capture dans la même image pour revue de contexte ; les miniatures sont ramenées à 844 pixels de haut. Ce montage ne simule pas un rendu mobile ni une comparaison 1:1.

## Findings et cinq surfaces

- Typography: police système conservée, hiérarchie titre/recherche/sections, formules en indices et noms commerciaux distincts. Rendu lisible au viewport large. Vérification des retours de ligne à 390 px restant bloquée.
- Spacing/layout: recherche puis grille à quatre raccourcis, gammes et navigation dans le même ordre que la maquette. Écart intentionnel : lien explicite vers les 12 essentiels et actions Favoris/thème pour préserver les fonctionnalités. Aucun débordement horizontal au viewport observé ; rendu mobile non conclu.
- Colors/tokens: fond blanc, encre sombre, surfaces grises et bleu d’action ; mode sombre décliné avec mêmes positions. Marque bleue restaurée après premier contrôle. Pas de code couleur inventé pour une marque commerciale.
- Asset quality: marque originale de l’application réutilisée ; icônes Feather MIT intégrées localement. Aucune photo ou illustration de bouteille utilisée après décision de sobriété. Les premières icônes étaient dépourvues de classe et d’attributs décoratifs ; correction contrôlée visuellement et par l’arbre accessible en 1.3.2.
- Copy/content: recherche, quatre gaz, gammes et compte de 109 fiches cohérents avec les données ; catalogue commercial explicitement partiel. Applications présentées avant composition pour les échanges en clientèle. Sources et FDS disponibles sans transformer les propriétés des constituants en propriétés de mélange.

## Historique

1. Première capture `outputs/Guide-des-gaz-1.3-clair-premier.png`, édition 1.3.0 : [P2] classe de présentation des SVG non injectée et icônes décoratives exposées ; [P2] marque noire au lieu de bleue.
2. Corrections : injection d’attributs au nœud SVG fourni par Feather et remplissage bleu de l’asset de marque. Tests ciblés ajoutés. Captures finales clair/sombre et arbre accessible inspectés : problèmes corrigés.
3. Revue de contexte dans la comparaison combinée : structure et palette conformes à la direction choisie au viewport large ; la fidélité au viewport mobile ne peut pas être jugée. Les détails de recherche, marque, grille et navigation restent lisibles dans ce montage ; une comparaison focalisée mobile ne serait pas valide avec ces dimensions.

## Contrôles fonctionnels

17 tests réussis ; navigateur public : accueil, 12 essentiels, liste 12+97, recherche globale ALIGAL depuis Favoris, fiche Prime/FDS, favori maintenu à travers la mise à jour puis retiré, navigation en haut, focus arrondi, thèmes. Console : aucune erreur ou alerte. Préférence automatique restaurée.

## Limite et suite

Inspection bureau réalisée. Validation de fidélité mobile formelle bloquée par les dimensions fournies par l’outil ; recette Safari/iPhone et coupure réseau réelle à effectuer. Aucun passage de QA mobile n’est revendiqué.

final result: blocked
