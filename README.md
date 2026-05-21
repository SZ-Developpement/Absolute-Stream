# Absolute Stream

> Notez. Critiquez. Matchez en duo. Triomphez en Tournoi. Absolute Stream est la plateforme communautaire qui transforme votre passion pour les films, séries et animés en expérience partagée.

![Status](https://img.shields.io/badge/status-en%20développement-yellow)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![NeonDB](https://img.shields.io/badge/NeonDB-PostgreSQL-green?logo=postgresql)
![Better Auth](https://img.shields.io/badge/Better%20Auth-auth-purple)
![Radix UI](https://img.shields.io/badge/Radix_UI-primitives-161618?logo=radixui)
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

**Absolute Stream** est une plateforme communautaire (type Letterboxd) unifiant films, séries et animés. Elle s'articule autour de deux expériences phares qui la distinguent des trackers classiques :

- le **Match** en temps réel, inspiré de Tinder, pour répondre instantanément au "qu'est-ce qu'on regarde ce soir ?" en duo ;
- le **Tournoi** communautaire, qui transforme les goûts collectifs en compétition pour faire émerger les œuvres les plus aimées.

Autour de ces deux modes, la plateforme s'appuie sur **TMDB (The Movie Database)** pour exposer un catalogue mondial. Chaque membre dispose d'une bibliothèque personnelle (statuts de visionnage, notes de 1 à 10, critiques avec marqueur spoiler), de favoris, de listes personnalisées publiques ou privées, et d'un réseau social (followers / following) qui alimente les recommandations et la visibilité de ses critiques. Les fiches affichent un badge de recommandation en flamme synthétisant l'avis communautaire.

---

## Fonctionnalites

### Catalogue

- Recherche dynamique films / séries / animés via TMDB
- Fiche détaillée unifiée (`/[type]/[id]`) : affiche, synopsis, casting, date de sortie
- Sections découverte par type : populaires, mieux notés, à l'affiche / en cours de diffusion
- Collections TMDB (sagas, univers cinématographiques)
- Top 10 communautaire basé sur les notes des membres

### Bibliotheque personnelle

- Statuts de visionnage : Vu / A voir / En cours
- Notation de 1 à 10
- Critiques avec marqueur "spoiler" optionnel
- Visibilité de chaque critique : Publique ou Réservée aux abonnés
- Favoris (indépendants du statut de visionnage)
- Listes personnalisées (publiques ou privées) — ex. "Films du dimanche", "A regarder avec Marie"

### Social

- Système Followers / Following
- Profil public avec critiques, favoris et listes visibles selon la visibilité choisie
- Recommandations basées sur le réseau d'amis

### Systeme de Match (fonctionnalite phare)

- Création d'une session duo avec lien d'invitation unique
- Etats de session : En attente / Active / Terminée
- Swipe Like / Dislike sur des propositions TMDB
- Détection de match en temps réel dès qu'un même média est liké par les deux participants
- Plusieurs matches possibles dans une même session

### Tournoi communautaire (fonctionnalite phare)

- Mode compétitif à l'échelle de la communauté pour faire émerger les œuvres préférées
- Confrontations entre films, séries, animés ou des thèmes variés
- Participation et vote réservés aux membres connectés
- Résultats agrégés et visibles par toute la communauté

### Moderation

- Signalement des critiques inappropriées
- Rôles : Utilisateur / Modérateur / Admin

### Acces

- Visiteur : recherche catalogue, fiches détaillées, Top 10
- Membre : toutes les fonctionnalités (bibliothèque, notes, favoris, listes, Match, tournoi, social)

---

## Stack technique

| Couche          | Technologie                                      |
| --------------- | ------------------------------------------------ |
| Framework       | Next.js 16 (App Router + Server Actions)         |
| Langage         | TypeScript 5                                     |
| UI              | React 19, Tailwind CSS 4, Radix UI, Lucide React |
| Carousel        | Embla Carousel                                   |
| Variants UI     | class-variance-authority + tailwind-merge        |
| Police          | Geist                                            |
| Base de données | NeonDB (PostgreSQL serverless)                   |
| ORM             | Prisma 6                                         |
| Auth            | Better Auth                                      |
| API externe     | TMDB API                                         |
| Déploiement     | Vercel                                           |

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

    TMDB API (catalogue mondial films / séries / animés)
```

### Flux du systeme de Match

```
Membre A crée une session (status: WAITING) -> lien d'invitation
    |
    v
Membre B rejoint -> session passe en ACTIVE
    |
    v
Next.js récupère des suggestions TMDB
    |
    v
Chaque user swipe (LIKE / DISLIKE) -> Swipe stocké en DB
    |
    v
A chaque LIKE, comparaison côté serveur : si l'autre user a déjà LIKE
le même tmdbId -> création d'un MatchResult + notification live
    |
    v
La session peut accumuler plusieurs matches avant d'être FINISHED
```

---

## Installation

### Prérequis

- Node.js >= 20
- Compte NeonDB (gratuit)
- Clé API TMDB (gratuite sur themoviedb.org)

### 1. Cloner le projet

```bash
git clone https://github.com/SZ-Developpement/Absolute-Stream.git
cd Absolute-Stream
```

### 2. Variables d'environnement

Créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

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
│   ├── app/                             # App Router Next.js
│   │   ├── layout.tsx                   # Layout global (dark mode)
│   │   ├── page.tsx                     # Landing
│   │   ├── globals.css                  # Styles globaux Tailwind
│   │   ├── (auth)/                      # Route group — authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (library)/                   # Route group — catalogue
│   │   │   ├── movies/                  # Catalogue films
│   │   │   ├── series/                  # Catalogue séries
│   │   │   ├── animes/                  # Catalogue animés
│   │   │   ├── collections/             # Collections TMDB
│   │   │   └── top10/                   # Top communautaire
│   │   ├── (games)/                     # Route group — modes ludiques
│   │   │   ├── match/                   # Système de Match
│   │   │   │   └── [sessionId]/         # Session de swipe en cours
│   │   │   └── tournoi/                 # Tournoi communautaire
│   │   ├── (user)/                      # Route group — espace membre
│   │   │   ├── profile/                 # Profil utilisateur
│   │   │   └── settings/                # Paramètres du compte
│   │   ├── [type]/[id]/                 # Fiche unifiée movie/tv/anime
│   │   └── api/                         # Route Handlers
│   │       ├── auth/[...all]/           # Better Auth
│   │       ├── movies/                  # discoverMovies, popularMovies, topRated, nowPlaying, movieGenres
│   │       ├── tvshows/                 # discoverTvshows, popularTv, topRated, onTheAir, tvGenres
│   │       ├── animes/                  # discoverAnimes, popularAnimes, topRated, animeGenres
│   │       ├── collections/             # Collections TMDB
│   │       └── findByID/[external_id]/  # Lookup par ID externe
│   │
│   ├── components/                      # Composants React
│   │   ├── ui/                          # MyInput, dropdown-menu, label, radio-group, slider
│   │   ├── layout/                      # NavBar, Footer, PageBackground
│   │   ├── medias/                      # BadgeReco, DiscoverMedia, EmblaCarousel, FavoriteButton, LibraryContainer, MediaCards, MediaContainer
│   │   └── collections/                 # CardCollection
│   │
│   ├── actions/                         # Server Actions
│   │   └── favorites.ts                 # Mutations favoris (ajout / suppression)
│   │
│   ├── providers/                       # Providers React
│   │   └── AuthContext.tsx              # Etat d'authentification cote client
│   │
│   ├── hooks/                           # Hooks React custom
│   │   ├── useAuth.ts                   # Acces a la session Better Auth
│   │   ├── useImageColor.ts             # Extraction de couleur dominante d'une image
│   │   └── usePageBackground.ts         # Gestion du background dynamique par page
│   │
│   ├── constants/                       # Constantes / config UI
│   │   ├── home-page.ts                 # Contenu de la landing
│   │   ├── medias.tsx                   # Constantes liées aux médias (catégories, options)
│   │   ├── nav-bar.ts                   # Liens et structure de la NavBar
│   │   └── page-design.ts               # Configuration visuelle par page
│   │
│   ├── types/                           # Types TypeScript partagés
│   │   ├── medias.ts                    # Types métiers médias
│   │   └── tmdb.ts                      # Types pour l'API TMDB
│   │
│   └── lib/                             # Utilitaires
│       ├── auth.ts                      # Configuration Better Auth
│       ├── prisma.ts                    # Client Prisma singleton
│       ├── tmdb.ts                      # Client TMDB API
│       └── utils.ts                     # Helpers (cn, etc.)
│
├── prisma/
│   └── schema.prisma                    # Schema BDD
├── public/
├── next.config.ts
├── postcss.config.mjs
├── package.json
└── tsconfig.json
```

---

## API

> Etat actuel : les endpoints catalogue sont en place. Les opérations liées aux données utilisateur (bibliothèque, reviews, favoris, listes, match) sont en cours d'implémentation et seront exposées via Server Actions.

### Catalogue (Route Handlers)

| Méthode | Endpoint                       | Description                      |
| ------- | ------------------------------ | -------------------------------- |
| GET     | `/api/movies/popularMovies`    | Films populaires TMDB            |
| GET     | `/api/movies/topRated`         | Films les mieux notés            |
| GET     | `/api/movies/nowPlaying`       | Films à l'affiche                |
| GET     | `/api/movies/discoverMovies`   | Recherche / filtrage films       |
| GET     | `/api/movies/movieGenres`      | Liste des genres films           |
| GET     | `/api/tvshows/popularTv`       | Séries populaires                |
| GET     | `/api/tvshows/topRated`        | Séries les mieux notées          |
| GET     | `/api/tvshows/onTheAir`        | Séries en cours de diffusion     |
| GET     | `/api/tvshows/discoverTvshows` | Recherche / filtrage séries      |
| GET     | `/api/tvshows/tvGenres`        | Liste des genres séries          |
| GET     | `/api/animes/popularAnimes`    | Animés populaires                |
| GET     | `/api/animes/topRated`         | Animés les mieux notés           |
| GET     | `/api/animes/discoverAnimes`   | Recherche / filtrage animés      |
| GET     | `/api/animes/animeGenres`      | Liste des genres animés          |
| GET     | `/api/collections`             | Collections TMDB                 |
| GET     | `/api/findByID/[external_id]`  | Lookup par ID externe            |
| ALL     | `/api/auth/[...all]`           | Better Auth (login, callback...) |

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
