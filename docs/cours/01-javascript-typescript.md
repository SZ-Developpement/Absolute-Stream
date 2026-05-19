# Module 01 — JavaScript & TypeScript modernes

## Objectifs

- Lire et comprendre **n'importe quel** `.ts` ou `.tsx` du projet sans buter sur la syntaxe
- Maîtriser les patterns : `async/await`, destructuring, optional chaining, modules ES
- Comprendre les `interface`, `type`, génériques, narrowing
- Savoir pourquoi TypeScript et pas du JavaScript pur

---

## 1. Modules ES (import / export)

```ts
// Export "named" (plusieurs par fichier)
export function cn(...inputs: ClassValue[]) { ... }
export const SORT_OPTIONS = [ ... ];
export type { Media, Genre };

// Export "default" (un seul par fichier)
export default function MoviesPage() { ... }

// Import named
import { cn } from "@/lib/utils";
import { Media, Genre } from "@/types/tmdb";

// Import default + named en même temps
import MediaCards, { MediaCardsProps } from "@/components/medias/MediaCards";

// Import "type only" (n'apparait pas dans le JS compilé)
import type { Metadata } from "next";
```

**Le `@/` au début des imports** vient de `tsconfig.json` :
```json
"paths": { "@/*": ["./src/*"] }
```
Donc `@/lib/utils` = `./src/lib/utils`. Ça évite les `../../../`.

---

## 2. async / await — le modèle mental

JavaScript est **mono-thread**. Pour ne pas bloquer pendant un appel réseau, il utilise des Promesses. `async/await` est du sucre syntaxique pour les manipuler.

```ts
// Une fonction async retourne TOUJOURS une Promise
async function getPopularMovies(): Promise<Media[]> {
  const res = await fetch(url, options);   // attend la réponse
  if (!res.ok) return [];                  // fallback si erreur HTTP
  const data = await res.json();           // attend le parsing JSON
  return data.results || [];
}

// Pour l'appeler :
const movies = await getPopularMovies();   // dans un contexte async
// ou
getPopularMovies().then(movies => { ... }); // sans await
```

**Règle d'or** : `await` ne fonctionne qu'**à l'intérieur** d'une fonction `async` (ou au top-level d'un module ES).

### try / catch / finally
```ts
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed: ${res.statusText}`);
    return [];
  }
  return await res.json();
} catch (error) {
  console.error("Network error:", error);
  return [];
}
```
- `try` = exécute le code "à risque"
- `catch` = capture toute erreur lancée (erreur réseau, JSON malformé…)
- `finally` (non utilisé ici) = exécute toujours

### Promise.all — paralléliser

Extrait de `src/lib/tmdb.ts:53` :
```ts
const movieDetails = await Promise.all(
  data.results.slice(0, moviesOnThisPage).map((movie) =>
    fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}`)
      .then((res) => res.json())
      .catch(() => null),
  ),
);
```
- `.map(...)` produit un **tableau de Promises**
- `Promise.all([p1, p2, p3])` attend que **toutes** se résolvent, en parallèle
- ⚠️ Si une seule rejette, `Promise.all` rejette tout → ici on `.catch(() => null)` sur chacune pour les rendre "résilientes"

---

## 3. Destructuring, spread, rest

### Destructuring d'objet
```ts
// Au lieu de :
const tmdbId = props.tmdbId;
const type = props.type;
// On fait :
const { tmdbId, type } = props;

// Avec renommage :
const { user: currentUser } = session;

// Avec valeur par défaut :
const { sortBy = "popularity.desc" } = options;
```

### Destructuring d'array
```ts
const [count, setCount] = useState(0);
const [value, setValue] = React.useState([1970, 2026]);
```

### Spread (étalement)
```ts
// Objet : copier + écraser
const newProps = { ...defaultProps, color: "red" };

// Array : concaténer
const all = [...arr1, ...arr2];

// Combiné avec la dédup par Map :
setCollections((prev) => {
  const combined = [...prev, ...data];
  const unique = Array.from(new Map(combined.map((c) => [c.id, c])).values());
  return unique;
});
```

### Rest (collecter dans un paramètre)
```ts
function cn(...inputs: ClassValue[]) {   // ← rest
  return twMerge(clsx(inputs));
}
cn("p-4", "text-white", isActive && "bg-blue-500");
// inputs reçoit ["p-4", "text-white", false] (ou la string si isActive)
```

---

## 4. Optional chaining `?.` et nullish coalescing `??`

### `?.` — accès sécurisé
```ts
// Au lieu de :
const userId = session && session.user && session.user.id;
// On fait :
const userId = session?.user?.id;
// Si session ou user est null/undefined → renvoie undefined sans crasher

// Sur un appel de fonction :
emblaApi?.scrollPrev();   // appelle seulement si emblaApi existe

// Sur un index :
mediaData.credits?.cast?.slice(0, 10) || [];
```

### `??` — nullish coalescing
```ts
const title = media.title ?? media.name ?? "Titre non disponible";
//   prend title si pas null/undefined, sinon name, sinon le fallback

// Différence avec || :
const count = 0 || 5;   // 5  (0 est falsy)
const count = 0 ?? 5;   // 0  (0 n'est pas nullish)
```
Utilise `??` quand `0` ou `""` sont des valeurs valides.

### Le `!` (non-null assertion)
```ts
const userId = session!.user!.id;   // "je te promets que ce n'est pas null"
```
À **éviter** : ça désactive la sécurité TS. Préférer `?.` ou un check explicite.

---

## 5. Template literals et URL building

```ts
const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
//          ^ backticks, ${} pour interpoler

// Plus propre pour construire des URLs complexes :
const url = new URL("https://api.themoviedb.org/3/discover/movie");
url.searchParams.append("api_key", apiKey);
url.searchParams.append("language", "en-US");
if (withGenres) url.searchParams.append("with_genres", withGenres);
fetch(url.toString());
```
L'API `URL` gère l'encoding pour toi (espaces, caractères spéciaux). Utilisé dans `src/app/api/movies/discoverMovies/route.ts:23`.

---

## 6. TypeScript : types vs interfaces

### `interface`
```ts
interface Genre {
  id: number;
  name: string;
}

interface Media {
  id: number;
  title: string;
  poster_path: string | null;   // union type
  release_date: string;
  genre_ids: number[];          // tableau de number
}
```
Une `interface` décrit la **forme** d'un objet.

### `type` — plus polyvalent
```ts
type Direction = "left" | "right";          // union de littéraux
type ID = string | number;                  // union de types
type User = { id: string; name: string };   // équivalent à interface

// Type utilitaire personnalisé
type Nullable<T> = T | null;
```

**Quand utiliser quoi ?** Dans le projet, on utilise `interface` pour les objets, `type` pour les unions. Les deux sont quasi-interchangeables sur les objets simples.

### Types optionnels et nullables
```ts
interface NavItem {
  icon: LucideIcon;
  name: string;
  href: string;
  isActive?: boolean;        // optionnel : peut être absent
  description: string | null; // doit exister mais peut valoir null
}
```

### Types unions et narrowing
```ts
function format(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();   // ici TS sait que c'est un string
  }
  return value.toFixed(2);        // ici c'est un number
}

// Narrowing par null check
const userId = session?.user?.id;
if (userId) {
  // ici TS sait que userId est string (et pas undefined)
  await prisma.favorite.findUnique({ where: { userId, ... } });
}
```

### Génériques (basique)
```ts
async function getPopularMovies(): Promise<Media[]> { ... }
//                                 ↑ Promise<T> est générique
//                                   T = ce que la Promise résout

useState<Media[]>(initialData);
//        ↑ on dit explicitement le type stocké

const [user, setUser] = useState<User | null>(null);
```

### Types utilitaires courants
```ts
Readonly<User>          // toutes les props deviennent readonly
Partial<User>           // toutes deviennent optionnelles
Pick<User, "id" | "name">    // ne garde que ces props
Omit<User, "password">       // enlève cette prop
```

Utilisé dans le projet :
```ts
// src/app/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) { ... }
```

---

## 7. Exemple décortiqué — `favorites.ts`

```ts
"use server";                                          // ① directive Next : ce fichier ne s'exécute QUE côté serveur

import { MediaType } from "@prisma/client";            // ② enum auto-généré par Prisma
import { z } from "zod";

const favoriteSchema = z.object({                       // ③ schéma Zod
  tmdbId: z.number().int().positive(),
  type: z.nativeEnum(MediaType),                        //    réutilise l'enum Prisma
});

export async function toggleFavoriteAction(             // ④ fonction async exportée
  tmdbId: number,
  type: MediaType,                                      //    paramètres typés
) {
  const parsed = favoriteSchema.safeParse({ tmdbId, type });  // ⑤ validation runtime
  if (!parsed.success) {                                       //    safeParse renvoie {success, data} ou {success, error}
    return { error: "Données invalides." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  //              ↑ await imbriqué : await headers() puis await getSession()
  const userId = session?.user?.id;                     // ⑥ optional chaining

  if (!userId) return { error: "Non autorisé." };

  try {
    const existing = await prisma.favorite.findUnique({ ... });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
    } else {
      await prisma.favorite.create({ data: { userId, tmdbId, type } });
    }
    revalidatePath("/");
    return { success: true };                           // ⑦ retour explicite
  } catch (error) {
    console.error(error);
    return { error: "Erreur interne." };
  }
}
```

Chaque ligne a son rôle. Reviens à ce diagramme si tu sèches.

---

## Exercices

### Exo 1 — Refactor en destructuring
Transforme ce code en utilisant destructuring + optional chaining :
```ts
function displayUser(user) {
  if (user && user.profile && user.profile.name) {
    return user.profile.name.toUpperCase();
  }
  return "Anonyme";
}
```

### Exo 2 — Typer une fonction
Écris la signature TypeScript de cette fonction :
```ts
function fetchTmdb(endpoint, options) {
  // endpoint est toujours une string commençant par "/"
  // options est optionnel et a une clé "cache" ("force-cache" | "no-store")
  // retourne une Promise contenant soit { results: Media[] } soit null
}
```

### Exo 3 — Parallèle vs séquentiel
Dans `src/app/(library)/movies/page.tsx`, on trouve :
```ts
const topRated = await getTopRatedMedia();
const popular = await getPopularMovies();
const discover = await getDiscoverMovies();
const genres = await getMovieGenres();
```
**Question** : ce code est-il optimal ? Réécris-le pour aller plus vite.

### Exo 4 — Narrowing
Ce code ne compile pas. Corrige-le et explique pourquoi :
```ts
function getYear(date: string | null): number {
  return new Date(date).getFullYear();
}
```

### Exo 5 — Comprendre `cn`
Que retourne `cn("p-4", isActive && "bg-blue-500", null, undefined, "text-white")` quand `isActive` vaut `false` puis `true` ?

---

## Corrigés

### Exo 1
```ts
function displayUser(user?: { profile?: { name?: string } }) {
  return user?.profile?.name?.toUpperCase() ?? "Anonyme";
}
```
- `?.` court-circuite la chaîne à la première valeur nullish
- `?? "Anonyme"` ne fournit le fallback **que** si le résultat est `null/undefined` (pas `""`)

### Exo 2
```ts
type Options = { cache?: "force-cache" | "no-store" };
type TmdbResponse = { results: Media[] } | null;

async function fetchTmdb(
  endpoint: `/${string}`,
  options?: Options,
): Promise<TmdbResponse> { ... }
```
- `\`/${string}\`` est un template literal type : impose que ça commence par `/`
- `options?` rend tout l'objet optionnel
- `Promise<T | null>` couvre les deux cas de retour

### Exo 3
```ts
const [topRated, popular, discover, genres] = await Promise.all([
  getTopRatedMedia(),
  getPopularMovies(),
  getDiscoverMovies(),
  getMovieGenres(),
]);
```
Le code original lance les 4 fetchs **en série** (chacun attend le précédent) alors qu'ils sont indépendants. Avec `Promise.all`, ils partent en **parallèle** : si chaque fetch prend 300ms, on passe de 1200ms à 300ms.

### Exo 4
```ts
function getYear(date: string | null): number | null {
  if (!date) return null;
  return new Date(date).getFullYear();
}
```
`new Date(null)` est techniquement légal mais retourne le 1er janvier 1970. TypeScript te force à gérer le cas `null` parce qu'il ne fait pas confiance à JS pour ça.

Variante avec une valeur par défaut :
```ts
function getYear(date: string | null): number {
  return date ? new Date(date).getFullYear() : new Date().getFullYear();
}
```

### Exo 5
```ts
// isActive = false
cn("p-4", false, null, undefined, "text-white")
// clsx ignore false/null/undefined → "p-4 text-white"
// twMerge supprime les conflits Tailwind → "p-4 text-white"

// isActive = true
cn("p-4", "bg-blue-500", null, undefined, "text-white")
// "p-4 bg-blue-500 text-white"
```
`clsx` accepte n'importe quel "truthy" et ignore le reste. `twMerge` résout les conflits genre `p-4 p-6` → garde le dernier. Voir module 10 pour le détail.

---

## Suite

→ [Module 02 — Next.js App Router](./02-nextjs-app-router.md)
