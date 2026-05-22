// ============================================================================
// GET /api/tvshows/tvGenres
// ----------------------------------------------------------------------------
// Liste des genres pour les séries TV. Réponse miroir de /api/movies/movieGenres
// mais sur l'endpoint TV — la liste est DIFFÉRENTE de celle des films
// (ex: pas de "Animation" du même id, présence de "News", "Reality"...).
//
// IMPORTANT : c'est aussi cette liste qu'on utilise pour les animes, car
// TMDB ne distingue pas les animes des séries dans sa taxonomie.
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

  // Endpoint TMDB : genre/tv/list (à ne pas confondre avec genre/movie/list)
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

    // Destructuration + annotation de type sur l'objet renvoyé.
    // La syntaxe `{ genres }: { genres: Genre[] }` se lit :
    //   - extrais la prop `genres` de l'objet retourné par .json()
    //   - et type cet objet comme { genres: Genre[] }
    const { genres }: { genres: Genre[] } = await res.json();
    return NextResponse.json(genres);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
