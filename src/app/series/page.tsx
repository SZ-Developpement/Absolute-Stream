import { EmblaCarousel } from "@/components/library/EmblaCarousel";
import MediaCards from "@/components/library/MediaCards";
import { DiscoverTvshows } from "@/components/library/DiscoverTvshows";
import {
  PopularMediaResponse,
  TopRatedMediaResponse,
  DiscoverMediaResponse,
} from "@/types/tmdb";
import { Media, Genre } from "@/types/tmdb";

// On considère qu'un item est un anime s'il est classé "Animation" (genre 16) ET vient du Japon.
// Ça enlève les anime tout en gardant les cartoons occidentaux (Rick & Morty, Bob's Burgers, etc.).
const isAnime = (m: Media) =>
  m.genre_ids?.includes(16) && m.origin_country?.includes("JP");

// ------ FONCTION POUR RÉCUPÉRER LES SÉRIES POPULAIRES ------ \\

async function getPopularSeries(): Promise<Media[]> {
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
    return (data.results || []).filter((m) => !isAnime(m));
  } catch (error) {
    console.error("Network error while fetching popular tv shows:", error);
    return [];
  }
}

// ------ FONCTION POUR RÉCUPÉRER LES SÉRIES LES MIEUX NOTÉES ------ \\
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
    return (data.results || []).filter((m) => !isAnime(m));
  } catch (error) {
    console.error("Network error while fetching top rated tv shows:", error);
    return [];
  }
}

// ------ FONCTION POUR RÉCUPÉRER LES SÉRIES À DÉCOUVRIR ------ \\
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

// ------ FONCTION POUR RÉCUPÉRER LES GENRES DE SERIES ------ \\
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
    next: { revalidate: 86400 }, // Les genres changent peu, on met en cache pour 24h
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

export default async function SeriesPage() {
  // On appelle directement les fonctions qui récupèrent les données sur le serveur.
  const topRatedSeries = await getTopRatedSeries();
  const popularSeries = await getPopularSeries();
  const discoverSeries = await getDiscoverSeries();
  const seriesGenres = await getSeriesGenres();

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col gap-2 w-full mt-120">
        {/* TENDANCES DU MOMENT */}
        <div className="my-8">
          <h1 className="text-lg font-bold my-6">Tendances du moment</h1>
          <EmblaCarousel opts={{ align: "start", loop: true, dragFree: true }}>
            <MediaCards mediaList={popularSeries} />
          </EmblaCarousel>
        </div>

        {/* LES MIEUX NOTÉS */}
        <div className="my-8">
          <h1 className="text-lg font-bold my-6">Les mieux notés</h1>
          <EmblaCarousel opts={{ align: "start", loop: true, dragFree: true }}>
            <MediaCards mediaList={topRatedSeries} />
          </EmblaCarousel>
        </div>

        {/* DÉCOUVRIR DES SÉRIES */}
        <DiscoverTvshows
          initialSeries={discoverSeries}
          genres={seriesGenres}
          className="my-8"
        />
      </div>
    </div>
  );
}
