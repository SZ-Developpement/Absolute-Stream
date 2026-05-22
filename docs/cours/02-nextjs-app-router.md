# Module 02 — Next.js App Router

## Objectifs

- Comprendre la différence **Server Components / Client Components**
- Savoir comment Next 16 traduit l'arborescence `app/` en URLs
- Maîtriser `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `route.ts`
- Utiliser correctement `<Link>`, `<Image>`, `useRouter`, `usePathname`
- Lire et comprendre les **route groups** `(parens)`, les segments dynamiques `[param]`, et les catch-all `[...all]`

---

## 1. App Router : le concept

Avec Next.js 13+, le routing est basé sur la **structure de fichiers** dans `src/app/`. Chaque dossier devient un segment d'URL :

```
src/app/page.tsx                          → /
src/app/movies/page.tsx                   → /movies
src/app/movies/[id]/page.tsx              → /movies/123
src/app/api/movies/popularMovies/route.ts → /api/movies/popularMovies (endpoint)
```

Fichiers spéciaux :

| Fichier | Rôle |
|---|---|
| `page.tsx` | Page accessible publiquement |
| `layout.tsx` | Layout englobant pour tout ce dossier et ses sous-dossiers |
| `loading.tsx` | UI affichée pendant le chargement de la page (Suspense) |
| `error.tsx` | UI affichée si une erreur survient |
| `not-found.tsx` | UI affichée si `notFound()` est appelé |
| `route.ts` | Endpoint HTTP (GET, POST, etc.) — pas une page |
| `template.tsx` | Comme layout mais re-monté à chaque navigation |

---

## 2. Server Components vs Client Components

**C'est LE concept fondamental d'App Router.**

### Server Component (par défaut)
- S'exécute **côté serveur**, lors de la requête
- Peut faire `await fetch(...)` directement
- Peut accéder à `process.env`, `prisma`, lire des fichiers
- N'envoie **aucun JavaScript** au navigateur
- Ne peut pas utiliser `useState`, `useEffect`, ou des events DOM
- Reconnaissable : **pas** de `"use client"` en haut

### Client Component
- S'exécute côté serveur (rendu initial) **ET** côté client (interactivité)
- Peut utiliser **tous** les hooks React (`useState`, `useEffect`, `useRef`…)
- Peut écouter les events (`onClick`, `onChange`…)
- Reconnaissable : `"use client"` **tout en haut** du fichier
- Envoie du JS au navigateur

### Exemple dans le projet
```tsx
// src/app/(library)/movies/page.tsx
// PAS de "use client" → Server Component
export default async function MoviesPage() {
  const topRatedMovies = await getTopRatedMedia();  // fetch direct, côté serveur
  return <MediaContainer>...</MediaContainer>;
}
```

```tsx
// src/components/medias/DiscoverMedia.tsx
"use client";                              // ← Client Component
import { useState, useEffect } from "react";

export function DiscoverMedia({ ... }) {
  const [medias, setMedias] = useState<Media[]>(initialData);
  // ↑ useState autorisé ICI seulement
}
```

### Règle pratique
1. **Par défaut, Server** (plus rapide, plus léger)
2. **Tu passes en Client uniquement si tu as besoin** :
   - d'un état (`useState`)
   - d'un effet (`useEffect`)
   - d'un event handler (`onClick`)
   - de `localStorage`, `window`, ou autre API navigateur

### Composition Server → Client
Tu peux **importer** un Client Component depuis un Server Component, et lui passer des props (dont des enfants déjà rendus côté serveur) :

```tsx
// page.tsx (Server)
import { DiscoverMedia } from "@/components/medias/DiscoverMedia";

export default async function Page() {
  const data = await getDiscoverMovies();   // côté serveur
  return <DiscoverMedia initialData={data} />;
  //              ↑ Client Component reçoit les données
}
```

⚠️ L'inverse (importer un Server Component depuis un Client) **ne marche pas**. À la place, passe-le via `children` :
```tsx
// Pattern : children côté Client, RSC injecté depuis le parent Server
<ClientWrapper>
  <ServerComponent />
</ClientWrapper>
```

---

## 3. Layout racine (`src/app/layout.tsx`)

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageBackground } from "@/components/layout/PageBackground";
import { AuthProvider } from "@/providers/AuthContext";

export const metadata: Metadata = {                    // ① métadonnées globales
  title: "Absolute Stream",
  description: "Plateforme communautaire ...",
};

export default function RootLayout({                   // ② layout racine
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col relative">
        <AuthProvider>                                 // ③ Context React
          <NavBar />
          <PageBackground />
          {children}                                   // ④ la page courante
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
```

- ① La `metadata` exportée définit `<title>` et `<meta>`. Reprise dans chaque page (qui peut surcharger).
- ② Le layout racine est **obligatoire**. Il contient `<html>` et `<body>`.
- ③ Le `<AuthProvider>` enveloppe tout pour rendre `useAuth()` accessible partout.
- ④ `{children}` est l'emplacement où Next injectera la page courante.

**Bonus** : un layout peut être posé à n'importe quel niveau. Par exemple `src/app/(library)/layout.tsx` (s'il existait) s'appliquerait à toutes les pages de ce group.

---

## 4. Route groups `(parens)`

```
src/app/(auth)/login/page.tsx       → /login          (PAS /auth/login)
src/app/(auth)/register/page.tsx    → /register
src/app/(library)/movies/page.tsx   → /movies
src/app/(games)/match/page.tsx      → /match
```

Les `(parens)` créent un **groupe d'organisation** dans le code, **sans** ajouter à l'URL. Avantages :
- Tu peux poser un layout spécifique à chaque groupe (`src/app/(auth)/layout.tsx` pour wrapper login + register dans un design particulier)
- Tu sépares logiquement sans alourdir l'URL

Dans le projet :
- `(auth)` → pages de connexion/inscription
- `(library)` → pages catalogue (films, séries, animes, collections, top10)
- `(games)` → fonctionnalités sociales gamifiées (match, tournoi)
- `(user)` → profil et settings

---

## 5. Segments dynamiques `[param]`

```
src/app/[type]/[id]/page.tsx        → /movies/123, /series/456, /animes/789
```

Le `[type]` et `[id]` deviennent des **paramètres** récupérables :

```tsx
// src/app/[type]/[id]/page.tsx
export default async function BasicMediaPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;       // ① Next 16 : params est une Promise
}) {
  const { type, id } = await params;                   // ② on l'await
  const mediaData = await getMediaDetails(type, id);
  // ...
}
```

⚠️ **Changement Next 15/16** : `params` est désormais une **Promise**, il faut `await` (ou utiliser `use()` côté client). Avant c'était un objet direct.

### Catch-all : `[...all]`
```
src/app/api/auth/[...all]/route.ts   → /api/auth/...n'importe quoi
```
Capture tout segment qui suit. Utilisé pour déléguer à Better Auth qui gère lui-même son routing interne :
```ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const { GET, POST } = toNextJsHandler(auth);
export { GET, POST };
```

### Optional catch-all : `[[...all]]`
Comme catch-all mais matche aussi quand il n'y a rien après. (Pas utilisé dans le projet.)

---

## 6. Route Handlers (API)

Un fichier `route.ts` (au lieu de `page.tsx`) crée un **endpoint HTTP**.

```ts
// src/app/api/movies/discoverMovies/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get("sort_by") || "popularity.desc";
  const withGenres = searchParams.get("with_genres");

  // ... appel TMDB ...

  return NextResponse.json(data);
  // OU return NextResponse.json({ error: "..." }, { status: 500 });
}
```

- Exporte `GET`, `POST`, `PUT`, `DELETE`, `PATCH` selon les méthodes HTTP gérées
- `NextRequest` = `Request` + extras (cookies, geo, searchParams faciles)
- `NextResponse.json(data)` = `Response` qui sérialise + ajoute `Content-Type: application/json`

### Avec params dynamiques
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

---

## 7. Composants Next : `<Link>` et `<Image>`

### `<Link>` — navigation client
```tsx
import Link from "next/link";

<Link href="/movies" className="...">
  Films
</Link>
```
- Recharge **partielle** (pas de reload complet)
- Préfetch automatique en survol
- Accessibilité : rendu comme `<a>` mais intercepte le clic

### `<Image>` — image optimisée
```tsx
import Image from "next/image";

<Image
  src={posterUrl}
  alt={title}
  width={500}
  height={750}
  className="rounded-lg"
/>
```

Optimisations automatiques :
- Conversion en WebP/AVIF
- Resize selon l'écran
- Lazy loading (par défaut)
- Empêche le **CLS** (Cumulative Layout Shift) car la taille est déclarée

### Variantes
```tsx
// "fill" : prend toute la place du parent (parent doit être relative)
<Image src={url} alt="..." fill sizes="(max-width: 768px) 50vw, 25vw" />

// "sizes" : indique à Next quelle taille demander au CDN selon le viewport
sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
```

⚠️ Pour utiliser une URL externe (TMDB), il faut configurer `next.config.ts` (voir doc Next) ou ajouter les domaines à `images.remotePatterns`.

---

## 8. Navigation côté client

```tsx
"use client";
import { useRouter, usePathname } from "next/navigation";

const router = useRouter();
const pathname = usePathname();

router.push("/login");          // navigation programmée
router.replace("/");            // remplace (pas d'entrée dans l'historique)
router.refresh();               // re-fetch la route courante (relance les RSC)
router.back();                  // retour
```

```tsx
// src/components/layout/NavBar.tsx
const pathname = usePathname();
const isActive = pathname === href;
```
On compare le `pathname` au `href` du lien pour styliser le lien actif.

---

## 9. Exécution côté serveur : `headers()` et `cookies()`

```ts
// Dans un Server Component ou Server Action
import { headers, cookies } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),    // ← lit les headers de la requête (cookie de session inclus)
});
```

⚠️ En Next 16 : `headers()` et `cookies()` retournent une **Promise**. Il faut `await`.

---

## 10. `metadata` par page

```ts
// Dans n'importe quelle page.tsx ou layout.tsx
export const metadata = {
  title: "Films — Absolute Stream",
  description: "Découvrez les films populaires...",
};

// Ou dynamique :
export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  const media = await getMediaDetails("movies", id);
  return {
    title: `${media.title} — Absolute Stream`,
    description: media.overview,
  };
}
```

---

## Exercices

### Exo 1 — Server ou Client ?
Pour chacun des composants suivants, dis s'il **doit** être Server, **doit** être Client, ou pourrait être les deux :

1. `MediaCards.tsx` (affiche une carte avec image et titre)
2. `FavoriteButton.tsx` (bouton qui toggle un favori avec UI optimiste)
3. `NavBar.tsx` (barre avec menu hamburger ouvrable)
4. La page `/movies` (charge les films populaires depuis TMDB)
5. `Footer.tsx` (liens statiques)

### Exo 2 — Tracer une URL
Donne le fichier qui répond pour chaque URL :
1. `/`
2. `/login`
3. `/movies`
4. `/movies/603` (mais wait, regarde bien le projet…)
5. `/api/movies/popularMovies`
6. `/api/auth/signin`
7. `/match/abc-123`

### Exo 3 — Layout imbriqué
Imagine que tu veux que toutes les pages dans `(auth)` (login + register) aient un fond rouge. Comment fais-tu sans toucher au layout racine ?

### Exo 4 — Migrer params
Voici du code Next 14 :
```tsx
export default function Page({ params }: { params: { id: string } }) {
  return <div>ID: {params.id}</div>;
}
```
Réécris-le pour Next 16.

### Exo 5 — Route Handler
Écris une Route Handler `POST /api/echo` qui lit un body JSON `{ message: string }` et renvoie `{ echo: message.toUpperCase() }`.

---

## Corrigés

### Exo 1
1. **`MediaCards`** : peut être Server (pas d'interaction, juste un `<Link>` et `<Image>`). Vérifie le fichier : pas de `"use client"`, donc bien Server.
2. **`FavoriteButton`** : DOIT être Client (useTransition, useOptimistic, onClick).
3. **`NavBar`** : DOIT être Client (useState pour le menu mobile, usePathname, onClick).
4. **`/movies`** : Server (`await getPopularMovies()` etc., aucune interactivité).
5. **`Footer`** : techniquement peut être Server (rendu statique), mais le projet le marque `"use client"` parce qu'il utilise `usePathname` implicitement via les liens. Pas un drame, mais on pourrait l'optimiser en Server.

### Exo 2
1. `src/app/page.tsx`
2. `src/app/(auth)/login/page.tsx` (le `(auth)` n'est pas dans l'URL)
3. `src/app/(library)/movies/page.tsx`
4. **Attention** : `/movies/603` matche `src/app/[type]/[id]/page.tsx` parce que c'est plus spécifique qu'un dossier `(library)/movies/[id]`. Si jamais on créait `src/app/(library)/movies/[id]/page.tsx`, alors l'URL serait `/movies/603` mais Next priorise les routes statiques sur les groups, ça devient ambigu. **Dans l'état actuel du projet, c'est `src/app/[type]/[id]/page.tsx` qui répond.** Lance le projet et clique sur une carte, tu verras.
5. `src/app/api/movies/popularMovies/route.ts`
6. `src/app/api/auth/[...all]/route.ts` (catch-all)
7. `src/app/(games)/match/[sessionId]/page.tsx`

### Exo 3
Créer `src/app/(auth)/layout.tsx` :
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-red-500 min-h-screen">{children}</div>;
}
```
Ce layout s'imbrique sous le layout racine et s'applique automatiquement à `/login` et `/register`.

### Exo 4
```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>ID: {id}</div>;
}
```
La fonction devient `async` car on a un `await` à l'intérieur.

### Exo 5
```ts
// src/app/api/echo/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (typeof body?.message !== "string") {
    return NextResponse.json({ error: "message requis" }, { status: 400 });
  }
  return NextResponse.json({ echo: body.message.toUpperCase() });
}
```
- `await request.json()` lit et parse le body
- On valide que `message` est bien une string (sinon 400)
- On répond avec le résultat en JSON

---

## Suite

→ [Module 03 — React Hooks fondamentaux](./03-react-hooks-fondamentaux.md)
