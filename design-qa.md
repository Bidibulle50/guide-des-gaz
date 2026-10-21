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
