# Absolute Stream

> Plateforme communautaire de gestion et découverte de films et séries — avec système de Match type Tinder pour trouver quoi regarder à deux.

![Status](https://img.shields.io/badge/status-en%20développement-yellow)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)
![NeonDB](https://img.shields.io/badge/NeonDB-PostgreSQL-green?logo=postgresql)
![Better Auth](https://img.shields.io/badge/Better%20Auth-auth-purple)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint)
![License](https://img.shields.io/badge/licence-MIT-green)

## Sommaire

- [A propos](#a-propos)
- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [API](#api)
- [Equipe](#equipe)

---

## A propos

**Absolute Stream** est une plateforme communautaire (type Letterboxd) unifiant films et séries. Elle résout le problème du "que regarder ce soir ?" grâce à un système de **Match** inspiré de Tinder : deux utilisateurs balayent des propositions et reçoivent une alerte instantanée quand leurs choix coïncident.

La plateforme s'appuie sur **TMDB (The Movie Database)** pour accéder à un catalogue mondial de films et séries. Les membres peuvent gérer leur bibliothèque personnelle, noter et critiquer des oeuvres, suivre leurs amis et découvrir des recommandations croisées.

---

## Fonctionnalites

### Catalogue

- Barre de recherche dynamique (films et séries via TMDB)
- Fiche détaillée : affiche, synopsis, date de sortie, casting
- Top Communauté : classement dynamique basé sur les notes des membres

### Bibliotheque personnelle

- Ajout d'oeuvres avec statuts : Vu / A voir / En cours
- Notation de 1 à 5 étoiles
- Rédaction de critiques

### Social

- Système Followers / Following
- Moteur de recommandation basé sur le réseau d'amis
- Profil utilisateur public

### Systeme de Match (fonctionnalite phare)

- Création d'une session duo avec lien d'invitation
- Interface de swipe (gauche / droite) sur des propositions TMDB
- Synchronisation en temps réel entre deux utilisateurs
- Alerte "Match" instantanée en cas de choix commun

### Acces

- Visiteur : recherche catalogue, Top Communauté
- Membre : toutes les fonctionnalités (bibliothèque, notes, Match, amis)

---

## Stack technique

| Couche          | Technologie                              |
| --------------- | ---------------------------------------- |
| Framework       | Next.js 16 (App Router + Server Actions) |
| Langage         | TypeScript 5                             |
| UI              | React, Tailwind CSS, Lucide React        |
| Base de données | NeonDB (PostgreSQL serverless)           |
| ORM             | Prisma                                   |
| Auth            | Better Auth                              |
| API externe     | TMDB API                                 |
| Déploiement     | Vercel                                   |

---

## Architecture

```
Utilisateur (Visiteur / Membre)
    |
    v
Next.js 16 — App Router
    |
    |-- /app                   Pages et layouts
    |-- /app/api               Route Handlers
    |-- Server Actions         Mutations sécurisées (DB sans exposer les clés)
    |
    |-- Better Auth            Sessions et authentification
    |
    |-- Prisma ORM
         |
         v
    NeonDB (PostgreSQL serverless)

    TMDB API (catalogue mondial films/séries)
```

### Flux du systeme de Match

```
Membre A crée une session -> génère un lien d'invitation
    |
    v
Next.js récupère des suggestions TMDB
basées sur les préférences des deux membres
    |
    v
Les deux membres balayent les cartes (Swipe)
    |
    v
Chaque "Swipe Right" -> stocké dans NeonDB via Prisma
    |
    v
Serveur compare les likes de la session
Si même tmdb_id pour les deux -> état "Match" retourné
    |
    v
Alerte Match affichée sur les deux interfaces
```

---

## Installation

### Prérequis

- Node.js >= 20
- Compte NeonDB (gratuit)
- Clé API TMDB (gratuite sur themoviedb.org)

### 1. Cloner le projet

```bash
git clone https://github.com/VOTRE_ORG/absolute-stream.git
cd absolute-stream
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplir les variables :

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="votre_secret"
BETTER_AUTH_URL="http://localhost:3000"
TMDB_API_KEY="votre_cle_tmdb"
TMDB_BASE_URL="https://api.themoviedb.org/3"
```

### 3. Installation et démarrage

```bash
npm install
npx prisma migrate dev
npm run dev
```

L'app sera disponible sur `http://localhost:3000`

---

## Structure du projet

```
absolute-stream/
├── src/
│   ├── app/                         # App Router Next.js
│   │   ├── layout.tsx               # Layout global (dark mode)
│   │   ├── page.tsx                 # Page d'accueil / catalogue
│   │   ├── (auth)/                  # Pages authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/               # Dashboard utilisateur
│   │   ├── library/                 # Bibliothèque personnelle
│   │   ├── media/[id]/              # Fiche détail film/série
│   │   ├── profile/[username]/      # Profil public utilisateur
│   │   ├── match/                   # Système de Match
│   │   │   ├── new/                 # Créer une session
│   │   │   └── [sessionId]/         # Session de swipe en cours
│   │   └── api/                     # Route Handlers
│   │       ├── auth/                # Better Auth endpoints
│   │       ├── library/             # CRUD bibliothèque
│   │       ├── media/               # Recherche et détails TMDB
│   │       ├── match/               # Logique sessions Match
│   │       ├── reviews/             # Notes et critiques
│   │       └── social/              # Followers / Following
│   │
│   ├── components/                  # Composants React
│   │   ├── ui/                      # Composants génériques
│   │   ├── media/                   # Cartes films/séries, fiches
│   │   ├── match/                   # Interface swipe
│   │   ├── library/                 # Composants bibliothèque
│   │   └── layout/                  # Header, Sidebar, Footer
│   │
│   ├── lib/                         # Utilitaires
│   │   ├── prisma.ts                # Client Prisma singleton
│   │   ├── tmdb.ts                  # Client TMDB API
│   │   └── auth.ts                  # Config Better Auth
│   │
│   └── types/                       # Types TypeScript
│       ├── media.ts
│       ├── match.ts
│       ├── library.ts
│       └── user.ts
│
├── prisma/
│   └── schema.prisma                # Schema BDD
├── public/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## API

| Méthode | Endpoint                  | Description                   |
| ------- | ------------------------- | ----------------------------- |
| GET     | `/api/media/search?q=...` | Recherche films/séries TMDB   |
| GET     | `/api/media/[id]`         | Détail d'une oeuvre           |
| GET     | `/api/library`            | Bibliothèque de l'utilisateur |
| POST    | `/api/library`            | Ajouter une oeuvre            |
| PATCH   | `/api/library/[id]`       | Modifier statut ou note       |
| DELETE  | `/api/library/[id]`       | Supprimer une oeuvre          |
| POST    | `/api/reviews`            | Ajouter une critique          |
| POST    | `/api/match/session`      | Créer une session Match       |
| POST    | `/api/match/swipe`        | Enregistrer un swipe          |
| GET     | `/api/match/[sessionId]`  | Etat de la session Match      |
| POST    | `/api/social/follow`      | Suivre un utilisateur         |
| DELETE  | `/api/social/follow/[id]` | Ne plus suivre                |

---

## Equipe

| Membre                                      | Role                                 |
| ------------------------------------------- | ------------------------------------ |
| [Chaïna](https://github.com/Chaina-bld)     | Frontend / UI                        |
| [Alexis](https://github.com/FlytziTv)       | Frontend / UI / Backend / API / Auth |
| [Thomas](https://github.com/thomas-montout) | Frontend / UI / Backend / API / Auth |

---

## Licence

# MIT — voir [LICENSE](./LICENSE)
