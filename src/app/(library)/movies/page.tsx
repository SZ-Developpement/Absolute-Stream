// ============================================================================
// /movies — page catalogue Films (Server Component)
// ----------------------------------------------------------------------------
// Concept clé : c'est un SERVER COMPONENT (le default en App Router).
// Différence avec un Client Component :
//   - Pas de "use client" en haut → rendu PURE côté serveur
//   - Peut être async → on peut await des fetchs directement dans le composant
//   - Pas d'accès aux hooks React (useState, useEffect...) ni au navigateur
//   - Le HTML est généré côté serveur → SEO + first paint plus rapide
//
// Pourquoi 4 fonctions getX() au lieu de réutiliser les /api routes ?
//   - Les /api routes sont pour le CLIENT (fetch côté navigateur).
//   - Ici on est côté serveur → on peut taper TMDB directement, sans passer
//     par notre propre API (= un aller-retour HTTP en moins).
//   - On utilise quand même `next: { revalidate }` → Next met en cache la
//     réponse pour la durée indiquée.
//
// Note : chaque page de catalogue (movies/series/animes) a sa propre version
// car les filtres TMDB diffèrent légèrement (animes = filtre origin_country JP).
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

// ------ Films populaires (carrousel "Tendances du moment") ------
// `Promise<Media[]>` = annotation de type du retour de la fonction async.
// Toute fonction async retourne implicitement une Promise.
async function getPopularMovies(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return []; // Fallback : tableau vide → la grille s'affiche sans crasher
  }

  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKey}`;

  // Astuce SSR : on passe l'option `next: { revalidate: N }` au fetch.
  // Next intercepte ce fetch et met le résultat en cache N secondes.
  // Au prochain appel dans la fenêtre de N sec → réponse en cache, 0 appel TMDB.
  // C'est ce qui fait que Next peut générer des centaines de pages /movies
  // sans exploser le quota TMDB.
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 3600 }, // 3600s = 1h
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch popular movies: ${res.statusText}`);
      return [];
    }
    // Annotation `: PopularMediaResponse` = TypeScript trust me bro.
    // C'est un cast statique, pas de validation runtime.
    const data: PopularMediaResponse = await res.json();
    // `|| []` = filet de sécurité si data.results est undefined
    return data.results || [];
  } catch (error) {
    console.error("Network error while fetching popular movies:", error);
    return [];
  }
}

// ------ Films les mieux notés ------
// Strictement la même structure que getPopularMovies (cf. commentaires ci-dessus).
// Variations : URL différente, type de retour TopRatedMediaResponse.
async function getTopRatedMedia(): Promise<Media[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&api_key=${apiKey}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
    next: { revalidate: 3600 },
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch top rated movies: ${res.statusText}`);
      return [];
    }
    const data: TopRatedMediaResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Network error while fetching top rated movies:", error);
    return [];
  }
}

// ------ Liste initiale "Découvrir" (sert d'initialData à DiscoverMedia) ------
// Pourquoi cette fonction en plus, puisque le composant DiscoverMedia refetch
// déjà tout seul côté client ? → pour avoir une grille HYDRATÉE dès le 1er
// render. L'utilisateur voit du contenu instantanément sans attendre le JS.
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

// ------ Liste des genres pour le filtre du composant Discover ------
// On met un revalidate de 24h car les genres TMDB changent quasiment jamais
// (la dernière modif date de plusieurs années). Pas la peine de re-fetch H24.
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
    next: { revalidate: 86400 }, // 86400s = 24h
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch movie genres: ${res.statusText}`);
      return [];
    }
    // Destructuration en TS : on extrait `genres` et on type l'objet wrapper
    const data: { genres: Genre[] } = await res.json();
    return data.genres || [];
  } catch (error) {
    console.error("Network error while fetching movie genres:", error);
    return [];
  }
}

// `export default async function` = composant React server async.
// L'async permet d'utiliser `await` directement dans le corps de la fonction.
export default async function MoviesPage() {
  // 4 await séquentiels — chaque fetch attend le précédent.
  // Optimisation possible : Promise.all([...]) pour les paralléliser. En
  // pratique le cache de Next les rend instantanés après le 1er appel.
  const topRatedMovies = await getTopRatedMedia();
  const popularMovies = await getPopularMovies();
  const discoverMovies = await getDiscoverMovies();
  const movieGenres = await getMovieGenres();

  return (
    <MediaContainer>
      {/* Espaceur transparent de 480px de haut — laisse voir l'image de fond
          (PageBackground) en haut de la page pour l'effet "hero". */}
      <div className="w-full h-120" />

      {/* Carrousel "Tendances du moment".
          opts d'Embla :
            align: "start"  → la 1re slide commence collée à gauche
            loop: true      → après la dernière, on revient à la 1re
            dragFree: true  → drag libre (pas de snap forcé sur une slide) */}
      <EmblaCarousel
        title="Tendances du moment"
        opts={{ align: "start", loop: true, dragFree: true }}
      >
        {/* .map(...) génère une MediasCard par film. key={movie.id} obligatoire. */}
        {popularMovies.map((movie) => (
          <MediaCards key={movie.id} media={movie} mediaType="movie" />
        ))}
      </EmblaCarousel>

      {/* Carrousel "Les mieux notés" — même structure */}
      <EmblaCarousel
        title="Les mieux notés"
        opts={{ align: "start", loop: true, dragFree: true }}
      >
        {topRatedMovies.map((movie) => (
          <MediaCards key={movie.id} media={movie} mediaType="movie" />
        ))}
      </EmblaCarousel>

      {/* Section "Découvrir" : passe initialData ET fetchEndpoint au composant.
          Le composant utilisera initialData pour le 1er render puis refetchera
          via fetchEndpoint quand l'user changera un filtre. */}
      <DiscoverMedia
        title="Découvrir des films"
        emptyMessage="Aucun film ne correspond à vos critères."
        fetchEndpoint="/api/movies/discoverMovies"
        initialData={discoverMovies}
        genres={movieGenres}
        mediaType="movie"
      />
    </MediaContainer>
  );
}
