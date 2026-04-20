import { NextResponse } from "next/server"; // Importation de NextResponse pour gérer les réponses HTTP
import { Genre } from "@/types/tmdb"; // Importation pour typer la réponse de l'API TMDB

// Fonction GET pour récupérer les séries TV les mieux notées
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

  // Construction de l'URL pour l'API TMDB pour les genres de films
  const url = `https://api.themoviedb.org/3/genre/tv/list?language=en&api_key=${apiKey}`;

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

    const { genres }: { genres: Genre[] } = await res.json();
    return NextResponse.json(genres);
    //catch attrape les erreurs qui peuvent survenir lors de la requête ou du traitement de la réponse et retourne une réponse d'erreur générique
  } catch (err) {
    // En cas d'erreur, retourner une réponse d'erreur générique avec un statut 500
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
