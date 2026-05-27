// ============================================================================
// GET /api/collections?limit=N
// ----------------------------------------------------------------------------
// Renvoie une liste de sagas/franchises (Harry Potter, Star Wars, MCU...).
// Toute la logique est dans lib/tmdb#getCollections : ici on se contente de
// lire la query string et de relayer.
//
// Param optionnel `limit` : nombre de films populaires à scanner pour en
// extraire les collections (défaut: 20).
// ============================================================================

import { getCollections } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get("limit");
  const collections = await getCollections(limit ? parseInt(limit) : 20);
  return NextResponse.json(collections);
}
