// ============================================================================
// GET /api/tvshows/onTheAir
// ----------------------------------------------------------------------------
// Séries actuellement diffusées à la TV (proxy de /tv/on_the_air TMDB).
//
// "On the air" = la série a au moins un épisode diffusé dans les 7 prochains
// jours selon la doc TMDB. Pratique pour faire un carrousel "À regarder cette
// semaine".
// ============================================================================

import { NextResponse } from "next/server";
// OnTheAirResponse a la même forme que les autres endpoints paginés TMDB
// (page / results / total_pages / total_results).
import { OnTheAirResponse } from "@/types/tmdb";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  const url = `https://api.themoviedb.org/3/tv/on_the_air?language=en-US&page=1&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }
    const data: OnTheAirResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
