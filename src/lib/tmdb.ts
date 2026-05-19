const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

interface TMDBMovie {
  id: number;
  title: string;
  belongs_to_collection?: {
    id: number;
    name: string;
  };
}

export interface TMDBCollection {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  parts: Array<{
    id: number;
    title: string;
    release_date: string;
    poster_path?: string;
  }>;
}

export async function getCollections(
  limit: number = 20,
): Promise<TMDBCollection[]> {
  try {
    const collectionIds = new Set<number>();
    let moviesProcessed = 0;
    let page = 1;

    // Récupère les films populaires sur plusieurs pages jusqu'au limit
    while (moviesProcessed < limit) {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`,
        { next: { revalidate: 3600 } },
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      const moviesOnThisPage = Math.min(
        data.results.length,
        limit - moviesProcessed,
      );

      // Pour chaque film, récupère les détails pour trouver les collections
      const movieDetails = await Promise.all(
        data.results.slice(0, moviesOnThisPage).map((movie: TMDBMovie) =>
          fetch(
            `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=fr-FR`,
            { next: { revalidate: 86400 } },
          )
            .then((res) => res.json())
            .catch(() => null),
        ),
      );

      // Collecte les IDs de collections uniques
      movieDetails.forEach((movie: TMDBMovie | null) => {
        if (movie?.belongs_to_collection?.id) {
          collectionIds.add(movie.belongs_to_collection.id);
        }
      });

      moviesProcessed += moviesOnThisPage;
      page++;

      if (data.results.length === 0) break;
    }

    // Récupère les détails de chaque collection
    const collections = await Promise.all(
      Array.from(collectionIds).map((id) =>
        fetch(
          `${TMDB_BASE_URL}/collection/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`,
          { next: { revalidate: 86400 } },
        )
          .then((res) => res.json())
          .catch(() => null),
      ),
    );

    return collections.filter((c): c is TMDBCollection => c !== null);
  } catch (error) {
    console.error("Erreur lors de la récupération des collections:", error);
    return [];
  }
}
