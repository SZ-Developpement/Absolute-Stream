// ============================================================================
// /top10 — page "Top 10 communauté"
// ----------------------------------------------------------------------------
// Stub à compléter. Objectif futur : afficher les 10 médias les mieux notés
// par les utilisateurs d'Absolute Stream (basé sur les notes en BDD, pas TMDB).
// ============================================================================

import UnderConstruction from "@/components/layout/UnderConstruction";
import MediaContainer from "@/components/medias/MediaContainer";

export default function Top10Page() {
  return (
    <MediaContainer className="min-h-screen">
      <UnderConstruction
        title="Top 10 communauté"
        message="Le classement des 10 médias préférés de la communauté arrive bientôt."
      />
    </MediaContainer>
  );
}
