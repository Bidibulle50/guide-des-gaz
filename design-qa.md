# Vérification du format de consultation 2.0.3

final result: passed

Référence : maquettes V2.1 Oxygène, Azote et ARCAL Chrome approuvées le 22 octobre 2026, conservées hors du dépôt. Vérification rendue sur le site GitHub Pages dans le navigateur intégré Chromium, avec documents à 390 et 320 pixels de largeur CSS, puis sur ordinateur. Le cadre de validation masque seulement la barre de défilement du document intégré pour conserver la largeur CSS annoncée ; il ne simule pas Safari iOS.

## Comparaison et corrections

- Typographie : Inter local, corps 14 px et annotations 12,5 px comme la référence ; titre 27 px, titre produit 25/21 px. Graisses et métriques conservées, rendu optique automatique désactivé pour correspondre à la maquette. Les différences d’anticrénelage entre PDF et navigateur ne constituent pas une identité de pixels.
- Espacement : mêmes marges 20 px, identité 58 × 61 px, quatre onglets, cartes risque/ogive/usages/FDS/sources dans le même ordre. La première capture avait trop d’espace vertical : densité corrigée et comparée à nouveau. Sous 360 px, les onglets occupent deux colonnes. Les cibles restent au moins 44 px.
- Couleurs : valeurs de la maquette sombre reprises, dont fond #111217, surfaces #1d1e26, bleu #a7bfff et cartes risque #2d1c23 / #202b3d. Le thème clair conserve la hiérarchie. Les RAL sont des repères d’ogive, pas l’aspect du gaz.
- Images : mêmes SGH03/04 INRS et illustrations ADR, pictogrammes de navigation utilisateur conservés. SGH02/05 proviennent aussi des PDF INRS officiels. Aucun logo fournisseur ajouté. Les images rendues contrôlées sont chargées.
- Contenu : usages validés des trois pilotes, état et pays de FDS explicites, notes longues dans Sources et limites. Les précisions antérieures du fabricant Chrome y restent accessibles. Aucune bande atmosphérique ni procédure de secours nouvelle.

Différences attendues : défilement réel et barre de navigation fixe de l’application, absence du pied « maquette de validation », annotations supplémentaires dans le volet Sources. Aucune revendication d’identité pixel par pixel avec un PDF. Aucun défaut P0/P1/P2 restant identifié dans les écrans contrôlés.

## Parcours vérifiés

- Les 115 fiches et 118 états produisent les quatre panneaux, les usages, les sources, les notes et les FDS sans valeur fictive. Tests automatiques : 44 réussis.
- Oxygène : sélection gaz/liquide dans Transport, onglet conservé, ONU 1072/1073, FDS correspondante, Sécurité H280/H281 et Technique propres à l’état.
- Azote : ONU 1066/1977, FDS France/Benelux, H281 et froid extrême du liquide ; usages gaz et cryogéniques séparés.
- Chrome : risques, couleur, ONU 1956, catégorie non confirmée, accès aux six références exactes de conditionnement. Les 76 références ARCAL sont conservées.
- Recherche « méthanol » : une fiche trouvée ; liquide de référence sans pictogramme de pression ajouté ; donnée de masse volumique absente signalée.
- Favori ajouté, retrouvé après rechargement, puis état initial rétabli. Thème clair contrôlé et choix Automatique initial rétabli.
- Ancien cache : proposition Actualiser puis chargement de l’édition 2.0.3 observés. Mention Hors ligne disponible présente ; cycle de cache avec réseau simulé indisponible couvert par les tests Node.
- Console du navigateur contrôlé : aucun avertissement ni erreur relevé.
- Les 24 ressources du cache livrées par HTTPS sont identiques aux fichiers locaux vérifiés. Déploiement applicatif : commit 30949fa4a5c9ab73d581054c32f07d4e49b8a8de, workflow 39700539689 réussi.

## Limites

Pas de test physique sur iPhone/Safari ni de coupure réseau réelle du navigateur. Les 112 autres entrées conservent leurs données : l’évolution du gabarit ne constitue pas une nouvelle vérification documentaire de leurs valeurs. FDS France exactes O2/LOX/LIN et catégories ADR UN1066/1956 toujours à confirmer comme indiqué dans les fiches. Les documents externes nécessitent Internet.
