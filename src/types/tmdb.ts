// ============================================================================
// Types TypeScript miroirs des réponses TMDB
// ----------------------------------------------------------------------------
// Pourquoi déclarer des types alors qu'on pourrait travailler avec `any` ?
//   - Auto-complétion dans VS Code (on tape `media.` → IDE propose poster_path)
//   - Erreur à la compilation si on fait une faute de frappe sur un champ
//   - Documentation vivante : lire le type = comprendre la donnée
//
// Limite à connaître : ces types sont des PROMESSES, pas des contrats.
// TypeScript ne valide RIEN au runtime → si TMDB change sa réponse, le code
// continue de compiler mais peut crasher à l'exécution. Pour avoir une vraie
// validation runtime → utiliser Zod (cf. actions/favorites.ts).
//
// Convention d'écriture : on ne déclare QUE les champs qu'on consomme dans
// l'app. TMDB renvoie beaucoup plus mais on évite de polluer le type.
// ============================================================================

// ---------------------------------------------------------------------------
// `Media` = type "fourre-tout" pour films ET séries.
// TMDB utilise des noms de champs LÉGÈREMENT différents selon le type :
//   - Films  : title, release_date, original_title
//   - Séries : name, first_air_date, original_name
// → On déclare TOUS les champs et on lit celui qui existe (`title ?? name`).
//   Pas idéal niveau pureté, mais super pratique côté composants.
// ---------------------------------------------------------------------------
interface Media {
  adult: boolean; // true si contenu adulte (toujours filtré côté serveur)
  backdrop_path: string | null; // chemin de l'image de fond (peut être null)
  genre_ids: number[]; // tableau d'ids de genres (ex: [28, 12] = Action + Aventure)
  id: number; // ID TMDB — clé primaire chez eux
  original_language: string; // code ISO 639-1 (ex: "fr", "en", "ja")
  original_title: string; // titre original (films)
  overview: string; // synopsis
  popularity: number; // score interne TMDB (variable continue)
  poster_path: string | null; // chemin de l'affiche
  release_date: string; // date au format "YYYY-MM-DD" (films)
  title: string; // titre traduit (films)
  video: boolean; // true si c'est une vidéo (très rare en pratique)
  vote_average: number; // note moyenne /10
  vote_count: number; // nombre de votes (sert au seuil anti-bruit)
  origin_country: string[]; // ex: ["JP", "US"] — origines (séries)
  original_name: string; // nom original (séries)
  first_air_date: string; // date de 1re diffusion (séries)
  name: string; // nom traduit (séries)
}

// ---------------------------------------------------------------------------
// Structures paginées : TMDB renvoie une enveloppe { page, results, ... }
// pour la plupart des endpoints. On déclare un type par endpoint même quand
// la forme est identique → ça documente mieux et permet de distinguer
// facilement quelle liste vient de quel appel.
// ---------------------------------------------------------------------------
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

// Spécifique à /movie/now_playing : ajoute un objet `dates` qui décrit la
// plage de dates considérée comme "à l'affiche actuellement" par TMDB.
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

// ---------------------------------------------------------------------------
// /find/{external_id} → un id IMDB peut matcher PLUSIEURS types (film/série/
// épisode/personne). TMDB renvoie donc plusieurs tableaux et c'est au client
// de piocher le bon.
//
// `unknown` (au lieu de `any`) sur les types qu'on n'utilise pas : ça force
// TypeScript à nous obliger à valider avant utilisation. C'est plus safe.
// ---------------------------------------------------------------------------
interface FindByIDResponse {
  movie_results: Media[];
  person_results: unknown[]; // pas utilisé dans l'app
  tv_results: Media[];
  tv_episode_results: unknown[];
  tv_season_results: unknown[];
}

// Genre TMDB minimal — ne contient que les deux champs qu'on lit
interface Genre {
  id: number;
  name: string;
}

// ---------------------------------------------------------------------------
// Détail d'un média (réponse de /movie/{id} ou /tv/{id})
// ----------------------------------------------------------------------------
// Beaucoup plus riche que `Media` (qui sert pour les listes). Inclut les
// champs hydratés via `append_to_response=credits,release_dates,content_ratings,videos`.
// ---------------------------------------------------------------------------
interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number; // ordre de billing TMDB — 0 = tête d'affiche
}

interface CrewMember {
  id: number;
  name: string;
  job: string; // ex: "Director", "Producer", "Screenplay"
  department: string; // ex: "Directing", "Writing"
  profile_path: string | null;
}

interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

interface Video {
  id: string;
  key: string; // clé YouTube si site = "YouTube"
  name: string;
  site: string; // "YouTube" ou "Vimeo"
  type: string; // "Trailer", "Teaser", "Clip", "Behind the Scenes"...
  official: boolean;
  iso_639_1: string; // code langue
}

interface VideosResponse {
  results: Video[];
}

// Films : /movie/{id}/release_dates renvoie un tableau par pays.
// Chaque entrée a un `release_dates[]` qui contient les certifications (PG-13...).
interface ReleaseDateEntry {
  certification: string; // ex: "PG-13", "R", "12"
  iso_639_1: string;
  release_date: string;
  type: number; // 1=Premiere, 3=Theatrical, 4=Digital, 5=Physical, 6=TV
}

interface ReleaseDatesByCountry {
  iso_3166_1: string; // code pays ex: "FR", "US"
  release_dates: ReleaseDateEntry[];
}

interface ReleaseDatesResponse {
  results: ReleaseDatesByCountry[];
}

// Séries : /tv/{id}/content_ratings → classification par pays (un seul rating par pays)
interface ContentRating {
  iso_3166_1: string;
  rating: string; // ex: "TV-MA", "TV-14"
}

interface ContentRatingsResponse {
  results: ContentRating[];
}

// "Créateur" de série (TV uniquement, équivalent du réalisateur pour les films)
interface Creator {
  id: number;
  name: string;
  profile_path: string | null;
}

// `MediaDetails` = tout ce qui peut sortir de /movie/{id} ou /tv/{id} après
// append_to_response. Beaucoup de champs sont optionnels car ils ne sont
// présents que pour un type (films vs séries).
interface MediaDetails {
  id: number;
  backdrop_path: string | null;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  // Films
  title?: string;
  original_title?: string;
  release_date?: string;
  runtime?: number; // minutes
  // Séries
  name?: string;
  original_name?: string;
  first_air_date?: string;
  episode_run_time?: number[]; // minutes (souvent un tableau d'1 élément)
  created_by?: Creator[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  // Hydratés via append_to_response
  credits?: Credits;
  release_dates?: ReleaseDatesResponse;
  content_ratings?: ContentRatingsResponse;
  videos?: VideosResponse;
}

// ---------------------------------------------------------------------------
// /search/multi — recherche mixte films + séries + personnes en un appel.
// Chaque résultat porte un champ `media_type` qui dit ce que c'est. C'est ce
// champ qu'on lit pour router vers /view-media/movie/X ou /view-media/tv/X.
// ---------------------------------------------------------------------------
interface MultiSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  // Champs partagés films/séries
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  // Films
  title?: string;
  original_title?: string;
  release_date?: string;
  // Séries
  name?: string;
  original_name?: string;
  first_air_date?: string;
  // Personnes
  profile_path?: string | null;
  known_for_department?: string;
}

interface MultiSearchResponse {
  page: number;
  results: MultiSearchResult[];
  total_pages: number;
  total_results: number;
}

// ---------------------------------------------------------------------------
// Export groupé en bas du fichier (`export type { ... }`).
// On utilise `export type` au lieu de `export` tout court car ce sont des
// déclarations TS pures : ça permet au compilateur de les retirer du bundle
// (`import type { Media }` n'ajoute rien au JS généré).
// ---------------------------------------------------------------------------
export type {
  Media,
  NowPlayingResponse,
  TopRatedMediaResponse,
  OnTheAirResponse,
  PopularMediaResponse,
  DiscoverMediaResponse,
  FindByIDResponse,
  Genre,
  MediaDetails,
  CastMember,
  CrewMember,
  Credits,
  Video,
  VideosResponse,
  ReleaseDateEntry,
  ReleaseDatesByCountry,
  ReleaseDatesResponse,
  ContentRating,
  ContentRatingsResponse,
  Creator,
  MultiSearchResult,
  MultiSearchResponse,
};
