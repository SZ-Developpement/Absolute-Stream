// ============================================================================
// GET /api/movies/movieGenres
// ----------------------------------------------------------------------------
// Liste tous les genres de films connus de TMDB (Action, Aventure, Drame,
// Comédie, ...). Utilisé côté front pour peupler le menu déroulant des
// filtres dans <DiscoverMedia/>.
//
// Particularité de la réponse TMDB : elle est enveloppée dans un objet
//   { genres: [ { id: 28, name: "Action" }, ... ] }
// → on extrait `genres` via une destructuration pour renvoyer un tableau plat.
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

  // Endpoint TMDB spécifique aux genres de FILMS (genre/movie/list).
  // Il existe l'équivalent genre/tv/list pour les séries (cf. tvGenres).
  const url = `https://api.themoviedb.org/3/genre/movie/list?language=en&api_key=${apiKey}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status },
      );
    }

    // Destructuration ES6 : on extrait directement la propriété `genres` de
    // l'objet JSON et on lui colle un type au passage.
    // Équivalent verbeux :
    //   const data = await res.json();
    //   const genres: Genre[] = data.genres;
    const { genres }: { genres: Genre[] } = await res.json();

    // On renvoie le TABLEAU directement (pas l'objet wrapper). Côté front,
    // on pourra faire .map(g => ...) sans détour.
    return NextResponse.json(genres);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
