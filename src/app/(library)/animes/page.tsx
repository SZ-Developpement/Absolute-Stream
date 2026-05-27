// ============================================================================
// /animes — page catalogue Animes (Server Component)
// ----------------------------------------------------------------------------
// Comme /movies et /series mais avec le filtre "anime" obligatoire sur tous
// les fetchs. Vu que TMDB ne distingue pas les animes dans sa taxonomie, on
// définit nous-mêmes la règle :
//
//   ANIME = série télé qui réunit DEUX critères :
//     - with_genres=16          → catégorisée "Animation" par TMDB
//     - with_origin_country=JP  → produite au Japon
//
// On passe ces deux paramètres DIRECTEMENT à TMDB (vs /series où on filtrait
// APRÈS réception avec .filter). Avantage : TMDB ne nous envoie que des
// animes → réponses plus petites, moins de bande passante.
// ============================================================================

import { EmblaCarousel } from "@/components/medias/EmblaCarousel";
import MediaCards from "@/components/medias/MediaCards";
import {
  PopularMediaResponse,
  TopRatedMediaResponse,
  DiscoverMediaResponse,
} from "@/types/tmdb";
import { Media, Genre } from "@/types/tmdb";
import MediaContainer from "@/components/medias/MediaContainer";
import { DiscoverMedia } from "@/components/medias/DiscoverMedia";

// ------ Animes populaires ------
async function getPopularAnimes(): Promise<Media[]> {
  const apikey = process.env.TMDB_API_KEY;
  if (!apikey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  // Noter la combinaison de filtres dans l'URL :
  //   with_genres=16          → genre Animation
  //   with_origin_country=JP  → produit au Japon
  //   sort_by=popularity.desc → tri par popularité décroissante
  // L'ordre des params dans la query string n'a pas d'importance.
  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&api_key=${apikey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.log(`Failed to reach popular animes ${res.statusText}`);
      return [];
    }

    const data: PopularMediaResponse = await res.json();
    // Pas de .filter ici : les filtres sont déjà passés dans l'URL,
    // TMDB ne nous renvoie QUE des animes.
    return data.results || [];
  } catch (error) {
    console.error("Network error while fetching popular animes:", error);
    return [];
  }
}

// ------ Animes les mieux notés (seuil 200 votes pour filtrer le bruit) ------
async function getTopRatedAnimes(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }
  // Param spécial sur cet endpoint : `vote_count.gte=200`
  //   - .gte = "greater than or equal" (≥) en convention TMDB
  //   - On ne garde que les animes qui ont reçu AU MOINS 200 votes
  //   - Sans ce seuil, un OAV obscur noté 10/10 par 3 personnes
  //     prendrait la 1re place. Le seuil filtre le bruit statistique.
  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&vote_count.gte=200&with_genres=16&with_origin_country=JP&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch top rated animes: ${res.statusText}`);
      return [];
    }
    const data: TopRatedMediaResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Network error while fetching top rated animes:", error);
    return [];
  }
}

// ------ Liste initiale "Découvrir" pour DiscoverMedia ------
async function getDiscoverAnimes(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  // Même URL que getPopularAnimes (filtres anime + tri popularité).
  // C'est ce qui hydrate la grille au 1er render avant que l'user touche aux filtres.
  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 3600 },
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) return [];
    const data: DiscoverMediaResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Network error while fetching discover animes:", error);
    return [];
  }
}

// ------ Genres TV (on réutilise la même liste que pour les séries) ------
async function getAnimeGenres(): Promise<Genre[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  // Endpoint TMDB générique des genres TV — il n'existe pas de "genre/anime/list"
  const url = `https://api.themoviedb.org/3/genre/tv/list?language=en&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 86400 }, // Cache long : la liste change quasi jamais
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch anime genres: ${res.statusText}`);
      return [];
    }
    const data: { genres: Genre[] } = await res.json();
    return data.genres || [];
  } catch (error) {
    console.error("Network error while fetching anime genres:", error);
    return [];
  }
}

export default async function AnimesPage() {
  // SSR : on précharge tout côté serveur pour servir une page complète
  const topRatedAnimes = await getTopRatedAnimes();
  const popularAnimes = await getPopularAnimes();
  const discoverAnimes = await getDiscoverAnimes();
  const animeGenres = await getAnimeGenres();

  return (
    <MediaContainer>
      <div className="w-full h-120" />

      {/* Carrousel des tendances */}
      <EmblaCarousel
        title="Tendances du moment"
        opts={{ align: "start", loop: true, dragFree: true }}
      >
        {popularAnimes.map((anime) => (
          <MediaCards key={anime.id} media={anime} mediaType="tv" />
        ))}
      </EmblaCarousel>

      {/* Carrousel des mieux notés */}
      <EmblaCarousel
        title="Les mieux notés"
        opts={{ align: "start", loop: true, dragFree: true }}
      >
        {topRatedAnimes.map((anime) => (
          <MediaCards key={anime.id} media={anime} mediaType="tv" />
        ))}
      </EmblaCarousel>

      {/* Section "Découvrir" — fetchEndpoint pointe vers une route serveur
          qui injecte automatiquement les filtres "anime" (cf. discoverAnimes/route.ts).
          Si l'user ajoute un filtre genre, on combinera avec 16 via "16,XX". */}
      <DiscoverMedia
        title="Découvrir des animes"
        emptyMessage="Aucun anime ne correspond à vos critères."
        fetchEndpoint="/api/animes/discoverAnimes"
        initialData={discoverAnimes}
        genres={animeGenres}
        mediaType="tv"
      />
    </MediaContainer>
  );
}
