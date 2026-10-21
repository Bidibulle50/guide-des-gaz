# Vérification — version 1.1.0 — 21 octobre 2026

## Contrôles réalisés

- 13 tests Node réussis : recherche par accents, indices, CAS et abréviations ; favoris ; couverture de 64 fiches et champs de provenance ; cas scientifiques sensibles ; échappement HTML ; génération du contenu des 64 fiches.
- Cache testé dans un environnement isolé : préchargement, lecture sans réseau simulée, installation incomplète rejetée, détection de ressources manquantes, suppression limitée aux anciennes versions de la même application et de sa portée, sources externes exclues, activation de mise à jour sur demande.
- Manifest et fichiers PNG vérifiés, dont dimensions 192 et 512 pixels. Chemins relatifs adaptés à `/guide-des-gaz/`.
- Données physiques transcrites des références publiques avec les conditions associées. Les valeurs ambiguës et les données absentes sont signalées ; voir `SOURCES.md`.

## Publication vérifiée

- Dépôt public : https://github.com/Bidibulle50/guide-des-gaz
- Site : https://bidibulle50.github.io/guide-des-gaz/
- Commit applicatif : `0a9b598cede870964abe44c766f7065818809305`.
- GitHub Pages : état `built`, branche `main`, racine `/`, HTTPS imposé.
- Les 21 fichiers déposés ont été relus par leurs empreintes Git et comparés à la copie locale.
- Accueil et 12 fichiers applicatifs servis en HTTPS : réponses 200, types de contenu appropriés et octets identiques à la copie testée. Certificat TLS vérifié avec le magasin système macOS ; aucun contrôle TLS désactivé.
- Preuve détaillée : [validation/deployment-2026-10-21.json](validation/deployment-2026-10-21.json). Ces contrôles vérifient la livraison statique, pas l’exécution dans un navigateur.

## Contrôles du site public dans le navigateur intégré

- Accueil avec 12 essentiels, commençant par oxygène, azote, argon, CO₂, hydrogène et hélium.
- Onglet Tous : 12 essentiels suivis de 52 autres entrées ; recherche « krypton » depuis Essentiels : 1 résultat et portée de 64 fiches affichée.
- Ouverture de la fiche Oxygène, ajout d’un favori, rechargement et présence confirmée dans Favoris ; retrait et état vide vérifiés. Le favori créé pour le test a été retiré.
- Thèmes clair et sombre contrôlés visuellement ; aucune erreur ou alerte applicative dans la console après ces interactions.
- Mise à jour du service worker : proposition « Actualiser », activation de la version 1.1, affichage de la nouvelle interface et état « Hors ligne disponible ».
- Rendu vérifié sur le viewport réellement fourni par le navigateur : largeur 1218 pixels. Hiérarchie, textes, liste groupée, tuiles de formule, espacements et navigation comparés à la maquette. Le libellé « Asphyxiant » du CO₂ est conservé pour sa pertinence de prévention, plutôt que le « Non inflammable » de la maquette.

## Vérifications non réalisées et limites des outils

L’accès à l’aperçu local est toujours refusé par le contrôle de sécurité. La validation ci-dessus porte sur le site public publié, sans contourner ce refus.

L’outil a accepté une demande de viewport 390 × 844 mais n’a pas appliqué ces dimensions : la largeur réelle est restée 1218 pixels dans l’onglet existant, et 1265 pixels dans un nouvel onglet. Ce test n’est donc **pas** présenté comme une validation mobile. La surcharge de viewport a été réinitialisée.

Restent à vérifier : rendu sur un iPhone physique et dans Safari iOS, installation sur l’écran d’accueil, rechargement hors ligne réel et accessibilité complète. L’état de cache confirmé dans le navigateur ne remplace pas une coupure réseau effective.

## Recette sur un appareil

1. Ouvrir le site dans Safari ; vérifier noms longs, formules et thèmes.
2. Chercher O2, CO₂, Co, D2, C4H8 et R-142b ; vérifier la distinction des substances.
3. Ajouter deux favoris, recharger et vérifier leur présence ; retirer un favori.
4. Attendre « Hors ligne disponible », installer depuis le menu de partage, couper les réseaux et rouvrir l’application.
5. Ouvrir plusieurs fiches, dont une non consultée avant la coupure, puis rétablir les réseaux. Les liens sources exigent une connexion.

Les données locales peuvent être effacées par iOS ou le navigateur. Les informations de sécurité sont indicatives : elles ne remplacent pas la FDS du produit et les procédures du site.
