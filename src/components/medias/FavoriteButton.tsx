"use client";

import { useTransition, useOptimistic } from "react";
import { toggleFavoriteAction } from "@/actions/favorites";
import { MediaType } from "@prisma/client";

interface FavoriteButtonProps {
  tmdbId: number;
  type: MediaType;
  initialIsFavorite: boolean;
}

export default function FavoriteButton({
  tmdbId,
  type,
  initialIsFavorite,
}: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();

  // Hook natif React pour une UI instantanée et bulletproof
  const [optimisticIsFavorite, toggleOptimisticFavorite] = useOptimistic(
    initialIsFavorite,
    (currentState) => !currentState, // Inverse l'état actuel
  );

  const handleAction = () => {
    startTransition(async () => {
      // 1. Met à jour l'UI instantanément
      toggleOptimisticFavorite(optimisticIsFavorite);

      // 2. Appelle le serveur
      const result = await toggleFavoriteAction(tmdbId, type);

      // 3. Gestion d'erreur (l'état optimiste s'annule tout seul si besoin)
      if (result?.error) {
        console.error(result.error);
      }
    });
  };

  return (
    <form action={handleAction}>
      <button
        type="submit"
        disabled={isPending}
        className="p-2 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
      >
        {optimisticIsFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </button>
    </form>
  );
}
