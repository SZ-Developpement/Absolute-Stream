import { EmblaCarousel } from "@/components/library/EmblaCarousel";
import MediaCards from "@/components/library/MediaCards";
import { PopularMediaResponse, Media } from "@/types/tmdb";

async function getPopularMovies(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return []; // On retourne un tableau vide pour éviter que la page ne plante.
  }

  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    // On met en cache le résultat pendant 1h pour ne pas surcharger l'API de TMDB.
    next: { revalidate: 3600 },
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch popular movies: ${res.statusText}`);
      return [];
    }
    const data: PopularMediaResponse = await res.json();
    // L'API TMDB renvoie les films dans la propriété "results".
    return data.results || [];
  } catch (error) {
    console.error("Network error while fetching popular movies:", error);
    return [];
  }
}

export default async function MoviesPage() {
  // On appelle directement la fonction qui récupère les données sur le serveur.
  const popularMovies = await getPopularMovies();
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col gap-2 w-full mt-110">
        <h1 className=" mt-4 text-1xl font-bold">Tendances du moment</h1>
        <EmblaCarousel opts={{ align: "start", loop: true, dragFree: true }}>
          <MediaCards mediaList={popularMovies} />
        </EmblaCarousel>
      </div>
    </div>
  );
}
