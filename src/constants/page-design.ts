// ============================================================================
// Mapping route → image de fond
// ----------------------------------------------------------------------------
// Le composant <PageBackground/> et le hook usePageBackground utilisent cette
// table pour décider quelle affiche d'ambiance montrer derrière chaque page.
//
// `exact: true`  → le fond ne s'applique QUE sur cette route précise
// `exact: false` → s'applique aussi aux sous-routes (ex: /match/abc123)
// ============================================================================

interface ImageData {
  name: string;
  src: string;
  // Sert à savoir si les sous-pages auront aussi l'image en fond.
  // Exemple : si false, /films/123 hérite du fond de /films
  exact?: boolean;
}

export const pageDesign: ImageData[] = [
  {
    name: "home",
    src: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    exact: true,
  },
  {
    name: "movies",
    src: "https://image.tmdb.org/t/p/original/rshlQ6LfPRSWFhpGL4s5ZkIPR51.jpg",
    exact: true,
  },
  {
    name: "series",
    src: "https://image.tmdb.org/t/p/original/tkfUWT5WULSz9GuJldBUxq8yH6C.jpg",
    exact: true,
  },
  {
    name: "animes",
    src: "https://image.tmdb.org/t/p/original/fFI7CYmqbW28eD7QbSxtUk9dABO.jpg",
    exact: true,
  },
  {
    // Match : exact=false → /match ET /match/[sessionId] partagent le même fond
    name: "match",
    src: "https://image.tmdb.org/t/p/original/nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg",
    exact: false,
  },
];
