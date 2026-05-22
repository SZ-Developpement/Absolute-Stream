// ============================================================================
// /match — page d'accueil du mode Match
// ----------------------------------------------------------------------------
// Écran de "lobby" : on présente le concept et on propose deux actions :
//   - "Nouveau Match"    → on crée une session (TODO : à brancher)
//   - "Rejoindre un Match" → on entre l'id d'une session reçue d'un ami
// ============================================================================

import UnderConstruction from "@/components/layout/UnderConstruction";
import MediaContainer from "@/components/medias/MediaContainer";

export default function MatchPage() {
  return (
    <MediaContainer className="min-h-screen">
      <UnderConstruction
        title="Absolute Match"
        message="Le swipe à deux pour trouver le film parfait arrive très bientôt."
      />
    </MediaContainer>
  );
}
