# Module 04 — React 19 avancé : Server Actions, `useTransition`, `useOptimistic`

## Objectifs

- Comprendre les **Server Actions** et la directive `"use server"`
- Maîtriser `useTransition` pour des UI non-bloquantes
- Maîtriser `useOptimistic` pour des UI instantanées
- Lire et expliquer `FavoriteButton.tsx` et `DiscoverMedia.tsx` ligne par ligne

---

## 1. Server Actions

Une **Server Action** est une fonction qui :
- S'exécute **uniquement côté serveur**
- Peut être appelée **directement depuis un Client Component**
- Marquée par la directive `"use server"`

C'est l'équivalent d'un `fetch("/api/...")` mais en plus typé, plus simple, et sans avoir à écrire de Route Handler.

### Deux façons de les déclarer

**A. Inline dans un Server Component** :
```tsx
export default function Page() {
  async function increment(formData: FormData) {
    "use server";
    // code serveur
  }
  return <form action={increment}>...</form>;
}
```

**B. Dans un fichier dédié** (le pattern du projet) :
```ts
// src/actions/favorites.ts
"use server";

export async function toggleFavoriteAction(tmdbId: number, type: MediaType) {
  // ...
}
```
Le `"use server"` en tête du fichier déclare **toutes** les fonctions exportées comme Server Actions.

### Appel depuis un Client Component
```tsx
"use client";
import { toggleFavoriteAction } from "@/actions/favorites";

export default function FavoriteButton({ tmdbId, type }) {
  const handleAction = async () => {
    const result = await toggleFavoriteAction(tmdbId, type);
    // ...
  };
  return <button onClick={handleAction}>...</button>;
}
```

### Comment ça marche sous le capot
Quand tu importes une Server Action côté client, **le code n'est pas envoyé au navigateur**. Next remplace l'import par un proxy qui fait un POST HTTP vers le serveur, qui exécute la fonction et te renvoie le résultat. Tu peux le voir dans l'onglet Réseau du devtools.

### Sécurité — point crucial
Une Server Action peut être appelée par n'importe qui (n'importe quel utilisateur, ou même un script externe). **Tu DOIS vérifier la session et valider les entrées à chaque appel**.

Regarde `src/actions/favorites.ts` :
```ts
// 1. Validation Zod
const parsed = favoriteSchema.safeParse({ tmdbId, type });
if (!parsed.success) return { error: "Données invalides." };

// 2. Vérification d'authentification
const session = await auth.api.getSession({ headers: await headers() });
const userId = session?.user?.id;
if (!userId) return { error: "Non autorisé." };

// 3. Seulement alors, opération en BDD
await prisma.favorite.create({ ... });
```

Ne fais **jamais** confiance aux paramètres entrants même s'ils viennent de "ton" front. Quelqu'un peut envoyer n'importe quoi.

### Retour structuré
Pattern habituel : `return { success: true }` ou `return { error: "..." }`. Le caller fait :
```tsx
const result = await myAction(...);
if (result?.error) { /* afficher l'erreur */ }
```

### `revalidatePath` — invalider le cache
```ts
import { revalidatePath } from "next/cache";

revalidatePath("/");      // efface le cache pour /
revalidatePath("/movies", "layout");   // efface + tous les enfants
```
Après une mutation (create/update/delete), tu veux probablement que les Server Components affectés se re-render avec les nouvelles données. `revalidatePath` invalide le cache associé.

---

## 2. `useTransition` — séparer les mises à jour urgentes / non-urgentes

```tsx
const [isPending, startTransition] = useTransition();

startTransition(() => {
  // état mis à jour de manière "non-urgente"
  setFilter(newFilter);
});
```

Imagine : l'utilisateur tape dans un champ. Tu veux que la frappe reste fluide même si une grosse liste se filtre derrière. **`useTransition`** dit à React : "ce changement n'est pas critique, tu peux l'interrompre si quelque chose de plus urgent (comme un clic) arrive".

### `isPending`
Vaut `true` pendant que React traite la transition. Tu l'utilises pour afficher un état de "chargement doux" :
```tsx
<div className={isPending ? "opacity-50" : "opacity-100"}>
```

### Dans le projet — `DiscoverMedia`
```tsx
// src/components/medias/DiscoverMedia.tsx:27
const [isPending, startTransition] = useTransition();

useEffect(() => {
  // ...
  startTransition(async () => {                  // ← démarre une transition
    const res = await fetch(`${fetchEndpoint}?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setMedias(data.results || []);
    }
  });
}, [selectedGenre, sortBy, fetchEndpoint]);
```

```tsx
<div className={`grid grid-cols-... transition-opacity duration-300 ${
  isPending ? "opacity-50 pointer-events-none" : "opacity-100"
}`}>
```

Effet visible : quand l'utilisateur change un filtre, la grille devient semi-transparente pendant le fetch, puis se met à jour avec les nouveaux médias. C'est plus doux qu'un spinner.

### `useTransition` dans `FavoriteButton`
```tsx
// src/components/medias/FavoriteButton.tsx:18
const [isPending, startTransition] = useTransition();

const handleAction = () => {
  startTransition(async () => {
    toggleOptimisticFavorite(optimisticIsFavorite);   // optimiste
    const result = await toggleFavoriteAction(tmdbId, type);
    if (result?.error) console.error(result.error);
  });
};
```

Avantage ici : `isPending` désactive le bouton pendant la requête (`disabled={isPending}`), évitant les double-clics.

---

## 3. `useOptimistic` — UI optimiste

```tsx
const [optimisticValue, addOptimistic] = useOptimistic(
  realValue,                  // valeur "officielle"
  (current, next) => next,    // comment calculer l'optimiste
);
```

L'idée : tu mets à jour l'UI **avant** la confirmation du serveur. Si le serveur répond OK, parfait. Si erreur, l'UI **se rollback automatiquement** à la valeur réelle.

### Anatomie
1. Tu déclares `useOptimistic` avec ta valeur réelle et un reducer
2. Tu appelles le setter optimiste dans une **transition** (`startTransition`)
3. À la fin de la transition, React compare optimiste vs réel et réconcilie

### Le `FavoriteButton`
```tsx
// src/components/medias/FavoriteButton.tsx:21-24
const [optimisticIsFavorite, toggleOptimisticFavorite] = useOptimistic(
  initialIsFavorite,
  (currentState) => !currentState,    // ← inverse l'état actuel
);

const handleAction = () => {
  startTransition(async () => {
    toggleOptimisticFavorite(optimisticIsFavorite);   // ① UI instant
    const result = await toggleFavoriteAction(tmdbId, type);   // ② serveur
    if (result?.error) console.error(result.error);            // ③ rollback auto si erreur
  });
};

return (
  <form action={handleAction}>
    <button type="submit" disabled={isPending}>
      {optimisticIsFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    </button>
  </form>
);
```

**Décortication ligne par ligne** :
- L22 : `useOptimistic(initialIsFavorite, ...)` → on dit "voilà ma vraie valeur initiale"
- L23 : le reducer prend le current et retourne le nouveau → ici inversion booléenne
- L29 : on déclenche l'optimiste **dans** la transition. React mémorise "le user veut basculer"
- L31 : l'action serveur s'exécute. Pendant ce temps, `optimisticIsFavorite` est déjà mis à jour
- L34 : si erreur, `optimisticIsFavorite` revient à `initialIsFavorite` automatiquement
- Si succès **+** `revalidatePath` côté serveur, `initialIsFavorite` est re-fetchée avec la nouvelle valeur → cohérent

### Pourquoi utiliser `useOptimistic` ?
- **Perçu instantané** : le user voit la réaction immédiate
- **Robuste** : le rollback est gratuit
- **Pas de state intermédiaire** à gérer manuellement

C'est un game-changer pour les interactions courtes (like, follow, toggle).

---

## 4. `<form action={...}>` — la voie React 19

```tsx
<form action={handleAction}>
  <button type="submit">...</button>
</form>
```

Au lieu de `onSubmit={...}`, React 19 préfère `<form action={...}>` qui :
- Marche **sans JavaScript** (progressive enhancement)
- Gère automatiquement l'état "submitting" via `useFormStatus`
- S'intègre nativement avec les Server Actions

Tu peux passer :
- Une **Server Action** : `<form action={mySAction}>` → POST direct vers le serveur
- Une **fonction normale** (client) : reçoit `(formData: FormData)` en argument

Dans `FavoriteButton`, on passe une fonction qui orchestre l'optimiste + l'appel d'action :
```tsx
<form action={handleAction}>
```
On n'utilise pas directement la Server Action comme `action` parce qu'on veut **wrapper** avec l'optimiste et `useTransition`.

---

## 5. Pattern complet — décortication de `FavoriteButton`

```tsx
"use client";

import { useTransition, useOptimistic } from "react";
import { toggleFavoriteAction } from "@/actions/favorites";
import { MediaType } from "@prisma/client";

interface FavoriteButtonProps {
  tmdbId: number;
  type: MediaType;
  initialIsFavorite: boolean;
}

export default function FavoriteButton({
  tmdbId,
  type,
  initialIsFavorite,
}: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticIsFavorite, toggleOptimisticFavorite] = useOptimistic(
    initialIsFavorite,
    (currentState) => !currentState,
  );

  const handleAction = () => {
    startTransition(async () => {
      toggleOptimisticFavorite(optimisticIsFavorite);
      const result = await toggleFavoriteAction(tmdbId, type);
      if (result?.error) {
        console.error(result.error);
      }
    });
  };

  return (
    <form action={handleAction}>
      <button
        type="submit"
        disabled={isPending}
        className="p-2 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
      >
        {optimisticIsFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </button>
    </form>
  );
}
```

**Pourquoi cette architecture ?**
1. **Initialement**, le composant reçoit `initialIsFavorite` calculé côté serveur (RSC) → état correct au premier render
2. Au clic, **l'UI bascule immédiatement** grâce à l'optimiste (l22-24)
3. La Server Action vérifie l'auth + la BDD côté serveur
4. Si erreur, l'UI revient à l'état correct sans qu'on ait à coder le rollback
5. `revalidatePath("/")` dans l'action invalide le cache → au prochain render RSC, `initialIsFavorite` sera bonne

C'est **bulletproof** : aucune désynchro possible entre UI et BDD.

---

## 6. Pièges à éviter

### ❌ Modifier le state directement dans une transition
```tsx
startTransition(() => {
  setUser(newUser);   // OK
  user = newUser;     // ❌ pas du tout
});
```

### ❌ Mettre à jour un state hors transition après un await
```tsx
startTransition(async () => {
  await fetch(...);
  setData(...);   // ⚠️ hors de la transition une fois après await
});
```
En React 19, ça reste OK techniquement, mais l'idée est que tout ce qui doit être "non urgent" soit dans la transition.

### ❌ Oublier la sécurité dans la Server Action
Ne te fie **jamais** au front pour la validation. Toujours :
1. Zod parse les inputs
2. Vérifier la session
3. Vérifier les permissions (l'user a-t-il le droit ?)

### ❌ Bloquer le user pendant l'optimiste
Si tu mets l'UI en `disabled` direct sans `isPending`, l'utilisateur ne profite pas de l'effet optimiste. Le bouton doit rester actif (sauf si tu veux explicitement empêcher les doubles clics → mais pour un toggle, c'est OK).

---

## Exercices

### Exo 1 — Convertir un fetch en Server Action
Voici un Route Handler :
```ts
// src/app/api/posts/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json();
  await prisma.post.create({ data: body });
  return NextResponse.json({ ok: true });
}
```
Et le client :
```ts
await fetch("/api/posts", { method: "POST", body: JSON.stringify(post) });
```
Réécris ça en Server Action, avec validation Zod et vérification de session.

### Exo 2 — Bouton "follow" optimiste
Écris un `<FollowButton userId="..." initialIsFollowing={false} />` qui suit le pattern de `FavoriteButton`. Tu peux supposer qu'il existe une `toggleFollowAction`.

### Exo 3 — Filtre avec `useTransition`
Voici un composant naïf :
```tsx
"use client";
function ListFilter({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter(i => i.name.includes(query));
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(i => <li key={i.id}>{i.name}</li>)}</ul>
    </>
  );
}
```
Si `items` contient 10 000 éléments, l'input "freeze". Refactor avec `useTransition` pour garder l'input fluide.

### Exo 4 — Identifier le bug
```tsx
const [count, setCount] = useState(0);
const [optimisticCount, setOptimistic] = useOptimistic(count, (c, n: number) => n);

const handleClick = () => {
  setOptimistic(count + 1);
  // ... appel serveur ...
  setCount(count + 1);
};
```
Qu'est-ce qui ne va pas ?

### Exo 5 — Pourquoi `revalidatePath` ?
Si on enlève `revalidatePath("/")` dans `favorites.ts`, que se passe-t-il ? Décris le scénario précis.

---

## Corrigés

### Exo 1
```ts
// src/actions/posts.ts
"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export async function createPost(input: { title: string; content: string }) {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: "Données invalides" };

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return { error: "Non autorisé" };

  try {
    await prisma.post.create({ data: { ...parsed.data, userId } });
    revalidatePath("/posts");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Erreur serveur" };
  }
}
```
Côté client :
```tsx
import { createPost } from "@/actions/posts";
const res = await createPost({ title, content });
if (res.error) showError(res.error);
```

### Exo 2
```tsx
"use client";
import { useTransition, useOptimistic } from "react";
import { toggleFollowAction } from "@/actions/follows";

interface Props { userId: string; initialIsFollowing: boolean }

export default function FollowButton({ userId, initialIsFollowing }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isFollowing, toggle] = useOptimistic(
    initialIsFollowing,
    (curr) => !curr,
  );

  const handleAction = () => {
    startTransition(async () => {
      toggle(isFollowing);
      const res = await toggleFollowAction(userId);
      if (res?.error) console.error(res.error);
    });
  };

  return (
    <form action={handleAction}>
      <button type="submit" disabled={isPending}>
        {isFollowing ? "Se désabonner" : "Suivre"}
      </button>
    </form>
  );
}
```

### Exo 3
```tsx
"use client";
import { useState, useTransition, useMemo } from "react";

function ListFilter({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferred] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);   // urgent : input répond
    startTransition(() => {
      setDeferred(e.target.value);   // non-urgent : filtre
    });
  };

  const filtered = useMemo(
    () => items.filter(i => i.name.includes(deferredQuery)),
    [items, deferredQuery],
  );

  return (
    <>
      <input value={query} onChange={handleChange} />
      <ul className={isPending ? "opacity-50" : ""}>
        {filtered.map(i => <li key={i.id}>{i.name}</li>)}
      </ul>
    </>
  );
}
```
- `query` se met à jour synchroniquement → l'input reste fluide
- `deferredQuery` se met à jour dans une transition → React peut interrompre le filtre si une nouvelle frappe arrive
- `useMemo` évite de re-filtrer si rien n'a changé

Plus simple avec `useDeferredValue` (équivalent natif), mais c'est le même principe.

### Exo 4
Bug : `setCount(count + 1)` est exécuté **avant** que la valeur du serveur ne soit confirmée. Ça contourne tout le bénéfice de `useOptimistic` (qui justement gère ce timing automatiquement).

**Correction** : ne touche jamais au `count` "réel" depuis le client. La vraie source de vérité doit venir du serveur (via revalidation ou refetch). Le pattern correct :
```tsx
const handleClick = () => {
  startTransition(async () => {
    setOptimistic(count + 1);             // UI instant
    const res = await incrementOnServer();
    if (res.error) console.error(res.error);
    // count se met à jour automatiquement via revalidatePath
  });
};
```

### Exo 5
Sans `revalidatePath("/")` :
- L'utilisateur clique sur "Ajouter aux favoris"
- L'optimiste passe à `true` immédiatement (UI OK)
- L'action serveur écrit en BDD
- **Mais** le cache des Server Components n'est pas invalidé
- À la prochaine navigation ou refresh, le RSC `[type]/[id]/page.tsx` peut renvoyer **l'ancienne** valeur de `initialIsFavorite` (depuis le cache)
- Quand `FavoriteButton` reçoit cette ancienne prop, son `useOptimistic` se "réinitialise" à `false`
- L'utilisateur voit son favori "disparaître" alors qu'il est bien en BDD

`revalidatePath("/")` force Next à re-fetch les données la prochaine fois → le `initialIsFavorite` sera bien `true`.

---

## Suite

→ [Module 05 — Tailwind CSS v4](./05-tailwind-v4.md)
