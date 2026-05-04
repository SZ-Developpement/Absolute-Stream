import Image from "next/image";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { MediaType } from "@prisma/client";
import FavoriteButton from "@/components/ActionMedia/FavoriteButton";

interface Genre {
  id: number;
  name: string;
}

interface Actor {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

async function getMediaDetails(type: string, id: string) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("Clé TMDB manquante");

  const tmdbType = type === "movies" ? "movie" : "tv";
  const url = `https://api.themoviedb.org/3/${tmdbType}/${id}?language=fr-FR&api_key=${apiKey}&append_to_response=credits`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    return null;
  }
}

export default async function BasicMediaPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const mediaData = await getMediaDetails(type, id);

  if (!mediaData) {
    return (
      <div className="p-10 text-red-500 font-bold text-xl">
        Erreur : Média introuvable (Vérifie ton URL ou l&apos;ID)
      </div>
    );
  }

  // 1. Convertir le type d'URL en MediaType Prisma
  const dbMediaType = type === "movies" ? MediaType.MOVIE : MediaType.TV_SHOW;
  const tmdbId = parseInt(id);

  // 2. Récupérer la session utilisateur
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;

  // 3. Vérifier l'état initial du favori dans la BDD
  let isFavorite = false;
  if (userId) {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_tmdbId_type: {
          userId,
          tmdbId,
          type: dbMediaType,
        },
      },
    });
    isFavorite = !!existingFavorite;
  }

  const title = mediaData.title || mediaData.name;
  const date = mediaData.release_date || mediaData.first_air_date;
  const year = date ? new Date(date).getFullYear() : "N/A";

  const posterUrl = mediaData.poster_path
    ? `https://image.tmdb.org/t/p/w500${mediaData.poster_path}`
    : "https://via.placeholder.com/500x750?text=Pas+d'affiche";

  const cast = mediaData.credits?.cast?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans mt-20">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="shrink-0">
            <Image
              src={posterUrl}
              alt={title}
              width={500}
              height={750}
              className=" rounded-lg shadow-lg object-cover"
            />
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-4xl font-bold text-white">
                {title} <span className="text-gray-400 text-2xl">({year})</span>
              </h1>

              {/* Le bouton ne s'affiche que si l'utilisateur est connecté */}
              {userId && (
                <div className="mt-1">
                  <FavoriteButton
                    tmdbId={tmdbId}
                    type={dbMediaType}
                    initialIsFavorite={isFavorite}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 text-sm font-semibold text-gray-300">
              <span className="bg-gray-700 px-3 py-1 rounded">
                Note : {mediaData.vote_average?.toFixed(1)}/10
              </span>
              <span className="bg-gray-700 px-3 py-1 rounded">
                Type d&apos;URL : {type}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2 text-white">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">
                {mediaData.overview ||
                  "Aucun synopsis traduit en français pour le moment."}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap mt-auto">
              {mediaData.genres?.map((g: Genre) => (
                <span
                  key={g.id}
                  className="text-xs border border-gray-500 px-2 py-1 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">
            Casting Principal
          </h2>
          {cast.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {cast.map((actor: Actor) => (
                <div
                  key={actor.id}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col"
                >
                  <Image
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                        : "https://via.placeholder.com/185x278?text=Photo"
                    }
                    alt={actor.name}
                    className="w-full object-cover"
                    width={185}
                    height={278}
                  />
                  <div className="p-3 flex-1 flex flex-col justify-center">
                    <p className="font-bold text-sm text-white text-center leading-tight">
                      {actor.name}
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {actor.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Aucun acteur trouvé.</p>
          )}
        </div>

        <details className="mt-10 bg-black/50 p-4 rounded border border-gray-800 cursor-pointer">
          <summary className="font-mono text-sm text-gray-500 hover:text-white">
            Afficher le JSON complet de TMDB (pour le debug)
          </summary>
          <pre className="mt-4 text-xs text-green-400 overflow-x-auto">
            {JSON.stringify(mediaData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
