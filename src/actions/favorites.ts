"use server";

import { MediaType } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 1. Définition du schéma de validation strict
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
  // On récupère les headers de la requête pour que Better Auth lise le cookie de session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Non autorisé. Veuillez vous connecter." };
  }

  try {
    // 4. Interaction avec la BDD
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
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          tmdbId: parsed.data.tmdbId,
          type: parsed.data.type,
        },
      });
    }

    // 5. Rafraîchissement des données en cache pour Absolute Stream
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erreur BDD (toggleFavorite):", error);
    return { error: "Erreur interne du serveur." };
  }
}
