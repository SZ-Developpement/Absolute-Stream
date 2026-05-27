// ============================================================================
// GET /api/tvshows/popularTv
// ----------------------------------------------------------------------------
// Séries TV les plus populaires actuellement (proxy de /tv/popular TMDB).
//
// Structure de réponse identique aux films populaires (page/results/total_pages)
// → on réutilise le type PopularMediaResponse qui sert à la fois aux films et
// aux séries (les deux ont la même forme côté API).
// ============================================================================

import { NextResponse } from "next/server";
import { PopularMediaResponse } from "@/types/tmdb";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Endpoint "tv" (pas "movie") car ce sont des séries.
  // TMDB utilise systématiquement "tv" en URL, jamais "series" ou "shows".
  const url = `https://api.themoviedb.org/3/tv/popular?language=en-US&page=1&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }
    const data: PopularMediaResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
