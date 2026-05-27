# Module 09 — Server Actions, validation Zod, le cycle complet d'une mutation

## Objectifs

- Maîtriser la **chaîne complète** d'une mutation : UI → action → validation → auth → BDD → revalidation → UI
- Écrire un schéma Zod et l'utiliser correctement (`safeParse`, `parse`, `infer`)
- Décortiquer `toggleFavoriteAction` ligne par ligne (encore)
- Comprendre `revalidatePath`, `revalidateTag`, `redirect` depuis une action

---

## 1. Schéma typique d'une mutation

```
[Click utilisateur]
       ↓
[Composant Client] ──── appel direct ────→ [Server Action]
       ↓                                          ↓
[useOptimistic update UI]                  [Zod safeParse]
                                                  ↓
                                           [auth.api.getSession]
                                                  ↓
                                           [Prisma queries]
                                                  ↓
                                           [revalidatePath]
                                                  ↓
                                       [return { success | error }]
       ↓                                          ↓
[Si error : rollback auto]                ←──── retour HTTP
[Si success : revalidation auto]
```

À chaque étape, on a une **responsabilité claire** :
- UI : afficher l'optimiste + appeler l'action
- Action : valider, auth, muter, invalider
- Retour structuré pour permettre au client de réagir

---

## 2. Zod en 5 minutes

[Zod](https://zod.dev/) est une bibliothèque de validation runtime. Elle crée des schémas qui :
- **Valident** les données entrantes
- **Inférent** un type TypeScript

```ts
import { z } from "zod";

// Définition
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

// Validation runtime
const result = userSchema.safeParse(input);
if (!result.success) {
  console.error(result.error.flatten());
} else {
  // result.data est typé { email: string, age: number, role?: "USER" | "ADMIN" }
  console.log(result.data);
}

// Inférer un type TS depuis le schéma
type User = z.infer<typeof userSchema>;
// = { email: string; age: number; role?: "USER" | "ADMIN" }
```

### Les méthodes principales

| Méthode | Effet |
|---|---|
| `z.string()` | string |
| `z.number()` | number |
| `z.boolean()` | boolean |
| `z.literal("foo")` | string littérale "foo" |
| `z.enum(["A","B"])` | union de littéraux |
| `z.nativeEnum(MyEnum)` | utilise un enum TS existant |
| `z.array(z.string())` | string[] |
| `z.object({ ... })` | objet |
| `.optional()` | rend le champ optionnel |
| `.nullable()` | autorise null |
| `.default(val)` | valeur par défaut |
| `.min(n)`, `.max(n)` | min/max (chaîne ou nombre) |
| `.email()`, `.url()`, `.uuid()` | validations string spécifiques |

### `parse` vs `safeParse`
- `parse(input)` → throw si invalide. À utiliser quand tu sais que l'input est OK.
- `safeParse(input)` → retourne `{ success, data }` ou `{ success, error }`. Recommandé.

---

## 3. Anatomie de `toggleFavoriteAction`

```ts
// src/actions/favorites.ts
"use server";                                                  // ① Directive Server Action

import { MediaType } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ② Schéma Zod : on accepte un tmdbId positif et un MediaType valide
const favoriteSchema = z.object({
  tmdbId: z.number().int().positive("L'ID doit être positif"),
  type: z.nativeEnum(MediaType),
});

// ③ Fonction async exportée — appelable depuis n'importe quel Client Component
export async function toggleFavoriteAction(tmdbId: number, type: MediaType) {

  // ④ Validation runtime
  const parsed = favoriteSchema.safeParse({ tmdbId, type });
  if (!parsed.success) {
    return { error: "Données invalides." };
  }

  // ⑤ Récupération de la session côté serveur via cookie
  const session = await auth.api.getSession({
    headers: await headers(),                                  // headers() de Next 16 est async
  });

  const userId = session?.user?.id;
  if (!userId) {
    return { error: "Non autorisé. Veuillez vous connecter." };
  }

  try {
    // ⑥ Lecture : le favori existe-t-il déjà ?
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_tmdbId_type: {
          userId,
          tmdbId: parsed.data.tmdbId,
          type: parsed.data.type,
        },
      },
    });

    // ⑦ Toggle : delete si existe, create sinon
    if (existingFavorite) {
      await prisma.favorite.delete({ where: { id: existingFavorite.id } });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          tmdbId: parsed.data.tmdbId,
          type: parsed.data.type,
        },
      });
    }

    // ⑧ Invalider le cache pour que la prochaine requête RSC ait les bonnes données
    revalidatePath("/");

    // ⑨ Retour explicite
    return { success: true };
  } catch (error) {
    console.error("Erreur BDD (toggleFavorite):", error);
    return { error: "Erreur interne du serveur." };
  }
}
```

### Pourquoi chaque étape ?
- ① **`"use server"`** : sans cette directive, le code serait considéré comme isomorphe et pourrait fuiter côté client (avec ta logique BDD, ce serait catastrophique)
- ② **Schéma typé** : la validation tient même si TS est désactivé (Zod fait la validation **runtime**, TS ne fait que de la statique)
- ③ Les **paramètres TS** servent de garde à la compilation, mais l'attaque vient toujours du runtime
- ④ **safeParse** : on n'utilise pas `parse` pour éviter de propager une exception qui sortirait du contrôle
- ⑤ **`await headers()`** : Next 16 a rendu cette fonction async, c'est piégeux
- ⑥ **`findUnique`** : profite de l'index unique `@@unique([userId, tmdbId, type])`
- ⑦ **Toggle simple** : pas atomique (mais OK ici, les contentions sont rares)
- ⑧ **`revalidatePath("/")`** : invalide le cache de la home (et tous les enfants ?). En vrai, ici on devrait peut-être faire `revalidatePath("/movies", "layout")` ou `revalidatePath(\`/movies/${tmdbId}\`)` selon ce qu'on veut rafraîchir.
- ⑨ **Pas d'exception** : on retourne un objet, c'est plus simple à gérer côté client

---

## 4. Le pattern `{ success } | { error }`

```ts
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
```

Le code du projet renvoie `{ success: true } | { error: string }` (les deux variants n'ont pas la même clé). Côté client :
```tsx
const result = await myAction(...);
if (result?.error) {
  showError(result.error);
} else {
  // succès
}
```

**Pourquoi pas des exceptions ?**
- Les exceptions traversent les frontières serveur/client de manière confuse (Next sérialise mal certaines)
- Un retour structuré est typé et explicite
- C'est plus facile à tester

---

## 5. Validation côté client vs serveur

Le projet **ne valide pas** côté client avant l'appel. C'est OK ici car :
- Le `tmdbId` vient d'une donnée serveur (rendu par RSC)
- Le `type` est statique (`MOVIE` ou `TV_SHOW`)
- Pas de champ texte libre

Mais pour des inputs utilisateur (formulaires, recherche…), tu peux vouloir :
- **Valider côté client** pour donner du feedback instantané
- **Re-valider côté serveur** **toujours** (le client peut être trompé/contourné)

Pattern avec le même schéma des deux côtés :
```ts
// src/lib/schemas/review.ts
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  content: z.string().max(5000).optional(),
});

// Client : validation en temps réel
const result = reviewSchema.safeParse(formValues);
if (!result.success) showError(result.error.format());

// Server : re-validation
const parsed = reviewSchema.safeParse(input);
if (!parsed.success) return { error: "invalide" };
```

---

## 6. `revalidatePath`, `revalidateTag`, `redirect`

### `revalidatePath(path, type?)`
```ts
revalidatePath("/movies");                   // invalide juste cette page
revalidatePath("/movies", "layout");         // invalide la page + tout son sous-arbre
revalidatePath("/movies/[id]", "page");      // pattern dynamique
```
Après ça, le prochain accès re-fetchera tout (ou utilisera la stratégie de cache configurée).

### `revalidateTag(tag)`
Si tu as fetché avec un tag :
```ts
fetch(url, { next: { tags: ["movies"] } });
// ...
revalidateTag("movies");   // invalide toutes les data tagged "movies"
```
Plus fin que `revalidatePath` (n'impose pas de connaître les routes affectées).

### `redirect(path)`
```ts
import { redirect } from "next/navigation";

if (!session) redirect("/login");
```
Lance en interne une exception spéciale qui interrompt l'exécution et déclenche la redirection. **Ne mets pas de code après**.

---

## 7. Server Action avec `FormData`

Si tu attaches une action directement à un `<form action={...}>`, elle reçoit un `FormData` :
```tsx
<form action={createPost}>
  <input name="title" />
  <textarea name="content" />
  <button type="submit">Publier</button>
</form>
```

```ts
"use server";
export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  // validation, auth, save…
}
```

**Avantages** :
- Marche sans JavaScript (progressive enhancement)
- Pas besoin de gérer un state pour chaque champ

**Inconvénients** :
- Pas de typage automatique (tu dois caster)
- Moins flexible pour les UI complexes

Le projet utilise plutôt la voie **fonction avec arguments typés** (`tmdbId: number, type: MediaType`). C'est plus type-safe.

---

## 8. Gestion des erreurs : pattern complet

```ts
"use server";

import { z } from "zod";

const inputSchema = z.object({ ... });

export async function myAction(input: z.infer<typeof inputSchema>) {
  // 1. Validation
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };  // détaillé par champ
  }

  // 2. Auth
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Non autorisé" };

  // 3. Permissions (exemple : vérifier qu'on est owner)
  const item = await prisma.item.findUnique({ where: { id: parsed.data.id } });
  if (!item || item.ownerId !== session.user.id) {
    return { error: "Interdit" };
  }

  // 4. Mutation
  try {
    await prisma.item.update({ where: { id: item.id }, data: { ... } });
    revalidatePath("/items");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Erreur serveur" };
  }
}
```

**Ordre important** : validation → auth → permissions → mutation. Ne jamais sauter une étape.

---

## 9. Logging et observabilité

```ts
catch (error) {
  console.error("Erreur BDD (toggleFavorite):", error);
  return { error: "Erreur interne du serveur." };
}
```

Bonnes pratiques :
- Logger **côté serveur uniquement** (`console.error` en prod = capté par Vercel/Datadog)
- **Ne pas exposer** les détails d'erreur au client (info disclosure)
- Préfixer avec le nom de l'action pour faciliter le debug

---

## 10. Tests de Server Actions

Tu peux les tester en les important directement dans Vitest/Jest :
```ts
import { toggleFavoriteAction } from "@/actions/favorites";

test("retourne une erreur si l'user n'est pas connecté", async () => {
  // mock headers() pour ne pas avoir de session
  const result = await toggleFavoriteAction(123, "MOVIE");
  expect(result).toEqual({ error: "Non autorisé. Veuillez vous connecter." });
});
```
Pas de tests dans le projet pour l'instant, mais c'est ce qu'on ferait.

---

## Exercices

### Exo 1 — Schéma Zod
Écris un schéma `signupSchema` qui valide :
- `email` : string, format email
- `password` : string, au moins 8 caractères, avec au moins 1 chiffre
- `name` : string, 2-50 caractères
- `birthYear` (optionnel) : nombre entre 1900 et l'année actuelle

### Exo 2 — Compléter une action
Voici une action incomplète. Ajoute la validation, l'auth, la gestion d'erreur :
```ts
"use server";
export async function setLibraryStatus(
  tmdbId: number,
  type: MediaType,
  status: MediaStatus,
) {
  await prisma.library.upsert({
    where: { userId_tmdbId_type: { userId, tmdbId, type } },
    create: { userId, tmdbId, type, status },
    update: { status },
  });
}
```

### Exo 3 — Erreur côté client
Comment gérer un retour `{ error: string }` côté client pour l'afficher proprement ? Écris un exemple avec un toast (tu peux utiliser un simple `alert` ou un state).

### Exo 4 — Le bug Discover
La Server Action `revalidatePath("/")` invalide la home. Si l'user ajoute un favori depuis `/movies/123`, et navigue ensuite vers `/movies`, le badge "favori" sera-t-il à jour ? Réponds et propose la correction.

### Exo 5 — Pourquoi pas un Route Handler ?
Récris `toggleFavoriteAction` comme un Route Handler `POST /api/favorites`. Compare les deux approches.

---

## Corrigés

### Exo 1
```ts
import { z } from "zod";

const currentYear = new Date().getFullYear();

const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string()
    .min(8, "Minimum 8 caractères")
    .regex(/\d/, "Doit contenir au moins un chiffre"),
  name: z.string().min(2).max(50),
  birthYear: z.number().int().min(1900).max(currentYear).optional(),
});

type Signup = z.infer<typeof signupSchema>;
```

### Exo 2
```ts
"use server";

import { z } from "zod";
import { MediaType, MediaStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const schema = z.object({
  tmdbId: z.number().int().positive(),
  type: z.nativeEnum(MediaType),
  status: z.nativeEnum(MediaStatus),
});

export async function setLibraryStatus(
  tmdbId: number,
  type: MediaType,
  status: MediaStatus,
) {
  const parsed = schema.safeParse({ tmdbId, type, status });
  if (!parsed.success) return { error: "Données invalides" };

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return { error: "Non autorisé" };

  try {
    await prisma.library.upsert({
      where: { userId_tmdbId_type: { userId, tmdbId: parsed.data.tmdbId, type: parsed.data.type } },
      create: { userId, ...parsed.data },
      update: { status: parsed.data.status },
    });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("setLibraryStatus:", e);
    return { error: "Erreur serveur" };
  }
}
```

### Exo 3
```tsx
"use client";
import { useState } from "react";

function MyButton() {
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    const result = await myAction(...);
    if (result?.error) {
      setError(result.error);
      setTimeout(() => setError(null), 5000);   // auto-dismiss après 5s
    }
  };

  return (
    <>
      <button onClick={handleClick}>Action</button>
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded">
          {error}
        </div>
      )}
    </>
  );
}
```
Avec une lib de toast (`sonner`, `react-hot-toast`) :
```tsx
import { toast } from "sonner";
if (result?.error) toast.error(result.error);
```

### Exo 4
**Réponse** : oui, le badge devrait être à jour parce que `revalidatePath("/")` invalide **toute** la route home et ses enfants… mais **ça dépend du paramètre `type`** :
- `revalidatePath("/")` sans 2ᵉ argument = invalide **uniquement** la page exacte `/`
- Pour invalider `/`, `/movies`, `/series`, etc., il faudrait `revalidatePath("/", "layout")`

**Correction proposée** :
```ts
// Invalide la home + la page du média
revalidatePath("/", "layout");
revalidatePath(`/movies/${tmdbId}`);
revalidatePath(`/series/${tmdbId}`);
revalidatePath(`/animes/${tmdbId}`);
```
Ou plus malin avec une tag :
```ts
fetch(url, { next: { tags: [`media-${tmdbId}`] } });
// ...
revalidateTag(`media-${tmdbId}`);
```

### Exo 5
Route Handler version :
```ts
// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";

const schema = z.object({
  tmdbId: z.number().int().positive(),
  type: z.nativeEnum(MediaType),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalide" }, { status: 400 });

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_tmdbId_type: { userId, ...parsed.data } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favored: false });
  } else {
    await prisma.favorite.create({ data: { userId, ...parsed.data } });
    return NextResponse.json({ favored: true });
  }
}
```

Client :
```tsx
await fetch("/api/favorites", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tmdbId, type }),
});
```

**Comparaison** :
| Aspect | Server Action | Route Handler |
|---|---|---|
| Sérialisation | Automatique | Manuelle (JSON) |
| Typage end-to-end | ✅ | ❌ (tu re-types côté client) |
| Couplage Next | Fort | Standard HTTP |
| Réutilisable hors Next | ❌ | ✅ (app mobile, autre site…) |
| `revalidatePath` | ✅ direct | ✅ aussi |
| Verbose | Faible | Plus |

**Choisir** : Server Action pour les mutations internes à l'app. Route Handler quand tu veux un endpoint public (mobile, integrations, webhooks).

---

## Suite

→ [Module 10 — Composants UI réutilisables avec Radix](./10-composants-radix.md)
