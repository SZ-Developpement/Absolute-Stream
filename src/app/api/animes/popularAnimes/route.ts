// Import de NextResponse pour formater la réponse API Next.js
import { NextResponse } from "next/server";
// Import des types TypeScript pour typer la réponse et chaque anime
import { PopularMediaResponse } from "@/types/tmdb";

// Handler GET pour la route API des animes actuellement populaires
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

  // Construction de l’URL pour l’API TMDB (animes populaires : /discover/tv filtré sur le genre Animation et l'origine Japon)
  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&api_key=${apiKey}`;
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
    // Typage de la réponse JSON avec PopularMediaResponse
    const data: PopularMediaResponse = await res.json();
    // Retourne la réponse JSON au client
    return NextResponse.json(data);
  } catch {
    // Gestion d’erreur serveur (ex : problème réseau)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
