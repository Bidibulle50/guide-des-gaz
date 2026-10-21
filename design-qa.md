# Revue des icônes de navigation — édition 1.7.4 — 22 octobre 2026

## Cible et périmètre

Référence exacte choisie : https://chatgpt.com/s/m_6ad93b9ca448819188ea5cb78e22af07 . Quatre pictogrammes : molécule, torche, cartes, information. Le PNG source2172 ×724 est utilisé intact ; SHA-256 identique entre original et fichier applicatif. Les essais de détourage généré ne sont pas livrés. Aucun tracé SVG ou symbole de remplacement.

Seule la navigation adopte ces dessins. Logo principal, favicons, contenu métier, icônes génériques et structure des écrans restent inchangés. Le texte demeure éditable et accessible ; l’image entière n’est pas utilisée comme une barre cliquable unique.

## Preuves et comparaison

- Composant préalablement contrôlé dans `validation/navigation.html` : quatre états actifs répartis sur thème clair/sombre et largeurs320/390 ; capture `work/navigation-icons/preview-light-dark.png` dans le workspace.
- Application réelle publiée : 390 ×844 sombre Repères ; 320 ×844 sombre Soudage ; 320 ×844 clair Gammes ; 390 ×844 automatique Catalogue. Quatre rubriques ouvertes par leurs vrais liens, édition1.7.4 et cache prêt confirmés.
- Captures finales recadrées sur la barre : `outputs/Guide-des-gaz-1.7.4-navigation.png`, `navigation-sombre.png`, `navigation-soudage.png`, `navigation-claire.png` avec même préfixe dans le workspace. Originaux complets sous `work/navigation-icons/app-*-full.png`.
- Source/rendu réunis : `reference-comparison.png` et `reference-comparison-zoom.png` dans `work/navigation-icons/`. Source recadrée sur la zone de barre puis normalisée à390 ×84, rendu sombre Repères à390 ×84 ; agrandissement×4 réservé à l’examen des pictogrammes. L’alignement des colonnes et le texte gardent les mesures de l’application : la demande porte sur les icônes. Les positions exactes des pixels de la barre de référence ne sont pas imposées à la mise en page.
- Document intégré à vrai viewport CSS, densité1, navigateur sur ordinateur. Ces preuves ne sont pas des captures de Safari iOS ou d’une PWA native installée.

## Surfaces obligatoires

- **Polices/copie** : Inter et libellés Catalogue/Soudage/Gammes/Repères conservés, textes HTML réels. L’image est décorative avec aria-hidden ; aucun nom accessible parasite.
- **Espacement** : boîtes40 ×28, pictogrammes proportionnels avec hauteur optique26px, torche plus large comme la source. Coordonnées mesurées depuis les pixels de l’original ; pas de déformation ni de rognage visible. Liens de49px minimum,51px mesurés sur bureau ; hauteur de navigation et marges conservées.
- **Couleurs** : onglet actif bleu ; autres gris. Filtres et modes de fusion d’affichage évalués dans les deux thèmes. Pas de rectangle de fond parasite dans les régions inspectées ; contrastes de l’interface préservés. Les pixels colorés de l’original ne figent pas l’état actif sur Repères.
- **Assets** : PNG original local précaché, cadrage CSS ; aucun détourage destructif livré. Les contours de la molécule, du coude de torche, des trois cartes et du i encerclé correspondent à la référence. Le fichier source et ses textes non affichés restent dans l’asset, sans requête vers ChatGPT lors de l’usage.
- **Fonctionnement** : quatre liens et un seul aria-current par état. Recherche, favoris et données inchangés. Thème automatique rétabli après contrôle.

Aucun P0/P1/P2 restant détecté pour cette intégration. P3 : le lissage d’une source bitmap à26px peut varier selon le navigateur ; ces pictogrammes ne sont pas présentés comme des fichiers vectoriels. Aucun autre redesign engagé.

## Validation et limites

38 tests réussis, aucun échec ; nouveau contrôle des quatre liens/décorations/états actifs et conservation des glyphes génériques. Pages réussi pour `562bb74cebb192e27cc5125b2d9ff63a59f87ea7` ;23 fichiers HTTPS et accueil identiques aux octets locaux. Aucune erreur ni alerte provenant de la PWA relevée dans les journaux de l’onglet ; messages historiques ChatGPT exclus par leur origine.

Recette sur Safari iPhone, défilement tactile et réouverture après coupure réseau réelle non effectués. Compatibilité observée du rendu web uniquement ; les filtres d’affichage doivent encore être constatés sur l’appareil de l’utilisateur.

final result: passed

---

## Historique du logo 1.7.3

# Revue du logo principal — édition 1.7.3 — 22 octobre 2026

## Cible et preuves

Visuel exact choisi par l’utilisateur : https://chatgpt.com/s/m_6ad9387a01b08191b2f140eb07aaf56f . Original1254 ×1254 conservé ; cinq PNG redimensionnés sans recadrage. Comparaison source/icône dans `work/logo-principal/comparison-icon.png`, source et rendu réunis à192 ×192. Image et cadrage identiques, aucune recréation.

Rendu réel du site : `outputs/Guide-des-gaz-1.7.3-accueil-logo.png`, `Guide-des-gaz-1.7.3-accueil-bureau.png` et captures originales sous `work/logo-principal/` dans le workspace. Viewports intégrés390 ×940 et320 ×844 ; bureau également contrôlé. Gros plans des fichiers de capture vérifiés pour confirmer la présence du logo aux deux largeurs. Pas de capture d’une installation native.

## Surfaces vérifiées

- Typographie et textes : aucun changement ; logo décoratif à côté du nom lisible.
- Espacement : boîte48 ×48, proportions carrées et object-fit:contain, angle12px uniquement pour l’affichage dans l’en-tête. Réserve de défilement de l’accueil conservée ; la page reste défilable selon sa hauteur.
- Couleurs : platine, cobalt et fond du visuel original conservés ; palette de l’application inchangée.
- Assets : véritable image fournie, redimensionnements128/32/180/192/512, sans dessin, recadrage ni image distante dans l’application. Versions locales mises en cache.
- Contenu : seule l’identité graphique change. Aucun logo de fournisseur ajouté ; l’illustration n’est pas une formule scientifique.

Aucun P0/P1/P2 détecté pour cette intégration. Tests38/38 et livraison HTTPS22 fichiers contrôlés ; logo bureau chargé à sa taille attendue. L’icône d’installation et le changement d’une icône déjà installée doivent être constatés sur l’appareil. Le résultat ci-dessous porte sur les fichiers et le rendu web inspectés.

final result: passed

---

## Historique de la refonte 1.7.2

# Revue visuelle — édition 1.7.2 — 22 octobre 2026

## Résultat et corrections

Le contrôle des écrans et composants capturés est passé. La recette sur véritable iPhone demeure distincte et non effectuée. Aucun P0/P1/P2 applicatif restant relevé dans les régions inspectées.

1. **P2 corrigé — icône Soudage** : clé mécanique hors sujet, puis masque trop générique. Remplacement par la véritable torche avec arc/étincelles Noun Project #147374. Dessin d’origine conservé, domaine public vérifié ; 30 × 25 px, couleur de navigation, cache local. Preuves finales : `outputs/Guide-des-gaz-1.7.2-soudage.png` et `outputs/Guide-des-gaz-1.7.2-navigation-soudage.png` dans le workspace. Le DOM public confirme le masque local et son état bleu actif.
2. **P2 corrigé — accueil** : cartes et interlignes hérités trop grands, édition recouverte par la navigation au cadre 390 × 940. Mesures rapprochées du HTML fourni : cartes 104 px, gammes/CTA 64 px, écarts 24/14 px ; réserve de défilement pour le pied de page. Nouvelle capture comparée : `work/fiche-design-audit/home172-comparison.png` ; édition visible au-dessus de la navigation.
3. **P2 corrigé — valeurs techniques** : suppression du nowrap pour permettre le retour du point critique ; capture réelle 320 px avec température et pression lisibles sur deux lignes, sans rognage.

## Références et comparaison

Références sélectionnées : HTML `Main.dc.html`, `Catalogue.dc.html`, `Fiche-Oxygene.dc.html` et photos fournies par l’utilisateur. L’ancienne maquette générée O₂ n’est plus la cible.

- Accueil : photo 531 × 1280 ramenée à 390 × 940 ; rendu à viewport CSS réel 390 × 940, contenu seul recadré depuis le navigateur public. Source et rendu réunis dans `home172-comparison.png`.
- Catalogue : photo 499 × 1280 ramenée à 390 × 1000 ; rendu CSS 390 × 1000. La référence présente la portion D/E/H/I ; le rendu final commence volontairement par les essentiels. `catalogue172-comparison.png` sert à comparer les composants et leur géométrie, pas l’alignement de lignes différentes.
- Fiche : quatre images 237 × 1281 ramenées à 390 × 2100. Rendus 1.7.1 réunis avec chaque source dans `essential171-comparison.png`, `safety171-comparison.png`, `transport171-comparison.png`, `technical171-comparison.png` ; fiche inchangée en 1.7.2 sauf navigation. Captures de régions haute/basse également conservées. Les assemblages longs ont des raccords de défilement et ne constituent pas une comparaison pixel à pixel ; les fichiers originaux de chaque région ont été inspectés séparément pour les détails. Contrôle complémentaire réel 320 × 2100 en 1.7.2, `technical172-320-top.png` et `technical172-320-bottom.png`.
- Fenêtre parent sur ordinateur ; densité 1. Les fichiers natifs peuvent exclure les barres de défilement du parent. Seul le rectangle du document intégré est recadré, selon sa géométrie mesurée ; aucun écran iPhone ni clavier recréé. Les régions hors capture ne sont pas réputées vérifiées.

## Surfaces obligatoires

- **Polices/typographie** : Inter 4.1 variable locale, gras et tailles tirés des HTML, titres hiérarchisés, formules avec indices, petits textes lisibles dans les vues capturées. Différences mineures de lissage entre JPEG source et navigateur ; aucun texte en image.
- **Espacement/rythme** : marges 20 px, fond et cartes conservés, accès rapides en deux colonnes, recherche 52 px, quatre rubriques accessibles de 44 px. Hauteur de page souple en production ; les exports fixes ne sont pas copiés comme contrainte de contenu.
- **Couleurs** : fond #111217, surfaces #1c1d24, bleu #8fb0ff, risques et états préservés ; couleur active de la torche confirmée dans le DOM.
- **Images/icônes** : vrais fichiers SGH03/04 INRS ; illustrations ADR extraites du HTML fourni ; torche existante sous statut public vérifié. Pas de bouteille, logo fabricant ou dessin improvisé. Les fichiers SGH gardent leur dessin et leurs couleurs.
- **Copie/contenu** : 115 fiches au lieu du nombre ancien de la maquette ; guide indépendant, quatre entrées de navigation avec Soudage. Conditions physiques et sources ajoutées. Les applications détaillées restent développées conformément à la demande métier.

## Écarts intentionnels et limites

Les photos ne valent pas source technique : expansion O₂ 843,57 L avec conditions, codes ADR 1O/3O avec lettre O, portée Benelux des FDS explicite, pas de pression générique inventée. La bande verte supposée sûre et le seuil bas 19,5 % non confirmé ne sont pas repris comme information vérifiée. Les textes documentaires supplémentaires peuvent allonger les rubriques.

P3 : variantes de lissage des textes ; poids visuel de la torche pleine différent des icônes filaires. Aucun nouveau redesign proposé. L’utilisateur conserve la décision esthétique finale.

## Fonctionnement et vérification

38 tests réussis ; 22 fichiers HTTPS et accueil identiques aux octets locaux. Pages réussi pour `d4d3c829a6ec9ce11849f014a6d0ff09a99fee74`. Filtres de risques et recherche globale contrôlés dans le navigateur, mise à jour effective, navigation et icône active vérifiées. Console finale : aucune erreur ni alerte.

La réouverture hors ligne réelle, Safari iOS, le clavier, le zoom de texte et l’installation restent à tester. Le cache simulé et l’indication « Hors ligne disponible » ne prouvent pas ces essais. Le helper intégré ne valide pas à lui seul le défilement tactile d’un appareil.

final result: passed
