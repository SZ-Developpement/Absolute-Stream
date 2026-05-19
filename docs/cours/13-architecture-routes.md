# Module 13 — Architecture des routes du projet

## Objectifs

- Cartographier **toutes les routes** de l'app
- Comprendre les **route groups** `(parens)` et leur utilité
- Maîtriser les **dynamiques** : `[id]`, `[...catch-all]`, `[[...optional]]`
- Savoir comment Next résout les conflits entre routes
- Identifier les patterns qu'on retrouverait dans une vraie app

---

## 1. Cartographie complète

### Pages publiques
```
/                                  → src/app/page.tsx                    Accueil (landing)
/login                             → src/app/(auth)/login/page.tsx       Connexion
/register                          → src/app/(auth)/register/page.tsx    Inscription
/movies                            → src/app/(library)/movies/page.tsx   Catalogue films
/series                            → src/app/(library)/series/page.tsx   Catalogue séries
/animes                            → src/app/(library)/animes/page.tsx   Catalogue animes
/collections                       → src/app/(library)/collections/page.tsx  Collections
/top10                             → src/app/(library)/top10/page.tsx    Top 10 (vide)
/match                             → src/app/(games)/match/page.tsx      Hub Match
/tournoi                           → src/app/(games)/tournoi/page.tsx    Hub Tournoi (vide)
/movies/603 (ex.)                  → src/app/[type]/[id]/page.tsx        Fiche média
/series/1396                       → src/app/[type]/[id]/page.tsx        Fiche média
```

### Pages connectées (auth requis)
```
/profile                           → src/app/(user)/profile/page.tsx     Profil (vide)
/settings                          → src/app/(user)/settings/page.tsx    Settings (vide)
/match/[sessionId]                 → src/app/(games)/match/[sessionId]/page.tsx  Session Match
```

### Endpoints API
```
GET /api/movies/popularMovies      → src/app/api/movies/popularMovies/route.ts
GET /api/movies/topRated           → src/app/api/movies/topRated/route.ts
GET /api/movies/nowPlaying         → src/app/api/movies/nowPlaying/route.ts
GET /api/movies/discoverMovies     → src/app/api/movies/discoverMovies/route.ts
GET /api/movies/movieGenres        → src/app/api/movies/movieGenres/route.ts
GET /api/tvshows/popularTv         → src/app/api/tvshows/popularTv/route.ts
GET /api/tvshows/topRated          → src/app/api/tvshows/topRated/route.ts
GET /api/tvshows/onTheAir          → src/app/api/tvshows/onTheAir/route.ts
GET /api/tvshows/discoverTvshows   → src/app/api/tvshows/discoverTvshows/route.ts
GET /api/tvshows/tvGenres          → src/app/api/tvshows/tvGenres/route.ts
GET /api/animes/popularAnimes      → src/app/api/animes/popularAnimes/route.ts
GET /api/animes/topRated           → src/app/api/animes/topRated/route.ts
GET /api/animes/discoverAnimes     → src/app/api/animes/discoverAnimes/route.ts
GET /api/animes/animeGenres        → src/app/api/animes/animeGenres/route.ts
GET /api/collections               → src/app/api/collections/route.ts
GET /api/findByID/[external_id]    → src/app/api/findByID/[external_id]/route.ts
*   /api/auth/[...]                → src/app/api/auth/[...all]/route.ts  (Better Auth)
```

---

## 2. Les route groups `(parens)`

Les `()` regroupent des routes **sans affecter l'URL**.

### Pourquoi le projet utilise (auth), (library), (games), (user) ?

1. **Organisation visuelle** : retrouver vite "tout ce qui est library" dans le file explorer
2. **Layouts dédiés** : tu peux poser `src/app/(auth)/layout.tsx` qui s'applique à `/login` et `/register` (par exemple : fond rouge, pas de NavBar)
3. **Logique conditionnelle** : tu pourrais ajouter un middleware par groupe (vérifier que `(user)/*` exige une auth)

### Le pattern dans le projet
- `(auth)` → tout ce qui touche à la connexion
- `(library)` → tout ce qui est catalogue media
- `(games)` → fonctionnalités sociales gamifiées
- `(user)` → espace personnel

C'est purement organisationnel ici (pas de layout par groupe), mais ça documente l'intention.

### Conflit potentiel
Ne crée **jamais** deux `page.tsx` qui résolvent la même URL :
```
src/app/(library)/page.tsx        → "/" ❌
src/app/page.tsx                  → "/" ❌ conflit avec le précédent
```
Next plante au build.

---

## 3. Segments dynamiques `[param]`

### Single param : `[id]`
```
src/app/[type]/[id]/page.tsx
```

Matche `/movies/603`, `/series/1396`, `/animes/12345`. Les `params` sont accessibles :

```tsx
export default async function BasicMediaPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  // type = "movies" | "series" | "animes" | n'importe quoi
  // id = "603"
}
```

**Attention** : `type` n'est **pas typé** au niveau de Next. Si quelqu'un va sur `/banana/603`, le composant s'exécute avec `type = "banana"`. À toi de gérer :
```tsx
if (!["movies", "series", "animes"].includes(type)) {
  return <NotFound />;
}
```

### Catch-all : `[...slug]`
```
src/app/api/auth/[...all]/route.ts
```

Matche `/api/auth/sign-in`, `/api/auth/callback/github`, `/api/auth/session`, etc. — **n'importe quel** segment après `/api/auth/`.

`params.all` est un **tableau** :
```ts
params.all // ["sign-in"] ou ["callback", "github"]
```

Dans le projet, on délègue tout à Better Auth :
```ts
const { GET, POST } = toNextJsHandler(auth);
```
Better Auth a son propre router interne qui sait quoi faire selon le path.

### Optional catch-all : `[[...slug]]`
Comme catch-all mais matche aussi quand il n'y a rien après. (`/api/auth` matcherait aussi.)

---

## 4. Comment Next résout les conflits ?

Quand plusieurs fichiers pourraient matcher une URL :

```
1. Routes statiques     (les + spécifiques)
2. Routes dynamiques [id]
3. Catch-all [...rest]
4. Optional catch-all [[...rest]]
```

Exemple : si tu avais
```
src/app/movies/popular/page.tsx
src/app/movies/[id]/page.tsx
```
- `/movies/popular` → matche `popular/page.tsx` (plus spécifique)
- `/movies/603` → matche `[id]/page.tsx`

⚠️ Le projet a `src/app/(library)/movies/page.tsx` (page liste) **et** `src/app/[type]/[id]/page.tsx` (fiche). Comment `/movies` est résolu ?
- `(library)/movies/page.tsx` → routes statique sous group → l'URL est `/movies`
- `[type]/[id]/page.tsx` exige 2 segments → ne matche pas `/movies` (1 segment)

Donc pas de conflit. Mais si on créait `src/app/[type]/page.tsx`, là il y aurait conflit avec `/movies` (qui matcherait les deux).

---

## 5. Layouts imbriqués

Tu peux poser un `layout.tsx` à n'importe quel niveau. Il englobe tous les segments en dessous.

```
src/app/
├── layout.tsx                      ← racine : <html>, <body>, NavBar, Footer
├── (auth)/
│   └── layout.tsx (hypothétique)   ← englobe login + register seulement
└── (library)/
    └── movies/
        └── [id]/
            └── layout.tsx (hyp.)   ← englobe juste /movies/[id]
```

Chaque layout est rendu **dans** son parent. Le user qui visite `/movies/603` voit :
```
RootLayout
  └── (library) layout (si existe)
      └── movies/[id] layout (si existe)
          └── movies/[id] page
```

### Dans le projet
Seul le **layout racine** existe. Pas de layout intermédiaire. Mais c'est un point d'extension naturel quand l'app grandit.

---

## 6. Fichiers spéciaux dans une route

| Fichier | Rôle |
|---|---|
| `page.tsx` | Page accessible |
| `layout.tsx` | Layout englobant |
| `template.tsx` | Comme layout mais re-monté à chaque navigation |
| `loading.tsx` | UI pendant le chargement (Suspense boundary) |
| `error.tsx` | UI quand une erreur survient (Error boundary) |
| `not-found.tsx` | UI quand `notFound()` est appelé |
| `route.ts` | Endpoint HTTP (à la place de page.tsx) |
| `default.tsx` | Fallback pour les Parallel Routes |
| `middleware.ts` (racine src) | Middleware pour toutes les routes |

### Exemple d'usage `loading.tsx`
```tsx
// src/app/(library)/movies/loading.tsx (hypothétique)
export default function Loading() {
  return <div>Chargement des films...</div>;
}
```
Affiché automatiquement pendant que `page.tsx` fetch les données.

### Exemple `not-found.tsx`
```tsx
// src/app/[type]/[id]/not-found.tsx
export default function NotFound() {
  return <p>Ce média n'existe pas.</p>;
}
```
Apparait si on appelle `notFound()` dans `page.tsx`.

---

## 7. Le middleware Next

```ts
// src/middleware.ts (à la racine, pas dans app/)
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Bloquer les routes /admin si pas connecté
  if (path.startsWith("/admin")) {
    const cookie = request.cookies.get("better-auth.session_token");
    if (!cookie) return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
```

S'exécute **avant** chaque requête. Utile pour :
- Redirections globales
- Vérification d'auth lourde (avant même de toucher le RSC)
- Localisation (i18n)

Pas (encore) utilisé dans le projet.

---

## 8. Patterns réutilisables tirés du projet

### Pattern "type/id" pour des entités polymorphes
`/movies/603`, `/series/1396`, `/animes/12345` tous gérés par **un seul** `[type]/[id]/page.tsx`.

Pour : tu factorises le code de fiche.
Contre : tu dois faire `if (type === "movies")` pour adapter (URL TMDB par exemple).

### Pattern catch-all pour déléguer
`/api/auth/[...all]` délègue à Better Auth. Tu pourrais faire pareil pour un dashboard tiers, un éditeur Markdown, etc.

### Pattern session/[id] pour partage de lien
`/match/[sessionId]` : un user crée une session, partage le lien `https://app.com/match/abc-123`, l'invité accède direct.

C'est le pattern Tinder Match, Notion share, Calendly meeting link.

---

## 9. Pour aller plus loin : Parallel Routes (mention)

Next supporte des **slots parallèles** :
```
src/app/
├── layout.tsx
├── @modal/...
└── @main/...
```

Permet de rendre deux UI **simultanément** dans une même page (ex : page principale + modal). Pas utilisé dans le projet — note pour ta culture.

---

## Exercices

### Exo 1 — Inventaire
Trouve dans le projet :
1. Combien de pages ont un fichier réel non-vide ?
2. Combien sont des stubs `return <div></div>` ?
3. Quelle est la route la plus profonde (en nombre de segments) ?

### Exo 2 — Conflit potentiel
Si tu ajoutes `src/app/(library)/[type]/page.tsx`, quel impact ça aurait sur `/movies` ?

### Exo 3 — Layout `(auth)`
Crée le fichier `src/app/(auth)/layout.tsx` qui :
- Englobe `/login` et `/register` uniquement
- N'affiche **pas** la NavBar ni le Footer
- Centre le contenu verticalement et horizontalement
- Met un fond dégradé

(Tu n'as pas besoin de modifier le layout racine.)

### Exo 4 — Middleware d'auth
Écris un middleware qui :
- Redirige vers `/login` si l'user va sur `/profile/*` ou `/settings/*` sans cookie de session

### Exo 5 — Route handler dynamique
Écris `GET /api/users/[id]/route.ts` qui retourne `{ id, name, email }` d'un user en BDD.

---

## Corrigés

### Exo 1
1. **Pages avec contenu** : home, login, register, movies, series, animes, collections, match (hub), match/[sessionId], [type]/[id] = **10 pages**
2. **Stubs** : profile, settings, top10, tournoi = **4 stubs**
3. **Plus profonde** : `(games)/match/[sessionId]/page.tsx` → 3 segments (`match/[sessionId]` après le group). En API, `api/auth/[...all]/route.ts` peut être plus profond selon le path matché.

### Exo 2
Conflit. `/movies` matcherait à la fois :
- `(library)/movies/page.tsx` (statique, plus spécifique → gagne)
- `(library)/[type]/page.tsx` (dynamique)

Next prend `(library)/movies/page.tsx` (priorité statique). `/banana` matcherait `(library)/[type]/page.tsx`. **Mais** Next refusera de builder s'il considère qu'il y a ambiguïté entre deux fichiers du même niveau de spécificité (à tester).

En pratique, **évite** de mélanger routes statiques et dynamiques au même niveau dans le même group, ça complique la maintenance.

### Exo 3
```tsx
// src/app/(auth)/layout.tsx
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 to-zinc-950 flex items-center justify-center">
      {children}
    </div>
  );
}
```

**Mais attention** : ça ne masquera **pas** la NavBar/Footer rendus par le layout racine. Pour ça, tu devrais soit :
- Mettre une `z-50` qui les recouvre (comme ci-dessus) → un peu hacky
- Restructurer pour que `(auth)` soit hors du layout racine (impossible nativement en App Router)
- Conditionner la NavBar dans le layout racine selon le pathname (alternative)

Solution propre :
```tsx
// dans src/app/layout.tsx
import { headers } from "next/headers";

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";   // nécessite un middleware pour set ce header
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  return (
    <html>
      <body>
        {!isAuthPage && <NavBar />}
        {children}
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}
```
Mais ça mélange les responsabilités. Approche recommandée : utiliser **Route Groups avec layouts disjoints** (Next 13.4+ supporte plusieurs layouts racine via `(group1)/layout.tsx` + `(group2)/layout.tsx`).

### Exo 4
```ts
// src/middleware.ts (à la racine, à côté de src/)
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedPaths = ["/profile", "/settings"];
  const isProtected = protectedPaths.some(p => path.startsWith(p));

  if (isProtected) {
    const sessionCookie = request.cookies.get("better-auth.session_token");
    if (!sessionCookie) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", path);   // pour rediriger après login
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/settings/:path*"],
};
```
**Attention** : le middleware ne **valide pas** le cookie auprès de la BDD (trop coûteux pour chaque requête). Il vérifie juste sa présence. La validation réelle se fait dans le Server Component / Action.

### Exo 5
```ts
// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  // Optionnel : vérifier que le caller est connecté
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, image: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User introuvable" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```
Note l'usage de `select` pour ne **pas** exposer le password, role, etc.

---

## Suite

→ [Module 14 — Logique métier du Match](./14-logique-metier-match.md)
