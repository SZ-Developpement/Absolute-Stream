// ============================================================================
// Helpers TMDB — appels côté serveur à l'API The Movie Database
// ----------------------------------------------------------------------------
// Ce fichier contient les fonctions qui parlent à TMDB depuis le serveur.
// On y stocke les types qui décrivent les réponses qu'on consomme et la
// fonction `getCollections` (sagas / franchises ex: Harry Potter, Star Wars).
//
// Astuce mise en cache :
//   fetch(..., { next: { revalidate: N } })
// Next.js met automatiquement le résultat en cache N secondes → on évite
// de spammer TMDB et on tient les quotas largement.
// ============================================================================

const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Forme minimale d'un film TMDB (on ne déclare que ce qu'on lit ici)
interface TMDBMovie {
  id: number;
  title: string;
  belongs_to_collection?: {
    id: number;
    name: string;
  };
}

// Représente une saga complète avec ses films (= ce qu'on affiche en front)
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

/**
 * Construit la liste des sagas (collections) à partir des films populaires.
 *
 * Logique :
 *   1. On parcourt les pages /movie/popular jusqu'à atteindre `limit` films.
 *   2. Pour chaque film, on appelle son endpoint détails pour voir s'il
 *      appartient à une `belongs_to_collection` (ex: "Harry Potter Collection").
 *   3. On dédoublonne via un Set, puis on récupère les détails de chaque collection.
 *
 * Revalidation : popular = 1h, détails/collection = 24h (données stables).
 */
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
      // On ne traite que ce qu'il manque pour atteindre la limite
      const moviesOnThisPage = Math.min(
        data.results.length,
        limit - moviesProcessed,
      );

      // Pour chaque film, on demande les détails (Promise.all = parallèle)
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

      // On extrait les IDs de saga (Set dédoublonne automatiquement)
      movieDetails.forEach((movie: TMDBMovie | null) => {
        if (movie?.belongs_to_collection?.id) {
          collectionIds.add(movie.belongs_to_collection.id);
        }
      });

      moviesProcessed += moviesOnThisPage;
      page++;

      // Garde-fou : si TMDB renvoie 0 résultat, on stoppe (sinon boucle infinie)
      if (data.results.length === 0) break;
    }

    // 2e batch : on demande les détails de chaque collection trouvée
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

    // Filtre TypeScript propre : on retire les nulls (échec de fetch)
    return collections.filter((c): c is TMDBCollection => c !== null);
  } catch (error) {
    console.error("Erreur lors de la récupération des collections:", error);
    return [];
  }
}
