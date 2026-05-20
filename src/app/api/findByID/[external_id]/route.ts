// ============================================================================
// GET /api/findByID/[external_id]
// ----------------------------------------------------------------------------
// Permet de retrouver un média TMDB à partir d'un identifiant EXTERNE.
// Exemple : on a un id IMDB ("tt0133093" pour The Matrix) → on récupère
// l'objet TMDB correspondant.
//
// Convention Next App Router pour les routes dynamiques :
//   - Le nom de dossier entre crochets [external_id] devient un paramètre.
//   - On le récupère via `context.params.external_id` dans le handler.
//
// Depuis Next 15, params est une Promise (préparation au streaming) → il
// faut faire `await context.params` pour lire la valeur.
// ============================================================================

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { FindByIDResponse } from "@/types/tmdb";

// Signature du handler avec param dynamique :
//   - `request` : la requête HTTP (NextRequest)
//   - `context` : objet contenant params, une Promise<{ external_id: string }>
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ external_id: string }> },
) {
  // Await + destructuration en une ligne :
  //   const params = await context.params;     // { external_id: "tt..." }
  //   const external_id = params.external_id;  // "tt..."
  // Compacté en : `const { external_id } = await context.params;`
  const { external_id } = await context.params;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // `external_source=imdb_id` indique à TMDB que l'id qu'on lui passe est
  // un identifiant IMDB (pas TMDB). On pourrait aussi utiliser tvdb_id,
  // facebook_id, twitter_id, etc. selon ce qu'on a sous la main.
  const url = `https://api.themoviedb.org/3/find/${external_id}?external_source=imdb_id&language=en-US&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }

    // TMDB renvoie un objet avec PLUSIEURS tableaux (movie_results, tv_results,
    // person_results, ...) car un id IMDB peut correspondre à n'importe quoi.
    // Le client choisira lequel utiliser selon son besoin.
    const data: FindByIDResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
