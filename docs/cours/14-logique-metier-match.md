# Module 14 — Logique métier du Match

## Objectifs

- Comprendre le **modèle de données** du Match en détail
- Concevoir l'**algorithme de détection** d'un match
- Lire la page Match actuelle et identifier ce qui manque pour la rendre fonctionnelle
- Proposer une implémentation complète (Server Actions + UI swipe)

---

## 1. Vue d'ensemble du système Match

L'idée :
1. Alice crée une **session de match**
2. Alice partage un **lien** à Bob (`/match/abc-123`)
3. Bob ouvre le lien, rejoint la session
4. Les deux **swipent** des films (LIKE / DISLIKE) en parallèle
5. Dès qu'un même film reçoit un LIKE des deux → **C'est un match !**

Inspiré directement de Tinder, transposé aux films.

---

## 2. Le modèle Prisma

```prisma
enum SwipeType {
  LIKE
  DISLIKE
}

enum MatchStatus {
  WAITING   // Bob n'a pas encore rejoint
  ACTIVE    // Les deux swipent
  FINISHED  // Match trouvé ou abandonnée
}

model MatchSession {
  id        String      @id @default(cuid())
  creatorId String
  partnerId String?     // ← nullable : Bob rejoint plus tard
  status    MatchStatus @default(WAITING)
  createdAt DateTime    @default(now())

  creator User     @relation("creator", fields: [creatorId], references: [id])
  partner User?    @relation("partner", fields: [partnerId], references: [id])
  swipes  Swipe[]
  matches MatchResult[]

  @@map("match_session")
}

model Swipe {
  id        String       @id @default(cuid())
  sessionId String
  userId    String
  tmdbId    Int
  type      SwipeType
  session   MatchSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([sessionId, userId, tmdbId])
  @@map("swipe")
}

model MatchResult {
  id        String   @id @default(cuid())
  sessionId String
  tmdbId    Int
  createdAt DateTime @default(now())

  session   MatchSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@unique([sessionId, tmdbId])
}
```

### Pourquoi cette structure ?

#### `MatchSession`
- `creatorId` non-null : il faut quelqu'un pour ouvrir la session
- `partnerId` nullable : Bob rejoint potentiellement plus tard (`WAITING` au début)
- `status` : machine à états (WAITING → ACTIVE → FINISHED)

#### `Swipe`
- Chaque swipe est une ligne séparée (vs un JSON de swipes dans la session, ce qui serait plus compact mais moins requêtable)
- `@@unique([sessionId, userId, tmdbId])` : **garantit qu'un user ne peut pas swiper deux fois le même film dans une session**. Si Bob essaye de revenir en arrière, il aura une erreur d'unicité.
- `onDelete: Cascade` : supprimer la session supprime ses swipes automatiquement

#### `MatchResult`
- Stocke explicitement les matchs trouvés (pas juste implicitement via `Swipe`)
- Avantage : query rapide "donne-moi les matchs de cette session" sans avoir à group by
- `@@unique([sessionId, tmdbId])` : impossible de créer 2 fois le même match (idempotent)

---

## 3. L'algorithme de détection (cœur du projet)

**Question** : à quel moment vérifier "est-ce un match ?"

### Approche 1 — Recalcul à la lecture (lente)
À chaque page load, on group by sur les swipes :
```ts
const matches = await prisma.swipe.groupBy({
  by: ["tmdbId"],
  where: { sessionId, type: "LIKE" },
  _count: { userId: true },
  having: { userId: { _count: { equals: 2 } } },
});
```

Inconvénient : on recalcule à chaque fois.

### Approche 2 — Vérifier au moment du swipe (rapide)
Quand Bob fait un swipe, on vérifie si Alice a déjà liké ce film. Si oui → on crée un `MatchResult`.

```ts
async function recordSwipe(sessionId: string, userId: string, tmdbId: number, type: SwipeType) {
  await prisma.swipe.create({ data: { sessionId, userId, tmdbId, type } });

  if (type === "LIKE") {
    // Vérifier si l'autre user a aussi liké
    const otherLike = await prisma.swipe.findFirst({
      where: {
        sessionId,
        tmdbId,
        userId: { not: userId },
        type: "LIKE",
      },
    });

    if (otherLike) {
      // C'est un match !
      await prisma.matchResult.create({
        data: { sessionId, tmdbId },
      });
      return { match: true, tmdbId };
    }
  }

  return { match: false };
}
```

**Avantages** :
- Détection instantanée
- Pas de batch/cron à gérer
- Le `MatchResult` est créé une seule fois (grâce au `@@unique`)

C'est l'approche recommandée. C'est elle qui devrait être implémentée dans `src/actions/match.ts` (qui n'existe pas encore).

---

## 4. Le cycle de vie d'une session

```
[Alice crée]                    Status: WAITING
       ↓
[Alice copie le lien]
       ↓
[Bob ouvre le lien]
       ↓
[Bob rejoint]                   Status: ACTIVE  (partnerId = bobId)
       ↓
[Alice swipe]                   Swipes accumulés
[Bob swipe]
       ↓
[Match trouvé !]                MatchResult créé
       ↓
[Quelqu'un termine]             Status: FINISHED
```

### Transitions de status
```ts
// Quand Bob rejoint
await prisma.matchSession.update({
  where: { id: sessionId },
  data: { partnerId: bobId, status: "ACTIVE" },
});

// Quand quelqu'un arrête
await prisma.matchSession.update({
  where: { id: sessionId },
  data: { status: "FINISHED" },
});
```

---

## 5. La sécurité du Match

Une session a des **invariants** à protéger :
- Seul `creatorId` et `partnerId` peuvent swiper dans la session
- Une fois `FINISHED`, plus de swipes possibles
- `partnerId` ne peut pas être set deux fois (Bob rejoint → ne peut pas être remplacé par Charlie)

```ts
// Dans recordSwipe, vérifications au début :
const session = await prisma.matchSession.findUnique({ where: { id: sessionId } });
if (!session) return { error: "Session introuvable" };
if (session.status !== "ACTIVE") return { error: "Session inactive" };
if (session.creatorId !== userId && session.partnerId !== userId) {
  return { error: "Vous n'êtes pas membre de cette session" };
}
```

Pour la jointure :
```ts
async function joinSession(sessionId: string, userId: string) {
  const session = await prisma.matchSession.findUnique({ where: { id: sessionId } });
  if (!session) return { error: "Introuvable" };
  if (session.creatorId === userId) return { error: "Vous êtes le créateur" };
  if (session.partnerId && session.partnerId !== userId) {
    return { error: "Cette session a déjà un partenaire" };
  }
  if (session.status === "FINISHED") return { error: "Session terminée" };

  await prisma.matchSession.update({
    where: { id: sessionId },
    data: { partnerId: userId, status: "ACTIVE" },
  });
  return { success: true };
}
```

---

## 6. L'UI du Match — ce qui existe et ce qui manque

### Ce qui existe
- `src/app/(games)/match/page.tsx` : page hub avec deux boutons "Nouveau Match" / "Rejoindre"
- `src/app/(games)/match/[sessionId]/page.tsx` : la page de configuration de session (genres, années, type)

Mais aucun des deux boutons / formulaires ne fait quoi que ce soit (pas de Server Action câblée).

### Ce qui manque pour que ça marche
1. **Server Actions** :
   - `createMatchSession()` : crée une session WAITING, retourne l'ID
   - `joinMatchSession(sessionId)` : transition vers ACTIVE
   - `recordSwipe(sessionId, tmdbId, type)` : enregistre + détecte match
   - `endMatchSession(sessionId)` : passe en FINISHED

2. **Synchronisation temps réel** : comment Alice voit-elle que Bob a rejoint ? Que Bob a fait un swipe ?
   - **Polling** : refresh toutes les 2 secondes (simple mais coûteux)
   - **Server-Sent Events (SSE)** : stream serveur → client (Vercel-compatible)
   - **WebSockets** : duplex (lourd à mettre en place sur Vercel serverless)
   - **Pusher / Ably / Supabase Realtime** : services tiers
   - **Polling + revalidatePath** : on revalide à chaque swipe, l'autre user voit dans la seconde

3. **UI de swipe** : `<SwipeCard>` avec gestures (probablement via `framer-motion` ou `react-spring`)

4. **Liste de films à swiper** : fetch TMDB filtré par les préférences de la session (genres, années, type)

---

## 7. Esquisse d'implémentation (proposition)

### Création de session
```ts
// src/actions/match.ts
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function createMatchSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return { error: "Non autorisé" };

  const matchSession = await prisma.matchSession.create({
    data: { creatorId: userId, status: "WAITING" },
    select: { id: true },
  });
  return { success: true, sessionId: matchSession.id };
}
```

### Page session avec polling
```tsx
// src/app/(games)/match/[sessionId]/page.tsx (version fonctionnelle)
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { recordSwipe, getSessionState } from "@/actions/match";

export default function MatchSessionPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const [state, setState] = useState<SessionState | null>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      const s = await getSessionState(sessionId);
      setState(s);
    }, 2000);
    return () => clearInterval(id);
  }, [sessionId]);

  const handleSwipe = async (tmdbId: number, type: "LIKE" | "DISLIKE") => {
    const result = await recordSwipe(sessionId, tmdbId, type);
    if (result?.match) {
      alert(`🎉 Match trouvé : film ${result.tmdbId} !`);
    }
  };

  if (!state) return <p>Chargement…</p>;
  if (state.status === "WAITING") return <p>En attente d'un partenaire…</p>;
  if (state.status === "FINISHED") return <p>Session terminée.</p>;

  return <SwipeDeck onSwipe={handleSwipe} />;
}
```

### Server Action de swipe + détection
```ts
// src/actions/match.ts (suite)
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SwipeType } from "@prisma/client";

const swipeSchema = z.object({
  sessionId: z.string().min(1),
  tmdbId: z.number().int().positive(),
  type: z.nativeEnum(SwipeType),
});

export async function recordSwipe(
  sessionId: string,
  tmdbId: number,
  type: SwipeType,
) {
  const parsed = swipeSchema.safeParse({ sessionId, tmdbId, type });
  if (!parsed.success) return { error: "Invalide" };

  const authSession = await auth.api.getSession({ headers: await headers() });
  const userId = authSession?.user?.id;
  if (!userId) return { error: "Non autorisé" };

  // Vérifier que l'user fait partie de la session
  const matchSession = await prisma.matchSession.findUnique({
    where: { id: sessionId },
    select: { creatorId: true, partnerId: true, status: true },
  });
  if (!matchSession || matchSession.status !== "ACTIVE") {
    return { error: "Session inactive" };
  }
  if (matchSession.creatorId !== userId && matchSession.partnerId !== userId) {
    return { error: "Pas membre" };
  }

  // Enregistrer le swipe (ou fail si déjà swipé)
  try {
    await prisma.swipe.create({ data: { sessionId, userId, tmdbId, type } });
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Déjà swipé" };
    throw e;
  }

  // Si LIKE, vérifier match
  if (type === "LIKE") {
    const otherLike = await prisma.swipe.findFirst({
      where: { sessionId, tmdbId, userId: { not: userId }, type: "LIKE" },
    });
    if (otherLike) {
      // Match !
      const result = await prisma.matchResult.upsert({
        where: { sessionId_tmdbId: { sessionId, tmdbId } },
        create: { sessionId, tmdbId },
        update: {},
      });
      revalidatePath(`/match/${sessionId}`);
      return { success: true, match: true, tmdbId };
    }
  }

  revalidatePath(`/match/${sessionId}`);
  return { success: true, match: false };
}
```

---

## 8. Optimisations à long terme

### Suggestion de films
Au lieu de servir tous les films TMDB à la chaîne, on pourrait :
- Intersecter les genres préférés des deux users (depuis leur library)
- Exclure les films déjà vus (status WATCHED dans Library)
- Trier par popularité

```ts
const aliceWatched = await prisma.library.findMany({
  where: { userId: aliceId, status: "WATCHED" },
  select: { tmdbId: true },
});
// Puis filtrer la liste TMDB
```

### Évitement des doublons
Pour ne pas resservir un film déjà swipé :
```ts
const alreadySwiped = await prisma.swipe.findMany({
  where: { sessionId, userId },
  select: { tmdbId: true },
});
const swipedIds = new Set(alreadySwiped.map(s => s.tmdbId));
const candidates = movies.filter(m => !swipedIds.has(m.id));
```

### Cache de la deck
Pré-fetcher 50 films au début de session, garder dans le state. Recharger quand on est à <10 restants.

---

## Exercices

### Exo 1 — Lire le modèle
- Combien de tables sont impliquées dans un Match ?
- Que se passe-t-il (en cascade) si on supprime un MatchSession ?

### Exo 2 — Détection alternative
Réécris `recordSwipe` mais en utilisant `groupBy` (l'approche 1 du module). Discute pourquoi l'approche 2 (du projet) est meilleure.

### Exo 3 — Bug de design
La table `MatchResult` a-t-elle besoin de la liaison `User` ? Pourquoi ne pas avoir mis `userId` dedans ?

### Exo 4 — Le flux complet
Écris en pseudo-code le flux complet d'un Match du début à la fin (création par Alice → match trouvé). Cite chaque appel BDD.

### Exo 5 — Race condition
Si Alice et Bob font swipe simultanément sur le même film (les deux en LIKE), peut-on créer 2 `MatchResult` ? Si non, qui empêche ça ?

---

## Corrigés

### Exo 1
- **3 tables** : `MatchSession`, `Swipe`, `MatchResult` (+ implicitement `User` pour les relations)
- **Cascade** : `Swipe.session` a `onDelete: Cascade` → suppression d'une session supprime ses swipes. `MatchResult` a aussi `onDelete: Cascade` sur sa relation `session` → supprime les résultats. **Mais** les `User` ne sont pas affectés (on supprime juste la session, pas les users).

### Exo 2
```ts
// Approche par recalcul
async function checkForMatch(sessionId: string): Promise<number | null> {
  const grouped = await prisma.swipe.groupBy({
    by: ["tmdbId"],
    where: { sessionId, type: "LIKE" },
    _count: { userId: true },
    having: { userId: { _count: { equals: 2 } } },
    take: 1,
  });
  return grouped[0]?.tmdbId ?? null;
}
```

**Pourquoi l'approche du projet (vérification au swipe) est meilleure** :
- **Détection instantanée** : on sait dès le 2ᵉ LIKE qu'on a un match. Avec groupBy, il faut le rechercher.
- **Moins de queries** : 1 `findFirst` léger vs un `groupBy` qui scanne plus de données
- **Permet de stocker `MatchResult`** : une trace persistante, avec `createdAt`. Avec recalcul, c'est juste un état dérivé.
- **Idempotent** : grâce à `@@unique([sessionId, tmdbId])`, créer le même `MatchResult` deux fois échoue proprement.

### Exo 3
`MatchResult` est l'**intersection** d'un swipe d'Alice ET de Bob. Mettre `userId` n'aurait pas de sens — il faudrait `aliceId + bobId`, mais ils sont déjà déductibles de `sessionId` (`creatorId + partnerId`).

Donc : la session encapsule les 2 users, le tmdbId encapsule le film, et c'est suffisant.

### Exo 4
```
1. Alice : POST /api/match (Server Action createMatchSession)
   → DB: INSERT MatchSession (creatorId=alice, status=WAITING)
   → Return: { sessionId: "abc-123" }

2. Alice navigue vers /match/abc-123
   → Server Component fetch la session
   → DB: SELECT MatchSession WHERE id = "abc-123"
   → Render : "Partage ce lien : .../match/abc-123, en attente d'un partenaire"

3. Bob clique le lien partagé
   → Server Component fetch la session
   → DB: SELECT MatchSession WHERE id = "abc-123"  (status=WAITING, pas de partner)

4. Bob clique "Rejoindre" (Server Action joinMatchSession)
   → DB: UPDATE MatchSession SET partnerId=bob, status=ACTIVE WHERE id="abc-123"
   → revalidatePath(`/match/abc-123`)
   → Alice (qui polle) voit l'update au prochain tick

5. Alice et Bob fetchent une deck de films TMDB
   → API: TMDB /discover/movie?with_genres=...

6. Alice swipe LIKE sur film 603
   → Server Action recordSwipe(abc-123, 603, "LIKE")
   → DB: INSERT Swipe(sessionId=abc-123, userId=alice, tmdbId=603, type=LIKE)
   → DB: SELECT Swipe WHERE sessionId=abc-123, tmdbId=603, userId!=alice, type=LIKE
       → Pas de résultat → pas de match
   → revalidatePath
   → Return: { match: false }

7. Bob swipe LIKE sur film 603
   → Server Action recordSwipe(abc-123, 603, "LIKE")
   → DB: INSERT Swipe(sessionId=abc-123, userId=bob, tmdbId=603, type=LIKE)
   → DB: SELECT Swipe WHERE sessionId=abc-123, tmdbId=603, userId!=bob, type=LIKE
       → Trouvé (le swipe d'Alice) → MATCH
   → DB: INSERT MatchResult(sessionId=abc-123, tmdbId=603)
   → revalidatePath
   → Return: { match: true, tmdbId: 603 }
   → UI: 🎉

8. (Optionnel) Quelqu'un clique "Terminer"
   → Server Action endMatchSession
   → DB: UPDATE MatchSession SET status=FINISHED
```

### Exo 5
**Scénario** : Alice et Bob font swipe en même temps sur le même film, tous deux en LIKE.

Si l'approche est "vérifier au swipe", voici ce qui peut se passer en race :
- T1 : Alice swipe → INSERT Swipe(alice, 603, LIKE) → query "autre user a-t-il liké ?" → Bob n'a pas encore inséré → pas de match
- T2 : Bob swipe → INSERT Swipe(bob, 603, LIKE) → query "autre user a-t-il liké ?" → trouve Alice → INSERT MatchResult
- Résultat : 1 seul `MatchResult` créé. 

Le cas pathologique : si les **deux** queries "autre user a liké" voient leurs swipes respectifs en BDD (donc match pour les deux) :
- Alice tente INSERT MatchResult(sessionId, 603)
- Bob tente INSERT MatchResult(sessionId, 603)
- Le `@@unique([sessionId, tmdbId])` rejettera la deuxième tentative avec une violation de contrainte → **1 seul MatchResult**

Donc la **contrainte unique sur `MatchResult`** est la sécurité finale. C'est pour ça qu'on l'a — sans elle, on pourrait avoir des doublons en cas de race.

Pour traiter l'erreur proprement :
```ts
try {
  await prisma.matchResult.create({ data: { sessionId, tmdbId } });
} catch (e: any) {
  if (e.code === "P2002") {
    // Déjà créé par l'autre side, OK on ignore
  } else throw e;
}
```
Ou plus élégant : `upsert` (comme dans le code proposé).

---

## Suite

→ [Module 15 — Conventions du projet (Git, lint, commits)](./15-conventions-projet.md)
