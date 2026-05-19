# Cours Absolute Stream — Sommaire

Cours complet pour comprendre et expliquer chaque ligne de code du projet **Absolute Stream**.

Niveau : débutant React/Next.js → autonomie complète sur la codebase.

---

## Format

Chaque module suit la même structure :

1. **Objectifs** — ce que tu sauras à la fin
2. **Notions** — vocabulaire + analogies
3. **Application dans le projet** — références aux fichiers réels (`src/.../fichier.tsx:ligne`)
4. **Décortication ligne par ligne** d'extraits clés
5. **Pièges et anti-patterns**
6. **Exercices** (3-5 par module)
7. **Corrigés détaillés**

---

## Sommaire

### Fondamentaux
- [00 — Introduction & vue d'ensemble du projet](./00-introduction.md)
- [01 — JavaScript & TypeScript modernes](./01-javascript-typescript.md)
- [02 — Next.js App Router](./02-nextjs-app-router.md)
- [03 — React : hooks fondamentaux](./03-react-hooks-fondamentaux.md)
- [04 — React 19 avancé : Server Actions, useTransition, useOptimistic](./04-react-19-avance.md)

### Stack technique
- [05 — Tailwind CSS v4](./05-tailwind-v4.md)
- [06 — Data fetching avec TMDB](./06-data-fetching-tmdb.md)
- [07 — Authentification avec Better Auth](./07-auth-better-auth.md)
- [08 — Prisma & base de données PostgreSQL](./08-prisma-bdd.md)
- [09 — Server Actions, validation Zod, cycle complet d'une mutation](./09-server-actions-zod.md)

### Composants et algos
- [10 — Composants UI réutilisables avec Radix](./10-composants-radix.md)
- [11 — Algorithmes maison](./11-algos-maison.md)
- [12 — Embla Carousel et grille responsive](./12-embla-carousel.md)

### Architecture et logique métier
- [13 — Architecture des routes](./13-architecture-routes.md)
- [14 — Logique métier du Match](./14-logique-metier-match.md)
- [15 — Conventions du projet (Git, lint, commits)](./15-conventions-projet.md)
- [16 — Projet final : reconstruction guidée + quiz 50 questions](./16-projet-final.md)

---

## Comment l'utiliser

### Lecture linéaire (recommandé pour débutant)
Commence par 00 et avance dans l'ordre. Chaque module suppose ceux d'avant.

### Lecture ciblée (si tu connais déjà certains sujets)
Tu peux piocher dans le sommaire. Chaque module est auto-contenu autant que possible. Les renvois entre modules (par exemple `[[cn]]` ou "cf. module 11") te guideront.

### En pratique
- Lis le module
- Ouvre les fichiers du projet cités
- Fais les exercices **sans regarder le corrigé**
- Vérifie avec le corrigé
- Si tu sèches → relis la partie correspondante avant de regarder

---

## Stack couverte

| Domaine | Outils |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Radix UI, Embla Carousel, Lucide |
| Langage | TypeScript 5 (strict mode) |
| BDD | PostgreSQL + Prisma 6 |
| Auth | Better Auth + OAuth GitHub/Google |
| Validation | Zod |
| Utils | clsx, tailwind-merge, cva |
| API externe | TMDB v3 |

---

## Crédits

Cours rédigé en accompagnement de la branche `docs/learning` d'Absolute Stream.
Tous les exemples de code sont tirés directement du projet (`src/`, `prisma/`, configs racine).
