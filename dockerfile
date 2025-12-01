FROM node:20-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
# RUN npm ci
RUN npm ci --no-audit --no-fund --prefer-offline --loglevel=error

# Copier tout le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Exposer le port 3000
EXPOSE 3000

# Commande de démarrage en mode développement
CMD ["npm", "run", "dev"]