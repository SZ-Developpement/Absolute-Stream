// ============================================================================
// /series — page catalogue Séries TV (Server Component)
// ----------------------------------------------------------------------------
// Même architecture que /movies (cf. les commentaires détaillés là-bas) sauf
// 3 différences fondamentales :
//
//   1. Endpoints TMDB en `/tv/...` au lieu de `/movie/...`
//   2. On EXCLUT les animes pour éviter les doublons avec la page /animes
//   3. Le helper `isAnime` centralise la règle "qu'est-ce qu'un anime"
//
// La règle est appliquée sur les 3 listes (popular, top rated, discover) via
// un .filter() — comme ça, peu importe quel endpoint on appelle, on garde la
// même définition. Si demain on change la règle, on change ICI uniquement.
// ============================================================================

import { DiscoverMedia } from "@/components/medias/DiscoverMedia";
import { EmblaCarousel } from "@/components/medias/EmblaCarousel";
import MediaCards from "@/components/medias/MediaCards";
import MediaContainer from "@/components/medias/MediaContainer";
import {
  PopularMediaResponse,
  TopRatedMediaResponse,
  DiscoverMediaResponse,
} from "@/types/tmdb";
import { Media, Genre } from "@/types/tmdb";

// ---------------------------------------------------------------------------
// Helper `isAnime` : prédicat qui renvoie true si le média est un anime.
//
// Définition appliquée : "anime" = genre Animation (id 16) ET origine Japon.
// Cette double condition exclut bien :
//   - Les cartoons US (Rick & Morty, etc.) → genre 16 mais origine US
//   - Les drama japonais → origine JP mais pas genre 16
//
// Syntaxe arrow function avec retour implicite :
//   const fn = (param) => expression;
// = équivalent de :
//   const fn = (param) => { return expression; };
//
// Le `?.` (optional chaining) sur genre_ids et origin_country évite un crash
// si l'un des deux est undefined dans la réponse TMDB.
// ---------------------------------------------------------------------------
const isAnime = (m: Media) =>
  m.genre_ids?.includes(16) && m.origin_country?.includes("JP");

// ------ Séries populaires (filtrées des animes) ------
async function getPopularSeries(): Promise<Media[]> {
  // Note : "apikey" en minuscule sur cette fonction (vs "apiKey" ailleurs).
  // C'est juste un nom de variable local, ça ne change rien fonctionnellement.
  const apikey = process.env.TMDB_API_KEY;
  if (!apikey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  const url = `https://api.themoviedb.org/3/tv/popular?language=en-US&page=1&api_key=${apikey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.log(`Failed to reach popular tv shows ${res.statusText}`);
      return [];
    }

    const data: PopularMediaResponse = await res.json();
    // `.filter(m => !isAnime(m))` :
    //   - .filter conserve les éléments pour lesquels la condition est true
    //   - `!isAnime(m)` inverse → on conserve ceux qui ne sont PAS des animes
    return (data.results || []).filter((m) => !isAnime(m));
  } catch (error) {
    console.error("Network error while fetching popular tv shows:", error);
    return [];
  }
}

// ------ Séries les mieux notées (filtrées des animes) ------
async function getTopRatedSeries(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }
  const url = `https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch top rated tv shows: ${res.statusText}`);
      return [];
    }
    const data: TopRatedMediaResponse = await res.json();
    // Même pattern qu'au-dessus : on retire les animes après réception
    return (data.results || []).filter((m) => !isAnime(m));
  } catch (error) {
    console.error("Network error while fetching top rated tv shows:", error);
    return [];
  }
}

// ------ Liste initiale "Découvrir" (filtrées des animes) ------
async function getDiscoverSeries(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 3600 },
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) return [];
    const data: DiscoverMediaResponse = await res.json();
    return (data.results || []).filter((m) => !isAnime(m));
  } catch (error) {
    console.error("Network error while fetching discover movies:", error);
    return [];
  }
}

// ------ Liste des genres TV ------
async function getSeriesGenres(): Promise<Genre[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  const url = `https://api.themoviedb.org/3/genre/tv/list?language=en&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 86400 }, // Cache 24h, les genres changent jamais
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch tv show genres: ${res.statusText}`);
      return [];
    }
    const data: { genres: Genre[] } = await res.json();
    return data.genres || [];
  } catch (error) {
    console.error("Network error while fetching tv show genres:", error);
    return [];
  }
}

// Server Component async — Next génère le HTML après ces 4 await
export default async function SeriesPage() {
  const topRatedSeries = await getTopRatedSeries();
  const popularSeries = await getPopularSeries();
  const discoverSeries = await getDiscoverSeries();
  const seriesGenres = await getSeriesGenres();

  return (
    <MediaContainer>
      {/* Espaceur pour laisser respirer le PageBackground en haut */}
      <div className="w-full h-120" />

      {/* Carrousel des tendances */}
      <EmblaCarousel
        title="Tendances du moment"
        opts={{ align: "start", loop: true, dragFree: true }}
      >
        {popularSeries.map((serie) => (
          <MediaCards key={serie.id} media={serie} />
        ))}
      </EmblaCarousel>

      {/* Carrousel des mieux notés */}
      <EmblaCarousel
        title="Les mieux notés"
        opts={{ align: "start", loop: true, dragFree: true }}
      >
        {topRatedSeries.map((serie) => (
          <MediaCards key={serie.id} media={serie} />
        ))}
      </EmblaCarousel>

      {/* Section "Découvrir" — le fetchEndpoint pointe vers la route serveur
          qui filtrera ELLE AUSSI les animes (cf. discoverTvshows/route.ts) */}
      <DiscoverMedia
        title="Découvrir des séries"
        emptyMessage="Aucune série ne correspond à vos critères."
        fetchEndpoint="/api/tvshows/discoverTvshows"
        initialData={discoverSeries}
        genres={seriesGenres}
      />
    </MediaContainer>
  );
}
