// ============================================================================
// GET /api/movies/discoverMovies?sort_by=...&with_genres=...
// ----------------------------------------------------------------------------
// Endpoint de découverte côté Films. Contrairement à /popular ou /top_rated
// qui sont figés, /discover accepte plein de filtres et c'est ce qu'on
// expose ici via deux query params :
//   - sort_by      : ordre (popularity.desc, vote_average.desc, ...)
//   - with_genres  : id d'un genre (ex: "28" pour Action)
//
// L'utilisateur change un filtre → DiscoverMedia (côté client) refetch
// cette route avec les nouveaux params → on transmet à TMDB → on renvoie.
// ============================================================================

import { NextResponse } from "next/server";
// NextRequest = extension de la Request standard avec des helpers Next-spécifiques
// (notamment `nextUrl` qui parse l'URL et expose les searchParams typés).
import { NextRequest } from "next/server";
import { DiscoverMediaResponse } from "@/types/tmdb";

// Quand la route a besoin de lire la requête entrante (query params, cookies,
// headers...), on accepte un paramètre `request: NextRequest`.
export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;

  // request.nextUrl est de type NextURL (= URL standard + extras).
  // .searchParams est une instance de URLSearchParams (Web API standard).
  const searchParams = request.nextUrl.searchParams;

  // .get(key) renvoie string | null. Le `|| "popularity.desc"` donne la
  // valeur par défaut si le filtre n'a pas été passé par le client.
  const sortBy = searchParams.get("sort_by") || "popularity.desc";

  // Pour with_genres on ne fournit PAS de défaut : null = "pas de filtre genre"
  // → on n'ajoutera tout simplement pas le param à TMDB.
  const withGenres = searchParams.get("with_genres");

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // On utilise la classe URL native plutôt que la concaténation de chaîne :
  // c'est plus safe (encode automatiquement les caractères spéciaux) et plus
  // lisible. `url.searchParams.append(k, v)` = ajoute "&k=v" à la query.
  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("include_adult", "false"); // jamais d'adulte
  url.searchParams.append("include_video", "false"); // pas les trailers/bonus
  url.searchParams.append("language", "en-US");
  url.searchParams.append("page", "1");
  url.searchParams.append("sort_by", sortBy);

  // Ajout conditionnel : si pas de filtre genre, on ne met rien dans l'URL.
  // TMDB acceptera la requête sans `with_genres` (= tous les genres).
  if (withGenres) {
    url.searchParams.append("with_genres", withGenres);
  }

  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    // url.toString() reconstruit la chaîne complète à partir de l'objet URL.
    // fetch() accepte aussi directement un objet URL mais .toString() est
    // explicite et compatible avec toutes les versions de Node.
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
