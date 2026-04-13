# Guide Git — Absolute Stream

Ce guide est fait pour l'équipe. Garde-le ouvert quand tu travailles sur le projet.

---

## Commencer une nouvelle tâche

```bash
# 1. Toujours partir de dev frais
git checkout dev
git pull origin dev

# 2. Créer ta branche
git checkout -b feat/nom-de-ta-feature

# Exemples :
git checkout -b feat/match-swipe-interface
git checkout -b feat/library-page
git checkout -b feat/tmdb-search
git checkout -b fix/match-session-sync
git checkout -b chore/setup-better-auth
```

---

## Sauvegarder ton travail

```bash
git status
git add src/components/match/SwipeCard.tsx
git commit -m "feat(match): add swipe card component"
git push origin feat/nom-de-ta-feature
```

---

## Mettre à jour ta branche avec les modifs des autres

```bash
git checkout dev
git pull origin dev
git checkout feat/nom-de-ta-feature
git rebase dev

# S'il y a des conflits -> les résoudre, puis :
git add .
git rebase --continue
```

---

## Ouvrir une Pull Request

1. Push ta branche
2. GitHub -> Pull Requests -> New pull request
3. Base = dev / Compare = ta branche
4. Remplir le template
5. Assigner l'autre membre comme reviewer
6. Submit

---

## Commandes utiles

```bash
# Voir l'historique
git log --oneline --graph --all

# Voir les différences
git diff

# Annuler le dernier commit (garde les fichiers)
git reset HEAD~1

# Voir toutes les branches
git branch -a

# Supprimer une branche locale après merge
git branch -d feat/nom-de-ta-feature

# Mettre de côté des modifs non commitées
git stash
git stash pop
```

---

## Les erreurs fréquentes

### J'ai commité sur dev par erreur

```bash
git reset HEAD~1
git checkout -b feat/ma-feature
git add .
git commit -m "feat: mon vrai commit"
```

### Ma branche est en retard sur dev

```bash
git checkout dev && git pull
git checkout feat/ma-feature
git rebase dev
```

### Il y a des conflits

```bash
git status
# Ouvrir chaque fichier, chercher <<<<<<, =======, >>>>>>>
# Garder ce qu'il faut, supprimer les balises
git add fichier-résolu.tsx
git rebase --continue
```

---

## Resume visuel

```
dev ──────────────────────────────────────►
     \                        /
      feat/ma-feature ───────

1. git checkout -b feat/ma-feature
2. Développer + committer
3. git push origin feat/ma-feature
4. Ouvrir PR sur GitHub (base: dev)
5. Review + approbation
6. Merge dans dev
7. Supprimer la branche
```

---

## Ne jamais commiter ces fichiers

- .env.local — clés API TMDB, secrets Better Auth
- node_modules/ — dépendances Node
- .next/ — build Next.js local

```

```
