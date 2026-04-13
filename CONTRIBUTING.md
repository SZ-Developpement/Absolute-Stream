# Guide de contribution — Absolute Stream

Bienvenue sur Absolute Stream ! Ce guide explique tout ce qu'il faut savoir pour contribuer proprement au projet.

---

## Table des matières

1. [Stratégie de branches](#stratégie-de-branches)
2. [Convention de commits](#convention-de-commits)
3. [Procédure de Pull Request](#procédure-de-pull-request)
4. [Règles de code](#règles-de-code)
5. [Workflow quotidien](#workflow-quotidien)
6. [Résolution de conflits](#résolution-de-conflits)
7. [FAQ](#faq)

---

## Stratégie de branches

### Schéma général

```
main          <- PRODUCTION — code stable, déployé sur Vercel
|
dev           <- INTÉGRATION — code testé, prêt à merger dans main
|-- feat/...  <- Nouvelles fonctionnalités
|-- fix/...   <- Corrections de bugs
|-- chore/... <- Config, dépendances, refacto
|-- docs/...  <- Documentation
```

### Règles absolues

| Règle                            | Détail                                 |
| -------------------------------- | -------------------------------------- |
| Jamais de push direct sur main   | Passe toujours par une PR              |
| Jamais de push direct sur dev    | Passe toujours par une PR              |
| Une branche = une tâche          | Chaque feature/fix a sa propre branche |
| PR revue par au moins 1 personne | Pas de merge sans review               |

### Nommage des branches

```
type/description-courte-en-kebab-case
```

| Type  | Usage                   | Exemple                       |
| ----- | ----------------------- | ----------------------------- |
| feat  | Nouvelle fonctionnalité | feat/match-swipe-interface    |
| fix   | Correction de bug       | fix/tmdb-search-empty-results |
| chore | Config, deps, refacto   | chore/setup-better-auth       |
| docs  | Documentation           | docs/update-readme            |
| test  | Ajout de tests          | test/match-session-api        |
| style | CSS/UI sans logique     | style/media-card-dark-mode    |

---

## Convention de commits

Format : `type(scope): description courte en minuscules`

Scopes disponibles : `auth`, `library`, `media`, `match`, `reviews`, `social`, `ui`, `db`, `ci`, `tmdb`

### Exemples

```bash
feat(match): add swipe interface with left/right gestures
feat(library): add media status filter component
feat(tmdb): integrate movie search with dynamic results
feat(auth): setup better auth with neondb adapter
feat(social): add followers system and profile page
fix(match): resolve session sync between two users
fix(library): resolve status update not persisting
chore(deps): add better-auth and prisma dependencies
chore(db): add match session table to prisma schema
docs(readme): add match system flow documentation
style(ui): update dark mode media card hover state
```

### Règles

- Description en anglais
- Verbe à l'infinitif (add, fix, update)
- Minuscules partout
- Pas de point à la fin
- Pas de message vague : fix, update, wip sont interdits

---

## Procédure de Pull Request

### Etape 1 — Créer ta branche depuis dev

```bash
git checkout dev
git pull origin dev
git checkout -b feat/ma-feature
```

### Etape 2 — Développer et committer

```bash
git add src/components/match/SwipeCard.tsx
git commit -m "feat(match): add swipe card component"
git push origin feat/ma-feature
```

### Etape 3 — Ouvrir la PR sur GitHub

1. GitHub -> Pull Requests -> New Pull Request
2. Base : dev <- Compare : feat/ma-feature
3. Remplir le template de PR
4. Assigner l'autre membre comme reviewer
5. Submit

### Etape 4 — Après review

- Changements demandés -> corriger sur la même branche puis push
- Approuvé -> Squash and Merge dans dev
- Supprimer la branche après le merge

---

## Règles de code

### TypeScript / Next.js

```typescript
// Toujours typer les props
interface SwipeCardProps {
  media: TMDBMedia;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

// Server Components par défaut
// Ajouter "use client" seulement si hooks ou events nécessaires

// Server Actions pour les mutations (pas de clés exposées)
("use server");
export async function swipeMedia(
  sessionId: string,
  tmdbId: number,
  direction: "left" | "right",
) {
  const session = await auth();
  // ...
}

// Jamais de clé API en dur
// Toujours utiliser process.env.TMDB_API_KEY
```

### Nommage

| Element          | Convention      | Exemple            |
| ---------------- | --------------- | ------------------ |
| Composants React | PascalCase      | SwipeCard.tsx      |
| Hooks            | camelCase + use | useMatchSession.ts |
| Server Actions   | camelCase       | swipeMedia.ts      |
| Utils / lib      | camelCase       | tmdbClient.ts      |
| Types            | PascalCase      | MatchSession.ts    |

### Prisma / Base de données

```typescript
// Toujours utiliser le client singleton
import { prisma } from "@/lib/prisma";

// Toujours gérer les erreurs dans les Route Handlers
try {
  const match = await prisma.matchSession.findUnique({
    where: { id: sessionId },
    include: { swipes: true },
  });
} catch (error) {
  return NextResponse.json({ error: "Database error" }, { status: 500 });
}
```

---

## Workflow quotidien

### Début de journée

```bash
git checkout dev
git pull origin dev
git checkout feat/ma-feature
git rebase dev
```

### Vérifier avant de PR

```bash
npm run lint
npm run type-check
npm run build
```

---

## Résolution de conflits

```bash
git checkout dev && git pull
git checkout feat/ma-feature
git rebase dev

git add fichier-résolu.tsx
git rebase --continue

git push origin feat/ma-feature --force-with-lease
```

---

## FAQ

**Q : J'ai commité sur dev directement.**
R : `git reset HEAD~1` pour défaire le commit, crée ta branche, recommit.

**Q : Comment annuler mon dernier commit ?**
R : `git reset HEAD~1` (garde les fichiers) ou `git reset --hard HEAD~1` (supprime tout).

**Q : Je ne dois jamais commiter le .env.local ?**
R : Exact, il est dans le .gitignore. Idem pour node_modules et .next.

**Q : Server Component ou Client Component pour le swipe ?**
R : Le swipe nécessite des interactions et des animations -> "use client". La logique de vérification du Match se fait côté serveur via une Server Action.

**Q : Comment tester la session Match en local ?**
R : Ouvre deux fenêtres de navigateur avec deux comptes différents sur la même session.
