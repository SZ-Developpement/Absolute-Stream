// ============================================================================
// Server Action — ajouter / retirer un favori
// ----------------------------------------------------------------------------
// "use server" → Next exécute cette fonction sur le serveur même si elle est
// appelée depuis un composant client (cf. <FavoriteButton/>). Pas besoin de
// créer une route API : on l'importe et on l'appelle comme une fonction async.
//
// Pipeline défensif (toujours dans cet ordre) :
//   1. Validation Zod → on rejette les payloads malformés
//   2. Auth check     → on s'assure que l'utilisateur est connecté
//   3. Toggle BDD     → si déjà favori on supprime, sinon on crée
//   4. revalidatePath → on invalide le cache pour que l'UI se rafraîchisse
//
// Sécurité : on ne FAIT JAMAIS confiance au client. Même si le bouton est
// caché côté UI, on revérifie session + données ici.
// ============================================================================

"use server";

import { MediaType } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 1. Schéma de validation strict — refuse tout id non positif ou type inconnu
const favoriteSchema = z.object({
  tmdbId: z.number().int().positive("L'ID doit être positif"),
  type: z.nativeEnum(MediaType),
});

export async function toggleFavoriteAction(tmdbId: number, type: MediaType) {
  // 2. Validation des données entrantes (Sécurité)
  const parsed = favoriteSchema.safeParse({ tmdbId, type });
  if (!parsed.success) {
    return { error: "Données invalides." };
  }

  // 3. Vérification de l'authentification côté SERVEUR
  // On passe les headers de la requête à better-auth pour qu'il lise le cookie
  // de session et récupère l'utilisateur courant.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Non autorisé. Veuillez vous connecter." };
  }

  try {
    // 4. Toggle : on cherche d'abord si un favori existe déjà pour ce trio
    //    (userId, tmdbId, type) — c'est notre contrainte d'unicité Prisma.
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_tmdbId_type: {
          userId,
          tmdbId: parsed.data.tmdbId,
          type: parsed.data.type,
        },
      },
    });

    if (existingFavorite) {
      // Déjà favori → on supprime (un clic = retire des favoris)
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
    } else {
      // Pas encore favori → on crée la ligne
      await prisma.favorite.create({
        data: {
          userId,
          tmdbId: parsed.data.tmdbId,
          type: parsed.data.type,
        },
      });
    }

    // 5. On force Next à régénérer le cache de la home pour refléter le changement
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erreur BDD (toggleFavorite):", error);
    return { error: "Erreur interne du serveur." };
  }
}
