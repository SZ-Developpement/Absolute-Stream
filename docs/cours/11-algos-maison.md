# Module 11 — Algorithmes maison

## Objectifs

- Décortiquer **chaque algo non-trivial** du projet, ligne par ligne
- Comprendre les structures de données utilisées (`Map`, `Set`)
- Expliquer la **formule de luminance** et l'extraction de couleur depuis une image
- Lire et expliquer les patterns de pagination, dédup, filtre

---

## Vue d'ensemble des algos du projet

| Fichier | Algo |
|---|---|
| `src/hooks/useImageColor.ts` | Couleur dominante d'une image (Canvas + moyenne RGB + luminance YIQ) |
| `src/app/(library)/collections/page.tsx` | Dédup avec `Map`, pagination "load more" |
| `src/lib/tmdb.ts` | Crawler de collections (Set + Promise.all + cascade de fetchs) |
| `src/app/(library)/series/page.tsx` | Filtre `isAnime` (combo de tests) |
| `src/components/medias/DiscoverMedia.tsx` | useTransition + URL builder + refresh |
| `src/components/medias/EmblaCarousel.tsx` | Mapping basis-1/N → grid-cols (cf. module 12) |

---

## 1. `useImageColor` — couleur dominante d'une image

```ts
// src/hooks/useImageColor.ts
"use client";
import { useState, useEffect } from "react";

export function useImageColor(src: string | null) {
  const [colors, setColors] = useState({ main: "#0ea5e9", text: "#ffffff" });

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=100`;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let r = 0, g = 0, b = 0;
      const count = imageData.length / 4;

      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const textColor = brightness > 125 ? "#000000" : "#ffffff";

      setColors({ main: hex, text: textColor });
    };

    img.onerror = () => console.error("Impossible de charger l'image");
  }, [src]);

  return colors;
}
```

### Décortication ligne par ligne

#### Le proxy CORS
```ts
img.src = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=100`;
img.crossOrigin = "Anonymous";
```
- TMDB sert les images sans header `Access-Control-Allow-Origin: *`
- Sans header CORS, on **peut** afficher l'image dans une `<img>` mais **on ne peut pas** lire ses pixels via Canvas
- `images.weserv.nl` est un proxy qui ajoute les headers CORS ET redimensionne (`w=100` → 100px de large → analyse rapide)
- `encodeURIComponent` encode l'URL TMDB pour la mettre en query param
- `img.crossOrigin = "Anonymous"` est essentiel pour que le navigateur fasse une vraie requête CORS

#### Création du canvas
```ts
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
if (!ctx) return;

canvas.width = img.width;
canvas.height = img.height;
ctx.drawImage(img, 0, 0);
```
- Crée un canvas **en mémoire** (jamais ajouté au DOM)
- `getContext("2d")` donne accès à l'API de dessin 2D
- On dessine l'image dans le canvas

#### Lire les pixels
```ts
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
```
- `getImageData(x, y, w, h)` retourne un `ImageData` qui contient un `data: Uint8ClampedArray`
- `.data` est un **tableau plat** de bytes : `[R, G, B, A, R, G, B, A, ...]`
- Pour 100×100px → 100*100*4 = 40 000 entrées

#### La moyenne RGB
```ts
let r = 0, g = 0, b = 0;
const count = imageData.length / 4;

for (let i = 0; i < imageData.length; i += 4) {
  r += imageData[i];       // canal Rouge du pixel
  g += imageData[i + 1];   // canal Vert
  b += imageData[i + 2];   // canal Bleu
  // on ignore imageData[i + 3] = canal Alpha
}

r = Math.floor(r / count);
g = Math.floor(g / count);
b = Math.floor(b / count);
```
- On parcourt par pas de 4 (un pixel = 4 bytes)
- On accumule chaque canal
- On divise par le nombre de pixels pour avoir la moyenne
- `Math.floor` pour arrondir (les canaux sont des entiers 0-255)

#### Conversion RGB → hex
```ts
const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
```
Astuce mathématique pour formater en hex avec padding zéros :
- `1 << 24` = `0x1000000` (16 777 216) → bit "1" en position 25
- `r << 16` = `r` décalé de 16 bits → octet de poids fort
- `g << 8` = `g` décalé de 8 bits → octet du milieu
- `+ b` = octet de poids faible
- Total : un nombre où les bits ressemblent à `1RRGGBB` (avec R, G, B en hex)
- `.toString(16)` → chaîne hex genre `"1ff8800"`
- `.slice(1)` → enlève le `1` initial → `"ff8800"` (le `1` garantit que le résultat ait toujours 7 chars donc 6 après slice, même si R=0)
- Préfixé `#` → `"#ff8800"`

C'est plus rapide qu'un `r.toString(16).padStart(2, "0") + g.toString(16)...`.

#### La formule de luminance (YIQ)
```ts
const brightness = (r * 299 + g * 587 + b * 114) / 1000;
const textColor = brightness > 125 ? "#000000" : "#ffffff";
```

C'est la formule de **luminance perçue** issue du modèle YIQ :
- L'œil humain est **plus sensible au vert** (~58.7%), moins au rouge (~29.9%), peu au bleu (~11.4%)
- Pas une simple moyenne `(r+g+b)/3` qui serait moins fidèle à la perception
- Résultat dans 0-255

Choix du seuil 125 :
- Fond clair (brightness > 125) → texte noir lisible
- Fond foncé (brightness ≤ 125) → texte blanc lisible

C'est le même calcul que la **WCAG** utilise (avec d'autres coefficients pour la conformité a11y stricte, mais celui-là est déjà bon).

#### Utilisation dans l'app
```tsx
// src/components/layout/PageBackground.tsx
const src = usePageBackground();
const { main, text } = useImageColor(src);

useEffect(() => {
  if (main) {
    document.documentElement.style.setProperty("--page-main", main);
    document.documentElement.style.setProperty("--page-text", text);
  }
}, [main, text]);
```

→ Les variables CSS `--page-main` et `--page-text` deviennent dynamiques. N'importe quel composant peut écrire `bg-(--page-main)` et le fond changera selon la page.

C'est ce qui permet au bouton "Lancer le Match" d'avoir une couleur qui matche l'image de fond.

---

## 2. Dédup avec `Map` — collections page

```tsx
// src/app/(library)/collections/page.tsx:18-24
setCollections((prev) => {
  const combined = [...prev, ...data];
  const unique = Array.from(
    new Map(combined.map((c) => [c.id, c])).values(),
  );
  return unique;
});
```

### Le pattern
1. **Concat** : `[...prev, ...data]` → fusion des deux tableaux
2. **Mapping en pairs** : `combined.map(c => [c.id, c])` → `[[123, {id: 123, name: "..."}], [456, ...], [123, ...]]`
3. **Map constructor** : `new Map([[k, v], [k, v]])` crée une Map. Si deux entrées ont la même clé, **la dernière l'emporte**
4. **Values** : `.values()` retourne un itérateur des valeurs
5. **Array.from** : convertit l'itérateur en tableau

### Pourquoi pas un Set ?
Un `Set` dédupe par identité d'objet, pas par contenu. `Set.add({id:1})` puis `Set.add({id:1})` te donne 2 éléments (deux objets différents en mémoire).

Pour dédupliquer par **clé**, `Map` est l'outil idiomatique.

### Complexité
- O(n) pour la concat + map
- O(n) pour la construction de Map (hashing)
- O(n) pour `Array.from`
- **Total : O(n)** — beaucoup mieux que `O(n²)` d'un nested loop avec `find`

---

## 3. Crawler de collections — `getCollections`

```ts
// src/lib/tmdb.ts:27-94 (extrait)
export async function getCollections(limit: number = 20) {
  const collectionIds = new Set<number>();
  let moviesProcessed = 0;
  let page = 1;

  while (moviesProcessed < limit) {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 3600 } },
    );
    const data = await response.json();
    const moviesOnThisPage = Math.min(data.results.length, limit - moviesProcessed);

    const movieDetails = await Promise.all(
      data.results.slice(0, moviesOnThisPage).map((movie: TMDBMovie) =>
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}`, {
          next: { revalidate: 86400 },
        })
          .then((res) => res.json())
          .catch(() => null),
      ),
    );

    movieDetails.forEach((movie: TMDBMovie | null) => {
      if (movie?.belongs_to_collection?.id) {
        collectionIds.add(movie.belongs_to_collection.id);
      }
    });

    moviesProcessed += moviesOnThisPage;
    page++;
    if (data.results.length === 0) break;
  }

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

### Stratégie
TMDB n'a pas d'endpoint "donne-moi les collections populaires". Le projet contourne :
1. Récupère les **films populaires** (par pages de 20)
2. Pour chaque film, fetch ses **détails** (qui contient `belongs_to_collection`)
3. Collecte les **IDs uniques** de collections (via `Set`)
4. Fetch les **détails** de chaque collection

### Pourquoi un `Set` ?
Plusieurs films d'une même franchise (Marvel, Harry Potter…) référencent la même collection. Le `Set` évite de fetcher 8× la même collection.

### Boucle while
```ts
while (moviesProcessed < limit) { ... }
```
On continue tant qu'on n'a pas traité assez de films. Note la garde `if (data.results.length === 0) break;` pour éviter une boucle infinie si TMDB renvoie une page vide.

### `Math.min` pour ne pas dépasser
```ts
const moviesOnThisPage = Math.min(data.results.length, limit - moviesProcessed);
```
Si on a déjà traité 15 films et que `limit = 20`, on n'en veut que 5 de plus de cette page, pas les 20.

### Parallélisation
- 20 fetchs de détails en parallèle avec `Promise.all(... .map(...))`
- Erreurs individuelles capturées : `.catch(() => null)` → la chaîne ne casse pas si 1 film est inaccessible

### Type guard final
```ts
return collections.filter((c): c is TMDBCollection => c !== null);
```
Sans le type guard, TS infère `(TMDBCollection | null)[]`. Avec, il accepte `TMDBCollection[]`.

### Coût
Pour `limit = 20` :
- 1 fetch (page de popular)
- 20 fetchs (détails de films) — en parallèle
- ~12 fetchs (collections uniques, supposons 8/20 films sans collection) — en parallèle

= **33 fetchs**, mais avec un cache 1h-24h, l'utilisateur suivant aura tout depuis le cache Next.

---

## 4. Filtre `isAnime` — heuristique simple

```ts
// src/app/(library)/series/page.tsx:14-15
const isAnime = (m: Media) =>
  m.genre_ids?.includes(16) && m.origin_country?.includes("JP");
```

### La logique métier
TMDB ne sépare pas formellement les animes des séries. Pour les distinguer :
- **Genre 16 = "Animation"** (chez TMDB)
- **Origine JP = produit au Japon**

`Animation` seul → on récupérerait Rick & Morty, Bob's Burgers (cartoons US)
`Origine JP` seul → on récupérerait Squid Game (drama coréen ? non, KR. Mais des dramas japonais en live action passeraient)
`Animation && JP` → on cible bien les animes japonais

C'est une **heuristique** : pas parfaite mais suffisante pour 90% des cas. C'est explicitement documenté en commentaire dans le code :
```ts
// On considère qu'un item est un anime s'il est classé "Animation" (genre 16) ET vient du Japon.
// Ça enlève les anime tout en gardant les cartoons occidentaux (Rick & Morty, Bob's Burgers, etc.).
```

### Utilisation
```ts
return (data.results || []).filter((m) => !isAnime(m));
//                                       ↑ on EXCLUT les animes de la page Series
```

Pour la page Animes, l'inverse : on filtre `with_genres=16&with_origin_country=JP` directement dans l'URL TMDB (cf. `src/app/(library)/animes/page.tsx:21`).

---

## 5. Pagination "load more" — collections

```tsx
// src/app/(library)/collections/page.tsx
const [limit, setLimit] = useState(20);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCollections = async () => {
    setLoading(true);
    const res = await fetch(`/api/collections?limit=${limit}`);
    const data = await res.json();
    setCollections((prev) => {
      const combined = [...prev, ...data];
      const unique = Array.from(new Map(combined.map((c) => [c.id, c])).values());
      return unique;
    });
    setLoading(false);
  };
  fetchCollections();
}, [limit]);

const handleLoadMore = () => setLimit((prev) => prev + 20);
```

### Le pattern
- `limit` augmente de 20 à chaque clic
- Le `useEffect` se redéclenche → re-fetch avec le nouveau `limit`
- L'endpoint `/api/collections` retourne **toutes** les collections jusqu'à `limit` (pas seulement les 20 nouvelles)
- La dédup `Map` gère les doublons (la nouvelle réponse contient les anciennes + nouvelles)

### Discussion
**Avantage** : simple, le backend ne change pas, la dédup fait le travail.

**Inconvénient** : on re-fetch des données déjà reçues. Pour 100 collections, le fetch retourne 100 items même si on n'en veut que 20 nouveaux.

**Alternative** :
```ts
const res = await fetch(`/api/collections?offset=${offset}&limit=20`);
```
Plus efficace mais demande de gérer offset/limit côté serveur.

---

## 6. Patterns transverses à retenir

### Dédup
- **Par id** → `new Map(items.map(i => [i.id, i]))` puis `Array.from(map.values())`
- **Par identité d'objet** → `new Set(items)`
- **Filter unique** → `items.filter((v, i, a) => a.indexOf(v) === i)` (O(n²), à éviter sur grands tableaux)

### Parallélisation
- **N appels indépendants** → `Promise.all([...])`
- **N appels avec gestion d'erreur individuelle** → `.catch(() => null)` sur chacun
- **Avec timeout** → `Promise.race([fetch(...), new Promise(r => setTimeout(r, 5000))])`

### Type guards
```ts
function isMedia(x: unknown): x is Media {
  return typeof x === "object" && x !== null && "tmdbId" in x;
}
// Permet à TS d'affiner le type après le guard
```

---

## Exercices

### Exo 1 — Améliorer la moyenne RGB
Le code actuel fait la moyenne de **tous** les pixels. Mais une moyenne d'une image très colorée peut donner un gris terne. Imagine une amélioration : **moyenne pondérée** qui ignore les pixels presque-noirs/presque-blancs (les bords noirs, le ciel blanc). Pseudo-code suffit.

### Exo 2 — Dédup par plusieurs clés
Tu as `[{userId: 1, tmdbId: 5}, {userId: 1, tmdbId: 7}, {userId: 1, tmdbId: 5}]`. Dédupe par la combinaison `(userId, tmdbId)`.

### Exo 3 — Détection de match
Dans le projet, la détection d'un match (2 users qui ont liké le même film) n'est pas implémentée en code. Écris la fonction :
```ts
async function detectMatch(sessionId: string): Promise<number[]>
// retourne les tmdbId qui ont 2 LIKE distincts dans la session
```
(Indice : groupBy Prisma, vu au module 8.)

### Exo 4 — Color picker basique
Écris une fonction `mostCommonColor(pixels: Uint8ClampedArray): string` qui retourne la couleur **la plus fréquente** (pas la moyenne) parmi les pixels.
Indice : bucketize les couleurs (réduire la précision à 32 niveaux par canal pour éviter d'avoir 16M de buckets).

### Exo 5 — Comprendre le hex
Que retourne `((1 << 24) + (255 << 16) + (0 << 8) + 0).toString(16).slice(1)` ?

---

## Corrigés

### Exo 1
```ts
let r = 0, g = 0, b = 0, count = 0;
for (let i = 0; i < imageData.length; i += 4) {
  const pr = imageData[i], pg = imageData[i + 1], pb = imageData[i + 2];
  const brightness = (pr * 299 + pg * 587 + pb * 114) / 1000;
  if (brightness < 30 || brightness > 225) continue;   // skip extremes
  r += pr; g += pg; b += pb; count++;
}
r = Math.floor(r / count);
// ... etc.
```
Si tous les pixels sont filtrés (cas extrême), `count = 0` → division par zéro → garde le fallback :
```ts
if (count === 0) { /* utilise les anciens r,g,b moyens */ }
```

### Exo 2
```ts
const items = [{userId: 1, tmdbId: 5}, {userId: 1, tmdbId: 7}, {userId: 1, tmdbId: 5}];
const key = (x: typeof items[0]) => `${x.userId}-${x.tmdbId}`;
const unique = Array.from(new Map(items.map(i => [key(i), i])).values());
// → [{userId: 1, tmdbId: 5}, {userId: 1, tmdbId: 7}]
```

### Exo 3
```ts
async function detectMatch(sessionId: string): Promise<number[]> {
  const grouped = await prisma.swipe.groupBy({
    by: ["tmdbId"],
    where: { sessionId, type: "LIKE" },
    _count: { userId: true },
    having: { userId: { _count: { equals: 2 } } },
  });
  return grouped.map(g => g.tmdbId);
}
```
Grâce au `@@unique([sessionId, userId, tmdbId])`, on est sûr que `_count: 2` = 2 users distincts.

### Exo 4
```ts
function mostCommonColor(pixels: Uint8ClampedArray): string {
  const buckets = new Map<string, number>();
  for (let i = 0; i < pixels.length; i += 4) {
    // Réduit chaque canal à 32 niveaux (5 bits) → 32^3 = 32 768 buckets max
    const r = pixels[i] >> 3;
    const g = pixels[i + 1] >> 3;
    const b = pixels[i + 2] >> 3;
    const key = `${r},${g},${b}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  // Trouve la clé avec le plus grand count
  let bestKey = "0,0,0";
  let bestCount = 0;
  for (const [key, count] of buckets) {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  }

  const [r, g, b] = bestKey.split(",").map(n => parseInt(n) << 3);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
```
- `>> 3` divise par 8 (5 bits gardés sur 8) → 32 niveaux par canal
- On reverse avec `<< 3` à la fin pour reconstruire une couleur "complète"

### Exo 5
- `1 << 24` = `16777216` (binaire : `1` suivi de 24 zéros)
- `255 << 16` = `16711680` (binaire : `11111111` puis 16 zéros)
- `0 << 8` = `0`
- `0` = `0`
- Somme : `16777216 + 16711680 = 33488896`
- En hex : `33488896.toString(16)` = `"1ff0000"`
- `.slice(1)` = `"ff0000"`
- C'est le **rouge pur** : R=255, G=0, B=0 → `#ff0000` ✓

---

## Suite

→ [Module 12 — Embla Carousel et grille responsive](./12-embla-carousel.md)
