// ============================================================================
// GET /api/tvshows/topRated
// ----------------------------------------------------------------------------
// Séries TV les mieux notées (proxy de /tv/top_rated TMDB).
//
// Comme pour les films, on n'ajoute pas de seuil `vote_count.gte` côté serveur
// : TMDB classe déjà via une moyenne bayésienne pour cet endpoint, ce qui
// élimine naturellement les séries notées 10/10 par 3 personnes.
// ============================================================================

import { NextResponse } from "next/server";
// On réutilise le même type que pour les films : la structure de la réponse
// /tv/top_rated est identique à /movie/top_rated (page/results/total_pages).
import { TopRatedMediaResponse } from "@/types/tmdb";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  const url = `https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }

    const data: TopRatedMediaResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
