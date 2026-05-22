// ============================================================================
// Client Prisma singleton
// ----------------------------------------------------------------------------
// Astuce classique en dev avec Next : à chaque hot-reload, le code serveur est
// rechargé. Si on créait un `new PrismaClient()` à chaque import, on finirait
// avec des dizaines de connexions à la base. Pour éviter ça, on stocke
// l'instance sur `globalThis` en développement et on la réutilise.
//
// En production, on ne pollue pas le global → un seul process, une seule
// instance, pas besoin de cette gymnastique.
// ============================================================================

import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // Permet de garder l'instance Prisma en mémoire globale pendant le développement
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Si une instance existe déjà sur globalThis (hot-reload), on la réutilise.
// Sinon on en crée une nouvelle.
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// On accroche l'instance au global UNIQUEMENT en dev
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
