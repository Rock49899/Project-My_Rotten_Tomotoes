## Tomato Reviews — README

Tomato Reviews est une application web de critiques de films développée avec Next.js. Elle combine une interface publique pour consulter des films et lire/laisser des critiques, et un espace d'administration permettant d'importer des films depuis l'API du site The Movie DB, gérer les films et les utilisateurs.

### Objectifs principaux

- Lister et consulter des films (fiche détaillée, image, durée formatée en heures/minutes).
- Permettre aux utilisateurs inscrits de noter et commenter des films.
- Gérer une liste de favoris par utilisateur et l'afficher sur leur profil.
- Fournir un backoffice admin pour importer, éditer et supprimer des films et gérer les utilisateurs.

### Technologies et composants clés

- Framework : Next.js
- Base de données : MongoDB via Prisma ORM 
- Authentification : NextAuth (providers : Credentials et Google).
- Styles : Tailwind CSS.

### Arborescence 

Voici les dossiers et fichiers les plus pertinents pour se repérer rapidement (chemins relatifs à la racine) :

- `app/` : pages et composants liés au routeur `app`
	- `app/page.js` : page d'accueil
	- `app/movies/` : listing et pages de détail (`[id]/page.jsx`)
	- `app/profile/page.js` : profil utilisateur (affiche favoris, formulaire)
	- `app/api/` : routes API
		- `app/api/auth/[...nextauth]/route.js` : configuration NextAuth
		- `app/api/movies/route.js` : endpoints films
		- `app/api/users/[id]/route.js` : endpoints utilisateur par id 
		- `app/api/users/me/route.js` : endpoints pour l'utilisateur courant 
		- `app/api/favorites/route.js` : GET/POST/DELETE favoris
	- `app/dashboard/admin/` : pages d'administration (movies-list, users-list, tmdb-search)

- `components/` : composants réutilisables
	- `components/FavoriteButton.jsx` 
	- `components/movies/movieCard.jsx`, `movieActions.jsx` etc.

- `lib/` : helpers et utilitaires
	- `lib/prisma.js` : client Prisma
	- `lib/authMiddleware.js` : helpers pour vérifier session/admin/ownership côté serveur
	- `lib/tmdb.js` : helper pour construire les URLs d'images TMDB

- `prisma/schema.prisma` : modèle de données Prisma (MongoDB)

### Installation locale

Prérequis : Node.js (16+ recommandé), npm, une instance MongoDB et la clé TMDB.

1) Installer les dépendances :

```bash
npm install
```

2) Générer le client Prisma et appliquer le schéma :

```bash
npx prisma generate
npx prisma db push
```

3) Créer un fichier `.env` à la racine contenant au minimum :

```
DATABASE_URL:mongodb-connection-string
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="une-chaine-secrete"
TMDB_API_KEY="ta_cle_tmdb"
```

4) Lancer le serveur en développement :

```bash
npm run dev
```

### Configuration Prisma / données

- Le schéma `prisma/schema.prisma` définit les modèles `User`, `Movie`, `Review`.
- `User.favorites` est un tableau de `String` (ObjectId stockés comme string). Quand vous manipulez cet attribut via Prisma il faut veiller à utiliser les opérateurs Mongo compatibles (`has`, `push`, etc.).

### Authentification

- Providers configurés : `Credentials` (email/password) et `Google`.
- La stratégie de session est `jwt` — le contenu du JWT est contrôlé par les callbacks `jwt` et `session` dans `app/api/auth/[...nextauth]/route.js`.
- Remarque importante : pour les comptes Google, le callback `signIn` crée l'utilisateur en base s'il n'existe pas, mais le token initial peut ne pas contenir immédiatement l'`id`/`role` exact côté Prisma. Si vous changez le rôle en base, la session JWT du client peut rester inchangée jusqu'à ce que le token soit régénéré.

### Routes API exposées 

- `GET /api/movies` — liste publique, accepte des filtres de recherche et `meta=true` pour obtenir les listes distinctes (genres, producteurs, années).
- `GET /api/movies/:id` — détail d'un film.
- `POST|PUT|DELETE /api/movies` — opérations admin pour créer, modifier et supprimer.

- `GET /api/users` — liste admin des utilisateurs.
- `GET /api/users/:id` — récupérer un utilisateur (ownership/admin check).
- `GET /api/users/me` — récupérer l'utilisateur courant (utilisé par le profil pour éviter les erreurs d'ObjectId).
- `PUT /api/users/:id` & `PUT /api/users/me` — modification du profil (la route `/me` évite d'envoyer un id mal formaté issu de la session).

- `GET /api/favorites` — retourne les films favoris de l'utilisateur (id + title).
- `POST /api/favorites` — ajoute un film aux favoris (body: `{ movieId }`).
- `DELETE /api/favorites` — supprime un film des favoris (body: `{ movieId }`).


### Administration 
- L'espace admin se trouve sous `app/dashboard/admin/` et contient :
	- Import TMDB (recherche et ajout de films en base)
	- Movies list : tableau d'édition/suppression
	- Users list : gestion des rôles et suppression d'utilisateurs

- Seules les routes backend appelant `requireAdmin()` dans `lib/authMiddleware` acceptent les actions admin.

### Tests et vérifications manuelles

- Pour vérifier l'état des favoris/utilisateurs :
	- Démarrer `npx prisma studio` et inspecter les tables `User` et `Movie`.
	- Ouvrir le réseau dans DevTools et vérifier les requêtes vers `/api/favorites`, `/api/users/me`, `/api/auth/session`.

### Déploiement
- Assurez-vous que les variables d'environnement (MongoDB, NEXTAUTH_SECRET, TMDB_API_KEY, NEXTAUTH_URL) sont définies dans votre plateforme de déploiement.
- Construire puis démarrer :

```bash
npm run build
npm run start
```

Concepteurs du projet
- Emery TOSSAVI — emery.tossavi@epitech.eu
- Elvis AHISSOU — elvis.ahissou@epitech.eu
- Carmelle HOUESSOU — carmelle.houessou@epitech.eu
- Rock HOUINSOU — rock.houinsou@epitech.eu

Annexes utiles
--------------
- `lib/tmdb.js` : helper pour construire les URLs TMDB 
- `lib/authMiddleware.js` : centralise les vérifications `requireAuth`, `requireAdmin`
- `prisma/schema.prisma` : modèle source pour la base. 

Contribuer
----------
- Créez une branche feature, respectez la structure `app/`, `components/`, `lib/`, testez localement et ouvrez une PR.

Licence

MIT

--
Ce README a été rédigé pour donner un guide pratique et rapide à toute personne souhaitant développer, tester ou administrer l'application Tomato Reviews.