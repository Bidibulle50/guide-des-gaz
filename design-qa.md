# Revue des fiches 1.6.0 — 21 octobre 2026

## État et périmètre

Maquette Oxygène validée par « Go », intégrée dans les 115 fiches. Référence visuelle : `outputs/Guide-des-gaz-maquette-oxygene-v2.png` dans le workspace. Implémentation : https://bidibulle50.github.io/guide-des-gaz/#gaz/oxygene, commit applicatif `06a4199f58683b37bdcbe3153c108fffa8ea8289`.

Le contrôle fonctionnel et visuel au format bureau est passé. La validation de fidélité mobile reste bloquée : le navigateur disponible n’expose pas de changement de viewport effectif et l’aperçu local avait été refusé par le contrôle de sécurité. Aucun autre navigateur ni contournement de cette restriction n’a été utilisé.

## Preuves visuelles et comparaison

- Source : 853 × 1844 pixels, cible mobile 390 × 844 CSS px, contenu d’application seul.
- Implémentation sombre et claire : 1233 × 1234 pixels, fenêtre 1233 × 1234 CSS px, densité 1. Fiche de 620 px de large sur ordinateur.
- Captures réelles du workspace : `outputs/Guide-des-gaz-1.6-oxygene.png`, `outputs/Guide-des-gaz-1.6-oxygene-clair.png`, `outputs/Guide-des-gaz-1.6-arcal-formats.png`.
- Comparaison réunissant la source et le rendu : `work/fiche-design-audit/1.6-comparison.png`. Images réduites proportionnellement à 390 et 780 px de large pour une lecture qualitative uniquement. Il ne s’agit pas d’une comparaison à viewport identique ni d’une preuve mobile.
- Les valeurs, identifiants, libellés et références ont également été lus dans le DOM et l’arbre accessible ; les captures bureau permettent de lire les régions de synthèse et d’applications sans recadrage supplémentaire.

## Surfaces vérifiées

- **Typographie** : police système locale, titres hiérarchisés, valeurs alignées et indices chimiques conservés. Les noms longs et les formules gardent leurs règles d’adaptation ; la lisibilité au viewport iPhone n’est pas encore vérifiée.
- **Espacements et structure** : identité, quatre onglets, synthèse, FDS, usages, sources repliables. Aucun débordement horizontal dans les vues bureau contrôlées. Les sections longues défilent ; aucune hauteur fixe copiée des exports.
- **Couleurs** : palette sombre #111217 / #1c1d24, bleu d’action, badge de risque discret ; thème clair inspecté, thème automatique initial rétabli.
- **Assets** : formules et données en texte, icônes Feather sous licence existante. Aucun logo, photographie ni illustration de bouteille ajouté. La pastille d’ogive indique une donnée de couleur ; elle ne sert pas à identifier seule un gaz.
- **Copie** : trois applications O₂ reformulées depuis l’encyclopédie publique ; états comprimé/liquide associés chacun à leur ONU. Les applications ne portent pas de chevrons trompeurs : leur texte est intégralement présenté. FDS portail, document individuel et lien fabricant restent distingués.

## Interactions vérifiées

Dans le navigateur HTTPS : ancienne édition → proposition « Actualiser » → nouvelle fiche ; quatre rubriques ; sécurité et propriétés techniques ; numéros ONU ; touche Home depuis Transport → Essentiel ; ajout d’un favori dans Technique sans réinitialiser l’onglet, persistance après rechargement puis retrait du favori de test ; ouverture des quatre sources O₂ dans le bloc déplié ; recherche `I2531M20E2A001` → une fiche Chrome ; accès Formats → Technique et focus `product-supply`, six associations de conditionnement exactes ; thème clair puis retour au thème automatique ; édition 1.6.0 dans Repères. Les liens FDS ont été contrôlés comme destinations, sans revérification de chaque document externe.

Aucun écran vide, overlay d’erreur, erreur ou avertissement console observé. L’application indique « Hors ligne disponible » après actualisation. Le cache est confirmé, mais aucune coupure réseau réelle n’a été effectuée.

## Historique des corrections et écarts

- Revue avant publication : code fabricant ARCAL rétabli dans l’identité ; focus placé sur la cible après ouverture du panneau contenant les formats. Assertions ajoutées, puis comportement de Chrome confirmé dans le navigateur.
- Aucun défaut visuel certain P0/P1/P2 au format bureau inspecté.
- Blocage restant : absence de capture à 390 × 844 et 320 px ; la comparaison stricte de la maquette et du rendu mobile ne peut pas être déclarée passée. Safari iOS, clavier de recherche, zoom de texte, installation et réouverture sans réseau restent à vérifier sur appareil.
- P3 : le texte historique de la note LOX mentionne « ci-dessous » alors que les propriétés apparaissent avant cette note dans Technique ; il s’agit d’une précision éditoriale à reprendre lors d’une prochaine révision.

## Vérification automatisée et livraison

34 tests réussis, aucun échec. Couverture des 64 substances, 51 produits, onglets et relations ARIA, clavier, focus de raccourci, 21 ARCAL/76 conditionnements, recherche, favoris, Soudage, manifest et cache simulé. Syntaxe JavaScript vérifiée. Les 15 fichiers applicatifs et l’accueil servis en HTTPS sont identiques aux octets locaux. Workflow Pages `39679203101` terminé avec succès.

final result: blocked
