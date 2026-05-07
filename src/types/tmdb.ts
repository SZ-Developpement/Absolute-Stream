// Correspond à la structure d’un média (film ou série) dans les réponses de TMDB
interface Media {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
  original_name: string;
  first_air_date: string;
  name: string;
}

// Correspond à la structure de la réponse de TMDB pour les films les mieux notés
interface TopRatedMediaResponse {
  page: number;
  results: Media[];
  total_pages: number;
  total_results: number;
}

interface PopularMediaResponse {
  page: number;
  results: Media[];
  total_pages: number;
  total_results: number;
}

// Correspond à la structure de la réponse de TMDB pour les films en salle
interface NowPlayingResponse {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  results: Media[];
  total_pages: number;
  total_results: number;
}

// Correspond à la structure de la réponse de TMDB pour les séries TV les mieux notées

interface OnTheAirResponse {
  page: number;
  results: Media[];
  total_pages: number;
  total_results: number;
}

interface DiscoverMediaResponse {
  page: number;
  results: Media[];
  total_pages: number;
  total_results: number;
}

// Structure de la réponse de TMDB pour la recherche par ID
interface FindByIDResponse {
  movie_results: Media[];
  person_results: unknown[];
  tv_results: Media[];
  tv_episode_results: unknown[];
  tv_season_results: unknown[];
}

interface Genre {
  id: number;
  name: string;
}

// Export des types pour les utiliser dans d'autres parties de l'application
export type {
  Media,
  NowPlayingResponse,
  TopRatedMediaResponse,
  OnTheAirResponse,
  PopularMediaResponse,
  DiscoverMediaResponse,
  FindByIDResponse,
  Genre,
};
