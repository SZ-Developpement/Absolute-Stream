// ============================================================================
// Types partagés par les composants média
// ----------------------------------------------------------------------------
// Quand un composant est utilisé à plusieurs endroits avec les mêmes props,
// on extrait sa signature ici pour éviter de la dupliquer.
// ============================================================================

import { Genre, Media } from "./tmdb";

// Props du wrapper "section" sur les pages catalogue (Movies, Series, Animes).
// Affiche un titre + un lien "Voir plus" + des cartes en enfants.
interface LibraryContainerProps {
  Title: string;
  link: string;
  children: React.ReactNode;
}

// Props du composant DiscoverMedia : moteur de recherche/filtre avec données
// initiales hydratées côté serveur. Le client refetch ensuite via fetchEndpoint
// dès qu'on change un filtre (genre, tri, ...).
interface DiscoverMediaProps {
  title: string; // Exemple: "Découvrir des Animés"
  emptyMessage: string; // Exemple: "Aucun film ne correspond..."
  fetchEndpoint: string; // L'url de ton API interne: "/api/animes/discoverAnimes"
  initialData: Media[]; // Premiers résultats rendus en SSR
  genres: Genre[]; // Liste des genres pour le menu déroulant
}

export type { LibraryContainerProps, DiscoverMediaProps };
