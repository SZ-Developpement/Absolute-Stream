// ============================================================================
// /tournoi — page Tournoi de la communauté (stub à compléter)
// ----------------------------------------------------------------------------
// Page créée en prévision de la fonctionnalité "Tournoi" (anciennement "Games"
// → renommée pour clarifier le but : tournois de votes entre médias).
//
// L'objectif futur : permettre à la communauté d'élire le meilleur film/série
// dans un thème donné (ex: "le meilleur film d'horreur des années 90") via un
// système de brackets type tournoi de tennis.
// ============================================================================

import UnderConstruction from "@/components/layout/UnderConstruction";
import MediaContainer from "@/components/medias/MediaContainer";

export default function GamesPage() {
  return (
    <MediaContainer className="min-h-screen">
      <UnderConstruction
        title="Tournois communautaires"
        message="Les brackets de votes entre films et séries arrivent bientôt."
      />
    </MediaContainer>
  );
}
