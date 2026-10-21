# Vérification — 21 octobre 2026

## Contrôles réalisés

- 11 tests Node réussis : recherche par accents, indices, CAS et abréviations ; favoris ; couverture de 64 fiches et champs de provenance ; cas scientifiques sensibles ; échappement HTML ; génération du contenu des 64 fiches.
- Cache testé dans un environnement isolé : préchargement, lecture sans réseau simulée, installation incomplète rejetée, détection de ressources manquantes, suppression limitée aux anciennes versions de la même application et de sa portée, sources externes exclues, activation de mise à jour sur demande.
- Manifest et fichiers PNG vérifiés, dont dimensions 192 et 512 pixels. Chemins relatifs adaptés à `/guide-des-gaz/`.
- Données physiques transcrites des références publiques avec les conditions associées. Les valeurs ambiguës et les données absentes sont signalées ; voir `SOURCES.md`.

## Publication vérifiée

- Dépôt public : https://github.com/Bidibulle50/guide-des-gaz
- Site : https://bidibulle50.github.io/guide-des-gaz/
- Commit applicatif : `57ee16a2473ef7ac5acd3c0dea4182b24e683ef7`.
- GitHub Pages : état `built`, branche `main`, racine `/`, HTTPS imposé.
- Les 20 fichiers déposés ont été relus par leurs empreintes Git et comparés à la copie locale.
- Accueil et 12 fichiers applicatifs servis en HTTPS : réponses 200, types de contenu appropriés et octets identiques à la copie testée. Certificat TLS vérifié avec le magasin système macOS ; aucun contrôle TLS désactivé.
- Preuve détaillée : [validation/deployment-2026-10-21.json](validation/deployment-2026-10-21.json). Ces contrôles vérifient la livraison statique, pas l’exécution dans un navigateur.

## Vérifications non réalisées

Le contrôle de sécurité de l’outil navigateur a refusé l’ouverture locale, y compris après l’autorisation de l’utilisateur. Ce refus n’a pas été contourné.

Par conséquent, les tests isolés ne constituent **pas** une preuve de rendu visuel, d’accessibilité complète, de persistance réelle, de service worker en navigateur, de fonctionnement hors ligne réel, ni d’installation sur iPhone. Le prototype graphique ne valide pas le rendu de l’application.

## Recette sur un appareil

1. Ouvrir le site dans Safari ; vérifier noms longs, formules et thèmes.
2. Chercher O2, CO₂, Co, D2, C4H8 et R-142b ; vérifier la distinction des substances.
3. Ajouter deux favoris, recharger et vérifier leur présence ; retirer un favori.
4. Attendre « Hors ligne disponible », installer depuis le menu de partage, couper les réseaux et rouvrir l’application.
5. Ouvrir plusieurs fiches, dont une non consultée avant la coupure, puis rétablir les réseaux. Les liens sources exigent une connexion.

Les données locales peuvent être effacées par iOS ou le navigateur. Les informations de sécurité sont indicatives : elles ne remplacent pas la FDS du produit et les procédures du site.
