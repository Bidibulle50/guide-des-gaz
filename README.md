# guide-des-gaz

PWA indépendante en français, conçue pour l’iPhone et utilisable sur ordinateur. Interface sobre inspirée des conventions Apple, sans marque ou logo tiers. Aucune affiliation ni validation par Air Liquide ou l’INRS.

## Utilisation

- Recherche par nom, synonyme, formule avec/sans indices, numéro CAS et abréviations LOX/LIN/LAR.
- **64 fiches** : toutes les entrées de l’index public de l’encyclopédie Air Liquide consulté, dont air, gaz rares, hydrocarbures, gaz réactifs, réfrigérants, eau et autres liquides. Liste et limites dans [SOURCES.md](SOURCES.md).
- Propriétés physiques et conditions de référence, risques/précautions, applications, liens et date de consultation des sources.
- Favoris et thème clair/sombre/automatique conservés sur l’appareil.
- Installation iPhone via Safari et son menu de partage, puis ajout à l’écran d’accueil (libellé selon iOS).
- Attendre « Hors ligne disponible » après la première ouverture en ligne. L’ensemble des fiches est alors préchargé. Les pages sources externes restent en ligne uniquement.

## Données et limites

Les propriétés proviennent des pages publiques de l’Encyclopédie des gaz Air Liquide, consultées le **21 octobre 2026**. Chaque fiche cite ses sources ; les précautions générales sont complétées par le support de prévention Air Liquide et INRS ED 6369. Des fiches toxicologiques INRS complètent les substances concernées. Les applications manquantes sont recoupées avec des publications de fabricants, organismes publics ou chercheurs ; chaque ajout est référencé.

Les textes sont des synthèses originales et courtes ; les données chiffrées sont transcrites, sans interpolation. Aucune image, logo, FDS complète ou page source n’est redistribué. Les références à Air Liquide identifient la source et ne signifient ni partenariat ni certification.

- Masse volumique **du gaz à 15 °C et 1,013 bar absolu**, lorsqu’une valeur exploitable est publiée (44 fiches sur 64) ; masse molaire en g/mol. L’air est un mélange, les autres fiches identifient une substance ou une forme particulière.
- Transitions à 1,013 bar absolu quand cette référence est publiée. CO₂ et C₂H₂ : **sublimation** ; pas d’ébullition à cette pression. Les exceptions (air, SF₆, R-142b) sont expliquées. Une valeur inconnue ou incohérente n’est ni estimée ni remplacée par zéro.
- O₂/N₂/H₂ sont des formules ; O/N/H sont les symboles d’éléments. Ar/He/Ne désignent des gaz monoatomiques. CO n’est pas Co (cobalt).
- LOX/LIN/LAR désignent des formes liquides et sont uniquement des aides de recherche : elles ne changent pas les conditions des valeurs affichées.
- Couverture exhaustive de l’index public de 64 entrées consulté, pas de tous les gaz existants ni de tous les produits Air Liquide. Les grades commerciaux et mélanges sur mesure ne sont pas représentés. L’air est la seule fiche de mélange. Les usages historiques des halons/CFC/HCFC ne constituent pas une autorisation d’emploi actuelle.
- Applications documentées pour 60 fiches ; pour cyclopropane, isohexane, néopentane et R-21, l’absence d’application précise vérifiée est affichée. Les propriétés des isomères ne sont pas interchangeables. D est un isotope de H ; para-H₂ est une configuration de spin de H₂.
- La date de consultation n’est pas la date de révision d’une FDS ni une validation par un fournisseur. Pour intervenir, consulter la **FDS à jour du produit livré** et les consignes du site. Ce guide ne constitue pas une procédure d’urgence, un outil de calcul ou une prescription médicale.

## Structure

Application statique, sans dépendance d’exécution et sans compilation :

- `index.html`, `styles.css`, `app.js`, `core.js`, `theme.js` : interface et logique.
- `data/gases.json` : données, provenance et conditions de référence.
- `manifest.webmanifest`, `sw.js`, `icons/` : installation et cache hors ligne.
- `tests/` : recherche, stockage des favoris, intégrité des données, génération des 64 fiches et cycle de cache testé dans un environnement isolé.
- `SOURCES.md`, `VALIDATION.md` : couverture, arbitrages de données et limites des vérifications.

Tous les chemins sont relatifs ; compatible avec le sous-chemin `/guide-des-gaz/`. Les routes utilisent le fragment `#gaz/oxygene` afin de fonctionner sur GitHub Pages et hors ligne sans réécriture serveur. Les sources externes s’ouvrent explicitement dans un autre onglet.

## Développement et vérification

Servir le répertoire en HTTP local (`python3 -m http.server 8080`) puis ouvrir `http://localhost:8080/`. HTTPS est requis en dehors de localhost pour le service worker. L’ouverture en `file://` ne permet pas de vérifier la PWA.

`npm test` exécute les tests Node (Node 18+ ; aucune installation nécessaire). Les tests de cache et de gabarits simulent les interfaces du navigateur : ils ne prouvent pas le fonctionnement dans Safari ou sur un iPhone. Voir [VALIDATION.md](VALIDATION.md).

Pour une modification : vérifier recherche, favoris après rechargement, thèmes, navigation, dimensions mobiles et rechargement sans réseau. Incrémenter `VERSION` dans `sw.js` à chaque publication, ainsi que la version du catalogue/package. Le nouveau cache est rempli intégralement avant activation. Une mise à jour attend l’action « Actualiser » si une ancienne édition est ouverte. Seuls les caches de cette application et de sa portée sont supprimés.

## GitHub Pages

Publier la branche `main`, dossier `/ (root)`, depuis Settings → Pages → Deploy from a branch. `.nojekyll` désactive le traitement Jekyll. Aucun workflow additionnel ou secret n’est nécessaire.

Adresse prévue par cette configuration : https://bidibulle50.github.io/guide-des-gaz/ (sa disponibilité doit être vérifiée après déploiement).

## Confidentialité et conservation

Aucun compte, outil de suivi, publicité ou service tiers n’est chargé par l’application. Les préférences restent dans le stockage local du navigateur ; GitHub Pages traite les connexions selon ses propres politiques. Les favoris peuvent être distincts entre Safari et la PWA installée. Un navigateur ou iOS peut supprimer le cache et les préférences ; le mode hors ligne et les favoris ne sont pas des sauvegardes garanties.
