# Module 06 — Data fetching avec TMDB et le cache de Next 16

## Objectifs

- Comprendre le **fetch côté serveur** vs côté client
- Maîtriser le **cache de Next** : `revalidate`, `no-store`, `force-cache`
- Écrire un **Route Handler** propre avec validation et gestion d'erreurs
- Lire et comprendre toutes les fonctions de récupération du projet
- Connaître les **bonnes pratiques de sécurité API**

---

## 1. Pourquoi fetcher côté serveur ?

```tsx
// src/app/(library)/movies/page.tsx — Server Component
export default async function MoviesPage() {
  const topRatedMovies = await getTopRatedMedia();
  const popularMovies = await getPopularMovies();
  // ...
  return <MediaContainer>...</MediaContainer>;
}
```

**Avantages du fetch côté serveur** :
- ⚡ **Rapide** : pas de round-trip réseau navigateur → CDN → API. Le serveur est plus proche de l'API.
- 🔒 **Sécurisé** : la clé API ne quitte jamais le serveur.
- 🔍 **SEO** : le contenu est dans le HTML initial (les moteurs voient les films).
- 🚀 **Moins de JS** : pas de logique de fetch envoyée au navigateur.

**Inconvénient** : on bloque le rendu de la page tant que les fetchs ne sont pas terminés. C'est mitigé par :
- Le cache (les fetchs sont quasi-instantanés au 2ᵉ visiteur)
- `Suspense` pour streamer le HTML morceau par morceau

---

## 2. Le cache de Next : `fetch` augmenté

Next override le `fetch` global pour ajouter un système de cache intégré.

```ts
const res = await fetch(url, {
  method: "GET",
  headers: { accept: "application/json" },
  next: { revalidate: 3600 },     // ← option Next-spécifique
});
```

### Les 4 stratégies de cache

| Stratégie | Code | Comportement |
|---|---|---|
| **ISR (par défaut Next 14, désactivé en 15+)** | `next: { revalidate: N }` | Cache N secondes, puis re-fetch en arrière-plan |
| **Force cache** | `cache: "force-cache"` | Cache indéfini, jusqu'à `revalidatePath` ou redéploiement |
| **No store** | `cache: "no-store"` | Pas de cache : fetch à chaque requête |
| **Tags** | `next: { tags: ["movies"] }` | Cache invalidé par `revalidateTag("movies")` |

### Dans le projet
```ts
// src/app/(library)/movies/page.tsx
const options = {
  method: "GET",
  headers: { accept: "application/json" },
  next: { revalidate: 3600 },   // films populaires : 1h de cache
};
```

```ts
// src/lib/tmdb.ts — détails de collection
fetch(`${TMDB_BASE_URL}/collection/${id}?api_key=${TMDB_API_KEY}`, {
  next: { revalidate: 86400 },   // 24h de cache (les collections changent peu)
});
```

```ts
// src/app/[type]/[id]/page.tsx
const response = await fetch(url, { cache: "no-store" });
//                              ↑ détail d'un média : toujours frais (note, etc.)
```

### Comment choisir ?
- **Données qui changent rarement** (genres, collections) → `revalidate: 86400` (24h)
- **Données semi-fraîches** (top films de la semaine) → `revalidate: 3600` (1h)
- **Données qui doivent être à jour à la seconde** (panier, profil user) → `no-store`

---

## 3. Le pattern de fetch du projet

Toutes les fonctions de récupération suivent le même schéma. Exemple sur `getPopularMovies` :

```ts
async function getPopularMovies(): Promise<Media[]> {
  // ① Récupérer la clé API
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];                                  // ② Fallback graceful
  }

  // ③ Construire l'URL
  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 3600 },                 // ④ Cache 1h
  };

  // ⑤ Try / catch englobant
  try {
    const res = await fetch(url, options);
    if (!res.ok) {                              // ⑥ HTTP errors
      console.error(`Failed: ${res.statusText}`);
      return [];
    }
    const data: PopularMediaResponse = await res.json();  // ⑦ Typage
    return data.results || [];
  } catch (error) {
    console.error("Network error:", error);     // ⑧ Network errors
    return [];
  }
}
```

**Pourquoi cette structure ?**
- ① Toujours via `process.env` — jamais de clé en dur (sécurité)
- ② Si la clé manque, on rend la page vide plutôt que de cracher
- ④ Le cache évite de marteler l'API TMDB (qui rate-limite à 50 req/sec)
- ⑤–⑧ On distingue **deux types d'erreurs** :
  - **HTTP** (`!res.ok`) : la requête a abouti mais avec un statut 4xx/5xx
  - **Network/Parse** (catch) : la requête a échoué (réseau coupé, JSON malformé)
- Dans les deux cas → retour de `[]` pour que la page rende sans crash

---

## 4. Route Handlers — les API endpoints

```ts
// src/app/api/movies/popularMovies/route.ts
import { NextResponse } from "next/server";
import { PopularMediaResponse } from "@/types/tmdb";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json({ error: "Erreur TMDB" }, { status: res.status });
    }
    const data: PopularMediaResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

### NextResponse.json
```ts
NextResponse.json(data);                             // 200, Content-Type: application/json
NextResponse.json({ error: "..." }, { status: 400 }); // statut HTTP custom
```

### À quoi sert un Route Handler quand on peut fetch en RSC ?

Trois raisons principales :

1. **Endpoint client** : `DiscoverMedia` (client) doit pouvoir refetcher dynamiquement. Il ne peut pas appeler TMDB direct (la clé serait exposée) → il appelle `/api/movies/discoverMovies` qui proxy.

2. **Réutilisation** : un endpoint peut servir plusieurs vues (RSC, client, app mobile…).

3. **Compatibilité externe** : tu peux appeler ces endpoints depuis un autre site, depuis Postman, etc.

---

## 5. Lire les query params dans un Route Handler

```ts
// src/app/api/movies/discoverMovies/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get("sort_by") || "popularity.desc";
  const withGenres = searchParams.get("with_genres");

  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("sort_by", sortBy);
  if (withGenres) url.searchParams.append("with_genres", withGenres);

  // ...
}
```

`searchParams.get("key")` retourne :
- la valeur (string) si elle existe
- `null` si la clé est absente

`URL` + `URLSearchParams.append` est plus robuste que la concat de strings (encoding automatique).

---

## 6. Params dynamiques dans un Route Handler

```ts
// src/app/api/findByID/[external_id]/route.ts
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ external_id: string }> },
) {
  const { external_id } = await context.params;
  // ...
}
```

⚠️ Comme pour les pages, `context.params` est une **Promise** en Next 16.

---

## 7. Cas spécial : la pagination cumulative de collections

`src/lib/tmdb.ts:27` — pattern intéressant :

```ts
export async function getCollections(limit: number = 20): Promise<TMDBCollection[]> {
  const collectionIds = new Set<number>();
  let moviesProcessed = 0;
  let page = 1;

  // Boucle while sur les pages de films populaires
  while (moviesProcessed < limit) {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 3600 } },
    );
    const data = await response.json();
    const moviesOnThisPage = Math.min(data.results.length, limit - moviesProcessed);

    // Pour chaque film, fetch ses détails en parallèle
    const movieDetails = await Promise.all(
      data.results.slice(0, moviesOnThisPage).map((movie: TMDBMovie) =>
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}`, {
          next: { revalidate: 86400 },
        })
          .then((res) => res.json())
          .catch(() => null),
      ),
    );

    // Collecte les IDs uniques de collections
    movieDetails.forEach((movie) => {
      if (movie?.belongs_to_collection?.id) {
        collectionIds.add(movie.belongs_to_collection.id);
      }
    });

    moviesProcessed += moviesOnThisPage;
    page++;
    if (data.results.length === 0) break;
  }

  // Fetch toutes les collections en parallèle
  const collections = await Promise.all(
    Array.from(collectionIds).map((id) =>
      fetch(`${TMDB_BASE_URL}/collection/${id}?api_key=${TMDB_API_KEY}`, {
        next: { revalidate: 86400 },
      })
        .then((res) => res.json())
        .catch(() => null),
    ),
  );

  return collections.filter((c): c is TMDBCollection => c !== null);
}
```

**Décortication** :
- On scroll les pages de films populaires (chaque page = 20 films)
- Pour chacun, on fetch le détail (qui contient `belongs_to_collection`)
- On stocke les IDs de collections dans un `Set` (dédup automatique)
- Une fois `limit` films analysés, on fetch toutes les collections d'un coup avec `Promise.all`
- Le `filter((c): c is TMDBCollection => c !== null)` est un **type guard** : il dit à TS "après ce filter, le tableau ne contient plus de null"

**Type guard** détail :
```ts
.filter((c): c is TMDBCollection => c !== null)
//          ↑ "si la fn retourne true, c est un TMDBCollection"
```
Sans le type guard, TS resterait sur `(TMDBCollection | null)[]`. Avec, il accepte `TMDBCollection[]`.

---

## 8. Variables d'environnement

`.env.local` (jamais commité, dans `.gitignore`) :
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
TMDB_API_KEY=abc123
TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Règles
- `process.env.X` → accessible **côté serveur uniquement**
- `process.env.NEXT_PUBLIC_X` → accessible aussi côté client (inliné à la build)
- ⚠️ Tout ce qui est `NEXT_PUBLIC_` se retrouve dans le bundle navigateur → **n'y mets jamais de secret**

Dans le projet, `NEXT_PUBLIC_AUTH_URL` est public (l'URL de base de l'app) — pas un secret. `TMDB_API_KEY` reste serveur uniquement.

---

## 9. Le streaming avec Suspense (mention)

Next supporte le streaming HTML : tu peux envoyer le shell de la page immédiatement, puis "remplir" les zones en attente :

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <NavBar />
      <Suspense fallback={<Skeleton />}>
        <SlowDataComponent />
      </Suspense>
    </>
  );
}
```

Pas (encore) utilisé dans le projet, mais à connaître. Permet d'éviter qu'une partie lente bloque toute la page.

---

## 10. Sécurité — checklist

✅ Clé API jamais en dur, toujours dans `.env`
✅ `.env.local` dans `.gitignore`
✅ Route Handler valide les inputs (zod) — particulièrement les POST/PUT/DELETE
✅ Route Handler vérifie l'authentification si l'endpoint requiert un user
✅ Pas de `NEXT_PUBLIC_` pour les secrets
✅ Validation côté serveur **même si** le front valide déjà

---

## Exercices

### Exo 1 — Identifier la stratégie de cache
Pour chaque cas, propose la bonne stratégie (`revalidate: N`, `no-store`, `force-cache`) :
1. Liste des genres TMDB
2. Profil utilisateur (nom, photo)
3. Films "en salle" cette semaine
4. Note moyenne d'un film calculée par l'app
5. Page d'accueil avec les recos perso de l'utilisateur

### Exo 2 — Refactorer en Promise.all
```ts
const top = await getTopRated();
const popular = await getPopular();
const discover = await getDiscover();
const genres = await getGenres();
```
Réécris pour paralléliser. Combien de temps gagné si chaque fetch met 200ms ?

### Exo 3 — Route Handler avec validation
Écris `POST /api/reviews/route.ts` qui :
- Reçoit `{ tmdbId: number, rating: number (1-10), content: string }`
- Vérifie la session
- Crée une review en BDD
- Retourne `{ id: string }` ou `{ error: string }`

### Exo 4 — Bug
```ts
const url = `https://api.themoviedb.org/3/search/movie?query=${searchTerm}&api_key=${apiKey}`;
const res = await fetch(url);
```
Si `searchTerm = "Lord of the Rings"`, quel est le problème ? Corrige.

### Exo 5 — Type guard
Réécris ce filtre avec un type guard pour que TS accepte le retour comme `string[]` :
```ts
const arr: (string | null | undefined)[] = ["a", null, "b", undefined, "c"];
const cleaned = arr.filter(x => x);    // TS infère (string | null | undefined)[]
```

---

## Corrigés

### Exo 1
1. Genres → `revalidate: 86400` (24h ou plus, ils ne changent jamais)
2. Profil user → `no-store` (peut changer à tout moment)
3. Films en salle → `revalidate: 3600` (1h, le cinéma ne sort pas un nouveau film toutes les minutes)
4. Note moyenne calculée par l'app → `no-store` ou `revalidate: 60` (selon que tu veux refléter en temps réel)
5. Recos perso → `no-store` (dépend de l'historique de l'user, doit être frais)

### Exo 2
```ts
const [top, popular, discover, genres] = await Promise.all([
  getTopRated(),
  getPopular(),
  getDiscover(),
  getGenres(),
]);
```
Avant : 4 × 200ms = 800ms
Après : max(200, 200, 200, 200) = 200ms
**Gain : 600ms** (75% plus rapide).

### Exo 3
```ts
// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";

const reviewSchema = z.object({
  tmdbId: z.number().int().positive(),
  type: z.nativeEnum(MediaType),
  rating: z.number().int().min(1).max(10),
  content: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const review = await prisma.review.create({
      data: { ...parsed.data, userId },
      select: { id: true },
    });
    return NextResponse.json(review);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

### Exo 4
Problème : `"Lord of the Rings"` contient des espaces. Concaténer directement dans une URL → `query=Lord of the Rings` → URL malformée (le serveur ne saura pas où finit le param).

**Correction** :
```ts
const url = new URL("https://api.themoviedb.org/3/search/movie");
url.searchParams.set("query", searchTerm);     // ← encode automatiquement → "Lord+of+the+Rings"
url.searchParams.set("api_key", apiKey);
```
Ou :
```ts
const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchTerm)}&api_key=${apiKey}`;
```

### Exo 5
```ts
const cleaned = arr.filter((x): x is string => x != null && x !== "");
//                          ↑ type guard : "si la fn retourne true, x est string"
```
- `x != null` (avec `!=` et pas `!==`) couvre **null ET undefined** d'un coup
- `x !== ""` exclut aussi la string vide si tu veux (à toi)

Plus court avec coercion booléenne (mais TS ne le suit pas toujours sans aide) :
```ts
const cleaned = arr.filter(Boolean) as string[];
```
Ça marche mais on perd la garantie TS — préfère le type guard explicite.

---

## Suite

→ [Module 07 — Authentification avec Better Auth](./07-auth-better-auth.md)
