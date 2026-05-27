# Module 16 — Projet final : reconstruction guidée

## Objectifs

- Avoir une **roadmap concrète** pour rebâtir l'app de zéro
- T'auto-évaluer avec un **quiz final** (50 questions)
- Pratiquer en codant les **mini-challenges**
- Savoir quoi creuser pour aller plus loin

---

## 1. Roadmap : reconstruire Absolute Stream en 10 étapes

Si tu maîtrises ces 10 étapes, tu peux **réécrire l'app** sans regarder le code source. Faisons-les dans l'ordre de difficulté.

### Étape 1 — Setup initial (1h)
```bash
npx create-next-app@latest absolute-stream --typescript --tailwind --app --src-dir --import-alias "@/*"
cd absolute-stream
npm install @prisma/client better-auth lucide-react clsx tailwind-merge zod
npm install -D prisma @tailwindcss/postcss
```
- Configure `tsconfig.json` (paths `@/*`)
- Crée `src/lib/utils.ts` avec `cn()`
- Configure `globals.css` avec `@theme inline` et tes variables

**Tu sais expliquer** : pourquoi chaque dépendance, le rôle de `cn`.

### Étape 2 — Layout et navigation (2h)
- `src/app/layout.tsx` avec `<html>`, `<body>`, NavBar, Footer
- `src/components/layout/NavBar.tsx` avec menu desktop + mobile
- `src/components/layout/Footer.tsx`
- `src/constants/nav-bar.ts` avec les items
- `usePathname` pour highlight la nav active

**Tu sais expliquer** : RSC vs Client, pourquoi NavBar est en client.

### Étape 3 — TMDB integration (3h)
- Crée des helpers dans `src/lib/tmdb.ts`
- Crée `src/types/tmdb.ts` avec `Media`, `Genre`, etc.
- Crée la page `(library)/movies/page.tsx` qui fetch popular + topRated + discover + genres
- Affiche dans un grid simple

**Tu sais expliquer** : `fetch + revalidate`, `Promise.all`, `process.env`.

### Étape 4 — Composants media (3h)
- `src/components/medias/MediaCards.tsx` (la carte d'un film)
- `src/components/medias/MediaContainer.tsx`
- `src/components/medias/LibraryContainer.tsx` (header + grid)
- Mise en place des Image Next avec `sizes`

**Tu sais expliquer** : `next/image`, sizes, lazy loading, ratios.

### Étape 5 — Carrousels (2h)
- Installe Embla
- Crée `src/components/medias/EmblaCarousel.tsx`
- Map `basis-1/N` au `grid-cols-N`
- Utilise dans `MoviesPage` pour "Tendances" et "Top notés"

**Tu sais expliquer** : `useEmblaCarousel`, `React.Children.map`, `useCallback`.

### Étape 6 — Filtre interactif (3h)
- `src/components/medias/DiscoverMedia.tsx` (Client)
- `useState` pour genre/sort
- Wrapper Radix `DropdownMenu` dans `src/components/ui/dropdown-menu.tsx`
- Route Handler `/api/movies/discoverMovies` qui proxy TMDB
- `useEffect` + `useTransition` qui refetch à chaque changement

**Tu sais expliquer** : useState, useEffect deps, useTransition, Route Handlers, asChild.

### Étape 7 — BDD + Prisma (3h)
- Setup Postgres (local ou Neon)
- `prisma/schema.prisma` avec User, Session, Account, Favorite
- `src/lib/prisma.ts` avec singleton
- `npx prisma migrate dev`
- Test avec Prisma Studio

**Tu sais expliquer** : models, relations, `@@unique`, singleton, migrations.

### Étape 8 — Authentification (3h)
- `src/lib/auth.ts` (Better Auth)
- `src/app/api/auth/[...all]/route.ts`
- `src/providers/AuthContext.tsx` avec pattern anti-flash localStorage
- `src/hooks/useAuth.ts`
- Pages `/login` et `/register`

**Tu sais expliquer** : sessions cookies, localStorage cache, useContext, [...catch-all].

### Étape 9 — Favoris (Server Action + optimistic) (3h)
- Ajoute le model `Favorite` au schema
- `src/actions/favorites.ts` avec validation Zod
- `src/components/medias/FavoriteButton.tsx` (`useOptimistic` + `useTransition`)
- `src/app/[type]/[id]/page.tsx` (fiche média avec le bouton favori)

**Tu sais expliquer** : "use server", revalidatePath, useOptimistic, sécurité.

### Étape 10 — Match (BDD + UI) (5h)
- Modèles `MatchSession`, `Swipe`, `MatchResult`
- Server Actions : `createSession`, `joinSession`, `recordSwipe`
- Page `/match` (hub) + `/match/[sessionId]` (UI swipe)
- Algorithme de détection au swipe
- Polling pour synchronisation (ou Pusher si tu veux plus avancé)

**Tu sais expliquer** : le modèle de données, l'algo de détection, les contraintes uniques, la race condition.

**Total : ~28h** de code à mon estimation, en autodidacte. Avec ce cours, tu devrais aller plus vite.

---

## 2. Mini-challenges progressifs

### Challenge 1 — Bouton "À voir"
À partir du modèle `Library`, crée un bouton qui ajoute/retire un média du statut `TO_WATCH`. Même pattern que `FavoriteButton`.

### Challenge 2 — Page profil
Crée `/profile/[userId]/page.tsx` qui affiche :
- Nom, photo, date d'inscription du user
- Nombre de favoris
- Liste des 10 derniers favoris (cartes avec image)

### Challenge 3 — Système de follow
- Ajoute Server Action `toggleFollow(userId)`
- Crée un `<FollowButton>` optimiste
- Affiche le nombre de followers sur le profil

### Challenge 4 — Reviews
- Schéma déjà prêt (modèle `Review`)
- Server Action `createReview` (avec rating 1-10 + content optionnel)
- Composant `<ReviewList>` sur la fiche média
- Note moyenne avec `prisma.review.aggregate({ _avg })`

### Challenge 5 — Search bar
- Route Handler `/api/search?q=...` qui appelle `/search/multi` de TMDB
- Composant `<SearchBar>` dans la NavBar avec debounce (300ms)
- Dropdown de résultats live

---

## 3. Auto-évaluation : 50 questions

**Pour chaque question, tu dois pouvoir répondre en 30 secondes max. Si tu sèches → relis le module correspondant.**

### Module 00 — Introduction
1. À quoi sert TMDB dans le projet ?
2. Quels types d'informations sont stockés en BDD vs récupérés à la volée ?
3. Que veulent dire `(auth)`, `(library)`, `(games)`, `(user)` ?

### Module 01 — JS/TS
4. Que fait `??` vs `||` ?
5. Pourquoi `await` ne marche que dans une fonction `async` ?
6. Que fait `Promise.all` ?
7. Différence entre `interface` et `type` ?

### Module 02 — Next.js
8. Server Component vs Client Component : qu'est-ce qui change ?
9. Comment `params` est récupéré dans une page dynamique en Next 16 ?
10. Que fait `<Link>` versus `<a>` ?
11. À quoi sert `(parens)` dans `app/` ?

### Module 03 — Hooks
12. Que fait `useEffect(() => {...}, [])` ?
13. Différence entre `useState(0)` et `useState(() => 0)` ?
14. Quand utiliser `useRef` plutôt que `useState` ?
15. Pourquoi le throw dans `useAuth` ?

### Module 04 — React 19
16. Que se passe-t-il si `useOptimistic` reçoit une erreur du serveur ?
17. À quoi sert `useTransition` ?
18. Différence entre `<form action={fn}>` et `<form onSubmit={...}>` ?
19. Pourquoi `"use server"` ?

### Module 05 — Tailwind
20. Que fait `tailwind-merge` ?
21. Quel est le breakpoint custom du projet et sa valeur ?
22. Comment cibler un état Radix en CSS ?
23. Que fait `group-hover:` ?

### Module 06 — Data fetching
24. Quelles sont les 3 stratégies de cache de Next ?
25. Pourquoi utiliser un Route Handler quand on peut fetch dans un RSC ?
26. Pourquoi `process.env.X` vs `process.env.NEXT_PUBLIC_X` ?

### Module 07 — Auth
27. Pourquoi un cache localStorage pour la session ?
28. Que fait `[...all]` dans la route Better Auth ?
29. Comment récupérer la session côté serveur ?

### Module 08 — Prisma
30. Pourquoi un singleton Prisma en dev ?
31. Que fait `@@unique([a, b, c])` ?
32. Différence entre `findUnique` et `findFirst` ?
33. Que fait `onDelete: Cascade` ?

### Module 09 — Server Actions
34. Quelles sont les 3 vérifs **obligatoires** dans une Server Action ?
35. Quand appeler `revalidatePath` ?
36. Différence entre `safeParse` et `parse` ?

### Module 10 — Radix
37. À quoi sert la prop `asChild` ?
38. Que fait `React.ComponentProps<typeof X>` ?
39. Pourquoi `Portal` dans le Content d'un Dropdown ?

### Module 11 — Algos
40. Quelle est la formule de luminance YIQ ?
41. Pourquoi un proxy (weserv.nl) pour `useImageColor` ?
42. Pourquoi un `Map` pour dédupliquer ?

### Module 12 — Embla
43. Que fait `React.Children.map` ?
44. À quoi sert `min-w-0` sur un slide ?
45. Pourquoi un `useCallback` autour de `scrollPrev` ?

### Module 13 — Routes
46. Comment Next résout les conflits entre routes statiques et dynamiques ?
47. Différence entre `[id]` et `[...slug]` ?

### Module 14 — Match
48. Combien de tables sont impliquées dans le Match ?
49. Qui empêche le double-comptage d'un match en cas de race condition ?

### Module 15 — Conventions
50. Pourquoi `--force-with-lease` plutôt que `--force` ?

---

## 4. Corrigés du quiz

1. Source des données médias (films, séries, animes). API publique gratuite.
2. **Stocké** : users + leurs interactions (favoris, library, swipes, reviews, follows). **Volée** : titres, affiches, casting, synopsis.
3. Route groups d'organisation, n'apparaissent pas dans l'URL.

4. `??` ne falls back que sur `null`/`undefined`. `||` falls back sur tout falsy (0, "", false…).
5. `await` est du sucre pour `.then()`. Sans `async` (ou top-level module ES), c'est une erreur de syntaxe.
6. Lance plusieurs Promises en parallèle, attend toutes. Rejette si une seule rejette.
7. `interface` décrit un objet, `type` est polyvalent (unions, primitives, etc.). Quasi-équivalent sur les objets.

8. Server = côté serveur, pas de hooks/events, peut fetch direct. Client = côté navigateur (rendu initial côté serveur quand même), hooks OK.
9. `params: Promise<{...}>` qu'il faut `await`.
10. `<Link>` fait du préfetch, navigation client (pas de reload).
11. Ne modifient pas l'URL, permettent l'organisation et des layouts dédiés.

12. Exécute après le premier render seulement, jamais re-déclenché.
13. La 2ᵉ est lazy : la fonction n'est appelée qu'au mount. Utile si init coûteuse.
14. Quand tu as besoin d'une valeur mutable qui **ne déclenche pas de re-render**.
15. Fail fast si `useAuth` est appelé hors du provider → erreur claire au mount.

16. L'optimistic value revient automatiquement à la valeur réelle (rollback gratuit).
17. Marque un état comme "non urgent", l'UI reste fluide.
18. `<form action>` marche sans JS (progressive enhancement), s'intègre aux Server Actions.
19. Sans, le code pourrait fuiter côté client. Avec, c'est strictement serveur.

20. Résout les conflits de classes Tailwind (`p-4 p-6` → `p-6`).
21. `3xl` à 1930px.
22. Avec `data-[state=open]:...`.
23. Stylise un enfant en réagissant au hover du parent (qui a la classe `group`).

24. `revalidate: N` (ISR), `cache: "force-cache"` (perpétuel), `cache: "no-store"` (jamais).
25. Pour les Client Components qui doivent refetch dynamiquement sans exposer la clé API. Et pour les endpoints publics.
26. Sans préfixe → serveur seulement (sécurisé). Avec `NEXT_PUBLIC_` → inliné dans le bundle navigateur (visible par tous).

27. Pour éviter le flash "non connecté" pendant la validation initiale. localStorage est synchrone.
28. Catch-all : matche toutes les sous-routes (`/api/auth/sign-in`, `/api/auth/callback/github`, etc.).
29. `await auth.api.getSession({ headers: await headers() })`.

30. Le hot reload de Next crée des nouveaux clients à chaque save → fuite de connexions. Le singleton survit au reload.
31. Contrainte unique sur la **combinaison** des champs.
32. `findUnique` exige une clé unique, `findFirst` accepte n'importe quoi (retourne le premier match).
33. Si on supprime le parent, les enfants sont supprimés automatiquement.

34. Validation des inputs (Zod), vérification de la session, vérification des permissions.
35. Après une mutation, pour invalider le cache RSC.
36. `parse` throw, `safeParse` retourne `{success, data | error}`.

37. Remplace le composant Radix par l'enfant, en fusionnant les props (a11y, onClick, refs).
38. Récupère le type des props de X (synchronisé automatiquement avec la lib).
39. Pour rendre le contenu hors du parent (évite les problèmes d'overflow/z-index).

40. `(R*299 + G*587 + B*114) / 1000` (luminance perçue, pondérée par sensibilité de l'œil).
41. TMDB n'envoie pas d'header CORS → impossible de lire les pixels en Canvas direct.
42. Permet de dédupliquer par **clé** (id). Set ne dédupe que par identité d'objet.

43. Itère sur children même s'il y en a un seul, gère null/undefined, attache des keys.
44. Permet à l'élément de rétrécir en-dessous de sa taille de contenu (sinon flexbox force la taille naturelle).
45. Stabilise la référence quand `emblaApi` change (au premier render, c'est `undefined`).

46. Statique > dynamique > catch-all > optional catch-all.
47. `[id]` matche un seul segment. `[...slug]` matche un ou plusieurs (catch-all).

48. 3 (MatchSession, Swipe, MatchResult), +User implicitement.
49. La contrainte `@@unique([sessionId, tmdbId])` sur MatchResult.

50. `--force-with-lease` refuse si quelqu'un d'autre a pushé entretemps → plus sûr.

---

## 5. Bonus : ce qui n'est pas (encore) dans le projet

Pour aller plus loin :
- **Tests** : Vitest pour les utils, Playwright pour les flows e2e
- **Streaming + Suspense** : pour ne pas bloquer la page sur les fetchs lents
- **Parallel routes** (`@modal`) : pour la modal de connexion
- **Intercepting routes** (`(.)`) : pour afficher `/movies/603` en modal par-dessus `/movies`
- **Internationalisation** : Next-intl ou next-international
- **Realtime** : Pusher, Ably, Supabase Realtime pour le Match
- **Analytics** : Vercel Analytics, PostHog
- **Tests de charge** : k6 sur les endpoints
- **Storybook** : pour cataloguer les composants UI

---

## 6. Si je devais récapituler en 5 phrases

1. **Next.js App Router** fait du SSR par défaut, avec des Server Components pour les pages et des Client Components pour l'interactivité.
2. **Tailwind v4** se configure en CSS pur (`@theme inline`), et les utility classes composent toutes les UI avec `cn()` pour résoudre les conflits.
3. **Prisma + Better Auth** gèrent BDD et auth respectivement, en s'appuyant sur Postgres et des cookies de session sécurisés.
4. **TMDB** est la source unique de vérité pour les médias — l'app ne stocke que les interactions utilisateur (favoris, library, reviews, swipes).
5. **Server Actions + Zod + `useOptimistic`** forment le triptyque idéal pour les mutations : UI instantanée, validation runtime, retour structuré et revalidation automatique du cache RSC.

---

## 7. Conclusion

Bravo d'être arrivé jusqu'ici. Si tu as lu et compris les 17 modules, **tu peux expliquer chaque ligne** du projet. Mieux : tu peux **étendre** l'app, débugger un comportement bizarre, et orienter une review de code.

### Pour pratiquer encore
- Refais l'app from scratch (étape 1 à 10 ci-dessus)
- Complète les pages stubs (`/profile`, `/settings`, `/top10`, `/tournoi`)
- Implémente le Match en vrai
- Ajoute une feature originale (mode "À deviner" : on te montre un casting, devine le film ?)

Bonne route !
