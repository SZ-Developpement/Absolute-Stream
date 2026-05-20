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
};
