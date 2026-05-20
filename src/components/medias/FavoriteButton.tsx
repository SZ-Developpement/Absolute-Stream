// ============================================================================
// FavoriteButton — bouton "ajouter/retirer des favoris" avec UI optimiste
// ----------------------------------------------------------------------------
// L'enjeu UX : l'utilisateur clique → on ne veut PAS qu'il attende l'aller-retour
// serveur pour voir le bouton changer. On utilise donc useOptimistic :
//
//   1. Clic → on bascule immédiatement l'état (UI répond en 0ms)
//   2. En parallèle, on appelle la server action toggleFavoriteAction
//   3. Si le serveur échoue, React annule automatiquement l'état optimiste
//
// Le `<form action={...}>` est une syntaxe Server Actions de React 19 :
// pas besoin d'API route ni de gestion manuelle d'event.
// ============================================================================

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

  // useOptimistic : valeur "vraie" + setter qui applique la mutation côté UI.
  // Tant que la transition est en cours, l'UI voit cette valeur optimiste.
  const [optimisticIsFavorite, toggleOptimisticFavorite] = useOptimistic(
    initialIsFavorite,
    (currentState) => !currentState, // Inverse l'état actuel
  );

  const handleAction = () => {
    startTransition(async () => {
      // 1. Bascule instantanée de l'UI
      toggleOptimisticFavorite(optimisticIsFavorite);

      // 2. Appel serveur (la vraie source de vérité)
      const result = await toggleFavoriteAction(tmdbId, type);

      // 3. Si le serveur échoue, React rejouera l'état d'origine tout seul
      //    grâce au useOptimistic + transition.
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
