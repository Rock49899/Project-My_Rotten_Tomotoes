# Guide de déploiement Vercel - Rotten Tomatoes

## Étapes de déploiement

### 1. Préparer votre base de données MongoDB

Vous aurez besoin d'une base MongoDB cloud (MongoDB Atlas est recommandé) :

1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un nouveau cluster (le tier gratuit suffit)
3. Créez un utilisateur de base de données
4. Ajoutez l'adresse IP `0.0.0.0/0` dans Network Access (pour permettre Vercel)
5. Copiez votre connection string MongoDB

Exemple : `mongodb+srv://username:password@cluster.mongodb.net/rotten_tomatoes?retryWrites=true&w=majority`

### 2. Déployer sur Vercel

#### Option A : Via l'interface web (Recommandé)

1. **Connectez-vous à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec votre compte GitHub

2. **Importez votre projet**
   - Cliquez sur "Add New Project"
   - Sélectionnez votre repository `Project-My_Rotten_Tomotoes`
   - Cliquez sur "Import"

3. **Configurez les variables d'environnement**
   
   Dans la section "Environment Variables", ajoutez :
   
   ```
   DATABASE_URL=mongodb+srv://votre-connection-string
   NEXTAUTH_URL=https://votre-domaine.vercel.app
   NEXTAUTH_SECRET=votre-secret-genere
   TMDB_API_KEY=votre-cle-tmdb
   ADMIN_BEARER=votre-token-admin-securise
   ```
   
   Pour générer `NEXTAUTH_SECRET` :
   ```bash
   openssl rand -base64 32
   ```

4. **Déployez**
   - Cliquez sur "Deploy"
   - Attendez que le build se termine

#### Option B : Via CLI

1. **Installez Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Connectez-vous**
   ```bash
   vercel login
   ```

3. **Déployez**
   ```bash
   vercel
   ```
   
   Suivez les instructions et configurez les variables d'environnement quand demandé.

### 3. Configuration post-déploiement

1. **Configurez Prisma**
   
   Vercel exécutera automatiquement `prisma generate` pendant le build.
   
   Pour pousser le schéma vers la base de données de production, ajoutez un script dans `package.json` :
   ```json
   "scripts": {
     "postinstall": "prisma generate",
     "vercel-build": "prisma generate && prisma db push && next build"
   }
   ```

2. **Vérifiez les logs**
   - Allez dans votre projet Vercel > Deployments
   - Cliquez sur le dernier déploiement
   - Vérifiez les logs pour toute erreur

### 4. Variables d'environnement requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string MongoDB Atlas | `mongodb+srv://...` |
| `NEXTAUTH_URL` | URL de votre site Vercel | `https://mon-site.vercel.app` |
| `NEXTAUTH_SECRET` | Secret pour NextAuth (généré) | Générer avec `openssl rand -base64 32` |
| `TMDB_API_KEY` | Clé API TMDB (optionnel) | Obtenir sur [TMDB](https://www.themoviedb.org/settings/api) |
| `ADMIN_BEARER` | Token pour routes admin | Choisir un token sécurisé |
| `GOOGLE_CLIENT_ID` | Google OAuth (optionnel) | ID client Google |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (optionnel) | Secret client Google |

### 5. Configuration Google OAuth (Optionnel)

Si vous utilisez Google OAuth :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez "Google+ API"
4. Créez des identifiants OAuth 2.0
5. Ajoutez vos URLs autorisées :
   - Origines JavaScript : `https://votre-domaine.vercel.app`
   - URI de redirection : `https://votre-domaine.vercel.app/api/auth/callback/google`

### 6. Domaine personnalisé (Optionnel)

1. Dans Vercel, allez dans Settings > Domains
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS

### 7. Vérification

Après le déploiement :

✅ Vérifiez que le site est accessible  
✅ Testez l'inscription/connexion  
✅ Vérifiez la connexion à MongoDB  
✅ Testez les routes API  

## Dépannage

### Erreur "Module not found: Can't resolve 'prisma'"
- Assurez-vous que `prisma generate` s'exécute pendant le build
- Vérifiez `package.json` pour le script `postinstall`

### Erreur de connexion MongoDB
- Vérifiez que `0.0.0.0/0` est dans Network Access de MongoDB Atlas
- Vérifiez que la connection string est correcte
- Assurez-vous que le mot de passe ne contient pas de caractères spéciaux (URL encode si nécessaire)

### Erreur NextAuth
- Vérifiez que `NEXTAUTH_URL` correspond à votre domaine Vercel
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Nettoyez les cookies du navigateur

## Notes importantes

- Les déploiements sont automatiques à chaque push sur la branche `main`
- Les preview deployments sont créés pour chaque PR
- Les variables d'environnement peuvent être différentes par environnement (Production, Preview, Development)
- Vercel offre des logs en temps réel et des analytics

## 🔗 Liens utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Prisma avec Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
