// ============================================================================
// GET /api/search?q=...
// ----------------------------------------------------------------------------
// Proxy vers TMDB /search/multi. Pourquoi un proxy ?
//   - TMDB_API_KEY est secrète (process.env, côté serveur uniquement).
//     L'appeler depuis le navigateur exposerait la clé dans le bundle JS.
//   - Cette route reçoit la requête côté serveur, ajoute la clé, et renvoie
//     uniquement le JSON utile au client.
//
// /search/multi cherche dans films + séries + personnes en un seul appel.
// Chaque résultat porte un `media_type` ("movie" | "tv" | "person") qu'on
// utilise côté client pour router vers la bonne page de détail.
// ============================================================================

import { NextResponse, NextRequest } from "next/server";
import { MultiSearchResponse } from "@/types/tmdb";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Sans query (ou query vide) on renvoie un résultat vide. Évite un appel
  // TMDB inutile à chaque vidage du champ.
  if (!query) {
    return NextResponse.json({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    } satisfies MultiSearchResponse);
  }

  const url = new URL("https://api.themoviedb.org/3/search/multi");
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("query", query);
  url.searchParams.append("include_adult", "false");
  url.searchParams.append("language", "fr-FR");
  url.searchParams.append("page", "1");

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }

    const data: MultiSearchResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
