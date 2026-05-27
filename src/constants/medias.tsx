// ============================================================================
// Options de tri TMDB pour les pages catalogue (Movies, Series, Animes)
// ----------------------------------------------------------------------------
// Les `value` correspondent exactement à ce qu'attend l'endpoint /discover de
// TMDB (cf. https://developer.themoviedb.org/reference/discover-movie).
// Format: <champ>.<asc|desc>
// ============================================================================

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularité Décroissante" },
  { value: "popularity.asc", label: "Popularité Croissante" },
  { value: "vote_average.desc", label: "Note Décroissante" },
  { value: "vote_average.asc", label: "Note Croissante" },
  { value: "primary_release_date.desc", label: "Plus Récents" },
  { value: "primary_release_date.asc", label: "Plus Anciens" },
];

export { SORT_OPTIONS };
