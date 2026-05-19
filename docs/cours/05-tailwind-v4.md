# Module 05 — Tailwind CSS v4

## Objectifs

- Comprendre la philosophie **utility-first**
- Configurer Tailwind v4 (nouveau : config CSS-first, plus de `tailwind.config.js`)
- Maîtriser breakpoints, dark/light, variables CSS, `@theme`, `@apply`
- Décortiquer les classes complexes du projet
- Connaître les modifiers : `hover:`, `group-hover:`, `data-[state=open]:`, etc.

---

## 1. Utility-first : la philosophie

Au lieu d'écrire :
```css
.card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
}
```

```html
<div class="card">...</div>
```

…tu composes directement dans le HTML avec des classes utilitaires :
```html
<div class="bg-white rounded-lg p-4 shadow">...</div>
```

**Avantages** :
- Pas de CSS à nommer/maintenir
- Visualisation directe dans le JSX
- Pas de "CSS mort" qui traîne
- Cohérence du design (les classes utilisent une échelle prédéfinie)

**Le compromis** : le JSX devient verbeux. C'est le prix à payer.

---

## 2. Configuration Tailwind v4 (CSS-first)

⚠️ **Changement majeur** : Tailwind v4 n'utilise plus `tailwind.config.js`. Tout se configure dans le CSS.

### Setup du projet

`postcss.config.mjs` :
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

`src/app/globals.css` :
```css
@import "tailwindcss";          // ← équivalent du vieux @tailwind base/components/utilities

:root {                          // ← variables CSS globales
  --background: #000000;
  --foreground: #ffffff;
  --primary: #ffffff;
}

@theme inline {                  // ← surcharge du thème Tailwind
  --breakpoint-3xl: 1930px;      // breakpoint custom

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --font-sans: var(--font-geist-sans);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
```

### Le bloc `@theme inline`
- Définit les **tokens** de design (couleurs, polices, breakpoints…)
- Le mot-clé `inline` insère les valeurs au moment de la compilation (au lieu de produire `var(--color-...)` dans le CSS final)
- Chaque `--color-X` génère **automatiquement** les utilitaires `bg-X`, `text-X`, `border-X`, etc.

Exemple : `--color-background: var(--background)` → tu peux écrire `bg-background`, `text-background`, `border-background`.

### Variables CSS dynamiques
Dans `src/components/layout/PageBackground.tsx:10-14`, on injecte des couleurs en runtime :
```ts
document.documentElement.style.setProperty("--page-main", main);
document.documentElement.style.setProperty("--page-text", text);
```

Puis on utilise dans le JSX :
```tsx
className="bg-(--page-main) text-(--page-text)"
//        ↑ Tailwind v4 syntax pour utiliser une var CSS comme valeur
```

C'est ce qui permet au design de **changer dynamiquement** selon la couleur dominante de l'image de fond (cf. module 11).

---

## 3. Le système d'espacement et de couleurs

### Espacement (`p-`, `m-`, `gap-`, `w-`, `h-`…)
Tailwind a une échelle : `0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, …`
Chaque unité = `0.25rem` = `4px` (par défaut).

```html
<div class="p-4 gap-6 w-full max-w-360">
```
- `p-4` → `padding: 1rem` (16px)
- `gap-6` → `gap: 1.5rem`
- `max-w-360` → `max-width: 90rem` (1440px)

### Couleurs
Soit la palette de base (`zinc-50` à `zinc-950`, `blue-500`, etc.), soit tes variables (`background`, `foreground`).

```html
<div class="bg-zinc-900 text-zinc-100 border border-zinc-800">
```

### Couleurs avec opacité
```html
<div class="bg-foreground/8 hover:bg-foreground/15">
              ↑                       ↑
            opacity 0.08         opacity 0.15
```
`/N` = pourcentage d'opacité (0-100).

---

## 4. Responsive — les breakpoints

Par défaut, les utilitaires s'appliquent **à tous les écrans**. Tu ajoutes un préfixe pour cibler un breakpoint **et au-dessus** :

| Préfixe | Min width |
|---|---|
| (none) | 0 |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |
| `3xl:` | 1930px (custom du projet) |

```html
<div class="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
```
- < 640px : 2 colonnes
- ≥ 640px : 3 colonnes
- ≥ 768px : 4 colonnes
- … etc.

C'est du **mobile-first** : tu écris d'abord pour le petit écran, puis tu surcharges pour les plus grands.

### Cacher / afficher selon le viewport
```html
<nav class="hidden 2xl:flex">         <!-- caché par défaut, visible en 2xl+ -->
<div class="2xl:hidden">              <!-- visible par défaut, caché en 2xl+ -->
```
Pattern utilisé dans `NavBar` pour basculer entre menu desktop et menu hamburger mobile.

---

## 5. Pseudo-classes & états

```html
<button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 focus:ring-2">
```
- `hover:` → au survol
- `active:` → pendant le clic
- `focus:` → focus clavier
- `disabled:` → attribut `disabled`
- `focus-visible:` → focus visible (clavier, pas souris)

### `group` et `group-hover`

Le **group pattern** te permet de styler un enfant en réagissant au survol du parent :
```html
<div class="group">
  <div class="opacity-0 group-hover:opacity-100">       <!-- s'affiche quand on survole le parent -->
    ...
  </div>
</div>
```

Exemple `MediaCards.tsx:8` :
```tsx
<div className="relative group overflow-hidden rounded-md aspect-2/3">
  <Link className="...before:opacity-0 group-hover:before:opacity-100 ...">
    <Image ... />
    <div className="hidden group-hover:flex absolute ...">    {/* ← bouton play visible au hover */}
      <Play />
    </div>
    <div className="absolute bottom-0 ... translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
      {/* ← titre qui apparait par le bas au hover */}
    </div>
  </Link>
</div>
```

C'est tout l'effet "carte qui révèle le titre au survol".

### `peer`
Comme `group` mais pour un sibling :
```html
<input id="x" class="peer" />
<label for="x" class="peer-focus:text-blue-500">...</label>
```
Pas utilisé dans le projet (à ma connaissance).

---

## 6. `data-[state=open]:` — cibler les data-attributes

Les composants Radix exposent leur état via des `data-*` attributs (`data-state="open"`, `data-state="checked"`, etc.). Tailwind sait les cibler :

```tsx
// src/components/ui/dropdown-menu.tsx:45
"data-[state=open]:animate-in data-[state=closed]:animate-out
 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
 data-[side=bottom]:slide-in-from-top-2 ..."
```

→ "Quand `data-state="open"`, anime l'entrée. Quand `data-state="closed"`, anime la sortie."

```tsx
// src/components/ui/radio-group.tsx:34
"data-[state=checked]:bg-primary/10"
```
→ "Quand la radio est cochée, fond plus visible."

---

## 7. Arbitrary values

Tu peux **toujours** sortir de la palette avec `[valeur]` :
```html
<div class="w-[33vw] bg-[#E50914] grid-cols-[1fr_2fr_1fr]">
```

Tailwind compile ça en CSS arbitraire, mais avec le tree-shaking intact (seules les classes utilisées sont produites).

Exemple du projet (`globals.css` n'utilise pas trop d'arbitrary, mais `BadgeReco`) :
```tsx
<Flame className="text-[#CC4700]" />
```

### Variables CSS comme valeurs
```html
<div class="bg-(--page-main) text-(--page-text)">     <!-- v4 syntax -->
```

---

## 8. `@apply` — réutiliser des utilitaires dans du CSS

```css
/* src/app/globals.css */
.title-category {
  @apply text-lg xl:text-xl text-white font-semibold capitalize;
}
```

Utilisé dans `EmblaCarousel.tsx:37` :
```tsx
<h1 className="title-category">{title}</h1>
```

**Quand l'utiliser ?**
- Quand une combinaison se répète **vraiment** souvent
- Quand un selector complexe (`a:not(:hover)`) ne s'exprime pas en classes utilitaires

**Quand ne pas l'utiliser ?**
- Pour "extraire" un composant : préfère un composant React qui contient les classes
- Sinon tu reviens à du CSS classique qui défait le bénéfice utility-first

---

## 9. Gradient et `linear-` syntax

```tsx
className="bg-clip-text text-transparent bg-blue-500"
//         ↑ texte coloré uniquement où il y a du fond
```

Ou des gradients linéaires complexes (Tailwind v4 syntax) :
```tsx
className="bg-linear-65 from-white/10 via-white/80 to-white/10"
//         ↑ angle de 65°    ↑ stops du gradient
```

Et :
```tsx
className="before:bg-linear-to-t before:from-black/80 before:to-black/20"
//                    ↑ "to top" : du bas vers le haut
```

`before:` cible le pseudo-élément `::before` (qu'il faut activer avec `content-['']` ou similaire).

---

## 10. Le helper `cn` — fusion intelligente de classes

Le projet utilise un helper omniprésent :
```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `clsx` — composer conditionnellement
```ts
clsx("p-4", isActive && "bg-blue-500", { "text-white": true }, undefined);
// → "p-4 bg-blue-500 text-white"   (ignore undefined/false)
```

### `tailwind-merge` — résoudre les conflits
```ts
twMerge("p-4 p-6");   // → "p-6"  (le dernier l'emporte)
twMerge("text-red-500 text-blue-500");   // → "text-blue-500"
```

Sans `twMerge`, les deux classes coexistent et c'est l'ordre dans le CSS qui décide (imprévisible).

### Usage typique
```tsx
<button className={cn(
  "px-4 py-2 rounded",
  isPrimary && "bg-blue-500 text-white",
  className,    // ← permet à l'appelant de surcharger
)}>
```

---

## 11. Patterns du projet à connaître

### `min-h-screen flex flex-col` — pied de page en bas
```tsx
// src/app/layout.tsx
<body className="min-h-screen flex flex-col relative">
  <NavBar />
  {children}
  <Footer className="mt-auto" />
</body>
```
- `min-h-screen` : au moins toute la hauteur
- `flex flex-col` : colonne
- `mt-auto` sur le footer : pousse le footer en bas

### `backdrop-blur` pour le glassmorphism
```tsx
className="bg-background/70 backdrop-blur-xl border-b border-foreground/5"
```
Fond semi-transparent + flou de l'arrière-plan = effet "verre dépoli". Utilisé par la NavBar et le Footer.

### Hauteur fixe pour le hero
```tsx
<div className="w-full h-120" />   // espace dans le top des pages (library/movies)
```
`h-120` = `30rem` (480px) — équivalent du `h-[30rem]`.

### Aspect ratios
```tsx
<div className="aspect-2/3">       // poster cinéma (ratio classique)
<div className="aspect-16/6">      // bannière collection
<div className="aspect-video">     // 16/9 (équivalent aspect-16/9)
```

### Couleurs dynamiques avec `style`
```tsx
// src/app/(games)/match/page.tsx:17-23
<button
  className="bg-(--hover-color) hover:bg-(--page-main)"
  style={{
    "--hover-color": "color-mix(in srgb, var(--page-main), transparent 40%)",
  } as React.CSSProperties}
>
```
- On définit `--hover-color` en JSX inline
- On l'utilise comme couleur Tailwind via `bg-(--hover-color)`
- `color-mix` mélange la couleur avec du transparent → version atténuée

C'est subtile mais puissant.

---

## 12. Anti-patterns

### ❌ Mixer classes utilitaires et CSS custom sans raison
```tsx
<div className="custom-card p-4">       // ← `.custom-card` fait quoi ?
```
Soit tout-en-utilitaires, soit `@apply` cohérent.

### ❌ `!important` partout (`!`)
```tsx
className="!bg-red-500"   // important : forcé
```
À utiliser **en dernier recours** uniquement si quelque chose surcharge.

### ❌ Oublier `tailwind-merge` lors de surcharge
```tsx
// Mauvais
<Button className={"p-8 " + className} />
// Bon
<Button className={cn("p-8", className)} />
```

### ❌ Trop d'arbitrary values
```tsx
className="bg-[#3b82f6] text-[#fff] p-[16px]"
```
Préfère la palette/échelle. Sinon, déclare une variable globale.

---

## Exercices

### Exo 1 — Identifier les responsives
Lis cette ligne :
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
```
Combien de colonnes à `375px`, `700px`, `1100px`, `1600px` ?

### Exo 2 — Reproduire une carte
Réécris le markup d'une `MediaCards` mais sans hover effects, juste l'image en `aspect-2/3` et un titre en dessous. Utilise Tailwind.

### Exo 3 — Décortiquer
Que fait cette classe ?
```tsx
className="hover:before:opacity-100 before:-inset-px before:bg-linear-to-t before:from-black/80 before:to-black/20 before:-m-px before:z-1 before:opacity-0"
```

### Exo 4 — `cn`
Que renvoie :
```tsx
cn("text-sm p-2", isLoading && "opacity-50", "p-4", "text-lg")
```

### Exo 5 — Compose un bouton
Écris un composant `<Button variant="primary" | "secondary" | "ghost">` avec Tailwind. Aide-toi des conventions du projet (bg, text, hover, transitions).

---

## Corrigés

### Exo 1
- 375px → 2 colonnes (defaut)
- 700px → 3 (≥ 640 = sm)
- 1100px → 5 (≥ 1024 = lg)
- 1600px → 8 (≥ 1536 = 2xl)

### Exo 2
```tsx
<div className="flex flex-col gap-2">
  <div className="aspect-2/3 relative overflow-hidden rounded-md">
    <Image src={posterUrl} alt={title} fill className="object-cover" />
  </div>
  <h3 className="text-sm font-semibold line-clamp-1">{title}</h3>
</div>
```

### Exo 3
- `before:` cible un pseudo-élément `::before` (déjà présent grâce à `aspect-2/3` qui le crée probablement)
- `before:-inset-px` → position absolute, `inset: -1px` (déborde de 1px sur tous les côtés)
- `before:bg-linear-to-t` → gradient vertical, du bas vers le haut
- `before:from-black/80 before:to-black/20` → noir opaque 80% en bas, 20% en haut
- `before:-m-px` → margin négative pour aligner
- `before:z-1` → au-dessus de l'image
- `before:opacity-0` → invisible par défaut
- `hover:before:opacity-100` → opacité pleine au survol

= "voile dégradé qui apparait au survol pour assombrir le bas de la carte"

### Exo 4
```ts
cn("text-sm p-2", false, "p-4", "text-lg")
// clsx → "text-sm p-2 p-4 text-lg"
// twMerge résout les conflits :
//   text-sm vs text-lg → garde text-lg
//   p-2 vs p-4 → garde p-4
// → "p-4 text-lg"
```
Si `isLoading = true` :
```
// → "p-4 text-lg opacity-50"
```

### Exo 5
```tsx
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/80",
  secondary: "bg-foreground/8 text-foreground hover:bg-foreground/15 border border-foreground/10",
  ghost: "bg-transparent text-foreground hover:bg-foreground/8",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "h-11 px-6 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
```
Points clés :
- `Record<Variant, string>` → mappe chaque variant à ses classes
- `extends React.ButtonHTMLAttributes<HTMLButtonElement>` → on hérite des props standard d'un `<button>`
- `cn(...)` permet à l'appelant de surcharger
- `{...props}` propage tout le reste (onClick, type, etc.)

---

## Suite

→ [Module 06 — Data fetching avec TMDB](./06-data-fetching-tmdb.md)
