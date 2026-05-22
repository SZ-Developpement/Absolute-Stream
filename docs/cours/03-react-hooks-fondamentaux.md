# Module 03 — React : Hooks fondamentaux

## Objectifs

- Comprendre **pourquoi** les hooks existent et leurs règles
- Maîtriser `useState`, `useEffect`, `useRef`, `useContext`
- Optimiser avec `useCallback` et `useMemo` (et savoir quand **ne pas** le faire)
- Écrire un custom hook

---

## 1. Pourquoi des hooks ?

Avant les hooks (React < 16.8), pour avoir un état dans un composant il fallait écrire une classe. Les hooks permettent d'utiliser de l'état et des effets dans des **fonctions**, plus simples à lire et à composer.

### Les 3 règles d'or
1. **Toujours au top-level** du composant — jamais dans un `if`, une boucle, ou une fonction imbriquée
2. **Toujours dans un composant React** ou un autre custom hook — jamais dans une fonction utilitaire normale
3. **Le nom commence par `use`** — convention obligatoire (ESLint vérifie)

Pourquoi ces règles ? React identifie les hooks par leur **ordre d'appel**. Si tu les mets dans un `if`, l'ordre change → React s'embrouille → bug obscur.

---

## 2. `useState` — l'état local

```tsx
const [count, setCount] = useState(0);
//     ↑       ↑                    ↑
//   valeur  setter         valeur initiale
```

```tsx
// src/components/layout/NavBar.tsx:18
const [isOpen, setIsOpen] = useState(false);

// src/components/medias/DiscoverMedia.tsx:24-26
const [medias, setMedias] = useState<Media[]>(initialData);
const [selectedGenre, setSelectedGenre] = useState<string>("");
const [sortBy, setSortBy] = useState<string>("popularity.desc");
```

### Setter avec fonction
Quand le nouveau state dépend de l'ancien :
```tsx
// MAL (si plusieurs setters en cascade) :
setCount(count + 1);
setCount(count + 1);   // count est encore l'ancien → +1 seulement

// BIEN :
setCount(prev => prev + 1);
setCount(prev => prev + 1);  // bien +2
```

Exemple dans le projet (`src/app/(library)/collections/page.tsx:18`) :
```tsx
setCollections((prev) => {
  const combined = [...prev, ...data];
  const unique = Array.from(
    new Map(combined.map((c) => [c.id, c])).values(),
  );
  return unique;
});
```

### Initialisation lazy
```tsx
const [user, setUser] = useState(() => {
  const cached = localStorage.getItem("auth_user");
  return cached ? JSON.parse(cached) : null;
});
```
La fonction n'est appelée qu'**une seule fois** au mount. Utile si l'init est coûteuse.

---

## 3. `useEffect` — effets secondaires

```tsx
useEffect(() => {
  // code à exécuter après le rendu
  return () => {
    // cleanup : appelé avant le prochain effet OU au unmount
  };
}, [dep1, dep2]);   // tableau de dépendances
```

### Les 3 modes
```tsx
useEffect(() => { ... });        // À CHAQUE rendu  (rare et dangereux)
useEffect(() => { ... }, []);    // UNE FOIS au mount
useEffect(() => { ... }, [x]);   // À chaque changement de x
```

### Exemple : init de session (AuthContext)
```tsx
// src/providers/AuthContext.tsx:34-61
useEffect(() => {
  // 1. Lit le cache local au démarrage (anti-flash)
  const cached = localStorage.getItem("auth_user");
  if (cached) {
    setUser(JSON.parse(cached));
    setLoading(false);
  }

  // 2. Valide en arrière-plan avec le serveur
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
}, []);   // [] → exécuté UNE FOIS au mount du provider
```

### Exemple : effet dépendant
```tsx
// src/components/medias/DiscoverMedia.tsx:30-56
useEffect(() => {
  if (isInitialRender.current) {
    isInitialRender.current = false;
    return;
  }

  startTransition(async () => {
    const params = new URLSearchParams({ sort_by: sortBy });
    if (selectedGenre) params.append("with_genres", selectedGenre);

    const res = await fetch(`${fetchEndpoint}?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setMedias(data.results || []);
    }
  });
}, [selectedGenre, sortBy, fetchEndpoint]);
//  ↑ relance le fetch dès que l'un de ces 3 change
```

### Le cleanup
```tsx
useEffect(() => {
  const id = setInterval(() => { ... }, 1000);
  return () => clearInterval(id);   // évite le memory leak au unmount
}, []);
```

### Piège : les dépendances oubliées
ESLint (règle `react-hooks/exhaustive-deps`) hurle si tu oublies une dep. **Ne désactive jamais cette règle sans réfléchir** — c'est source de bugs vicieux.

---

## 4. `useRef` — valeur mutable persistante

```tsx
const ref = useRef<HTMLDivElement>(null);
//   ref.current = null au départ
//   <div ref={ref} />   ← React assigne l'élément DOM
```

Deux usages :

### A. Référence DOM
```tsx
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);
return <input ref={inputRef} />;
```

### B. Valeur mutable qui survit aux rendus
```tsx
// src/components/medias/DiscoverMedia.tsx:28
const isInitialRender = useRef(true);

useEffect(() => {
  if (isInitialRender.current) {
    isInitialRender.current = false;
    return;          // ← skip la première exécution
  }
  // ... fetch ...
}, [selectedGenre, sortBy, fetchEndpoint]);
```

**Pourquoi pas `useState` ?** Modifier un `state` re-rend le composant. Modifier un `ref.current` **ne re-rend pas**. C'est exactement ce qu'on veut pour un drapeau interne.

⚠️ Tu ne dois **jamais** lire ou écrire `ref.current` pendant le rendu lui-même — seulement dans un effet, un handler, ou une fonction async.

---

## 5. `useContext` — partager des données

Le Context permet à un composant lointain dans l'arbre d'accéder à une valeur **sans la passer en prop à chaque niveau** ("prop drilling").

### Création du contexte
```tsx
// src/providers/AuthContext.tsx
import { createContext } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<unknown>;
  signOut: () => Promise<void>;
  // ...
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
```

### Fournir la valeur
```tsx
// src/providers/AuthContext.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Consommer la valeur
```tsx
// src/hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "@/providers/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
```

```tsx
// src/components/layout/NavBar.tsx:19
const { user, loading } = useAuth();
```

Le pattern **"un custom hook qui enveloppe le useContext + throw si pas wrappé"** est très répandu. Ça donne une erreur claire si quelqu'un utilise `useAuth` hors d'un `<AuthProvider>`.

---

## 6. `useCallback` — mémoïser une fonction

```tsx
// src/components/medias/EmblaCarousel.tsx:24-31
const scrollPrev = React.useCallback(
  () => emblaApi?.scrollPrev(),
  [emblaApi],
);
const scrollNext = React.useCallback(
  () => emblaApi?.scrollNext(),
  [emblaApi],
);
```

À chaque rendu, **les fonctions sont recréées**. Si tu passes une fonction comme prop à un composant `memo`-isé, ça casse l'optimisation. `useCallback` garde la **même référence** tant que les dépendances ne changent pas.

### Quand l'utiliser ?
- Si tu passes la fonction à un composant qui dépend de la stabilité de la référence (React.memo, useEffect deps…)
- Si la fonction fait quelque chose de coûteux et que tu veux l'éviter

**Sinon, ne le mets pas.** Recréer une petite fonction est gratuit. `useCallback` lui-même a un coût.

---

## 7. `useMemo` — mémoïser une valeur calculée

```tsx
// src/components/ui/slider.tsx:17-25
const _values = React.useMemo(
  () =>
    Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max],
  [value, defaultValue, min, max],
);
```

Le calcul n'est refait que si une des deps change.

### Quand l'utiliser ?
- Calcul coûteux (filtres complexes, tri…)
- Tu passes le résultat à un composant `memo`-isé
- Référence stable nécessaire pour `useEffect` deps

**Sinon, ne le mets pas.** Pareil que `useCallback` : ne pré-optimise pas.

---

## 8. Custom hooks — réutiliser de la logique

Un custom hook est une **fonction** dont le nom commence par `use` et qui appelle d'autres hooks.

### Exemple : `useAuth`
```ts
// src/hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "@/providers/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
```

### Exemple : `usePageBackground`
```ts
// src/hooks/usePageBackground.ts
import { usePathname } from "next/navigation";
import { pageDesign } from "@/constants/page-design";

export function usePageBackground() {
  const pathname = usePathname();
  const page = pageDesign.find((p) => {
    const path = p.name === "home" ? "/" : `/${p.name}`;
    return p.exact ? pathname === path : pathname.startsWith(`/${p.name}`);
  });
  return page?.src ?? null;
}
```

Ce hook :
1. Récupère le pathname courant
2. Cherche dans `pageDesign` une entrée qui matche (selon `exact` ou `startsWith`)
3. Retourne l'URL de l'image de fond (ou `null`)

L'appelant fait juste :
```tsx
const src = usePageBackground();
```

C'est l'équivalent d'une **fonction utilitaire**, mais qui peut utiliser d'autres hooks (ici `usePathname`).

### Exemple plus poussé : `useImageColor`
On le décortique en détail dans le module 11 (algorithmes).

---

## 9. Anti-patterns à éviter

### ❌ Hook conditionnel
```tsx
if (props.show) {
  const [x, setX] = useState(0);   // ← INTERDIT
}
```
Lance toujours le hook au top-level. Si tu n'en as pas besoin, utilise `null` comme valeur initiale.

### ❌ Effet sans dépendances qui devrait en avoir
```tsx
useEffect(() => {
  fetch(`/api/${id}`);   // ← id devrait être dans les deps
}, []);
```

### ❌ Setter qui appelle son propre state
```tsx
useEffect(() => {
  setCount(count + 1);   // si tu mets count dans deps → boucle infinie
}, [count]);
```

### ❌ Mutation directe
```tsx
const [user, setUser] = useState({ name: "Toto" });
user.name = "Titi";    // ← React ne détecte pas le changement
setUser(user);         // ← même ref → pas de re-render
// Solution :
setUser({ ...user, name: "Titi" });
```

---

## Exercices

### Exo 1 — useState basics
Écris un composant `<Counter>` avec un state `count` initialisé à 0, deux boutons "+" et "-", et qui affiche `count`. Bonus : ajoute un bouton "reset".

### Exo 2 — useEffect + cleanup
Écris un composant `<Clock>` qui affiche l'heure courante mise à jour chaque seconde. Pense au cleanup.

### Exo 3 — Race condition
Ce code a un bug :
```tsx
const [data, setData] = useState(null);
useEffect(() => {
  fetch(`/api/movies/${id}`).then(res => res.json()).then(setData);
}, [id]);
```
Quel est le bug si l'utilisateur change rapidement de `id` ? Corrige-le.

### Exo 4 — Custom hook
Écris un hook `useLocalStorage<T>(key: string, initial: T)` qui :
- Lit la valeur au mount depuis localStorage (ou `initial` si absent)
- Retourne `[value, setValue]` à la `useState`
- Sauvegarde dans localStorage à chaque setValue

### Exo 5 — Analyse de code
Dans `src/components/layout/NavBar.tsx:160-181`, comprends pourquoi on a un state `imageLoaded` et le fallback avec la première lettre du nom.

---

## Corrigés

### Exo 1
```tsx
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+</button>
      <button onClick={() => setCount(prev => prev - 1)}>-</button>
      <button onClick={() => setCount(0)}>reset</button>
    </div>
  );
}
```

### Exo 2
```tsx
"use client";
import { useState, useEffect } from "react";

export function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);   // ← cleanup obligatoire
  }, []);
  return <p>{now.toLocaleTimeString()}</p>;
}
```

### Exo 3
**Bug** : si l'utilisateur change rapidement (id=1 puis id=2), les 2 fetchs partent. Le premier (lent) peut répondre **après** le second (rapide) → on affiche les données de id=1 alors qu'on est sur id=2.

**Solution** : flag d'annulation.
```tsx
useEffect(() => {
  let cancelled = false;
  fetch(`/api/movies/${id}`)
    .then(res => res.json())
    .then(d => { if (!cancelled) setData(d); });
  return () => { cancelled = true; };
}, [id]);
```
Ou utiliser `AbortController` pour vraiment annuler le fetch :
```tsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch(`/api/movies/${id}`, { signal: ctrl.signal })
    .then(res => res.json())
    .then(setData)
    .catch(e => { if (e.name !== "AbortError") console.error(e); });
  return () => ctrl.abort();
}, [id]);
```

### Exo 4
```tsx
"use client";
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;   // SSR safe
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("localStorage error", e);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```
Points clés :
- Lazy init avec une fonction (`() => ...`)
- `typeof window === "undefined"` : protection SSR (localStorage n'existe pas côté serveur)
- `as const` au retour : TS infère `[T, Dispatch<SetStateAction<T>>]` au lieu de `(T | Dispatch<...>)[]`

### Exo 5
Le bouton avatar a deux couches :
1. **Fallback** (toujours rendu en dessous) : une lettre colorée sur fond rose
2. **Image** : superposée par-dessus avec `position: absolute` + `opacity-0` au départ

`onLoad` passe `imageLoaded = true` → l'image s'affiche en fondu (`opacity-100 transition-opacity`).

**Pourquoi ?**
- Pendant le chargement de l'image distante, on a un visuel immédiat (la lettre)
- Si l'image échoue à charger, on garde la lettre
- Évite le "trou blanc" pendant le chargement
- Si pas d'image (`image == null`), on n'affiche que la lettre

C'est un pattern d'**avatar gracieux** très courant.

---

## Suite

→ [Module 04 — React 19 : Server Actions, useTransition, useOptimistic](./04-react-19-avance.md)
