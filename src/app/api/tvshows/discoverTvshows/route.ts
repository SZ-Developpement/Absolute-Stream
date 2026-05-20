// ============================================================================
// GET /api/tvshows/discoverTvshows?sort_by=...&with_genres=...
// ----------------------------------------------------------------------------
// Endpoint /discover pour les séries. Même schéma que discoverMovies sauf
// qu'on EXCLUT les animes manuellement après réception.
//
// Pourquoi le filtrage est fait CÔTÉ SERVEUR plutôt que dans le composant
// client ?
//   1. On ne renvoie au front que les données réellement utilisables (moins
//      de bande passante).
//   2. La règle "anime = genre 16 + origine JP" est centralisée → si demain
//      on change la définition, on change ici uniquement.
//   3. Le composant client reste générique (DiscoverMedia ne sait pas qu'il
//      affiche des séries) → moins de code dupliqué.
// ============================================================================

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { DiscoverMediaResponse } from "@/types/tmdb";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;

  // Lecture des filtres envoyés par le composant DiscoverMedia (côté client)
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get("sort_by") || "popularity.desc";
  const withGenres = searchParams.get("with_genres");

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Construction propre via la classe URL (encode automatiquement, on évite
  // les bugs de caractères spéciaux ou d'espaces).
  const url = new URL("https://api.themoviedb.org/3/discover/tv");
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("include_adult", "false");
  url.searchParams.append("include_video", "false");
  url.searchParams.append("language", "en-US");
  url.searchParams.append("page", "1");
  url.searchParams.append("sort_by", sortBy);
  // Ajout optionnel : si pas de genre choisi, on omet le param (= tous genres)
  if (withGenres) {
    url.searchParams.append("with_genres", withGenres);
  }

  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url.toString(), options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }

    const data: DiscoverMediaResponse = await res.json();

    // ----- Filtrage anime -----
    // On copie l'objet `data` via le spread `...data` pour préserver les
    // champs page, total_pages, total_results — et on REMPLACE results par
    // une version filtrée.
    //
    // `m.genre_ids?.includes(16)` :
    //   - le `?.` (optional chaining) évite un crash si genre_ids est undefined
    //   - includes(16) renvoie true si 16 (Animation) est dans la liste
    //
    // Le `&&` cumule les deux conditions : il faut Animation ET origine Japon.
    // On préfixe par `!` pour GARDER les éléments qui ne sont PAS des animes.
    const filtered = {
      ...data,
      results: (data.results || []).filter(
        (m) =>
          !(m.genre_ids?.includes(16) && m.origin_country?.includes("JP")),
      ),
    };
    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
