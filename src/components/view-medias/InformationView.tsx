import ActionButton from "@/components/view-medias/ActionButton";
import { ListChecks, NotebookPen, Star, TicketCheck } from "lucide-react";
import TableInfos from "./TableInfos";
import Warning from "./Warning";
import { MediaPanelProps } from "@/types/medias";
import { MediaDetails } from "@/types/tmdb";

// ----- Helpers d'extraction des champs (films vs séries) -----

// Réalisateur (films) ou créateur (séries). Renvoie une string formatée.
function getDirectorOrCreator(media: MediaDetails, type: "movie" | "tv") {
  if (type === "movie") {
    const directors = (media.credits?.crew ?? [])
      .filter((p) => p.job === "Director")
      .map((p) => p.name);
    return directors.length > 0 ? directors.join(", ") : "—";
  }
  const creators = (media.created_by ?? []).map((c) => c.name);
  return creators.length > 0 ? creators.join(", ") : "—";
}

// Durée formatée "Xh YYmin" pour les films, "Xmin/épisode" pour les séries.
function getRuntime(media: MediaDetails, type: "movie" | "tv") {
  if (type === "movie") {
    const minutes = media.runtime;
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}` : `${m}min`;
  }
  const ep = media.episode_run_time?.[0];
  return ep ? `${ep}min / épisode` : "—";
}

// Date de sortie formatée en français.
function getReleaseDate(media: MediaDetails, type: "movie" | "tv") {
  const raw = type === "movie" ? media.release_date : media.first_air_date;
  if (!raw) return "—";
  // raw est au format "YYYY-MM-DD" → on construit une Date et on la formate FR.
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Classification : on cherche la française d'abord (FR), puis US en fallback.
function getCertification(media: MediaDetails, type: "movie" | "tv") {
  if (type === "movie") {
    const results = media.release_dates?.results ?? [];
    const pickCert = (countryCode: string) => {
      const country = results.find((r) => r.iso_3166_1 === countryCode);
      return country?.release_dates.find((r) => r.certification)?.certification;
    };
    return pickCert("FR") || pickCert("US") || "—";
  }
  const results = media.content_ratings?.results ?? [];
  const fr = results.find((r) => r.iso_3166_1 === "FR")?.rating;
  const us = results.find((r) => r.iso_3166_1 === "US")?.rating;
  return fr || us || "—";
}

function getGenres(media: MediaDetails) {
  const genres = (media.genres ?? []).map((g) => g.name);
  return genres.length > 0 ? genres.join(", ") : "—";
}

export default function InformationView({ media, type }: MediaPanelProps) {
  return (
    <>
      {/* Informations supplémentaires */}
      <div className="grid grid-cols-3 gap-3 my-1">
        <TableInfos name={type === "movie" ? "Réalisateur" : "Créateur"}>
          {getDirectorOrCreator(media, type)}
        </TableInfos>
        <TableInfos name="Durée">{getRuntime(media, type)}</TableInfos>
        <TableInfos name="Date de sortie">
          {getReleaseDate(media, type)}
        </TableInfos>
        <TableInfos name="Classification">
          {getCertification(media, type)}
        </TableInfos>
        <TableInfos name="Genres">{getGenres(media)}</TableInfos>
      </div>

      {/* Avertissement sur les données TMDB */}
      <Warning />

      <div className="flex items-center gap-1">
        {/* Ajouter une note */}
        <ActionButton Icon={NotebookPen} text="Note" />

        {/* Ajouter au favori */}
        <ActionButton Icon={Star} text="Favori" />

        {/* Ajouter à une liste */}
        <ActionButton Icon={ListChecks} text="Liste" />

        {/* Ajouter à la liste deja vue */}
        <ActionButton Icon={TicketCheck} text="Déjà vu" />
      </div>
    </>
  );
}
