// ============================================================================
// GET /api/animes/animeGenres
// ----------------------------------------------------------------------------
// Liste des genres pour les animes.
//
// Comme TMDB ne distingue pas les animes des séries, on réutilise EXACTEMENT
// l'endpoint genre/tv/list (identique à /api/tvshows/tvGenres). On garde quand
// même une route dédiée pour rester cohérent avec l'organisation animes/...
// → si demain TMDB sortait un genre/anime/list, on n'aurait qu'à modifier
//   l'URL ici sans toucher au composant DiscoverMedia côté animes.
// ============================================================================

import { NextResponse } from "next/server";
import { Genre } from "@/types/tmdb";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 },
    );
  }

  // Même endpoint que pour les séries TV (genre/tv/list)
  const url = `https://api.themoviedb.org/3/genre/tv/list?language=en&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }

    // Destructuration : on extrait directement le tableau `genres` de l'objet
    // wrapper renvoyé par TMDB pour le donner tel quel au client.
    const { genres }: { genres: Genre[] } = await res.json();
    return NextResponse.json(genres);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
