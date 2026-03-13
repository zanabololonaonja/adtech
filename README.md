# AdTech Platform 

## Description de l'Architecture

Le projet est structuré en deux répertoires distincts (Frontend et Backend).

### Backend (Node.js/Express)
L'architecture suit le modèle **MVC (Modèle-Vue-Contrôleur)** pour assurer la modularité et la scalabilité :
- **Models** : Gestion de la persistance des données avec MongoDB. Utilisation d'un modèle centralisé pour les campagnes.
- **Controllers** : Contient la logique métier, notamment la simulation d'impressions, le calcul du budget en temps réel et la génération de statistiques.
- **Routes** : Mapping des points de terminaison de l'API RESTful.
- **Config & Utils** : Gestion de la base de données et système de **logs structurés (JSON)** pour une meilleure observabilité.

### Frontend (React)
Architecture basée sur des composants modernes (Hooks, Tailwind CSS) gérant trois vues clés :
- **Dashboard** : Visualisation des performances (Total campagnes, impressions, top annonceur).
- **Liste de campagnes** : Interface interactive pour gérer le statut et simuler des impressions.
- **Création** : Formulaire de paramétrage des campagnes avec ciblage géographique.

---

## Justification des Technologies

- **React** : Choisi pour sa réactivité (Virtual DOM) et sa gestion efficace de l'interface via des composants réutilisables.
- **Node.js & Express** : Idéal pour sa rapidité d'exécution et sa capacité à gérer de nombreuses requêtes asynchrones en temps réel grâce à sa boucle d'événements (Event Loop).
- **MongoDB** : Base de données NoSQL privilégiée pour la flexibilité des schémas publicitaires (champs variables par campagne) et sa performance en lecture/écriture à grande échelle.

---

## Réponses aux Questions de Performance & Scalabilité

### 1. Comment gérer 1 million de requêtes par minute ?
Pour atteindre ce niveau de performance (approx. 16.6k RPS), il faut :
- **Mise en cache (Redis)** : Ne pas interroger MongoDB à chaque impression. Stocker les campagnes actives dans Redis. Une impression vient décrémenter une valeur atomique dans le cache, puis synchroniser la DB de manière asynchrone (write-behind).
- **Load Balancing** : Utiliser un équilibreur de charge (Nginx, AWS ALB) pour répartir le trafic sur plusieurs instances du backend Node.js.
- **Optimisation MongoDB** : Création d'index composés (ex: `{ status: 1, targetCountries: 1, budget: 1 }`) pour des recherches en quelques millisecondes.
- **Architecture Event-Driven** : Utiliser un broker de messages (Kafka ou RabbitMQ) pour traiter les statistiques et les logs sans ralentir la réponse au client.

### 2. Comment gérer le capping d’impressions ?
Le capping (limiter le nombre de fois qu'un utilisateur voit une pub) s'implémente généralement avec :
- **Redis avec TTL** : On définit une clé `capping:{user_id}:{campaign_id}`. À chaque impression, on incrémente cette clé. Si elle atteint la limite (ex: 3), on ne sert plus cette campagne à cet utilisateur. Le TTL permet de réinitialiser le compteur (ex: toutes les 24h).
- **Cookies/LocalStorage** : Une solution côté client pour un capping "soft", mais moins fiable que Redis pour du multi-appareil.

### 3. Comment scaler ce système en production ?
- **Conteneurisation (Docker)** : Isoler l'application et ses dépendances.
- **Orchestration (Kubernetes)** : Utiliser le *Horizontal Pod Autoscaling* (HPA) pour ajouter automatiquement des instances lors des pics de trafic.
- **Base de données managée** : Utiliser MongoDB Atlas (Cluster sharded) pour supporter la montée en charge des données.
- **CDN (CloudFront/Cloudflare)** : Servir les fichiers statiques du frontend au plus proche des utilisateurs pour réduire la latence.
- **Monitoring & Alerting** : Outils comme Prometheus/Grafana pour surveiller la latence de l'API et le taux d'erreur en temps réel grâce aux logs structurés.

---

## Décisions Techniques Importantes
- **Isolation des mises à jour** : Utilisation du `campaignId` lors de la simulation pour garantir que seule la campagne sélectionnée est impactée.
- **Règle de Gestion** : Une impression coûte **10€**. Le système désactive automatiquement une campagne dès que son budget est insuffisant (< 10€).
- **Observabilité** : Mise en place de logs au format JSON pour faciliter l'intégration future avec une stack ELK (Elasticsearch, Logstash, Kibana).




## Instructions pour lancer le projet

### 1. Cloner le projet

git clone https://github.com/zanabololonaonja/adtech.git

cd adtech-project

### 2. Lancer le backend

cd backend

npm install

npm run dev

Le serveur démarre sur :
http://localhost:3001

### 3. Lancer le frontend

Ouvrir un nouveau terminal :

cd frontend

npm install

npm start

L'application démarre sur :
http://localhost:3000