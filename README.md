# guide-des-gaz

PWA indépendante en français, conçue pour l’iPhone et utilisable sur ordinateur. Interface sobre inspirée des conventions Apple, sans marque ou logo tiers. Aucune affiliation ni validation par Air Liquide ou l’INRS.

## Nouveautés 2.0.0 — fiches de consultation validées

Le format V2.1 approuvé sur Oxygène, Azote et ARCAL Chrome est appliqué aux **115 fiches** : même hiérarchie, palette sombre, typographie, cartes et quatre onglets. Le thème clair conserve la structure. Risques documentés et pictogrammes en tête, couleur d’ogive puis utilisations, accès FDS haut/bas, détails séparés en Sécurité, Transport et Technique.

- O₂ et N₂ : choisir gaz comprimé ou liquide change ensemble la FDS, les risques, le numéro ONU et les propriétés. Le choix conserve l’onglet actif. Les usages cryogéniques de l’azote sont réservés au liquide.
- ARCAL : utilisations, composition, 76 références exactes de conditionnement, pression de remplissage, tête/chapeau et raccords conservés. Les propriétés des constituants ne sont jamais transposées au mélange.
- Les pictogrammes sont des repères des risques déjà décrits ; les mentions CLP exactes sont reprises uniquement lorsqu’une FDS a été lue. Une toxicité non catégorisée utilise un repère d’alerte général, sans lui attribuer SGH06. Pas de SGH07 pour l’asphyxie.
- Les deux catégories de transport UN 1066/1956 restent non confirmées. Certaines FDS documentaires sont Benelux : le pays et la version sont visibles. FDS France exactes O₂/LOX/LIN à associer au produit livré. Pas de code, de plaque orange ni de couleur inventés lorsqu’ils sont absents.
- Les 112 autres entrées conservent leurs données ; leur format commun ne constitue pas une nouvelle vérification documentaire. Les dates de consultation restent propres aux sources.
- Texte courant ≥ 14 px, commandes ≥ 44 px ; quatre onglets en deux colonnes sous 360 px. Le cache 2.0.0 inclut le nouveau rendu et les pictogrammes locaux. Utiliser « Actualiser » lorsqu’une ancienne édition est ouverte.

## Nouveautés 1.7.4 — icônes de navigation

Les quatre pictogrammes du visuel fourni sont utilisés directement : molécule, torche, cartes superposées et information. Le PNG original reste intact ; son cadrage et ses couleurs d’affichage sont gérés dans la barre de navigation, avec état actif bleu et adaptation claire/sombre. Les libellés et destinations restent de vrais liens accessibles. Aucun changement du logo principal, des icônes d’installation ou des données métier.

## Nouveautés 1.7.3 — logo principal

Visuel moléculaire platine et bleu cobalt fourni par l’utilisateur : logo d’accueil, favicon et icônes d’installation 180/192/512 px. Dessin conservé, sans recadrage ; fichiers locaux avec de nouveaux noms pour éviter la réutilisation d’une ancienne image en cache. L’identité du manifest et les données métier restent inchangées. Les installations existantes peuvent conserver leur ancienne icône jusqu’au rafraîchissement par le système ; mise à jour sur iPhone non vérifiée.

## Nouveautés 1.7.2 — références visuelles conservées

Les écrans d’accueil, de catalogue et de fiche fournis par l’utilisateur constituent la référence : quatre cartes de gaz, gammes regroupées, accès au catalogue complet, recherche arrondie, filtres de risques, lettres alphabétiques, fiches à quatre rubriques avec cartes de sécurité et de transport. Le guide conserve les **115 fiches**, les 12 essentiels en premier et l’onglet Soudage.

- Les filtres portent uniquement sur les risques déjà décrits. « Ininflammable » n’est pas assimilé à « inflammable » ; les produits non détaillés sont signalés. Une recherche parcourt toujours le catalogue complet, même si un filtre était actif.
- Oxygène : mentions H/P synthétisées par état, tableaux gaz/liquide, points remarquables, repères ADR et sources supplémentaires. Les deux FDS documentaires sont francophones **Benelux**, sans prétendre identifier le produit France livré ; le portail France reste l’accès FDS proposé.
- Les illustrations de la référence ne valent pas validation technique : code ADR **1O/3O** avec lettre O, expansion publiée **843,57** avec conditions ; le seuil bas 19,5 % non confirmé dans les sources Air Liquide consultées n’est pas affiché comme un seuil vérifié et aucune bande verte ne garantit une atmosphère sûre. Aucun conditionnement 200/300 bar générique n’est inventé.
- Soudage : torche avec arc et étincelles, issue d’une icône déclarée dans le domaine public ; masque local mis en cache.
- Police Inter 4.1 conservée localement avec sa licence OFL. SGH03/04 reproduits depuis les fichiers officiels INRS, rendus sans modification graphique ; illustrations ADR reprises du HTML utilisateur. Aucun logo tiers.
- La page `validation/mobile.html` permet un contrôle sur ordinateur avec un vrai viewport CSS intégré de 390 ou 320 px. Elle reste une surface de vérification distincte du parcours utilisateur et ne simule pas Safari iOS ni son clavier.

## Nouveautés 1.6 — fiches de consultation

La maquette Oxygène validée est déclinée sur les **115 fiches** : identité, quatre rubriques **Essentiel / Sécurité / Transport / Technique**, synthèse ONU–ogive–propriété de référence et accès FDS immédiatement accessibles, applications en dessous. Les onglets exposent leur sélection, le panneau associé et le parcours au clavier (flèches, Début, Fin).

- Les 64 fiches de substances conservent toutes leurs propriétés, notes, précautions et sources. Les informations non vérifiées restent signalées. Les trois applications de l’oxygène sont développées en courtes synthèses de l’[encyclopédie publique](https://encyclopedia.airliquide.com/fr/oxygene).
- Les 51 produits commerciaux gardent leurs compositions et constituants séparés. Pour ARCAL, utilisations et procédés restent dans Essentiel ; un accès direct ouvre les **formats, pression et chapeau** dans Technique, avec les 76 associations exactes taille/pression/tête/référence.
- Les états comprimé et liquide réfrigéré sont associés explicitement à leur numéro ONU. Une absence de donnée ou un lien FDS vers un portail n’est pas présenté comme un document individuel vérifié.
- Les favoris, thèmes, recherche, liens historiques et parcours Soudage sont conservés. L’édition 1.6.0 renouvelle le cache de l’application ; utiliser « Actualiser » lorsqu’une ancienne édition est ouverte.
- Aucun visuel de marque ou nouveau document interne n’est ajouté. Les couleurs affichées restent indicatives et l’étiquette du produit fait foi.

## Nouveautés 1.5 — aide Soudage

Un onglet **Soudage** guide la discussion : matériau → procédé → besoin → présélection ARCAL. Dix familles de matériaux sont proposées. Chaque résultat expose le domaine publié, les conditions à préciser et un accès à la fiche, aux formats et à la source.

- Les 21 produits ARCAL ont des cas d’usage explicitement reliés aux fiches vérifiées. Les cas particuliers (mode automatique, fil plein, MAG pulsé / fil plein, fil fourré inox) restent conditionnels jusqu’à information du client.
- Les usages visant la nuance choisie sont présentés avant les domaines « tous matériaux ». Un objectif sans détail publié reste signalé. Aucun « meilleur gaz », débit, réglage ou gain calculé n’est inventé.
- Exemple aluminium / MIG : Prime, 31 et He20 ; He70 demande le mode automatique. Duplex / TIG : 39 et N2-2 apparaissent avant les références tous matériaux. Ces correspondances documentaires ne constituent pas une qualification de soudage.
- Les réponses restent en mémoire pendant la consultation ; elles ne contiennent aucun nom de client et ne sont pas envoyées à un serveur. Le parcours et les règles sont enregistrés avec l’application pour la consultation hors ligne. Les documents externes nécessitent Internet.
- Aucun document interne n’est intégré. Le dépôt et le site restent publics dans cette édition ; aucune restriction d’accès n’est revendiquée.

## Nouveautés 1.4 — ARCAL en clientèle

- **21 produits ARCAL France**, soit les deux pages du catalogue public observées le 21 octobre 2026 : 4 Référents en premier, puis 17 Techniques. Le guide compte désormais **115 fiches**, dont 51 produits commerciaux.
- Utilisations précisées par procédé, matériau et cas réellement publié. Les sources succinctes restent signalées ; aucun réglage de soudage ni gain chiffré n’est inventé.
- **76 références de conditionnement** : taille, pression publiée, tête/chapeau, contenu annoncé et référence exacte, associés ligne par ligne. Une tête absente n’est jamais déduite du code produit.
- Composition, tolérances, impuretés, ISO 14175, raccords, ONU et couleur d’ogive repris des fiches liées. Différences R1-2 / R1-5 conservées ; divergences de source visibles.
- Liens vers les 21 pages et PDF fabricant, dates de révision, lien FDS relevé sur chaque page. Seules les FDS dont la note le précise ont été ouvertes et identifiées individuellement.
- Consultation rapide : accès Utilisations / Formats & chapeaux / FDS & ONU ; recherche par référence de bouteille, matériau ou procédé. Contenu disponible hors ligne avec le catalogue ; documents externes en ligne seulement.

Les dimensions physiques d’un chapeau (hauteur, diamètre) ne sont pas publiées dans ces tableaux : le guide affiche son **type commercial**, sans inventer une cote. Le contenu en m³ est celui annoncé par le fabricant ; ses conditions de référence ne figurant pas dans le tableau, aucune conversion n’est calculée. La pression affichée n’est pas une pression d’utilisation. Ces fiches soutiennent l’échange commercial ; elles ne constituent ni un DMOS ni une qualification de l’application.

## Nouveautés 1.3

- Accueil issu de la maquette « Recherche immédiate » : recherche prioritaire, quatre raccourcis, accès aux 12 essentiels et aux gammes ARCAL/ALIGAL.
- Consultation commerciale : applications présentées avant la composition ; FDS et sources conservées. Favoris, recherche complète, thèmes et mode hors ligne préservés.
- Aucun visuel générique de bouteille intégré : ces images ne permettent pas d’identifier un produit réel ou son conditionnement. Les deux essais de visuels générés restent hors du site.
- Icônes Feather 4.29.2 intégrées localement sous licence MIT ; avis conservé dans `THIRD_PARTY_LICENSES.md`. Aucun chargement externe de police ou d’icône.
- Les favoris sont accessibles par le marque-page de l’en-tête et dans les filtres de liste. Le bouton Catalogue revient à l’accueil.

## Nouveautés 1.2

- **109 fiches** : 64 entrées de molécules/substances et 45 références commerciales documentées (15 ARCAL, 12 ALIGAL, 15 ALPHAGAZ, 3 LASAL).
- Navigation **Gammes** : ARCAL, ALIGAL, ALPHAGAZ, LASAL, PHARGALIS, ALNAT, FLAMAL, ALbee, BLUE et CRYSTAL. Six gammes sont répertoriées sans composition de produit documentée dans cette édition. Le catalogue commercial reste partiel.
- Composition et applications commerciales séparées des propriétés des molécules. Aucun calcul de propriété ou classification d’un mélange par transposition des constituants.
- Recherche globale, favoris et cache couvrent les 109 fiches.
- Liens FDS : document individuel quand le lien est vérifié ; sinon accès explicitement nommé au portail officiel Air Liquide France. La FDS du produit livré, de son état et de son pays reste à sélectionner.
- Références ONU et couleurs d’ogive publiées lorsqu’une source est identifiée ; absence ou portée limitée affichées. La couleur ne désigne pas une marque ; l’étiquette identifie le contenu. La teinte écran est indicative. Les références ne constituent pas une validation transport.
- Cadre rectangulaire interne de recherche supprimé ; focus arrondi sur le conteneur complet et maintien du repère clavier.

## Nouveautés 1.1

Accueil **Essentiels** avec 12 gaz usuels sélectionnés : oxygène, azote, argon, dioxyde de carbone, hydrogène, hélium, acétylène, air, méthane, propane, ammoniac et monoxyde de carbone. Cette sélection éditoriale n’est pas une statistique de consommation.

L’onglet **Tous** affiche ces 12 fiches en premier, puis les 52 autres entrées par ordre alphabétique français. La saisie d’une recherche parcourt toujours les 64 fiches, y compris depuis les favoris ; choisir un onglet efface la recherche. Interface plus aérée et thèmes harmonisés.

## Utilisation

- Recherche par nom, synonyme, formule avec/sans indices, numéro CAS et abréviations LOX/LIN/LAR.
- **64 fiches** : toutes les entrées de l’index public de l’encyclopédie Air Liquide consulté, dont air, gaz rares, hydrocarbures, gaz réactifs, réfrigérants, eau et autres liquides. Liste et limites dans [SOURCES.md](SOURCES.md).
- Propriétés physiques et conditions de référence, risques/précautions, applications, liens et date de consultation des sources.
- Favoris et thème clair/sombre/automatique conservés sur l’appareil.
- Installation iPhone via Safari et son menu de partage, puis ajout à l’écran d’accueil (libellé selon iOS).
- Attendre « Hors ligne disponible » après la première ouverture en ligne. L’ensemble des fiches est alors préchargé. Les pages sources externes restent en ligne uniquement.

## Données et limites

Les propriétés proviennent des pages publiques de l’Encyclopédie des gaz Air Liquide, consultées le **21 octobre 2026**. Chaque fiche cite ses sources ; les précautions générales sont complétées par le support de prévention Air Liquide et INRS ED 6369. Des fiches toxicologiques INRS complètent les substances concernées. Les applications manquantes sont recoupées avec des publications de fabricants, organismes publics ou chercheurs ; chaque ajout est référencé.

Les textes sont des synthèses originales et courtes ; les données chiffrées sont transcrites, sans interpolation. Aucune image, logo, FDS complète ou page source n’est redistribué. Les références à Air Liquide et aux noms commerciaux identifient les produits et les sources et ne signifient ni partenariat ni certification. Les marques appartiennent à leur titulaire.

- Masse volumique **du gaz à 15 °C et 1,013 bar absolu**, lorsqu’une valeur exploitable est publiée (44 fiches sur 64) ; masse molaire en g/mol. L’air est un mélange, les autres fiches identifient une substance ou une forme particulière.
- Transitions à 1,013 bar absolu quand cette référence est publiée. CO₂ et C₂H₂ : **sublimation** ; pas d’ébullition à cette pression. Les exceptions (air, SF₆, R-142b) sont expliquées. Une valeur inconnue ou incohérente n’est ni estimée ni remplacée par zéro.
- O₂/N₂/H₂ sont des formules ; O/N/H sont les symboles d’éléments. Ar/He/Ne désignent des gaz monoatomiques. CO n’est pas Co (cobalt).
- LOX/LIN/LAR désignent des formes liquides et sont uniquement des aides de recherche : elles ne changent pas les conditions des valeurs affichées.
- Couverture exhaustive de l’index public de 64 entrées consulté, pas de tous les gaz existants ni de tous les produits Air Liquide. Les propriétés physiques des grades commerciaux et mélanges sur mesure ne sont pas calculées. Les références commerciales documentées sont présentées séparément. L’air figure dans la partie encyclopédique ; les produits commerciaux et mélanges disposent de fiches distinctes. Les usages historiques des halons/CFC/HCFC ne constituent pas une autorisation d’emploi actuelle.
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

Pour une modification : vérifier recherche, favoris après rechargement, thèmes, navigation, dimensions mobiles et rechargement sans réseau. Incrémenter `VERSION` dans `sw.js` à chaque modification des ressources mises en cache, ainsi que la version du catalogue/package. Le nouveau cache est rempli intégralement avant activation. Une mise à jour attend l’action « Actualiser » si une ancienne édition est ouverte. Seuls les caches de cette application et de sa portée sont supprimés.

## GitHub Pages

Publier la branche `main`, dossier `/ (root)`, depuis Settings → Pages → Deploy from a branch. `.nojekyll` désactive le traitement Jekyll. Aucun workflow additionnel ou secret n’est nécessaire.

Site publié : [Guide des gaz](https://bidibulle50.github.io/guide-des-gaz/). Déploiement GitHub Pages réussi et livraison HTTPS des 14 fichiers applicatifs vérifiée le 21 octobre 2026 ; détails dans [VALIDATION.md](VALIDATION.md).

## Confidentialité et conservation

Aucun compte, outil de suivi, publicité ou service tiers n’est chargé par l’application. Les préférences restent dans le stockage local du navigateur ; GitHub Pages traite les connexions selon ses propres politiques. Les favoris peuvent être distincts entre Safari et la PWA installée. Un navigateur ou iOS peut supprimer le cache et les préférences ; le mode hors ligne et les favoris ne sont pas des sauvegardes garanties.
