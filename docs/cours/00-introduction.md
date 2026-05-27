# Module 00 — Introduction & vue d'ensemble

## Objectifs

À la fin de ce module, tu sauras :
- Expliquer en 30 secondes ce que fait l'application
- Nommer toutes les briques techniques utilisées et savoir pourquoi
- Visualiser le flux d'une requête (du clic utilisateur jusqu'à l'écran)
- Te repérer dans l'arborescence `src/`

---

## 1. Ce que fait Absolute Stream

C'est une **plateforme communautaire de découverte de films, séries et animes**, branchée en direct sur l'API publique TMDB (The Movie Database). Trois grandes fonctionnalités :

1. **Catalogue** : explorer les films/séries/animes populaires, les mieux notés, filtrer par genre, trier
2. **Bibliothèque perso** : favoris, statuts de visionnage (vu, à voir, en cours), notes, critiques
3. **Social** : suivre des amis, voir leurs critiques, et surtout un **Match Tinder** à deux pour décider d'un film ensemble

L'app ne stocke **pas** les films en base. Elle ne stocke que :
- Les comptes utilisateurs et leurs données sociales
- Des `tmdbId` (identifiants) liés à un type (`MOVIE`, `TV_SHOW`, `ANIME`)
- Les interactions (favoris, listes, swipes, reviews…)

Toutes les métadonnées (titre, affiche, casting, synopsis…) sont récupérées **à la volée** depuis TMDB. C'est un choix d'architecture important : il évite d'avoir à maintenir une base de données de films à jour.

---

## 2. La stack en un coup d'œil

| Brique | Choix | Rôle |
|---|---|---|
| Framework | Next.js 16 (App Router) | Rendu côté serveur, routing fichier, RSC, API routes |
| UI | React 19 | Composants, hooks, Server Components |
| Langage | TypeScript 5 (strict) | Typage statique du JS |
| Style | Tailwind CSS v4 | Utility-first, config CSS-first |
| UI primitives | Radix UI | Dropdown, slider, radio-group accessibles |
| Carrousel | Embla Carousel | Carrousels horizontaux performants |
| Icônes | Lucide React | Bibliothèque d'icônes SVG |
| Typo | Geist Sans | Police via `next/font` |
| BDD | PostgreSQL + Prisma 6 | ORM TypeScript |
| Auth | Better Auth | Session cookies + OAuth GitHub/Google |
| Validation | Zod | Validation runtime des données entrantes |
| Utils | `clsx`, `tailwind-merge`, `cva` | Composition de classes CSS |
| API externe | TMDB v3 | Source des données médias |

---

## 3. Arborescence

```
absolute-stream/
├── prisma/
│   ├── schema.prisma          ← Schéma de la BDD
│   └── migrations/            ← Migrations versionnées
├── src/
│   ├── app/                   ← Routing Next.js (App Router)
│   │   ├── layout.tsx         ← Layout racine (NavBar, Footer, AuthProvider)
│   │   ├── page.tsx           ← Page d'accueil "/"
│   │   ├── globals.css        ← Styles globaux + import Tailwind
│   │   │
│   │   ├── (auth)/            ← Group "auth" (login, register)
│   │   ├── (games)/           ← Group "games" (match, tournoi)
│   │   ├── (library)/         ← Group "library" (movies, series, animes…)
│   │   ├── (user)/            ← Group "user" (profile, settings)
│   │   ├── [type]/[id]/       ← Page dynamique fiche média
│   │   │
│   │   └── api/               ← Route Handlers (endpoints HTTP)
│   │       ├── auth/[...all]/ ← Catch-all Better Auth
│   │       ├── movies/        ← Endpoints films (popular, topRated…)
│   │       ├── tvshows/
│   │       ├── animes/
│   │       └── collections/
│   │
│   ├── components/            ← Composants UI réutilisables
│   │   ├── layout/            ← NavBar, Footer, PageBackground
│   │   ├── medias/            ← MediaCards, EmblaCarousel, FavoriteButton…
│   │   ├── collections/
│   │   └── ui/                ← Wrappers Radix (DropdownMenu, Slider…)
│   │
│   ├── actions/               ← Server Actions ("use server")
│   │   └── favorites.ts
│   ├── hooks/                 ← Custom hooks (useAuth, useImageColor…)
│   ├── lib/                   ← Code utilitaire (prisma, auth, tmdb, utils)
│   ├── providers/             ← Contextes React (AuthContext)
│   ├── constants/             ← Données statiques (nav-bar, home-page…)
│   └── types/                 ← Types TypeScript partagés
│
├── public/                    ← Assets statiques
├── package.json
├── tsconfig.json              ← Config TypeScript
├── eslint.config.mjs          ← Config ESLint
├── postcss.config.mjs         ← Config PostCSS (Tailwind)
└── next.config.ts             ← Config Next.js
```

---

## 4. Flux d'une requête type

Imagine que tu cliques sur **`/movies`** :

1. **Navigateur** envoie `GET /movies`
2. **Next.js** matche le fichier `src/app/(library)/movies/page.tsx` (le `(library)` est un group, il n'apparait pas dans l'URL)
3. C'est un **Server Component** (par défaut). Il s'exécute côté **serveur** :
   - Lance 4 `fetch` parallèles vers TMDB (popular, topRated, discover, genres)
   - Avec `next: { revalidate: 3600 }` → les réponses sont mises en cache 1h
4. Une fois les données reçues, Next rend le HTML
5. Le HTML est streamé au navigateur
6. Les **Client Components** (marqués `"use client"`) s'hydratent : `<DiscoverMedia>`, `<EmblaCarousel>` deviennent interactifs
7. Si tu changes un filtre dans `<DiscoverMedia>`, il appelle `/api/movies/discoverMovies?with_genres=28` (une Route Handler) qui interroge TMDB et te renvoie les nouveaux résultats

C'est l'**hybride** Server/Client typique de Next 13+ App Router.

---

## 5. Le Match : la fonctionnalité-signature

C'est l'algo le plus original. Schéma de données (Prisma) :

```
User (Alice) ──── MatchSession ──── User (Bob)
                       │
                  ┌────┴────┐
                  ▼         ▼
               Swipe[]   MatchResult[]
```

- Alice crée une `MatchSession`
- Bob la rejoint via un lien d'invitation
- Tous les deux **swipent** des films (LIKE / DISLIKE)
- Dès qu'un même `tmdbId` reçoit un `LIKE` des deux → on crée un `MatchResult` → on notifie

L'algorithme de détection est simple :
```sql
-- En pseudo-SQL
SELECT tmdbId FROM swipe
WHERE sessionId = ? AND type = 'LIKE'
GROUP BY tmdbId
HAVING COUNT(DISTINCT userId) = 2
```
Le `@@unique([sessionId, userId, tmdbId])` sur la table `Swipe` empêche un user de swiper deux fois le même film.

---

## 6. Concepts transverses à retenir

- **Server Components par défaut, Client uniquement si besoin** (interaction, state, hooks). Penche-toi sur la directive `"use client"` qui crée la frontière.
- **Pas de clé API en dur** : `process.env.TMDB_API_KEY` toujours, jamais exposé côté client. Les Route Handlers servent de proxy.
- **Strategie BDD minimaliste** : on ne stocke que ce qui est propre à l'utilisateur. Les données des films restent chez TMDB.
- **Optimistic UI** : pour les favoris, on met à jour l'UI **avant** la réponse serveur (hook `useOptimistic`).

---

## Exercices

### Exo 1 — Carte mentale (sans corrigé technique, à toi)
Dessine sur papier le flux : un utilisateur clique sur "Ajouter aux favoris" sur la fiche d'un film. Cite les fichiers concernés du projet.

### Exo 2 — Lis et comprends
Ouvre `src/app/layout.tsx`. Pour chaque ligne, écris ce qu'elle fait. Reviens à ce module pour vérifier.

### Exo 3 — Pourquoi tel choix ?
- Pourquoi on a choisi de **ne pas** stocker les films en BDD ?
- Pourquoi on a un Route Handler `/api/movies/discoverMovies` alors que `src/app/(library)/movies/page.tsx` peut déjà fetch directement TMDB ?

### Corrigés

**Exo 1 (correction guidée)** :
```
Click → FavoriteButton.tsx (client) 
  → useOptimistic met à jour l'icône instantanément
  → useTransition lance toggleFavoriteAction (server action)
    → favorites.ts ("use server") 
    → Zod valide tmdbId + type
    → auth.api.getSession() vérifie le cookie de session
    → prisma.favorite.findUnique → existe-t-il déjà ?
      → si oui : prisma.favorite.delete
      → si non : prisma.favorite.create
    → revalidatePath("/") invalide le cache
    → return { success: true }
  → Si erreur : useOptimistic se rollback automatiquement
```

**Exo 3a** :
- TMDB met à jour ses données en temps réel (nouvelles notes, nouveaux films). Maintenir une copie locale = corvée + risque de désynchro
- Économie de stockage : 800 000+ films chez TMDB
- Légalement : pas de question sur les droits, on consulte une API publique
- L'app reste **mince** : Postgres ne contient que les données propres aux utilisateurs

**Exo 3b** :
- La page `/movies` charge ses données initiales côté serveur (rendu rapide, SEO). Mais une fois sur la page, quand l'utilisateur change de filtre/tri, refaire un rendu Server Component complet = trop lourd
- Le Route Handler sert d'**endpoint léger** pour les rafraîchissements client. C'est aussi un **proxy** : il cache la clé API TMDB qu'on ne veut jamais exposer
- C'est l'archi classique : SSR pour la première charge, API interne pour les interactions ultérieures

---

## Suite

→ [Module 01 — JavaScript & TypeScript modernes](./01-javascript-typescript.md)
