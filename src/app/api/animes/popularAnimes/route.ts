// ============================================================================
// GET /api/animes/popularAnimes
// ----------------------------------------------------------------------------
// Animes les plus populaires en ce moment.
//
// TMDB n'a PAS de catégorie "anime" en propre. Pour les isoler, on combine
// deux filtres sur /discover/tv :
//   - with_genres=16          → genre Animation
//   - with_origin_country=JP  → produit au Japon
//
// Combiner les deux exclut les cartoons occidentaux (Rick and Morty, Bob's
// Burgers, etc.) qui ont aussi le genre 16 mais une autre origine.
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

  // URL hardcodée car aucun filtre dynamique sur cet endpoint : on demande
  // toujours "les animes populaires" sans variantes. La concaténation par
  // template string suffit ici.
  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&api_key=${apiKey}`;
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
