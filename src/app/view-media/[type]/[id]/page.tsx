import MediaContainer from "@/components/medias/MediaContainer";
import LikeDislikeGroup from "@/components/view-medias/LikeDislikeGroup";
import NoteGroup from "@/components/view-medias/NoteGroup";
import SubMenu from "@/components/view-medias/SubMenu";
import { MediaDetails } from "@/types/tmdb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getMedia(
  type: "movie" | "tv",
  id: string,
): Promise<MediaDetails | null> {
  const apiKey = process.env.TMDB_API_KEY;

  // append_to_response = on demande à TMDB d'inclure plusieurs ressources liées
  // dans la même réponse. Une seule requête HTTP au lieu de 4.
  //   - credits         → cast + crew (acteurs, réalisateur)
  //   - videos          → bandes-annonces YouTube
  //   - release_dates   → certifications films par pays (PG-13, etc.)
  //   - content_ratings → classifications séries par pays (TV-MA, etc.)
  const appendForMovie = "credits,videos,release_dates";
  const appendForTv = "credits,videos,content_ratings";
  const append = type === "movie" ? appendForMovie : appendForTv;

  const res = await fetch(
    `https://api.themoviedb.org/3/${type}/${id}?language=fr-FR&append_to_response=${append}&api_key=${apiKey}`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) return null;
  return res.json();
}

// Trouve la 1re bande-annonce YouTube officielle (fallback : 1re vidéo YouTube
// dispo, peu importe le type). Renvoie la clé YouTube ou null.
function findTrailerKey(media: MediaDetails): string | null {
  const videos = media.videos?.results ?? [];
  const youtubeVideos = videos.filter((v) => v.site === "YouTube");
  const officialTrailer = youtubeVideos.find(
    (v) => v.type === "Trailer" && v.official,
  );
  if (officialTrailer) return officialTrailer.key;
  const anyTrailer = youtubeVideos.find((v) => v.type === "Trailer");
  if (anyTrailer) return anyTrailer.key;
  return youtubeVideos[0]?.key ?? null;
}

export default async function ViewMediaPage({
  params,
}: {
  params: Promise<{ id: string; type: "movie" | "tv" }>;
}) {
  const { id, type } = await params;
  const media = await getMedia(type, id);

  if (!media) notFound();

  const backdropUrl = media.backdrop_path
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : null;

  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w600_and_h900_face${media.poster_path}`
    : "/No-Image/no-image.png";

  const title = media.title ?? media.name ?? "Titre inconnu";
  const trailerKey = findTrailerKey(media);
  const trailerHref = trailerKey
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " bande annonce")}`;

  return (
    <>
      {backdropUrl && (
        <Image
          src={backdropUrl}
          alt={`Backdrop ${title}`}
          fill
          className="object-cover object-center bg-black/50 opacity-20"
          loading="eager"
        />
      )}
      <MediaContainer>
        <div className="w-full min-h-screen flex flex-row gap-6 xl:gap-12 mt-12 z-10">
          {/* Bloc de gauche */}
          <div className="flex flex-col gap-4 max-w-[16rem] w-full">
            {/* Poster Media */}
            <div className="aspect-2/3 relative rounded-md transition overflow-hidden ">
              <Image
                src={posterUrl || "No-Image/no-image.png"}
                alt={title}
                fill
                className="object-cover object-top hover:scale-102 transition-transform duration-300"
              />
            </div>
            <Link
              href={trailerHref}
              target="_blank"
              className="px-6 py-3.5 text-sm rounded-md bg-[#262626] hover:bg-[#262626]/80 transition text-white text-center"
            >
              Voir la bande annonce
            </Link>
          </div>

          {/* Bloc de droite */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Titre */}
            <h1 className="text-3xl tracking-tighter font-semibold text-gray-100 line-clamp-1">
              {title}
            </h1>

            {/* Informations rapides */}
            {/* <div className="flex items-center gap-4 text-[#A3A3A3] text-xs">
              <span>51 minutes</span>
              <span>2024</span>
              <span>Etats-Unis</span>
            </div> */}

            {/* Like Actions */}
            <div className="flex items-center gap-4">
              <NoteGroup
                count_abs={media.vote_average / 2}
                count_tmdb={media.vote_average}
              />

              {/* Groupe de boutons Like/Dislike */}
              <LikeDislikeGroup />
            </div>

            {/* Synopsis */}
            <p className="text-[#a3a3a3] line-clamp-3">
              {media.overview || "Aucun synopsis disponible."}
            </p>

            <SubMenu media={media} type={type} />
          </div>
        </div>
      </MediaContainer>
    </>
  );
}
