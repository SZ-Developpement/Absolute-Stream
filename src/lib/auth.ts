// ============================================================================
// Configuration côté serveur de better-auth
// ----------------------------------------------------------------------------
// C'est ICI qu'on déclare comment l'app authentifie les utilisateurs.
// L'objet `auth` est ensuite utilisé par /api/auth/[...all]/route.ts qui
// expose toutes les routes (login, logout, session, callback OAuth, ...).
//
// Méthodes activées :
//  - email + password (sans vérification d'email pour le moment)
//  - OAuth GitHub
//  - OAuth Google
//
// La persistance utilise Prisma → PostgreSQL (cf. prisma/schema.prisma)
// ============================================================================

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  // Adaptateur Prisma → better-auth écrit dans nos tables PostgreSQL
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // pas de mail de validation pour la démo
  },
  // Providers OAuth — les secrets viennent des variables d'environnement
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});
