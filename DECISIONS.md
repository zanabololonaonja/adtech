# Rapport de Décisions Techniques - AdTech


## Erreurs rencontrées & Solutions
- **Incohérence des types de données** : Au début, le budget et les impressions étaient stockés sous forme de chaînes de caractères (`string`), ce qui empêchait les calculs mathématiques (`$inc` ne fonctionnait pas). 
  - *Solution* : Création d'un middleware de migration automatique qui convertit les données au format `Number` ou `Date` lors de la connexion à la base.
- **Mises à jour erronées (Overlapping geographical targets)** : Lorsqu'on cliquait sur "Servir annonce", si deux campagnes ciblaient la France, la mise à jour pouvait affecter la mauvaise ligne.
  - *Solution* : Modification du contrat d'API pour exiger un `campaignId`, garantissant l'atomicité de l'opération sur la ligne cliquée.
- **Race conditions sur le budget** : Risque de descendre en dessous de zéro lors de requêtes simultanées.
  - *Solution* : Ajout d'une condition MongoDB `{ budget: { $gte: 10 } }` directement dans la requête de mise à jour.

## Arbitrages techniques
- **Migration intégrée vs Script indépendant** : Nous avons arbitré pour une migration fluide au démarrage pour éviter une étape de configuration manuelle à l'utilisateur, au risque d'une légère latence au premier lancement.
- **Logique côté Serveur vs Client** : Le calcul du statut ("active", "ended", "paused") est effectué au moment de la lecture par le serveur. Arbitrer pour un calcul dynamique garantit que le statut est toujours juste par rapport à l'heure `now`, sans avoir besoin de tâches planifiées (cron) pour fermer les campagnes périmées.
- **Utilisation d'un Logger Custom** : Au lieu d'utiliser une bibliothèque lourde comme Winston dès le départ, nous avons arbitré pour un logger minimaliste maison produisant du JSON. Cela garde les dépendances légères tout en étant prêt pour une exploitation professionnelle.
