import { Genre, Media } from "./tmdb";

interface LibraryContainerProps {
  Title: string;
  link: string;
  children: React.ReactNode;
}

interface DiscoverMediaProps {
  title: string; // Exemple: "Découvrir des Animés"
  emptyMessage: string; // Exemple: "Aucun film ne correspond..."
  fetchEndpoint: string; // L'url de ton API interne: "/api/animes/discoverAnimes"
  initialData: Media[];
  genres: Genre[];
}

export type { LibraryContainerProps, DiscoverMediaProps };
