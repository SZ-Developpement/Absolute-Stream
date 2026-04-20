// Import de NextResponse pour formater la réponse API Next.js
import { NextResponse } from "next/server";
// Import des types TypeScript pour typer la réponse et chaque film
import { PopularTVResponse } from "@/types/tmdb";

// Handler GET pour la route API des séries TV actuellement populaires
export async function GET() {
  // Récupération de la clé d’API TMDB depuis les variables d’environnement
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    // Retourne une erreur si la clé d’API est manquante
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Construction de l’URL pour l’API TMDB (séries TV populaires)
  const url = `https://api.themoviedb.org/3/tv/popular?language=en-US&page=1&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    // Appel à l’API TMDB
    const res = await fetch(url, options);
    if (!res.ok) {
      // Retourne une erreur si la requête échoue côté TMDB
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }
    // Typage de la réponse JSON avec PopularTVResponse
    const data: PopularTVResponse = await res.json();
    // Retourne la réponse JSON au client
    return NextResponse.json(data);
  } catch (err) {
    // Gestion d’erreur serveur (ex : problème réseau)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
