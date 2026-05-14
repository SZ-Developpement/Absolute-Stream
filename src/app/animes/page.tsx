import { EmblaCarousel } from "@/components/library/EmblaCarousel";
import MediaCards from "@/components/library/MediaCards";
import { DiscoverAnimes } from "@/components/library/DiscoverAnimes";
import {
  PopularMediaResponse,
  TopRatedMediaResponse,
  DiscoverMediaResponse,
} from "@/types/tmdb";
import { Media, Genre } from "@/types/tmdb";

// ------ FONCTION POUR RÉCUPÉRER LES ANIMES POPULAIRES ------ \\

async function getPopularAnimes(): Promise<Media[]> {
  const apikey = process.env.TMDB_API_KEY;
  if (!apikey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&api_key=${apikey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.log(`Failed to reach popular animes ${res.statusText}`);
      return [];
    }

    const data: PopularMediaResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Network error while fetching popular animes:", error);
    return [];
  }
}

// ------ FONCTION POUR RÉCUPÉRER LES ANIMES LES MIEUX NOTÉS ------ \\
async function getTopRatedAnimes(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }
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

// ------ FONCTION POUR RÉCUPÉRER LES ANIMES À DÉCOUVRIR ------ \\
async function getDiscoverAnimes(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

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

// ------ FONCTION POUR RÉCUPÉRER LES GENRES D'ANIMES ------ \\
async function getAnimeGenres(): Promise<Genre[]> {
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
  // On appelle directement les fonctions qui récupèrent les données sur le serveur.
  const topRatedAnimes = await getTopRatedAnimes();
  const popularAnimes = await getPopularAnimes();
  const discoverAnimes = await getDiscoverAnimes();
  const animeGenres = await getAnimeGenres();

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col gap-2 w-full mt-120">
        {/* TENDANCES DU MOMENT */}
        <div className="my-8">
          <h1 className="text-lg font-bold my-6">Tendances du moment</h1>
          <EmblaCarousel opts={{ align: "start", loop: true, dragFree: true }}>
            <MediaCards mediaList={popularAnimes} />
          </EmblaCarousel>
        </div>

        {/* LES MIEUX NOTÉS */}
        <div className="my-8">
          <h1 className="text-lg font-bold my-6">Les mieux notés</h1>
          <EmblaCarousel opts={{ align: "start", loop: true, dragFree: true }}>
            <MediaCards mediaList={topRatedAnimes} />
          </EmblaCarousel>
        </div>

        {/* DÉCOUVRIR DES ANIMES */}
        <DiscoverAnimes
          initialAnimes={discoverAnimes}
          genres={animeGenres}
          className="my-8"
        />
      </div>
    </div>
  );
}
