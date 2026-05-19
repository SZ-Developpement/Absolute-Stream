import { EmblaCarousel } from "@/components/medias/EmblaCarousel";
import MediaCards from "@/components/medias/MediaCards";
import MediaContainer from "@/components/medias/MediaContainer";
import { DiscoverMovies } from "@/components/movies/DiscoverMovies";
import {
  PopularMediaResponse,
  TopRatedMediaResponse,
  DiscoverMediaResponse,
} from "@/types/tmdb";
import { Media, Genre } from "@/types/tmdb";

// ------ FONCTION POUR RÉCUPÉRER LES FILMS POPULAIRES ------ \\

/* On a besoin de Promise parce que l’appel API est asynchrone
cela permet au reste du code d’attendre proprement 
le tableau de films quand il est prêt */
async function getPopularMovies(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return []; // On retourne un tableau vide  si la clé d'API est manquante pour éviter de planter l'application.
  }

  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKey}`;
  const options = {
    method: "GET",
    // TMDB recommande d'inclure un header "Accept" pour indiquer que nous attendons une réponse JSON.
    headers: { accept: "application/json" },
    // On met en cache le résultat pendant 1h pour ne pas surcharger l'API de TMDB.
    next: { revalidate: 3600 },
  };
  // On utilise un bloc try/catch pour gérer les erreurs réseau ou les réponses non-OK de l'API.
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch popular movies: ${res.statusText}`);
      return [];
    }
    // On parse la réponse JSON et on retourne la liste des films populaires.
    const data: PopularMediaResponse = await res.json();
    // L'API TMDB renvoie les films dans la propriété "results".
    return data.results || []; // On retourne un tableau vide si "results" est undefined, || = opérateur de coalescence nulle pour éviter les erreurs de type.
  } catch (error) {
    console.error("Network error while fetching popular movies:", error);
    return [];
  }
}

// ------ FONCTION POUR RÉCUPÉRER LES FILMS LES MIEUX NOTÉS ------ \\
async function getTopRatedMedia(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return []; // On retourne un tableau vide  si la clé d'API est manquante pour éviter de planter l'application.
  }

  const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&api_key=${apiKey}`;
  const options = {
    method: "GET",
    // TMDB recommande d'inclure un header "Accept" pour indiquer que nous attendons une réponse JSON.
    headers: { accept: "application/json" },
    // On met en cache le résultat pendant 1h pour ne pas surcharger l'API de TMDB.
    next: { revalidate: 3600 },
  };
  // On utilise un bloc try/catch pour gérer les erreurs réseau ou les réponses non-OK de l'API.
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch top rated movies: ${res.statusText}`);
      return [];
    }
    // On parse la réponse JSON et on retourne la liste des films les mieux notés.
    const data: TopRatedMediaResponse = await res.json();
    // L'API TMDB renvoie les films dans la propriété "results".
    return data.results || []; // On retourne un tableau vide si "results" est undefined, || = opérateur de coalescence nulle pour éviter les erreurs de type.
  } catch (error) {
    console.error("Network error while fetching top rated movies:", error);
    return [];
  }
}

// ------ FONCTION POUR RÉCUPÉRER LES FILMS À DÉCOUVRIR ------ \\
async function getDiscoverMovies(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 3600 },
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch discover movies: ${res.statusText}`);
      return [];
    }
    const data: DiscoverMediaResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Network error while fetching discover movies:", error);
    return [];
  }
}

// ------ FONCTION POUR RÉCUPÉRER LES GENRES DE FILMS ------ \\
async function getMovieGenres(): Promise<Genre[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  const url = `https://api.themoviedb.org/3/genre/movie/list?language=en&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 86400 }, // Les genres changent peu, on met en cache pour 24h
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch movie genres: ${res.statusText}`);
      return [];
    }
    const data: { genres: Genre[] } = await res.json();
    return data.genres || [];
  } catch (error) {
    console.error("Network error while fetching movie genres:", error);
    return [];
  }
}

export default async function MoviesPage() {
  // On appelle directement les fonctions qui récupèrent les données sur le serveur.
  const topRatedMovies = await getTopRatedMedia();
  const popularMovies = await getPopularMovies();
  const discoverMovies = await getDiscoverMovies();
  const movieGenres = await getMovieGenres();

  return (
    <MediaContainer>
      <div className="w-full h-120" />

      {/* TENDANCES DU MOMENT */}
      <EmblaCarousel
        title="Tendances du moment"
        opts={{ align: "start", loop: true, dragFree: true }}
      >
        <MediaCards mediaList={popularMovies} />
      </EmblaCarousel>

      {/* LES MIEUX NOTÉS */}
      <EmblaCarousel
        title="Les mieux notés"
        opts={{ align: "start", loop: true, dragFree: true }}
      >
        <MediaCards mediaList={topRatedMovies} />
      </EmblaCarousel>

      {/* DÉCOUVRIR DES FILMS */}
      <DiscoverMovies initialMovies={discoverMovies} genres={movieGenres} />
    </MediaContainer>
  );
}
