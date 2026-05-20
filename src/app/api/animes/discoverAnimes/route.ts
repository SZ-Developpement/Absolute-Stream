// ============================================================================
// GET /api/animes/discoverAnimes?sort_by=...&with_genres=...
// ----------------------------------------------------------------------------
// Endpoint /discover dédié aux animes.
//
// Différence importante avec discoverMovies/discoverTvshows :
//   - Les filtres "anime" (genre 16 + origine JP) sont OBLIGATOIRES et
//     toujours appliqués, peu importe ce que l'utilisateur choisit.
//   - Si l'utilisateur ajoute un genre supplémentaire (ex: Action = 28),
//     on COMBINE avec 16 via une virgule : "with_genres=16,28".
//     Côté TMDB, une virgule = ET logique. L'item doit avoir LES DEUX genres.
//
// → Du coup l'utilisateur peut filtrer "animes d'action", "animes de comédie",
//   etc. sans qu'on perde le côté "anime japonais".
// ============================================================================

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { DiscoverMediaResponse } from "@/types/tmdb";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;

  // Récupération des filtres passés par le composant client.
  // .get() renvoie string | null → on coalesce avec || pour avoir un défaut.
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get("sort_by") || "popularity.desc";
  const withGenres = searchParams.get("with_genres");

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Classe URL pour assembler proprement (cf. autres routes pour explication)
  const url = new URL("https://api.themoviedb.org/3/discover/tv");
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("include_adult", "false");
  url.searchParams.append("include_video", "false");
  url.searchParams.append("language", "en-US");
  url.searchParams.append("page", "1");
  url.searchParams.append("sort_by", sortBy);

  // Combinaison de filtres : ternaire `cond ? a : b`.
  //   - Si withGenres existe : "16,XX" (animation ET genre choisi)
  //   - Sinon : "16" tout court (juste animation)
  // Le 16 reste TOUJOURS présent → on ne sort jamais du périmètre "anime".
  url.searchParams.append("with_genres", withGenres ? `16,${withGenres}` : "16");

  // Filtre origine Japon, jamais discutable pour cette route.
  url.searchParams.append("with_origin_country", "JP");

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
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
