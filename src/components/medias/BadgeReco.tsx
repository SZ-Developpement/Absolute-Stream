// ============================================================================
// BadgeReco — petit badge "X% recommandé" avec icône flamme
// ----------------------------------------------------------------------------
// Affiché sur les fiches médias pour exprimer un score de recommandation
// (de la communauté ou de TMDB). Composant purement visuel, pas de logique.
// ============================================================================

import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

export default function BadgeReco({
  reco,
  size,
  className,
}: {
  reco: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-black/60 gap-1 py-1 px-1.5 group inline-flex items-center border border-transparent justify-center rounded-md text-xs text-white font-regular",
        className,
      )}
    >
      {/* Couleur orange brûlé pour matcher l'identité "flamme" */}
      <Flame size={size || 14} className="text-[#CC4700]" />
      {reco} %
    </div>
  );
}
