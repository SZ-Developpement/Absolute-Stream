# Module 10 — Composants UI réutilisables avec Radix

## Objectifs

- Comprendre la philosophie **headless UI**
- Décortiquer les wrappers Radix du projet (`DropdownMenu`, `Slider`, `RadioGroup`, `Label`)
- Maîtriser le **composition pattern** : `asChild`, `Slot`, `React.ComponentProps`
- Cibler les états avec `data-state`, `data-side`

---

## 1. Headless UI — le concept

Une bibliothèque **headless** fournit :
- ✅ Le **comportement** (accessibilité, gestion clavier, focus management, ARIA)
- ✅ La **logique** (open/close, sélection, etc.)
- ❌ **Aucun style** par défaut

À toi de styler. Radix UI est le leader. Avantages :
- Tu gardes le contrôle total sur le design
- L'accessibilité est gérée pour toi (un dropdown clavier-accessible, c'est très dur à coder soi-même correctement)
- Compatible avec Tailwind, CSS-in-JS, etc.

### L'alternative non-headless
Material UI, Chakra UI : design imposé. Plus rapide à démarrer, plus dur à customiser profondément.

---

## 2. Pattern de wrapping Radix

Le projet wrap chaque composant Radix dans un fichier local pour ajouter ses propres classes Tailwind :

```tsx
// src/components/ui/dropdown-menu.tsx (extrait)
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-background/70 backdrop-blur-xl border-b border-foreground/5 ...",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}
```

### Décortication ligne par ligne

```ts
function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
```
- `React.ComponentProps<typeof X>` : récupère **tous** les props de X (type inférré depuis la définition)
- Avantage : si Radix ajoute une prop, tu en bénéficies automatiquement
- `{ ...props }` : rest pour tout récupérer

```ts
return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
```
- `data-slot="..."` : marqueur custom (utile pour debug/tests/scoping CSS)
- `{...props}` : propage tout (children, onOpenChange, etc.)

```ts
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
```
- On **extrait** `className` et `sideOffset` du rest
- Le reste (`...props`) sera propagé inchangé
- `sideOffset = 4` : valeur par défaut customisée

```tsx
<DropdownMenuPrimitive.Content
  className={cn("bg-background/70 ...", className)}
  {...props}
/>
```
- `cn(...)` combine les classes par défaut avec la `className` éventuelle de l'appelant
- Si l'appelant fournit `className="bg-red-500"`, `twMerge` résoudra le conflit avec `bg-background/70`

---

## 3. La prop magique `asChild`

C'est **le pattern phare** de Radix.

```tsx
// Usage normal : Radix rend un <button>
<DropdownMenuTrigger>Ouvrir</DropdownMenuTrigger>

// Avec asChild : Radix prend les props et les FUSIONNE avec l'enfant
<DropdownMenuTrigger asChild>
  <button className="my-custom-class">Ouvrir</button>
</DropdownMenuTrigger>
```

**Que se passe-t-il avec `asChild` ?**
1. Radix **ne rend pas son propre élément**
2. Il clone l'enfant (`<button>`)
3. Il fusionne ses props (onClick, ref, aria-*) avec celles de l'enfant
4. L'arbre DOM final : un seul `<button>` avec **tous** les props nécessaires

C'est l'équivalent du **Slot pattern** (cf. `@radix-ui/react-slot`).

### Pourquoi ?
- Tu peux mettre **n'importe quel élément** comme trigger (un `<button>`, un `<Link>`, un `<div>`)
- Tu gardes ton design
- Tu profites de l'a11y de Radix

### Exemple du projet
```tsx
// src/components/medias/DiscoverMedia.tsx:72
<DropdownMenuTrigger asChild>
  <button className="whitespace-nowrap py-2 px-4 ...">
    <ListFilter size={14} />
    {activeGenreName}
  </button>
</DropdownMenuTrigger>
```
Le `<button>` reste un vrai `<button>` (sémantique HTML correcte), mais Radix lui ajoute les `aria-*` et le `onClick` pour ouvrir le menu.

---

## 4. `<Slider>` — décortication

```tsx
// src/components/ui/slider.tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  color = "#E50914",
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { color?: string }) {

  // ① Calcule le tableau de valeurs (pour savoir combien de thumbs rendre)
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn("relative py-2 flex w-full ...", className)}
      {...props}
    >
      {/* ② La piste */}
      <SliderPrimitive.Track className={cn("relative grow overflow-hidden rounded-full bg-background ...")}>
        {/* ③ La portion "active" (entre les deux thumbs si plage) */}
        <SliderPrimitive.Range
          className={cn("absolute ...")}
          style={{ background: color }}
        />
      </SliderPrimitive.Track>

      {/* ④ Un thumb par valeur */}
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ..."
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
```

### Pourquoi `useMemo` ?
- `_values` est utilisé dans `Array.from(...)` pour render N thumbs
- Sans memo, à chaque render on recrée un nouveau tableau → si `value` est un tableau, React croit qu'il change même quand le contenu est identique
- Avec memo, on garde la même référence tant que les deps ne changent pas

### Le `color` prop
Radix ne le supporte pas natif → on l'ajoute via `& { color?: string }` (intersection de types). On l'utilise pour styler le Range dynamiquement :
```tsx
style={{ background: color }}
```

### Usage
```tsx
// src/app/(games)/match/[sessionId]/page.tsx:45-53
<Slider
  id="slider-date"
  value={value}                    // [1970, 2026]
  onValueChange={setValue}
  min={1970}
  max={2026}
  step={1}
  color="var(--page-main)"         // couleur dynamique de la page
/>
```
2 valeurs dans `value` → 2 thumbs (plage).

---

## 5. `<RadioCards>` — wrapper sur RadioGroup

```tsx
// src/components/ui/radio-group.tsx
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

function RadioCards({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

function RadioCardsItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        // Base
        "relative flex flex-col items-center justify-between rounded-md bg-primary/5 px-6 py-2 text-sm shadow-sm transition-all outline-none cursor-pointer font-medium",
        // Hover
        "hover:bg-primary/10",
        // Coché (Radix expose data-state="checked")
        "data-[state=checked]:bg-primary/10",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}
```

### Le selector `data-[state=checked]:bg-primary/10`
Radix expose son état via `data-state`. Tailwind le cible directement avec `data-[state=value]:`. Pas besoin de gérer un state React, c'est purement CSS.

### Usage
```tsx
<RadioCards defaultValue="movie" className="flex flex-row flex-wrap gap-2">
  <RadioCardsItem value="movie"><span>Films</span></RadioCardsItem>
  <RadioCardsItem value="tv"><span>Séries</span></RadioCardsItem>
  <RadioCardsItem value="anime"><span>Animé</span></RadioCardsItem>
  <RadioCardsItem value="all"><span>Tous</span></RadioCardsItem>
</RadioCards>
```

Radix s'occupe de :
- Cocher/décocher au clic
- Navigation flèches clavier
- ARIA roles (`radiogroup`, `radio`)
- Focus management

---

## 6. `<Label>` — wrapper minimal

```tsx
// src/components/ui/label.tsx
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none ...",
        className,
      )}
      {...props}
    />
  );
}
```

Radix `<Label>` ajoute deux choses :
- Click sur le label → focus sur le champ associé
- Style "disabled" automatique si le champ associé est disabled (via `peer-disabled:`)

---

## 7. La directive `"use client"` sur ces composants

**Tous** les wrappers Radix commencent par `"use client"`. Pourquoi ?
- Ils utilisent les hooks Radix qui gèrent du state
- Ils écoutent des events DOM (`onClick`, `onKeyDown`…)
- Ils manipulent le focus

Conséquence : un Server Component peut importer ces wrappers, mais ils seront rendus comme des Client Components.

---

## 8. Composer un composant from scratch

Imagine que tu veux faire ton propre `<Tabs>`. Le pattern Radix :

```tsx
// Niveau "primitives" : structure logique
<Tabs defaultValue="movies">
  <TabsList>
    <TabsTrigger value="movies">Films</TabsTrigger>
    <TabsTrigger value="series">Séries</TabsTrigger>
  </TabsList>
  <TabsContent value="movies">...</TabsContent>
  <TabsContent value="series">...</TabsContent>
</Tabs>
```

- `<Tabs>` : conteneur, gère le state actif (via Context interne)
- `<TabsList>` : conteneur des triggers
- `<TabsTrigger value="X">` : un bouton, active la tab "X"
- `<TabsContent value="X">` : montre le contenu si "X" est actif

Chaque sous-composant utilise un Context interne pour savoir quelle tab est active.

C'est exactement ce que fait Radix pour `Tabs`, `Dialog`, `Select`, etc.

---

## 9. La règle d'or des wrappers

✅ Toujours ajouter `data-slot` (debug, CSS scoping)
✅ Toujours utiliser `cn(...)` avec un default + `className` de l'appelant
✅ Toujours spread `...props` à la fin (l'appelant doit pouvoir surcharger)
✅ Utiliser `React.ComponentProps<typeof X>` pour le typage (sync avec la lib)
✅ Marquer `"use client"` car les composants Radix en ont besoin

❌ Ne **jamais** changer le comportement métier de Radix (un dropdown doit être un dropdown)
❌ Ne pas oublier le `Portal` quand Radix le recommande (Dialog, DropdownMenu Content…) — sinon overflow/z-index ne marchent pas

---

## Exercices

### Exo 1 — `asChild` ou pas ?
Pour chaque cas, dis si tu utiliserais `asChild` :
1. Trigger d'un dropdown avec un texte simple
2. Trigger d'un dropdown qui doit être un Link vers `/profile`
3. Wrapper d'un input dans un Label avec icône
4. Bouton submit dans un form

### Exo 2 — Décortiquer une classe
Explique chaque morceau de :
```tsx
"data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[side=bottom]:slide-in-from-top-2"
```

### Exo 3 — Créer un wrapper Tooltip
Avec `@radix-ui/react-tooltip`, crée :
```tsx
<Tooltip>
  <TooltipTrigger asChild><button>Hover me</button></TooltipTrigger>
  <TooltipContent>Texte du tooltip</TooltipContent>
</Tooltip>
```
(En te basant sur le pattern de dropdown-menu.tsx.)

### Exo 4 — Composition vs renderProps
Pourquoi Radix utilise la composition (children) plutôt que des render props ?
```tsx
// Radix (composition)
<Dropdown>
  <Dropdown.Trigger>...</Dropdown.Trigger>
  <Dropdown.Content>...</Dropdown.Content>
</Dropdown>

// Hypothétique (render props)
<Dropdown
  renderTrigger={(open) => ...}
  renderContent={() => ...}
/>
```

### Exo 5 — Variantes avec `class-variance-authority`
Le projet a `cva` dans `package.json` mais ne l'utilise pas (encore). Crée un `<Button>` avec des variants typés :
- `variant`: "primary" | "secondary" | "ghost"
- `size`: "sm" | "md" | "lg"
- `disabled` peut être un state visuel séparé

---

## Corrigés

### Exo 1
1. **Pas besoin d'`asChild`** : tu peux écrire `<DropdownMenuTrigger>Ouvrir</DropdownMenuTrigger>` directement, Radix rend un `<button>`.
2. **`asChild` obligatoire** : `<DropdownMenuTrigger asChild><Link href="/profile">...</Link></DropdownMenuTrigger>` pour préserver la sémantique de Link.
3. **Pas pertinent** : Label n'a pas `asChild`, c'est un wrapper simple. Tu mets l'icône en `children`.
4. **Pas d'asChild** mais utilise `type="submit"` directement sur le bouton.

### Exo 2
- `data-[state=open]:animate-in` → quand le composant Radix a `data-state="open"`, applique l'animation d'entrée (`tailwindcss-animate`)
- `data-[state=closed]:fade-out-0` → fermé : opacité passe à 0
- `data-[side=bottom]:slide-in-from-top-2` → si le dropdown s'ouvre en-dessous du trigger (`data-side="bottom"`), il glisse depuis le haut (de 2 unités)

Tout est piloté par les data-attributes que Radix gère automatiquement selon le placement et l'état.

### Exo 3
```tsx
"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background px-2 py-1 rounded text-xs shadow-md",
          "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
```
Note : Radix Tooltip nécessite un `<TooltipProvider>` à la racine de l'app (typiquement dans le layout).

### Exo 4
Avantages de la composition :
- **JSX plus lisible** (l'arbre visuel = l'arbre logique)
- **Plus flexible** : tu peux insérer ce que tu veux comme enfants (icônes, séparateurs)
- **Plus testable** : tu peux rendre chaque sous-composant isolément
- **Pas de prop hell** : si on avait `renderTrigger`, `renderContent`, `renderItem`, `renderItemIcon`, ça explose
- **Composition naturelle** avec d'autres composants (`<Link>`, `<button>` via `asChild`)

Avantages des render props (théoriques) :
- Accès au state interne dans le callback
- Moins de "components à exporter"

Mais Radix expose le state via `data-*` attributes (suffisant pour 99% des cas) → composition wins.

### Exo 5
```tsx
"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // base classes
  "inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-foreground/80",
        secondary: "bg-foreground/8 text-foreground hover:bg-foreground/15 border border-foreground/10",
        ghost: "bg-transparent text-foreground hover:bg-foreground/8",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// Usage
<Button variant="secondary" size="lg" disabled>Suivant</Button>
```

`cva` génère :
- Une fonction qui prend `{ variant, size }` et retourne la string de classes
- Le type `VariantProps<typeof buttonVariants>` pour le typage automatique

C'est le pattern utilisé par **shadcn/ui** (qui est sans doute la source de l'approche `cn` + Radix du projet).

---

## Suite

→ [Module 11 — Algorithmes maison du projet](./11-algos-maison.md)
