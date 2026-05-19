import { getCollections } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get("limit");
  const collections = await getCollections(limit ? parseInt(limit) : 20);
  return NextResponse.json(collections);
}
