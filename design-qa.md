# Contrôle visuel Soudage 2.0.5

Date : 22 octobre 2026. Périmètre : onglet Soudage uniquement.

## Référence et état comparé

- Référence sélectionnée : `../revue-soudage/concept-1.png` (853 × 1844 pixels). L’utilisateur a accepté la recommandation de partir de cette maquette, avec en-tête compact, résultat explicite et accompagnement commercial approfondi.
- Implémentation : `http://127.0.0.1:8878/#soudage`, acier carbone → MAG → productivité → fil plein confirmé.
- Capture finale : `../revue-soudage/v205-resultat-final-390.jpg` (375 × 812 pixels, capture redimensionnée par le navigateur intégré ; viewport CSS 390 × 844).
- Densité normalisée pour l’appréciation : référence ≈ 2,187 pixels par pixel CSS, capture ≈ 0,962. Même ratio de vue, même état et même thème sombre. La barre de défilement du navigateur de bureau n’est pas un élément du design mobile.
- Les deux images ont été ouvertes ensemble dans le même appel de comparaison. L’ensemble et les textes du résultat, de la confirmation et de l’argumentaire sont lisibles sans recadrage supplémentaire.

## Historique de comparaison et corrections

1. Première implémentation (`v205-speed-390.jpg`) : ligne « Nouvelle demande » séparée et placement de la source repoussaient les actions commerciales trop bas. Écart P2 d’accès rapide. Correction : commande dans l’en-tête, texte du pitch à 16 px, actions immédiatement après le pitch. Capture après correction : `v205-speed-final-390.jpg` puis `v205-resultat-final-390.jpg`.
2. Vue 320 px (`v205-accueil-320.jpg`) : ponctuation isolée sur une ligne dans la question. Écart P2 de lisibilité. Question raccourcie en « Quel métal souder ? ». Capture après correction : `v205-accueil-final-320.jpg`.
3. Recherche filtrée : intitulé « Les 4 Référents » conservé pour un seul résultat. Correction : « Référents » quand la recherche est active.
4. Condition inconnue : suppression du bouton qui réouvrait le même panneau technique. Les actions Oui/Non et les informations à recueillir restent disponibles.

## Surfaces vérifiées

- Typographie : police locale existante conservée, nom du gaz dominant (34 px / 30 px sous 360 px), texte courant de l’onglet 14–17 px, annotations secondaires 12–13 px. Aucun texte produit tronqué.
- Espacement : en-tête compact, contexte modifiable avant le résultat, justification avant les conseils. À 390 × 844, nom du gaz à y ≈ 220 CSS px et première action commerciale visible. À 320 × 740, les deux entrées restent accessibles avant la navigation fixe.
- Couleurs : variables existantes, gris sombres et bleu d’action ; rendu clair également vérifié. Pas de couleur présentée comme une validation technique.
- Images et icônes : logo, police et pictogrammes de navigation originaux conservés, aucune image générée injectée dans l’interface. Les différences avec les pictogrammes approximatifs de la maquette respectent la contrainte utilisateur.
- Contenu : usage publié distinct du pitch éditorial ; condition explicite avant confirmation ; plusieurs gaz présentés au même niveau ; aucune recommandation inventée lorsque l’objectif n’est pas documenté. Source et limites accessibles.

## Interactions et limites

Parcours guidé, accès direct/recherche, inconnus, refus et réexamen, confirmations et retrait, résultat multiple Duplex, panneaux commercial/technique/préparation, ouverture au clavier de la source, fiche et retour vérifiés. Vues sombre 320/390 et claire bureau 1280 × 900. Pas de débordement horizontal sur les états contrôlés ; commandes visibles mesurées à au moins 44 px. Aucun écran vide ni erreur applicative/console constaté.

Le serveur local a été arrêté et son inaccessibilité confirmée avant un rechargement puis un nouveau parcours jusqu’à l’objection prix : succès depuis le cache. Serveur relancé après le contrôle.

Écarts intentionnels avec la maquette : titre plus compact ; justification métier ajoutée ; « Préparer la suite » ouvre des actions adaptées au lieu d’imposer un essai ; détails supplémentaires accessibles par ouverture ou défilement naturel. Ces différences répondent aux améliorations approuvées.

Aucun P0/P1/P2 ouvert. Recette physique iPhone/Safari et expérience en clientèle restent à effectuer ; elles ne sont pas remplacées par le navigateur de bureau.

final result: passed
