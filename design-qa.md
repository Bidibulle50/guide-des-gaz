# Revue ciblée — Soudage et formules 1.5.1

Le parcours prolonge le design existant : titre, une question à la fois, listes ouvertes, bleu d’action, quatre onglets. Aucun nouvel asset média ; icône Feather « tool » sous la licence existante.

- Copie : matériaux, procédés et besoins cohérents avec les règles ; conditions client explicites. Aucun classement « meilleur gaz » ou réglage inventé.
- Structure : séquence matériau / procédé / besoin, puis résultats sourcés et accès aux fiches. Confirmation fil plein / automatique et demande inconnue exercées.
- Typographie : formules normales 26 px dans 72 px ; formules longues 16 px. Le constat de rognage à 48 px a été corrigé sur le composant de liste.
- Espacement et conteneurs : listes et séparateurs conformes à l’interface existante. Résultats lisibles ; navigation à quatre entrées sans débordement au viewport disponible.
- Couleurs / assets : palette et symboles existants, pas d’illustration de bouteille. Référence commerciale et formule restent distinctes.

Captures inspectées dans les outputs : `Guide-des-gaz-1.5-soudage.jpg`, `Guide-des-gaz-1.5-aluminium-mig.jpg`, `Guide-des-gaz-1.5.1-formules.jpg`. Contrôle navigateur public ; aucun overlay d’erreur, aucun écran vide, aucune erreur ou alerte console. Les 64 formules ont été mesurées dans le DOM après correction, sans dépassement. Le navigateur ne fournit toujours pas de viewport iPhone effectif : aucun passage de recette Safari iOS n’est revendiqué.

Résultat : revue bureau passée ; recette iPhone et coupure réseau réelle en attente. Les revues précédentes restent un historique.

---

# Revue ciblée — fiches ARCAL 1.4.1

Extension de la présentation existante, sans nouvelle maquette ni photo : procédés et matériaux, accès directs, utilisations, conditionnements par référence, composition et documents.

- Typographie : hiérarchie des titres et labels, références sélectionnables, indices chimiques et noms de marque distincts. Inspection lisible au viewport bureau fourni.
- Espacement : fiches d’utilisation ouvertes et cartes de conditionnement ; accès directs fonctionnels, sans changement de route. Aucun débordement horizontal observé.
- Couleurs : palette existante clair/sombre ; bleu pour la pression et les actions. L’ogive est une donnée fabricant, sans couleur de marque inventée. Signal inflammable propre au produit.
- Assets : aucun nouveau média ; icônes existantes et marque originale du guide conservées.
- Contenu : 21 fiches / 76 lignes source, aucune association de chapeau ou pression déduite par analogie. Absences et divergences visibles. Limites de qualification et de disponibilité explicites.

Captures du site public, inspectées : `Guide-des-gaz-1.4-utilisations-clair.png`, `Guide-des-gaz-1.4-formats-clair.png`, `Guide-des-gaz-1.4-formats-sombre.png` (dans les outputs du workspace). Capture 1218 × 1219 pixels, fenêtre 1233 × 1234 CSS px, densité 1. Le thème automatique a été restauré après la recette.

23 tests isolés réussis. Contrôles navigateur : mise à jour 1.4.1, favori persistant puis retiré, recherche de référence, accès directs, détail de raccord, exceptions 31/R1-5, ancien lien He20µC, console sans erreur ou alerte. La recette n’est pas une comparaison mobile ni un essai Safari iOS. Coupure réseau réelle non testée.

Résultat : revue bureau passée ; validation iPhone en attente. L’ancienne revue de fidélité mobile ci-dessous reste un historique, avec son blocage propre au viewport.

---

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
