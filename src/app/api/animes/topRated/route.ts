import { NextResponse } from "next/server"; // Importation de NextResponse pour gérer les réponses HTTP
import { TopRatedMediaResponse } from "@/types/tmdb"; // Importation pour typer la réponse de l'API TMDB

// Fonction GET pour récupérer les animes les mieux notés
export async function GET() {
  // Récupération de la clé API depuis les variables d'environnement
  const apiKey = process.env.TMDB_API_KEY;

  // Vérification de la présence de la clé API
  if (!apiKey) {
    // Si la clé API est manquante, retourner une réponse d'erreur
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Construction de l'URL pour l'API TMDB pour les animes les mieux notés
  // (utilisation de /discover/tv avec filtres anime + tri par note + un seuil de votes minimum pour éviter les anime obscurs)
  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&vote_count.gte=200&with_genres=16&with_origin_country=JP&api_key=${apiKey}`;

  // Options pour la requête fetch, spécifiant la méthode et les en-têtes, notamment pour accepter une réponse JSON
  const options = { method: "GET", headers: { accept: "application/json" } };

  //try essaye d'exécuter la requête et de traiter la réponse
  try {
    const res = await fetch(url, options); // Exécution de la requête fetch pour récupérer les données de TMDB
    // Vérification de la réponse de TMDB pour s'assurer qu'elle est correcte
    if (!res.ok) {
      // Si la réponse n'est pas correcte, retourner une réponse d'erreur avec le statut de la réponse de TMDB
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }

    // Si la réponse est correcte, parser les données JSON et les typer avec TopRatedMediaResponse
    const data: TopRatedMediaResponse = await res.json();
    return NextResponse.json(data);
    //catch attrape les erreurs qui peuvent survenir lors de la requête ou du traitement de la réponse et retourne une réponse d'erreur générique
  } catch {
    // En cas d'erreur, retourner une réponse d'erreur générique avec un statut 500
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
