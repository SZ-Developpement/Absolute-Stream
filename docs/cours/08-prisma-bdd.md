# Module 08 — Prisma & base de données PostgreSQL

## Objectifs

- Comprendre les concepts de BDD relationnelle (tables, clés, relations)
- Lire et écrire un `schema.prisma`
- Maîtriser les queries Prisma : `findUnique`, `findMany`, `create`, `update`, `delete`, `findFirst`
- Comprendre les **relations**, **enums**, **indexes**, **contraintes uniques**
- Connaître le **singleton pattern** Prisma en dev Next.js

---

## 1. PostgreSQL : vocabulaire minimum

- **Base de données** : un conteneur (ex : `absolute_stream_dev`)
- **Table** : équivalent d'un fichier Excel (ex : `user`, `favorite`)
- **Ligne / Row** : une entrée dans la table
- **Colonne / Column** : un champ (ex : `email`, `createdAt`)
- **Clé primaire** : identifie une ligne de manière unique (ex : `id`)
- **Clé étrangère** : référence l'id d'une autre table (ex : `userId` dans `favorite` → `user.id`)
- **Index** : structure qui accélère les recherches sur certains champs
- **Contrainte unique** : empêche les doublons (ex : un `email` unique par user)

---

## 2. Anatomie de `schema.prisma`

```prisma
datasource db {                       // ① BDD cible
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {                    // ② Génération du client TS
  provider = "prisma-client-js"
}

enum Role {                            // ③ Énumération
  USER
  MODERATOR
  ADMIN
}

model User {                           // ④ Une table
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  favorites     Favorite[]
  @@map("user")
}
```

- ① `datasource` indique quel SGBD et où il est
- ② `generator` produit le client TypeScript à partir du schema (`npx prisma generate`)
- ③ `enum` : type avec un ensemble fini de valeurs
- ④ `model` = une table

### Annotations de champs

| Annotation | Effet |
|---|---|
| `@id` | Clé primaire |
| `@default(cuid())` | Valeur par défaut (cuid = ID compact aléatoire) |
| `@default(now())` | Timestamp à la création |
| `@updatedAt` | Mis à jour à chaque modif |
| `@unique` | Contrainte unique sur ce champ |
| `@db.Text` | Type SQL spécifique (TEXT au lieu de VARCHAR) |
| `?` (après le type) | Champ optionnel (nullable) |
| `[]` (après le type) | Tableau / collection (= relation 1-N ou M-N) |

### Annotations de model

| Annotation | Effet |
|---|---|
| `@@id([a, b])` | Clé primaire composite (sur 2 colonnes) |
| `@@unique([a, b, c])` | Contrainte unique sur la combinaison |
| `@@map("table_name")` | Nom de la table en SQL (par défaut = nom du model) |
| `@@index([field])` | Index pour accélérer les queries |

---

## 3. Les modèles du projet en détail

### `User` — la table centrale
```prisma
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  following Follows[] @relation("follower")     // les gens que JE suis
  followers Follows[] @relation("following")    // les gens qui ME suivent
  library   Library[]
  reviews   Review[]
  favorites Favorite[]
  // ... etc.

  @@map("user")
}
```

- `id` est une `cuid` (string ~25 chars, aléatoire, triable chronologiquement)
- `email` est `@unique` → impossible d'avoir deux users avec le même email
- Les relations sont déclarées par le **type tableau** : `Favorite[]` signifie "un User a plusieurs Favorite"

### `Favorite` — relation 1-N
```prisma
model Favorite {
  id        String    @id @default(cuid())
  userId    String                              // clé étrangère
  tmdbId    Int
  type      MediaType
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())

  @@unique([userId, tmdbId, type])              // un user ne peut pas favoriser le même média deux fois
  @@map("favorite")
}
```

- `user      User      @relation(...)` : Prisma sait que `userId` pointe vers `User.id`
- `onDelete: Cascade` : si on supprime un User, ses Favorites sont aussi supprimés
- `@@unique([userId, tmdbId, type])` : combinaison unique → "un user × un tmdbId × un type = max 1 ligne"

### Côté User, la réciproque
```prisma
model User {
  favorites Favorite[]
}
```
Ce `Favorite[]` est **virtuel** : il n'existe pas comme colonne en BDD. C'est juste un pointeur pour Prisma : "tu peux suivre cette relation".

### `Follows` — relation N-N (auto-référente)
```prisma
model Follows {
  followerId  String
  followingId String
  follower    User   @relation("follower", fields: [followerId], references: [id])
  following   User   @relation("following", fields: [followingId], references: [id])

  @@id([followerId, followingId])
  @@map("follows")
}
```

C'est une **table de jonction** :
- `followerId` = qui suit
- `followingId` = qui est suivi
- Clé primaire composite `@@id([followerId, followingId])` → impossible de suivre deux fois la même personne

### Pourquoi `@relation("follower")` et `@relation("following")` ?
Parce que `User` apparait deux fois dans `Follows` (en `follower` et en `following`). Prisma a besoin d'un **nom** pour distinguer chaque relation.

Côté User :
```prisma
following Follows[] @relation("follower")   // je suis dans la colonne "follower" de Follows
followers Follows[] @relation("following")  // je suis dans la colonne "following" de Follows
```

### `MatchSession` — relation auto-référente nullable
```prisma
model MatchSession {
  id        String   @id @default(cuid())
  creatorId String
  partnerId String?                       // nullable : le partner peut rejoindre plus tard
  status    MatchStatus @default(WAITING)

  creator User     @relation("creator", fields: [creatorId], references: [id])
  partner User?    @relation("partner", fields: [partnerId], references: [id])
  swipes  Swipe[]
  matches MatchResult[]

  @@map("match_session")
}
```

### `Library` et `Review` — séparés par design
```prisma
model Library {
  // statut de visionnage : VU / À VOIR / EN COURS
  userId    String
  tmdbId    Int
  type      MediaType
  status    MediaStatus
  @@unique([userId, tmdbId, type])
}

model Review {
  // note et/ou commentaire
  userId     String
  tmdbId     Int
  type       MediaType
  rating     Int?
  content    String?    @db.Text
  visibility Visibility @default(PUBLIC)
  @@unique([userId, tmdbId, type])
}
```

**Pourquoi 2 modèles séparés** ?
- Un user peut **noter** un film sans le marquer comme "vu"
- Un user peut marquer "à voir" sans noter
- Conceptuellement : statut vs avis sont indépendants

---

## 4. Le client Prisma — singleton pattern

```ts
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
```

### Pourquoi ce pattern ?
En développement Next.js, le **hot reload** ré-exécute les modules à chaque changement. Sans précaution, on créerait un nouveau `PrismaClient` à chaque save → des connexions en BDD qui s'accumulent jusqu'à épuiser le pool.

Le singleton :
- En **prod** : un seul `PrismaClient` pour toute la durée de vie du serveur
- En **dev** : stocké dans `globalThis.prismaGlobal` qui survit au hot reload → un seul client

### `declare global`
Comme `globalThis` est typé `unknown` par défaut, on étend son type pour autoriser `prismaGlobal`.

---

## 5. Les queries Prisma

### Imports
```ts
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";   // enum auto-généré
```

### `findUnique` — clé unique
```ts
// src/actions/favorites.ts
const existingFavorite = await prisma.favorite.findUnique({
  where: {
    userId_tmdbId_type: {            // ← nom auto-généré depuis @@unique
      userId,
      tmdbId,
      type: parsed.data.type,
    },
  },
});
```

Quand on a `@@unique([userId, tmdbId, type])`, Prisma génère un `where` composite nommé `userId_tmdbId_type`.

`findUnique` retourne :
- Le record (typé) si trouvé
- `null` sinon

### `findFirst` — clé non-unique
```ts
const recent = await prisma.favorite.findFirst({
  where: { userId },
  orderBy: { createdAt: "desc" },
});
```

### `findMany` — plusieurs records
```ts
const favorites = await prisma.favorite.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
  take: 10,                  // limite
  skip: 20,                  // offset (pagination)
  include: { user: true },   // jointure
});
```

### `create`
```ts
await prisma.favorite.create({
  data: {
    userId,
    tmdbId: parsed.data.tmdbId,
    type: parsed.data.type,
  },
});
```

### `update`
```ts
await prisma.user.update({
  where: { id: userId },
  data: { name: "Nouveau nom" },
});
```

### `upsert` — update si existe, sinon create
```ts
await prisma.library.upsert({
  where: { userId_tmdbId_type: { userId, tmdbId, type } },
  create: { userId, tmdbId, type, status: "TO_WATCH" },
  update: { status: "WATCHED" },
});
```

### `delete`
```ts
await prisma.favorite.delete({
  where: { id: existingFavorite.id },
});
```

### `deleteMany`
```ts
await prisma.session.deleteMany({ where: { userId } });
```

---

## 6. Les jointures (`include` et `select`)

### `include` — récupérer les relations
```ts
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    favorites: true,                    // récupère ses favoris
    library: { where: { status: "WATCHED" } },  // filtre la relation
    reviews: { take: 5, orderBy: { createdAt: "desc" } },
  },
});
// → user.favorites est typé Favorite[]
```

### `select` — choisir les champs
```ts
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    favorites: { select: { tmdbId: true, type: true } },
  },
});
// → user n'a QUE les champs sélectionnés
```

`select` est plus efficace (réseau, mémoire) car on ne charge que ce qu'on utilise.

⚠️ Tu ne peux pas mélanger `select` et `include` au même niveau. Choisis l'un ou l'autre.

---

## 7. Calculs et agrégations

### `count`
```ts
const followersCount = await prisma.follows.count({
  where: { followingId: userId },
});
```

### `aggregate` — pour AVG, SUM, MIN, MAX
```ts
const avgRating = await prisma.review.aggregate({
  where: { tmdbId, type },
  _avg: { rating: true },
});
// avgRating._avg.rating = nombre ou null si pas de review
```

C'est avec ça qu'on calculerait la note communautaire d'un film :
```sql
SELECT AVG(rating) FROM review WHERE tmdbId = ? AND type = ?
```

### `groupBy`
```ts
const counts = await prisma.swipe.groupBy({
  by: ["tmdbId"],
  where: { sessionId, type: "LIKE" },
  _count: { userId: true },
  having: { userId: { _count: { equals: 2 } } },
});
// → liste des tmdbId likés par 2 users distincts = un match !
```

---

## 8. Les migrations

Workflow :
1. Tu modifies `schema.prisma`
2. `npx prisma migrate dev --name <nom_descriptif>` :
   - Compare schema avec la BDD
   - Génère un fichier SQL dans `prisma/migrations/<timestamp>_<nom>/`
   - Applique le SQL à la BDD locale
   - Régénère le client TS
3. Tu commit les fichiers de migration

En **prod** : `npx prisma migrate deploy` (n'applique que les migrations validées, ne génère pas de nouvelles).

### Le projet a sa migration initiale
```
prisma/migrations/
├── 20260504134534_init_or_add_favorites/
│   └── migration.sql
└── migration_lock.toml
```

`migration_lock.toml` verrouille le provider (`postgresql`) pour s'assurer qu'on ne change pas de SGBD par accident.

### `npx prisma generate`
Régénère le client TS sans toucher à la BDD. À lancer après chaque `npm install` (parfois automatique via `postinstall`).

### `npx prisma studio`
Ouvre une UI web pour explorer/éditer la BDD. Très pratique en dev.

---

## 9. Anti-patterns

### ❌ Créer un PrismaClient à chaque fois
```ts
async function getFoo() {
  const prisma = new PrismaClient();   // ← INTERDIT en Next dev
  return prisma.foo.findMany();
}
```
Utilise toujours le singleton de `src/lib/prisma.ts`.

### ❌ Pas d'index sur les colonnes filtrées
Si tu fais souvent `where: { tmdbId, type }`, ajoute `@@index([tmdbId, type])` ou `@@unique([tmdbId, type])` selon le cas.

### ❌ N+1 queries
```ts
const users = await prisma.user.findMany();
for (const u of users) {
  const favs = await prisma.favorite.findMany({ where: { userId: u.id } });  // ← 1 query par user
}
```
À la place :
```ts
const users = await prisma.user.findMany({ include: { favorites: true } });
```

### ❌ Oublier `onDelete: Cascade` (ou alternative)
Si tu supprimes un User mais que des Favorites pointent encore vers lui, tu auras une violation de contrainte. Soit cascade, soit `SetNull`, soit supprimer manuellement avant.

---

## Exercices

### Exo 1 — Lire un schema
Combien de modèles sont définis dans `prisma/schema.prisma` ? Combien d'enums ?

### Exo 2 — Requête simple
Écris une fonction qui retourne tous les favoris d'un user, triés du plus récent au plus ancien.

### Exo 3 — Toggle pattern
Le code de `toggleFavoriteAction` fait :
1. `findUnique` → existe ?
2. Si oui → `delete`. Si non → `create`.

C'est 2 queries dans le pire des cas. Peux-tu trouver une approche avec une seule query (en utilisant des features Prisma) ?

### Exo 4 — Détecter un match
Écris une fonction `findMatch(sessionId: string)` qui retourne le premier `tmdbId` liké par les 2 users de la session, ou `null` sinon.

### Exo 5 — Calculer la note moyenne
Écris une fonction `getCommunityRating(tmdbId: number, type: MediaType)` qui retourne la moyenne des notes pour ce média.

---

## Corrigés

### Exo 1
13 modèles : `User, Session, Account, Verification, Follows, Library, Review, Favorite, UserList, ListItem, MatchSession, MatchResult, Swipe, Report` → en fait 14 si on compte Report.

6 enums : `Role, MediaStatus, MediaType, SwipeType, MatchStatus, Visibility`.

### Exo 2
```ts
async function getUserFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
```

### Exo 3
Option 1 — atomique avec contrainte unique :
```ts
try {
  await prisma.favorite.create({
    data: { userId, tmdbId, type },
  });
  // succès → ajouté
} catch (e: any) {
  if (e.code === "P2002") {
    // contrainte @@unique violée → existait déjà → supprimer
    await prisma.favorite.delete({
      where: { userId_tmdbId_type: { userId, tmdbId, type } },
    });
  } else throw e;
}
```
Inconvénient : utilise les exceptions comme contrôle de flux, peu lisible.

Option 2 — l'approche actuelle reste idiomatique. 2 queries sur du SQL indexé = ~1ms. Pas la peine de sur-optimiser.

### Exo 4
```ts
async function findMatch(sessionId: string): Promise<number | null> {
  const grouped = await prisma.swipe.groupBy({
    by: ["tmdbId"],
    where: { sessionId, type: "LIKE" },
    _count: { userId: true },
    having: { userId: { _count: { equals: 2 } } },
    orderBy: { _count: { userId: "desc" } },
    take: 1,
  });
  return grouped[0]?.tmdbId ?? null;
}
```
Note : pour être propre, il faudrait aussi vérifier `DISTINCT userId` car un même user pourrait techniquement avoir 2 LIKE — mais le `@@unique([sessionId, userId, tmdbId])` l'empêche, donc on est safe.

### Exo 5
```ts
async function getCommunityRating(tmdbId: number, type: MediaType): Promise<number | null> {
  const result = await prisma.review.aggregate({
    where: { tmdbId, type, rating: { not: null } },
    _avg: { rating: true },
  });
  return result._avg.rating;
}
```
- `rating: { not: null }` → exclut les reviews sans note (commentaire seul)
- `_avg` retourne `{ rating: number | null }` → null si pas de review du tout

---

## Suite

→ [Module 09 — Server Actions + validation Zod](./09-server-actions-zod.md)
