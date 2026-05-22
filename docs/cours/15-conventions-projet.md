# Module 15 — Conventions du projet

## Objectifs

- Comprendre la **stratégie de branches** et le workflow Git
- Maîtriser la **convention de commits** du projet
- Connaître les règles de **PR** et de **review**
- Maîtriser `lint`, `type-check`, `build` avant push
- Comprendre la structure et le nommage des fichiers

---

## 1. Stratégie de branches

```
main          ← PRODUCTION : code stable, déployé sur Vercel
|
dev           ← INTÉGRATION : code testé, prêt à merger dans main
|-- feat/...  ← Nouvelles fonctionnalités
|-- fix/...   ← Corrections de bugs
|-- chore/... ← Config, dépendances, refacto
|-- docs/...  ← Documentation (← branche actuelle !)
|-- test/...  ← Ajout de tests
|-- style/... ← CSS/UI sans logique
```

### Règles **absolues** (citées dans `CONTRIBUTING.md`)
1. Jamais de push direct sur `main`
2. Jamais de push direct sur `dev`
3. Une branche = une tâche
4. PR revue par au moins 1 personne avant merge

### Nommage
Format : `type/description-kebab-case`

Exemples valides :
- `feat/match-swipe-interface`
- `fix/tmdb-search-empty-results`
- `chore/setup-better-auth`
- `docs/update-readme`

❌ Non valides :
- `mafeature` (pas de type)
- `feat-match` (pas de slash)
- `feat/MatchSwipe` (pas kebab-case)
- `wip` (vague)

---

## 2. Convention de commits

Format : `type(scope): description courte en anglais`

```bash
feat(match): add swipe interface with left/right gestures
fix(library): resolve status update not persisting
chore(deps): add better-auth and prisma dependencies
docs(readme): add match system flow documentation
```

### Types disponibles
| Type | Quand |
|---|---|
| `feat` | Nouvelle fonctionnalité utilisateur |
| `fix` | Correction de bug |
| `chore` | Config, dépendances, refacto sans impact UX |
| `docs` | Documentation |
| `test` | Tests |
| `style` | CSS/UI sans logique |
| `perf` | Amélioration de performance |
| `refactor` | Refactor sans changement de comportement |
| `ci` | CI/CD changes |

### Scopes disponibles
`auth`, `library`, `media`, `match`, `reviews`, `social`, `ui`, `db`, `ci`, `tmdb`

### Règles
- **Anglais** (cohérence inter-équipe)
- **Verbe à l'infinitif** : `add`, `fix`, `update` (pas `added`, `fixing`)
- **Minuscules** partout
- **Pas de point** à la fin
- **Pas de messages vagues** : `fix`, `update`, `wip` interdits

### Bons / mauvais commits
✅ `feat(match): add swipe interface with left/right gestures`
✅ `fix(auth): resolve session not persisting after refresh`
✅ `chore(db): add match session table to prisma schema`

❌ `Fix bug`
❌ `update stuff`
❌ `wip`
❌ `feat: ajout du système match` (français)

---

## 3. Le workflow quotidien

### Début de journée
```bash
git checkout dev
git pull origin dev          # récupérer les derniers changements
git checkout ma-branche
git rebase dev               # rebaser sur dev pour minimiser les conflits
```

### Pendant la journée
```bash
git add src/components/match/SwipeCard.tsx
git commit -m "feat(match): add swipe card component"
git push origin feat/match-swipe-interface
```

### Avant de PR
```bash
npm run lint           # ESLint
npm run type-check     # TypeScript --noEmit
npm run build          # Build de prod pour s'assurer que tout passe
```

Si un de ces 3 échoue → tu corriges avant de pusher.

---

## 4. La Pull Request

### Étapes
1. **GitHub → Pull Requests → New PR**
2. **Base** : `dev` ← **Compare** : `feat/ma-feature`
3. Remplir le template (titre clair, description, captures d'écran si UI)
4. Assigner l'autre membre comme reviewer
5. Submit

### Après review
- Changements demandés → corriger sur la même branche, push, le reviewer relit
- Approuvée → **Squash and Merge** dans `dev`
- Supprimer la branche après le merge

### Pourquoi Squash and Merge ?
- Tu peux faire **plein de petits commits** localement (WIP, "test", "fix typo"…)
- Au merge, tout est combiné en **1 seul commit propre** dans `dev`
- L'historique de `dev` reste lisible

---

## 5. Résolution de conflits

```bash
git checkout dev && git pull           # récupérer dev à jour
git checkout feat/ma-feature
git rebase dev                          # rejouer mes commits sur dev

# si conflit :
# (Éditer les fichiers en conflit pour résoudre)
git add fichier-resolu.tsx
git rebase --continue                   # continuer le rebase

# pousser (force nécessaire car l'historique a changé)
git push origin feat/ma-feature --force-with-lease
```

⚠️ `--force-with-lease` est **plus sûr** que `--force` : il refuse de pusher si quelqu'un d'autre a pushé entre temps.

---

## 6. Conventions de code

### TypeScript / Next.js
```typescript
// Toujours typer les props
interface SwipeCardProps {
  media: TMDBMedia;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

// Server Components par défaut
// "use client" UNIQUEMENT si hooks/events nécessaires
```

### Server Actions
```ts
"use server";
export async function swipeMedia(...) {
  const session = await auth();
  // ...
}
```

### Jamais de clé API en dur
```ts
// ❌
const apiKey = "abc123";

// ✅
const apiKey = process.env.TMDB_API_KEY;
```

### Nommage des fichiers
| Élément | Convention | Exemple |
|---|---|---|
| Composants React | PascalCase | `SwipeCard.tsx` |
| Hooks | camelCase + `use` prefix | `useMatchSession.ts` |
| Server Actions | camelCase | `swipeMedia.ts` |
| Utils / lib | camelCase | `tmdbClient.ts` |
| Types | PascalCase | `MatchSession.ts` |

### Prisma
```ts
// Toujours utiliser le singleton
import prisma from "@/lib/prisma";   // ✅ pas `new PrismaClient()`

// Toujours try/catch les routes handlers
try {
  const match = await prisma.matchSession.findUnique({ where: { id } });
} catch (error) {
  return NextResponse.json({ error: "DB error" }, { status: 500 });
}
```

---

## 7. ESLint

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

Les configs `nextVitals` et `nextTs` apportent :
- Règles React (hooks-rules, deps exhaustives…)
- Règles Next (a11y, performance, Image alt obligatoire…)
- Règles TypeScript (no-explicit-any, no-unused-vars…)

`globalIgnores` : on ignore les builds et les fichiers générés.

### Lancer le lint
```bash
npm run lint              # check uniquement
npm run lint -- --fix     # auto-fix les erreurs corrigeables
```

---

## 8. TypeScript config

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,                     // ← MODE STRICT activé
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }     // ← alias @/
  }
}
```

### `strict: true`
Active plein de checks dont :
- `strictNullChecks` : `null` / `undefined` ne sont pas assignables à d'autres types implicitement
- `noImplicitAny` : pas de paramètres implicitement `any`
- `strictFunctionTypes`, `strictBindCallApply`, etc.

### `noEmit: true`
TS ne produit pas de fichiers JS. C'est Next qui compile (via SWC).

### Type-check
```bash
npm run type-check        # tsc --noEmit
```

---

## 9. La FAQ tirée de CONTRIBUTING.md

> **Q : J'ai commité sur dev directement.**
> R : `git reset HEAD~1` pour défaire le commit, crée ta branche, recommit.

> **Q : Comment annuler mon dernier commit ?**
> R : `git reset HEAD~1` (garde les fichiers) ou `git reset --hard HEAD~1` (supprime tout).

> **Q : Je ne dois jamais commiter le .env.local ?**
> R : Exact, il est dans le .gitignore.

> **Q : Server Component ou Client Component pour le swipe ?**
> R : Le swipe nécessite des interactions et des animations → "use client". La logique de vérification du Match se fait côté serveur via une Server Action.

> **Q : Comment tester la session Match en local ?**
> R : Ouvre deux fenêtres de navigateur avec deux comptes différents sur la même session.

---

## 10. Fichiers à NE PAS commiter

`.gitignore` typique :
```
# Dépendances
node_modules/

# Build
.next/
out/
build/

# Env (secrets)
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Logs
*.log
```

### Si tu commit un secret par accident
1. **Ne te contente pas** de `git rm .env && git commit` — il reste dans l'historique
2. Si pas encore pushé : `git reset --soft HEAD~1` puis recommit sans le fichier
3. Si déjà pushé : tu dois **invalider les clés** immédiatement et nettoyer l'historique (`git filter-repo` ou `BFG`)

---

## Exercices

### Exo 1 — Générer des bons commits
Tu viens d'écrire :
- Le composant `SwipeCard.tsx`
- La Server Action `recordSwipe` dans `src/actions/match.ts`
- Le schéma Prisma `MatchResult`

Découpe en **3 commits** clean.

### Exo 2 — Repérer les violations
Pour chaque commit, dis ce qui ne respecte pas la convention :
1. `Fix bug`
2. `feat(auth): ajout du système OAuth GitHub.`
3. `style: change colors`
4. `feat(match): added swipe interface`
5. `chore(deps): bump next from 15.0 to 16.2`

### Exo 3 — Workflow conflict
Tu travailles sur `feat/match-swipe` depuis 3 jours. Pendant ce temps, `dev` a reçu un refacto du dossier `src/components/medias/`. Tu rebase et tu as 5 conflits. Décris la marche à suivre.

### Exo 4 — Lint error
ESLint te dit :
```
Warning: React Hook useEffect has a missing dependency: 'userId'. Either include it or remove the dependency array
```
Pourquoi cette règle existe-t-elle ? Et pourquoi tu ne dois (presque) jamais la désactiver ?

### Exo 5 — Type-check fail
Tu lances `npm run type-check` et tu as :
```
src/app/foo.tsx(15,3): error TS2532: Object is possibly 'undefined'.
```
Sur ce code :
```ts
const user = await prisma.user.findUnique({ where: { id } });
console.log(user.name);
```
Corrige.

---

## Corrigés

### Exo 1
```bash
# Commit 1 : Schéma DB
git add prisma/schema.prisma prisma/migrations/...
git commit -m "chore(db): add MatchResult model with sessionId+tmdbId unique constraint"

# Commit 2 : Server Action
git add src/actions/match.ts
git commit -m "feat(match): add recordSwipe action with instant match detection"

# Commit 3 : UI
git add src/components/match/SwipeCard.tsx
git commit -m "feat(match): add swipe card component with left/right gestures"
```

Pourquoi 3 commits ?
- Chacun est cohérent et indépendant
- Si on veut rollback un seul, c'est facile
- L'historique raconte une histoire

### Exo 2
1. ❌ Vague (`Fix bug`), pas de type, pas de scope → `fix(scope): describe the actual bug`
2. ❌ Français + point à la fin → `feat(auth): add github oauth provider`
3. ❌ Scope manquant + description vague → `style(ui): update navbar background color`
4. ❌ `added` (passé) au lieu de `add` (infinitif) → `feat(match): add swipe interface`
5. ✅ Correct

### Exo 3
```bash
# 1. Mettre dev à jour
git checkout dev
git pull origin dev

# 2. Retourner sur la branche
git checkout feat/match-swipe

# 3. Rebase
git rebase dev

# Conflict sur src/components/medias/MediaCards.tsx :
# git status → "both modified"
# Ouvrir le fichier, voir les marqueurs <<<<<<< ======= >>>>>>>
# Décider : version dev, ma version, ou un mix
# Sauvegarder

git add src/components/medias/MediaCards.tsx
git rebase --continue

# Répéter pour les 4 autres conflits

# Vérifier que tout marche
npm run lint
npm run type-check
npm run build
npm run dev   # test manuel

# Push (avec --force-with-lease car l'historique a été réécrit)
git push origin feat/match-swipe --force-with-lease
```

**Astuce** : si tu rebase et que tu te trompes pendant les conflits, `git rebase --abort` te ramène à l'état d'avant.

### Exo 4
**Pourquoi la règle** :
- L'effet utilise `userId`
- Si `userId` change entre deux renders et que tu ne le mets pas dans deps, **l'effet ne se relance pas** avec la nouvelle valeur → tu utilises une stale closure → bug subtil

**Pourquoi ne pas désactiver** :
- 90% du temps, l'erreur signale un vrai bug
- Si tu désactives sans réfléchir, tu maintiens un bug latent
- Si tu **vraiment** ne veux pas que l'effet se relance (cas rare), utilise `useRef` ou un autre pattern, mais documente pourquoi

**Solution propre** :
```ts
useEffect(() => {
  // utilise userId
}, [userId]);   // ← ajouter à deps
```

### Exo 5
```ts
const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  // gérer le cas (return, throw, redirect, default value…)
  return;
}
console.log(user.name);
```
Le `if (!user) return` est un **narrow** pour TS : après ce check, il sait que `user` n'est plus `null`.

Alternatives :
```ts
console.log(user?.name);                       // utilise optional chaining (mais user.name peut être undefined)
console.log(user?.name ?? "(anonyme)");        // fallback
const user = await prisma.user.findUniqueOrThrow({ where: { id } });   // throw si pas trouvé
```

---

## Suite

→ [Module 16 — Projet final : reconstruction guidée](./16-projet-final.md)
