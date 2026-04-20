// Correspond à la structure d'un film dans les réponses de TMDB
interface Movie {
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
}

// Correspond à la structure de la réponse de TMDB pour les films les mieux notés
interface TopRatedMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

interface PopularMoviesResponse {
  page: number;
  results: Movie[];
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
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Correspond à la structure d'une série TV dans les réponses de TMDB
interface TVShow {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
}

// Correspond à la structure de la réponse de TMDB pour les séries TV les mieux notées
interface TopRatedTVResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

interface PopularTVResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

interface OnTheAirResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

interface DiscoverTVResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

interface DiscoverMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Correspond à la structure de la réponse de TMDB pour la recherche par ID
interface FindByIDResponse {
  movie_results: Movie[];
  person_results: unknown[]; // Remplacer 'any' par le type approprié si disponible
  tv_results: TVShow[];
  tv_episode_results: unknown[]; // Remplacer 'any' par le type approprié si disponible
  tv_season_results: unknown[]; // Remplacer 'any' par le type approprié si disponible
}

interface Genre {
  id: number;
  name: string;
}

// Export des types pour les utiliser dans d'autres parties de l'application
export type {
  Movie,
  NowPlayingResponse,
  TVShow,
  TopRatedTVResponse,
  TopRatedMoviesResponse,
  OnTheAirResponse,
  PopularTVResponse,
  PopularMoviesResponse,
  DiscoverTVResponse,
  DiscoverMoviesResponse,
  FindByIDResponse,
  Genre,
};
