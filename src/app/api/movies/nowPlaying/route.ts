// ============================================================================
// GET /api/movies/nowPlaying
// ----------------------------------------------------------------------------
// Renvoie les films CURRENTLY in theaters (à l'affiche).
//
// Particularité TMDB : la réponse inclut un objet `dates` qui donne la plage
// de dates considérée comme "actuelle" :
//   {
//     dates: { minimum: "2026-04-25", maximum: "2026-05-21" },
//     page: 1,
//     results: [ ... ]
//   }
// → c'est pour ça qu'on type avec NowPlayingResponse (distinct de PopularResponse)
//   et qu'on renvoie l'objet entier, pas juste `results`.
// ============================================================================

import { NextResponse } from "next/server";
import { NowPlayingResponse } from "@/types/tmdb";

export async function GET() {
  // Variable d'environnement chargée par Next au démarrage (à partir du .env).
  // Type implicite : string | undefined. D'où la vérif juste après.
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  const url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }
    // Annotation `: NowPlayingResponse` = on AFFIRME le type. Aucun check
    // runtime n'est fait. Pour avoir une validation réelle → utiliser Zod
    // (cf. actions/favorites.ts qui en a un exemple).
    const data: NowPlayingResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    // Reasons fréquentes d'arriver ici : DNS down, timeout, JSON mal formé
    // côté TMDB. On renvoie 500 générique et on laisse le front gérer.
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
