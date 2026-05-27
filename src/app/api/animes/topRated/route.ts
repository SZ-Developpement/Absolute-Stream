// ============================================================================
// GET /api/animes/topRated
// ----------------------------------------------------------------------------
// Animes les mieux notés. Subtilité : on doit ajouter NOTRE PROPRE seuil de
// votes minimum car TMDB ne classe pas /discover/tv via une moyenne bayésienne
// (contrairement à /tv/top_rated). Sans ça, le classement serait pollué par
// des OAV obscurs notés 10/10 par 5 personnes.
//
// Le param TMDB `vote_count.gte=200` se lit "vote_count >= 200" → on ne
// considère que les animes avec au moins 200 votes pour avoir une moyenne
// statistiquement fiable.
// ============================================================================

import { NextResponse } from "next/server";
import { TopRatedMediaResponse } from "@/types/tmdb";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // L'URL combine 4 filtres :
  //   sort_by=vote_average.desc  → tri par note décroissante
  //   vote_count.gte=200         → au moins 200 votes (filtre antibruit)
  //   with_genres=16             → genre Animation
  //   with_origin_country=JP     → origine Japon
  // Le résultat = vrai top des animes japonais bien notés et bien votés.
  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&vote_count.gte=200&with_genres=16&with_origin_country=JP&api_key=${apiKey}`;
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
