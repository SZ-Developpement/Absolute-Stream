# Module 07 — Authentification avec Better Auth

## Objectifs

- Comprendre les concepts d'authentification web (session, cookie, OAuth, JWT)
- Configurer Better Auth (côté serveur + côté client)
- Lire et expliquer `AuthContext.tsx`, `useAuth.ts`, `auth.ts`
- Comprendre le pattern **anti-flash** avec localStorage
- Sécuriser les Server Actions et Route Handlers

---

## 1. Authentification : vocabulaire essentiel

### Authentification vs Autorisation
- **Authentification** : "qui es-tu ?" → login (email + password, OAuth, …)
- **Autorisation** : "as-tu le droit ?" → checks de permissions (role, owner, …)

Better Auth gère l'**authentification**. L'autorisation reste à toi (`if (session.user.role === "ADMIN") ...`).

### Cookie vs JWT en localStorage
| | Cookie HttpOnly | JWT dans localStorage |
|---|---|---|
| Accès JS | ❌ (sécurité) | ✅ |
| Envoyé auto avec chaque requête | ✅ | ❌ (à toi de l'ajouter) |
| Vulnérable XSS | Modérément (HttpOnly aide) | Très (un script peut le voler) |
| Vulnérable CSRF | Oui (SameSite aide) | Non |
| Logout serveur | ✅ (côté DB) | ❌ (tu dois maintenir une blacklist) |

Better Auth utilise par défaut des **cookies HttpOnly** + **sessions en BDD**. C'est le pattern le plus sûr pour une app full-stack.

### Session DB vs JWT stateless
- **Session en BDD** : à chaque requête, on lit la session via son token (cookie) → vérification en BDD. Logout = `DELETE FROM session`.
- **JWT stateless** : le token contient les infos signées. Pas besoin de BDD pour vérifier. Pas de logout immédiat possible.

Better Auth fait des sessions BDD (table `Session`). C'est sécurisé mais coûte 1 query par requête.

---

## 2. Setup côté serveur

```ts
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,    // ← simplifié pour le projet
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});
```

### Ce que Better Auth crée en BDD
Les tables `user`, `session`, `account`, `verification` (cf. `prisma/schema.prisma`). Better Auth les gère **lui-même** — tu ne fais que les déclarer dans le schema.

- `user` : utilisateurs
- `session` : sessions actives (token, expiresAt, ipAddress, userAgent)
- `account` : comptes liés (un user peut avoir email/password + GitHub + Google)
- `verification` : tokens de vérification email, reset password, etc.

---

## 3. Route Handler `[...all]`

```ts
// src/app/api/auth/[...all]/route.ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const { GET, POST } = toNextJsHandler(auth);
export { GET, POST };
```

Better Auth expose son propre routing interne (`/api/auth/sign-in`, `/api/auth/sign-out`, `/api/auth/callback/github`, etc.). Le catch-all `[...all]` lui délègue **toutes** les routes. Tu n'écris pas une route par endpoint — Better Auth s'en occupe.

---

## 4. Setup côté client

```ts
// src/providers/AuthContext.tsx (extrait)
import { createAuthClient } from "better-auth/client";

const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 },   // ← cache la session 5 min côté client
  },
});
```

`createAuthClient` te donne un objet avec :
- `client.signIn.email({ email, password })`
- `client.signUp.email({ email, password, name })`
- `client.signOut()`
- `client.getSession()`

### `cookieCache`
Active un cache léger du cookie de session pour éviter de re-fetch à chaque navigation. Au bout de 5 minutes, le client re-vérifie auprès du serveur.

---

## 5. `AuthContext` — le pattern anti-flash

Le **flash** = l'état initial où l'app affiche "non connecté" pendant 100ms avant que la session ne se valide. Ergonomiquement, c'est moche.

Le projet utilise un pattern à 2 phases :

```tsx
// src/providers/AuthContext.tsx
useEffect(() => {
  // PHASE 1 : lit localStorage instantanément (synchrone)
  const cached = localStorage.getItem("auth_user");
  if (cached) {
    setUser(JSON.parse(cached));
    setLoading(false);            // ← l'UI sait déjà qui est l'user
  }

  // PHASE 2 : valide en arrière-plan avec le serveur
  async function init() {
    try {
      const res = await client.getSession();
      if (res?.data?.user) {
        const u = res.data.user as User;
        setUser(u);
        localStorage.setItem("auth_user", JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem("auth_user");
      }
    } catch (e) {
      console.error("Session init error", e);
    } finally {
      setLoading(false);
    }
  }
  init();
}, []);
```

**Flux** :
1. L'utilisateur ouvre l'app
2. Le composant monte → `useEffect` lit `localStorage` → user trouvé → UI affichée
3. En parallèle, `client.getSession()` vérifie auprès du serveur
4. Si la session est invalide (cookie expiré, BDD supprime la session…) → `setUser(null)` → l'UI bascule à "non connecté"
5. Si la session est valide → `setUser(serverUser)` → on rafraîchit avec les données fraîches

### Pourquoi localStorage ?
- Synchrone (lecture immédiate, pas d'attente serveur)
- Persistant entre les sessions du navigateur
- Faible coût mémoire

⚠️ **Attention** : localStorage **n'est pas une source de vérité**. C'est juste un cache d'affichage. La source de vérité reste le cookie de session côté serveur.

---

## 6. Les méthodes du Context

```tsx
const signIn = async (email: string, password: string): Promise<unknown> => {
  const res = await client.signIn.email({ email, password });
  if (res?.data?.user) {
    const u = res.data.user as User;
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  } else {
    setError(res?.error?.message ?? "Erreur de connexion");
  }
  return res;
};

const signOut = async () => {
  try {
    await client.signOut();
    setUser(null);
    localStorage.removeItem("auth_user");
  } catch (e) {
    console.error("Sign out error", e);
  }
};
```

À chaque mutation d'auth :
1. Appel à Better Auth
2. Mise à jour du state React
3. Mise à jour de localStorage (ou nettoyage)

---

## 7. Le hook `useAuth`

```ts
// src/hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
```

Pattern simple mais efficace :
- Le `throw` garantit que tu ne peux pas appeler `useAuth()` en dehors d'un `<AuthProvider>` (= pas de NPE silencieux plus tard)
- Le retour est typé `AuthContextType` (jamais `undefined`)

Utilisation :
```tsx
// src/components/layout/NavBar.tsx
const { user, loading } = useAuth();
const { signOut } = useAuth();

// src/app/(auth)/login/page.tsx
const { signIn, user, loading, error } = useAuth();
```

---

## 8. Récupérer la session **côté serveur**

```ts
// src/actions/favorites.ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({
  headers: await headers(),
});
const userId = session?.user?.id;
```

```ts
// src/app/[type]/[id]/page.tsx
const session = await auth.api.getSession({
  headers: await headers(),
});
const userId = session?.user?.id;
```

**Comment ça marche** : `headers()` retourne les headers de la requête HTTP courante. Better Auth lit le cookie `better-auth.session_token` dans ces headers, le mappe à un user via la table `Session`.

⚠️ `headers()` n'est disponible **que** dans :
- Server Components
- Server Actions
- Route Handlers
- Middleware

Pas dans les Client Components (qui ont leur propre context déjà).

---

## 9. Page login — décortication

```tsx
// src/app/(auth)/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  if (user) {
    router.push("/");        // ← redirige si déjà connecté
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      <button type="submit" disabled={isLoading}>Se connecter</button>
    </form>
  );
}
```

**Décortication** :
- `loading` du context = "on est en train de valider la session initiale" → affiche un placeholder
- Si `user` existe déjà → redirige vers `/` (évite que l'user reste sur /login après connexion)
- Sinon, formulaire contrôlé : `value + onChange` pour piloter l'état
- `signIn` met à jour le context → `user` devient truthy → on push vers `/`

### Petit bug à corriger
Le `router.push("/")` est appelé **pendant le rendu**. Idéalement il devrait être dans un `useEffect` (comme c'est fait dans `register/page.tsx:17-21`).

```tsx
useEffect(() => {
  if (user) router.push("/");
}, [user, router]);
```

C'est un piège classique : modifier la navigation pendant le rendu déclenche un warning React.

---

## 10. Sécurité dans les Server Actions

Une Server Action peut être appelée par **n'importe qui**. Même si tu n'as pas affiché le bouton, quelqu'un peut envoyer un POST direct à l'endpoint.

Checklist à chaque Server Action :
1. **Valider les inputs** (Zod, manuellement…)
2. **Vérifier la session** (`auth.api.getSession`)
3. **Vérifier les permissions** (l'user a-t-il le droit ?)
4. **Logger les erreurs** (sans exposer les détails à l'attaquant)

Exemple complet dans `src/actions/favorites.ts`. Reviens lire ce fichier en gardant cette checklist en tête.

---

## 11. Concept : OAuth social (GitHub / Google)

```ts
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  },
}
```

Flux OAuth simplifié :
1. L'user clique "Se connecter avec GitHub"
2. Better Auth redirige vers `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...`
3. GitHub demande à l'user d'autoriser l'app
4. GitHub redirige vers `/api/auth/callback/github?code=XYZ`
5. Better Auth échange le `code` contre un `access_token` (call privé GitHub)
6. Better Auth récupère le profil de l'user via GitHub API
7. Better Auth crée/lie un `User` + un `Account` en BDD
8. Better Auth set le cookie de session → user connecté

Tu n'as **rien à coder** pour ce flux : Better Auth gère tout. Tu déclares juste les clés et redirect URIs dans la console GitHub/Google.

---

## Exercices

### Exo 1 — Pourquoi le throw dans useAuth ?
Que se passerait-il si on enlevait le `throw` et qu'on retournait `context` même si `undefined` ?

### Exo 2 — Décortiquer le sign out
Lis le code de `signOut` et explique ligne par ligne. Que se passe-t-il côté serveur ?

### Exo 3 — Server-side auth check
Écris un Server Component `/admin/page.tsx` qui :
- Vérifie que l'user est connecté
- Vérifie qu'il est `ADMIN` (champ `role`)
- Redirige sinon
- Sinon affiche "Bienvenue admin {name}"

### Exo 4 — Bug pédagogique
```tsx
"use client";
export function MyButton() {
  const user = JSON.parse(localStorage.getItem("auth_user")!);
  return <div>Bonjour {user.name}</div>;
}
```
Cite **3 problèmes** différents avec ce code.

### Exo 5 — Logout global
Comment forcer le logout d'un user **partout** (toutes ses sessions actives) côté serveur ?

---

## Corrigés

### Exo 1
Sans le throw :
- `useAuth()` retourne `undefined` si appelé hors du provider
- L'appelant fait `const { user } = useAuth()` → erreur runtime "Cannot destructure property 'user' of 'undefined'"
- Sauf si l'appelant fait `const ctx = useAuth(); const user = ctx?.user;` → user vaut `undefined` silencieusement → bugs cachés

Avec le throw, on **fail fast** au montage du composant, avec un message clair. C'est un pattern défensif standard pour les contexts.

### Exo 2
```ts
const signOut = async () => {
  try {
    await client.signOut();              // ① appel HTTP vers /api/auth/sign-out
    setUser(null);                       // ② met à jour le state React → toute l'app reflète la déconnexion
    localStorage.removeItem("auth_user"); // ③ nettoie le cache local
  } catch (e) {
    console.error("Sign out error", e);
  }
};
```

Côté serveur, `client.signOut()` :
- POST sur `/api/auth/sign-out`
- Better Auth supprime la ligne dans la table `Session`
- Better Auth set le cookie `better-auth.session_token` à expiré (`Set-Cookie: ...; Max-Age=0`)
- Le navigateur supprime le cookie

Après ça, n'importe quelle requête suivante ne trouvera plus de session.

### Exo 3
```tsx
// src/app/admin/page.tsx (RSC, pas de "use client")
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (user?.role !== "ADMIN") redirect("/");

  return <div>Bienvenue admin {user.name}</div>;
}
```

Points clés :
- `redirect()` lance en interne une exception qui interrompt le rendu et déclenche la redirection HTTP
- On va chercher le `role` en BDD car Better Auth ne retourne pas forcément les champs custom dans `session.user`
- Pas de `"use client"` : on garde le check 100% serveur (plus sûr, pas de flash)

### Exo 4
1. **SSR break** : `localStorage` n'existe pas côté serveur. Ce code crashera lors du SSR ("ReferenceError: localStorage is not defined").
2. **Non-null assertion** (`!`) : si la clé n'existe pas, `getItem` retourne `null` → `JSON.parse(null)` → crash.
3. **Pas de réactivité** : si l'user se déconnecte, ce composant ne se met pas à jour. Il devrait utiliser `useAuth()` pour suivre le state.

Bonne version :
```tsx
"use client";
import { useAuth } from "@/hooks/useAuth";

export function MyButton() {
  const { user } = useAuth();
  if (!user) return null;
  return <div>Bonjour {user.name}</div>;
}
```

### Exo 5
```ts
// Server action ou Route Handler
"use server";
import prisma from "@/lib/prisma";

export async function forceLogoutUser(userId: string) {
  // Optionnellement : vérifier que le caller est ADMIN
  await prisma.session.deleteMany({ where: { userId } });
  // À la prochaine requête, le cookie ne matchera plus aucune session → user déconnecté partout
}
```

Plus brutal : `await prisma.session.deleteMany({})` déconnecte **tout le monde** (utile pour un incident de sécurité).

---

## Suite

→ [Module 08 — Prisma et la base de données](./08-prisma-bdd.md)
