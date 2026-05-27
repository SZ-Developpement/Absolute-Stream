// ============================================================================
// GET /api/movies/topRated
// ----------------------------------------------------------------------------
// Films les mieux notés (proxy de l'endpoint /movie/top_rated TMDB).
//
// Pourquoi pas besoin d'un seuil de votes minimum ici (contrairement à
// l'endpoint animes/topRated) ?
//   → TMDB applique déjà une moyenne bayésienne sur cet endpoint. C'est une
//     formule qui pénalise les films avec peu de votes : un film noté 10/10
//     par 3 personnes ne grimpe pas en tête. Du coup le classement est déjà
//     "fiable" sans qu'on ajoute notre propre filtre `vote_count.gte`.
// ============================================================================

import { NextResponse } from "next/server";
import { TopRatedMediaResponse } from "@/types/tmdb";

// Le handler doit s'appeler exactement GET (ou POST, etc.) — Next se base sur
// le nom de l'export pour mapper la méthode HTTP.
export async function GET() {
  // On lit la clé d'API côté serveur. Le `?.env` n'existe pas en JS sur
  // process : `process.env` est toujours défini, c'est la VALEUR qui peut
  // être undefined si la variable n'est pas dans le .env.
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Endpoint TMDB. `page=1` est obligatoire pour TMDB sinon il assume 1.
  // language=en-US car on accepte les titres originaux (changer en fr-FR si
  // on veut les titres traduits).
  const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    // `await fetch(...)` arrête le code jusqu'à avoir la réponse HTTP.
    // Pendant ce temps Node.js n'est pas bloqué : il peut traiter d'autres
    // requêtes (c'est tout l'intérêt de l'asynchrone).
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }
    // .json() parse le corps de la réponse. C'est aussi async (lecture du
    // body en streaming sous le capot), d'où le 2e await.
    const data: TopRatedMediaResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
