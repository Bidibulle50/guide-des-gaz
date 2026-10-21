# Vérification de l’édition 1.3.1 — en cours

- 16 tests Node réussis : nouveau parcours d’accueil et recherche ARCAL, 12 essentiels, 109 fiches, favoris, gabarits et cache isolé.
- Syntaxe JavaScript vérifiée. Les nouvelles ressources locales (`ui-icons.js`, `icons/brand.svg`) figurent dans le préchargement hors ligne.
- Source visuelle retenue : maquette 3, Recherche immédiate. Les photos génériques ont été écartées après clarification de l’usage commercial.
- Recette sur site public et rapport visuel en cours ; la preuve ci-dessous concerne l’édition précédente.

---

# Vérification — édition 1.2.0 — 21 octobre 2026

## Résultat

- 15 tests Node réussis : recherche, favoris, intégrité des 64 fiches encyclopédiques, gabarits des 45 produits commerciaux et navigation des gammes.
- Cache testé dans un environnement isolé : préchargement, lecture sans réseau simulée, installation incomplète refusée, caches étrangers préservés, sources externes exclues, activation sur demande. Ce test ne constitue pas une coupure réseau dans Safari.
- Commit applicatif : `1c8930af3614d88536d8b7861fd2e26444600297`.
- GitHub Pages : `built`, branche `main`, racine `/`, site public https://bidibulle50.github.io/guide-des-gaz/.
- Les 18 fichiers texte de l’arbre préparé ont été comparés par empreinte Git avant activation de la branche ; les 3 PNG sont conservés depuis la version précédente.
- Accueil et 12 ressources applicatives servis en HTTPS : réponses 200 et octets identiques à la copie testée. TLS vérifié, aucun contrôle de certificat désactivé.
- Rapport : [validation/deployment-2026-10-21.json](validation/deployment-2026-10-21.json).

## Parcours vérifiés sur le site public

- Proposition « Actualiser », activation de l’édition de 109 fiches et affichage « Hors ligne disponible ».
- Essentiels : 12 fiches prioritaires. Recherche ARCAL : 15 résultats ; ALIGAL : 12 résultats, depuis la sélection Essentiels.
- Navigation Gammes : 10 gammes ; ARCAL : 15 références et ouverture d’ARCAL Prime.
- Fiche Prime : composition, application, lien FDS individuel, références ONU avec états, couleur d’ogive RAL et lien fabricant, constituant séparé.
- Ajout du favori Prime, rechargement : favori conservé ; retrait du favori de test effectué.
- Recherche en focus : contour interne `none`, conteneur arrondi à 15 pixels avec repère de focus. Capture visuelle contrôlée.
- Thèmes clair et sombre contrôlés visuellement ; préférence automatique restaurée. Aucune erreur ou alerte dans la console applicative après ces interactions.

## Données et limites

- Catalogue commercial partiel : 45 références, réparties entre ARCAL, ALIGAL, ALPHAGAZ et LASAL. Six autres gammes sont répertoriées sans composition documentée dans cette édition. Ce n’est pas l’ensemble des produits, variantes ou conditionnements Air Liquide.
- Composition, applications et constituants commerciaux séparés. Aucune propriété de mélange calculée ou classification déduite des constituants.
- FDS : 4 références ARCAL avec document individuel vérifié (2 URL distinctes). Pour les autres, accès au portail fournisseur explicitement nommé. Certains liens externes peuvent demander une sélection ou refuser un téléchargement ; ils ne sont pas disponibles hors ligne.
- Numéros ONU : références de sources publiques ; état et conditionnement doivent être confirmés dans la rubrique 14 de la FDS du produit livré. Aucune validation d’un transport réel.
- Couleurs : ogives argon/ARCAL Prime et oxygène documentées ; autres couleurs laissées non documentées. La teinte écran est indicative et ne remplace pas l’étiquette.
- La date de consultation n’est pas la date de révision d’une FDS. Pas de surveillance ou synchronisation automatique des sites sources.

## Vérifications non réalisées

L’aperçu local est refusé par le contrôle de sécurité du navigateur ; les essais ont porté sur le site public, sans contournement. Le viewport réellement fourni mesure 1218 pixels de largeur ; la demande de dimensions mobiles n’a pas été appliquée par l’outil. Aucun essai de ce navigateur n’est présenté comme une recette iPhone.

Restent à vérifier sur un appareil : Safari iOS, installation à l’écran d’accueil, rendu avec clavier ouvert, accessibilité complète et rechargement après coupure réseau réelle. L’état de cache confirmé ne remplace pas ce dernier test. iOS peut effacer le stockage local et les favoris.

## Recette iPhone

1. Ouvrir le site dans Safari ; chercher O2, CO₂, Co, ARCAL et ALIGAL ; vérifier les distinctions.
2. Ajouter deux favoris, recharger et vérifier leur conservation.
3. Attendre « Hors ligne disponible », installer sur l’écran d’accueil et couper les réseaux.
4. Rouvrir plusieurs fiches, dont une encore non consultée, puis rétablir le réseau. Les FDS et sources externes nécessitent Internet.
5. À la prochaine édition, appliquer « Actualiser » et vérifier la conservation des favoris.
