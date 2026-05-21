import { NextResponse } from "next/server"; // Importation de NextResponse pour gérer les réponses HTTP
import { NextRequest } from "next/server";
import { DiscoverMediaResponse } from "@/types/tmdb"; // Importation pour typer la réponse de l'API TMDB

// Fonction GET pour récupérer les animes à découvrir (avec genre et tri optionnels)
export async function GET(request: NextRequest) {
  // Récupération de la clé API depuis les variables d'environnement
  const apiKey = process.env.TMDB_API_KEY;
  // Récupération des paramètres envoyés par le composant client (sort_by et with_genres)
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get("sort_by") || "popularity.desc";
  const withGenres = searchParams.get("with_genres");

  // Vérification de la présence de la clé API
  if (!apiKey) {
    // Si la clé API est manquante, retourner une réponse d'erreur
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Construction de l'URL pour l'API TMDB pour découvrir des animes
  // Les filtres anime (genre Animation 16 + origine Japon) restent toujours appliqués.
  // Si l'utilisateur choisit un genre supplémentaire, on combine avec 16 (la virgule = AND côté TMDB).
  const url = new URL("https://api.themoviedb.org/3/discover/tv");
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("include_adult", "false");
  url.searchParams.append("include_video", "false");
  url.searchParams.append("language", "en-US");
  url.searchParams.append("page", "1");
  url.searchParams.append("sort_by", sortBy);
  url.searchParams.append("with_genres", withGenres ? `16,${withGenres}` : "16");
  url.searchParams.append("with_origin_country", "JP");

  // Options pour la requête fetch, spécifiant la méthode et les en-têtes, notamment pour accepter une réponse JSON
  const options = { method: "GET", headers: { accept: "application/json" } };

  //try essaye d'exécuter la requête et de traiter la réponse
  try {
    const res = await fetch(url.toString(), options); // Exécution de la requête fetch pour récupérer les données de TMDB
    // Vérification de la réponse de TMDB pour s'assurer qu'elle est correcte
    if (!res.ok) {
      // Si la réponse n'est pas correcte, retourner une réponse d'erreur avec le statut de la réponse de TMDB
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }

    // Si la réponse est correcte, parser les données JSON et les typer avec DiscoverMediaResponse
    const data: DiscoverMediaResponse = await res.json();
    return NextResponse.json(data);
    //catch attrape les erreurs qui peuvent survenir lors de la requête ou du traitement de la réponse et retourne une réponse d'erreur générique
  } catch {
    // En cas d'erreur, retourner une réponse d'erreur générique avec un statut 500
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
