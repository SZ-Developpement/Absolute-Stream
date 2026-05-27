# Module 12 — Embla Carousel et la grille responsive

## Objectifs

- Comprendre l'API d'Embla (`useEmblaCarousel`, `emblaApi`)
- Décortiquer le composant `EmblaCarousel` du projet
- Maîtriser le mapping **`basis-1/N` ↔ `grid-cols-N`** pour avoir le même visuel en grille et en carrousel
- Connaître `React.Children.map`

---

## 1. Pourquoi Embla ?

Un carrousel **bien fait**, c'est dur :
- Inertie au swipe
- Touch + souris + clavier (a11y)
- Snap aux items
- Loop sans saut
- Performances sur mobile
- Calcul des "slides visibles"

[Embla Carousel](https://www.embla-carousel.com/) est une lib légère (~3 KB gzip) qui gère tout ça en mode **headless** : tu fournis le markup et les styles, Embla gère la mécanique.

---

## 2. Setup

```bash
npm install embla-carousel-react
```

```tsx
"use client";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";

const [emblaRef, emblaApi] = useEmblaCarousel(options);
```

Le hook retourne :
- `emblaRef` : à attacher au **viewport** (le conteneur scrollable)
- `emblaApi` : l'API pour contrôler le carrousel (scrollNext, scrollPrev, on, etc.). Peut être `undefined` au premier render.

---

## 3. Structure HTML obligatoire

```tsx
<div className="overflow-hidden" ref={emblaRef}>     {/* Viewport */}
  <div className="flex">                              {/* Container */}
    <div className="flex-shrink-0 min-w-0 basis-1/3">Slide 1</div>
    <div className="flex-shrink-0 min-w-0 basis-1/3">Slide 2</div>
    <div className="flex-shrink-0 min-w-0 basis-1/3">Slide 3</div>
  </div>
</div>
```

- Le **viewport** (avec `ref`) doit avoir `overflow-hidden`
- Le **container** doit être en `flex` (les slides côte à côte)
- Les **slides** ne doivent pas rétrécir (`flex-shrink-0`) et avoir une largeur fixée (par exemple `basis-1/3`)

---

## 4. Le composant `EmblaCarousel` du projet

```tsx
// src/components/medias/EmblaCarousel.tsx
"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmblaCarouselProps {
  opts?: EmblaOptionsType;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function EmblaCarousel({ children, opts, className, title }: EmblaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(opts);

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row items-center justify-between">
          <h1 className="title-category">{title}</h1>
          <div className="flex flex-row items-center gap-2">
            <button onClick={scrollPrev} aria-label="Slide précédent">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={scrollNext} aria-label="Slide suivant">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="overflow-hidden -mx-3" ref={emblaRef}>
          {/* Container */}
          <div className="flex select-none">
            {React.Children.map(children, (child) => (
              <div className="min-w-0 px-3 shrink-0 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/8">
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Décortication

#### `useCallback` autour des handlers
```tsx
const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
```

**Pourquoi `useCallback` ?**
- `emblaApi` est `undefined` au premier render, puis défini ensuite
- Sans `useCallback`, la fonction `() => emblaApi?.scrollPrev()` est recréée à chaque render
- Avec `useCallback([emblaApi])`, elle est stable tant que `emblaApi` ne change pas
- En pratique : **utile si tu attaches** ces handlers à un effet ou à un autre composant memoïsé. Ici les boutons sont des HTML natifs (pas memoïsés), donc le bénéfice est faible
- Reste un **bon réflexe** quand on dépend d'une valeur potentiellement undefined

#### `React.Children.map`
```tsx
{React.Children.map(children, (child) => (
  <div className="basis-1/2 sm:basis-1/3 ...">
    {child}
  </div>
))}
```

`children` est de type `ReactNode` — peut être :
- Un seul élément
- Un tableau d'éléments
- Une string, un fragment, `null`, `undefined`…

Si tu fais `children.map(...)` direct, ça crash quand `children` n'est pas un tableau.

`React.Children.map(children, fn)` :
- Marche dans **tous** les cas
- Filtre les `null`/`undefined`
- Re-attache des keys uniques aux enfants (utile pour éviter les warnings React)

Donc l'appelant peut faire :
```tsx
<EmblaCarousel>
  {popularMovies.map((movie) => <MediaCards key={movie.id} media={movie} />)}
</EmblaCarousel>
```
Et Embla wrap chaque carte dans son div positionné.

---

## 5. Le mapping `basis-1/N` ↔ `grid-cols-N`

Regarde de près ces deux blocs du projet :

```tsx
// EmblaCarousel (carrousel) — par enfant :
"basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/8"

// DiscoverMedia + LibraryContainer (grille) — sur le parent :
"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8"
```

**Le mapping est exact** :
| Breakpoint | Cards visibles |
|---|---|
| < sm (mobile) | 2 |
| sm (640px+) | 3 |
| md (768px+) | 4 |
| lg (1024px+) | 5 |
| xl (1280px+) | 6 |
| 2xl (1536px+) | 8 |

C'est génial parce que **la fiche de film fait la même largeur** dans une grille et dans un carrousel. Tu peux mettre les mêmes cartes dans `LibraryContainer` (grille) et `EmblaCarousel` (slide) sans qu'elles changent visuellement.

### `basis-1/N`
- `basis-1/2` = `flex-basis: 50%`
- Combiné à `flex` du parent et `min-w-0 shrink-0` de l'enfant, ça force chaque slide à faire 50% de la largeur du viewport
- Avec 5 items et `basis-1/5`, on voit 5 slides en plein

### `min-w-0` + `shrink-0`
- `min-w-0` : permet à l'élément de **rétrécir** en-dessous de sa taille de contenu (sans ça, le flexbox impose une taille minimale ≥ contenu)
- `shrink-0` : empêche l'élément de **rétrécir** en-dessous de sa basis
- Le combo : `basis-1/3` est respecté à la lettre

### `-mx-3` + `px-3`
```tsx
<div className="overflow-hidden -mx-3" ref={emblaRef}>
  <div className="flex">
    <div className="px-3 ...">{child}</div>
```
- `-mx-3` (marge négative) sur le viewport
- `px-3` sur chaque slide
- Effet : un **gap visuel** de 24px (`px-3` = 12px de chaque côté) entre les slides, sans casser le calcul de basis (les bordures débordent du viewport visible)

---

## 6. Les options d'Embla

```tsx
<EmblaCarousel
  title="Tendances du moment"
  opts={{ align: "start", loop: true, dragFree: true }}
>
```

| Option | Effet |
|---|---|
| `align: "start"` | Aligne les slides à gauche du viewport |
| `align: "center"` | Aligne au centre (utile pour des highlights) |
| `loop: true` | Le carrousel boucle (revient au début après le dernier) |
| `dragFree: true` | Pas de snap : l'inertie continue sans coller à un slide |
| `slidesToScroll: 3` | Combien de slides à scroller par appel de scrollNext |
| `containScroll: "trimSnaps"` | Empêche de scroller plus que ce qu'il faut |
| `axis: "y"` | Carrousel vertical |

---

## 7. Plugins Embla

Embla a un système de plugins. Les plus utiles :
- `embla-carousel-autoplay` : autoplay
- `embla-carousel-class-names` : ajoute des classes `is-selected`, `is-prev`, `is-next` aux slides
- `embla-carousel-wheel-gestures` : scroll à la molette

**Pas utilisés dans le projet** mais bon à savoir.

---

## 8. Écouter les events

```tsx
useEffect(() => {
  if (!emblaApi) return;

  const onSelect = () => {
    const idx = emblaApi.selectedScrollSnap();
    setCurrentIndex(idx);
  };

  emblaApi.on("select", onSelect);
  onSelect();   // appelle une première fois

  return () => {
    emblaApi.off("select", onSelect);
  };
}, [emblaApi]);
```

Events utiles :
- `select` : quand la slide active change
- `init` : quand Embla est prêt
- `reInit` : après resize
- `scroll` : pendant le scroll
- `settle` : quand le scroll se stabilise

---

## 9. Anti-patterns

### ❌ Oublier `overflow-hidden` sur le viewport
Les slides débordent visuellement → ça scroll horizontalement la page entière.

### ❌ Mettre `position: absolute` sur les slides
Embla a besoin de la taille naturelle (basis) pour calculer. `position: absolute` casse tout.

### ❌ Wrapper `children` après le `React.Children.map`
Ne fais pas :
```tsx
<div className="basis-1/3">
  <SomeWrapper>{children}</SomeWrapper>
</div>
```
parce que `SomeWrapper` peut introduire une div intermédiaire qui casse le `flex`. Mets toujours le slide en direct enfant du container flex.

### ❌ Recréer Embla à chaque render
`useEmblaCarousel(opts)` doit recevoir des `opts` stables. Si tu passes `{ align: "start" }` inline, c'est OK (Embla ne re-init pas) mais pour des cas complexes, utilise `useMemo`.

---

## Exercices

### Exo 1 — Compter les slides
À une largeur de **1024px** (lg), combien de slides du projet sont visibles dans le carrousel ?

### Exo 2 — Implémenter un indicateur
Ajoute au `EmblaCarousel` un indicateur "1 / 20" qui affiche le nombre de slides et l'index courant. Indice : `emblaApi.scrollSnapList()` et `emblaApi.selectedScrollSnap()`.

### Exo 3 — Autoplay
Ajoute le plugin `embla-carousel-autoplay` au projet : `npm install embla-carousel-autoplay`. Modifie `EmblaCarousel` pour qu'il accepte une prop `autoplay?: boolean` et lance l'autoplay avec un délai de 4 secondes.

### Exo 4 — Pourquoi `React.Children.map` ?
Compare ces deux versions :
```tsx
// A
{React.Children.map(children, (c) => <div>{c}</div>)}
// B
{children.map((c) => <div>{c}</div>)}
```
Cite 2 scénarios où la version B échoue.

### Exo 5 — Synchroniser carrousel et state
Implémente un `<EmblaCarouselControlled>` où l'index courant est dans le state du parent et peut être set depuis l'extérieur (boutons "Aller à slide 5").

---

## Corrigés

### Exo 1
À 1024px = breakpoint **lg** → `lg:basis-1/5` → **5 slides** visibles.

### Exo 2
```tsx
"use client";
import { useState, useEffect } from "react";

// dans EmblaCarousel
const [snapList, setSnapList] = useState<number[]>([]);
const [selectedIdx, setSelectedIdx] = useState(0);

useEffect(() => {
  if (!emblaApi) return;
  setSnapList(emblaApi.scrollSnapList());
  const onSelect = () => setSelectedIdx(emblaApi.selectedScrollSnap());
  emblaApi.on("select", onSelect);
  return () => { emblaApi.off("select", onSelect); };
}, [emblaApi]);

// dans le JSX
<span className="text-sm text-foreground/60">
  {selectedIdx + 1} / {snapList.length}
</span>
```

### Exo 3
```tsx
import Autoplay from "embla-carousel-autoplay";

interface EmblaCarouselProps {
  // ... existing props
  autoplay?: boolean;
}

export function EmblaCarousel({ autoplay, opts, ... }: EmblaCarouselProps) {
  const plugins = autoplay ? [Autoplay({ delay: 4000, stopOnInteraction: true })] : [];
  const [emblaRef, emblaApi] = useEmblaCarousel(opts, plugins);
  // ...
}

// Usage
<EmblaCarousel title="Tendances" autoplay opts={{ loop: true }}>
```

### Exo 4
Version B échoue quand :
1. **`children` est un seul élément, pas un tableau** :
   ```tsx
   <EmblaCarousel><div>Hello</div></EmblaCarousel>
   ```
   `children` = `ReactElement`, pas de méthode `.map()` → crash.
2. **`children` contient un fragment ou un null** :
   ```tsx
   {condition && <Item />}
   ```
   `React.Children.map` saute les `null`. `.map()` direct crash sur null.

### Exo 5
```tsx
"use client";
import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface Props {
  selectedIndex: number;
  onSelectChange: (i: number) => void;
  children: React.ReactNode;
}

export function EmblaCarouselControlled({ selectedIndex, onSelectChange, children }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });

  // External → Embla
  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== selectedIndex) {
      emblaApi.scrollTo(selectedIndex);
    }
  }, [emblaApi, selectedIndex]);

  // Embla → External
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => onSelectChange(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelectChange]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {React.Children.map(children, (c) => (
          <div className="shrink-0 min-w-0 basis-1/3">{c}</div>
        ))}
      </div>
    </div>
  );
}

// Usage
const [idx, setIdx] = useState(0);
<EmblaCarouselControlled selectedIndex={idx} onSelectChange={setIdx}>
  {items.map(...)}
</EmblaCarouselControlled>
<button onClick={() => setIdx(5)}>Aller à 5</button>
```
**Attention** : ne pas oublier de guard `if (emblaApi.selectedScrollSnap() !== selectedIndex)` pour éviter une boucle infinie (effet déclenche `onSelectChange` → state change → effet déclenche `scrollTo` → embla déclenche select → …).

---

## Suite

→ [Module 13 — Architecture des routes](./13-architecture-routes.md)
