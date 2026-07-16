# Web Invitation System

Système d'invitation web construit avec **Next.js 15**, **TypeScript**, **Prisma** et **PostgreSQL**.

## Fonctionnalités

- Authentification par email/mot de passe avec sessions sécurisées (iron-session)
- Deux rôles : `USER` et `PARTNER`
- Les partenaires génèrent des liens d'invitation uniques à usage unique
- Les partenaires peuvent révoquer des invitations actives
- Les partenaires voient la liste de toutes leurs invitations et les utilisateurs inscrits
- L'inscription publique est désactivée — uniquement via lien d'invitation valide
- Statuts d'invitation : `ACTIVE`, `USED`, `REVOKED`

---

## Prérequis

- [Node.js](https://nodejs.org/) **v18+** (v20 recommandé)
- [PostgreSQL](https://www.postgresql.org/) **v14+** installé et en cours d'exécution
- `npm` ou `pnpm`

---

## Installation & Lancement (VS Code)

### 1. Cloner / Décompresser le projet

```bash
cd web-invitation-system
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copiez le fichier `.env.example` en `.env` :

```bash
cp .env.example .env
```

Puis éditez `.env` avec vos propres valeurs :

```env
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/invitation_system"
SESSION_SECRET="une-cle-secrete-aleatoire-de-minimum-32-caracteres"
```

> **Note :** `SESSION_SECRET` doit faire au moins 32 caractères. Vous pouvez en générer une avec :
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Créer la base de données PostgreSQL

Connectez-vous à PostgreSQL et créez la base :

```sql
CREATE DATABASE invitation_system;
```

Ou via la ligne de commande :

```bash
createdb invitation_system
```

### 5. Générer le client Prisma et appliquer les migrations

```bash
npm run db:generate     # Génère le client Prisma
npm run db:migrate      # Crée les tables en base de données
```

> Si vous êtes en développement et ne souhaitez pas utiliser les migrations, vous pouvez aussi faire :
>
> ```bash
> npm run db:push       # Synchronise le schéma sans historique de migration
> ```

### 6. Peupler la base de données (seed)

```bash
npm run db:seed
```

Cela crée deux comptes partenaires :

| Email             | Mot de passe | Rôle    |
| ----------------- | ------------ | ------- |
| omar@gmail.com    | omar1234     | PARTNER |
| youssef@gmail.com | youssef1234  | PARTNER |

### 7. Lancer l'application

```bash
npm run dev
```

L'application est disponible sur **http://localhost:3000**

---

## Structure du projet

```
web-invitation-system/
├── prisma/
│   ├── schema.prisma       # Schéma de la base de données
│   ├── seed.ts             # Script de peuplement initial
│   └── migrations/         # Historique des migrations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # POST /api/auth/login
│   │   │   │   ├── logout/route.ts     # POST /api/auth/logout
│   │   │   │   └── session/route.ts    # GET  /api/auth/session
│   │   │   ├── invitations/
│   │   │   │   ├── route.ts            # GET & POST /api/invitations
│   │   │   │   ├── [id]/route.ts       # PATCH /api/invitations/:id (révoquer)
│   │   │   │   └── [code]/info/route.ts# GET info publique d'une invitation
│   │   │   └── register/route.ts       # POST /api/register
│   │   ├── login/page.tsx              # Page de connexion
│   │   ├── dashboard/page.tsx          # Dashboard utilisateur (USER)
│   │   ├── partner/page.tsx            # Dashboard partenaire (PARTNER)
│   │   ├── register/[code]/page.tsx    # Page d'inscription par invitation
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Redirection vers login ou dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── InvitationManager.tsx       # Tableau de gestion des invitations
│   │   └── LogoutButton.tsx
│   ├── lib/
│   │   ├── prisma.ts                   # Singleton Prisma
│   │   ├── session.ts                  # Configuration iron-session
│   │   └── auth.ts                     # Helpers d'authentification
│   └── middleware.ts                   # Protection des routes
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Variables d'environnement

| Variable         | Description                                       | Exemple                                    |
| ---------------- | ------------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`   | URL de connexion PostgreSQL (format Prisma)       | `postgresql://user:pass@localhost:5432/db` |
| `SESSION_SECRET` | Clé secrète pour chiffrer les sessions (≥32 car.) | `une-longue-cle-aleatoire-de-32-chars`     |

---

## Commandes disponibles

| Commande              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Lance l'app en développement sur le port 3000      |
| `npm run build`       | Compile l'app pour la production                   |
| `npm run start`       | Lance l'app en production (après `build`)          |
| `npm run db:generate` | Génère le client Prisma                            |
| `npm run db:migrate`  | Applique les migrations Prisma                     |
| `npm run db:push`     | Synchronise le schéma sans migrations (dev rapide) |
| `npm run db:seed`     | Insère les données initiales (comptes partenaires) |
| `npm run db:studio`   | Ouvre Prisma Studio (interface visuelle de la BDD) |
| `npm run db:reset`    | Réinitialise la BDD et relance les migrations      |

---

## Décisions architecturales

### 1. App Router (Next.js 15)

On utilise l'App Router de Next.js avec les Server Components par défaut. Les composants interactifs (formulaires, tableaux avec actions) sont marqués `"use client"`.

### 2. iron-session pour les sessions

iron-session chiffre les données de session dans un cookie HTTP-only sécurisé. C'est la solution la plus légère pour Next.js App Router sans base de données de sessions séparée.

### 3. Prisma avec PostgreSQL

Prisma offre une couche de type-safety complète entre le schéma SQL et le code TypeScript. Les migrations garantissent un historique de schéma versionné.

### 4. Bcryptjs pour les mots de passe

Les mots de passe sont hachés avec bcrypt (coût 12) avant stockage. Jamais stockés en clair.

### 5. Middleware Next.js pour la protection des routes

Le middleware intercepte toutes les requêtes et redirige selon le rôle et l'état d'authentification, évitant de dupliquer cette logique dans chaque page.

### 6. Transaction Prisma pour l'inscription

La création d'un utilisateur et la mise à jour du statut de l'invitation sont effectuées dans une transaction atomique, évitant les états incohérents en cas d'erreur.

---

## Flux d'invitation

```
Partner          →  Génère un lien  →  /register/{code}
                                            ↓
Nouveau user     →  Remplit le formulaire (nom, email, mot de passe)
                                            ↓
                    API valide l'invitation (ACTIVE ?)
                                            ↓
                    Création user + invitation marquée USED (transaction)
                                            ↓
                    Redirection vers /login
```

s
