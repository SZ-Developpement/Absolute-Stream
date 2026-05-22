import { CastingViewProps } from "@/types/medias";
import ActorCard from "./ActorCard";

export default function CastingView({ cast }: CastingViewProps) {
  // On affiche les 12 premiers acteurs triés par "order" TMDB (= billing order).
  // Si le tableau est vide, on affiche un message neutre.
  const topCast = [...cast]
    .sort((a, b) => a.order - b.order)
    .slice(0, 12);

  if (topCast.length === 0) {
    return (
      <p className="text-sm text-[#a3a3a3]">
        Aucune information de casting disponible.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {topCast.map((actor) => (
        <ActorCard
          key={actor.id}
          actorName={actor.name}
          actorRole={actor.character || "—"}
          imageUrl={
            actor.profile_path
              ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
              : undefined
          }
        />
      ))}
    </div>
  );
}
