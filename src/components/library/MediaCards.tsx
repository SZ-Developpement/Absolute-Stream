"use client"; // Indique que c'est un Client Component
import Image from "next/image";
import Link from "next/link";
import { Media } from "@/types/tmdb";
import { Play } from "lucide-react";
import BadgeReco from "../Absolute/BadgeReco";

// On reçoit une liste de médias en props, typée avec le type Media défini dans types/tmdb.ts
// La destruc
export default function MediaCards({ mediaList }: { mediaList: Media[] }) {
  return (
    <>
      {/* On mappe sur la liste de médias pour créer une carte pour chaque média 
        map = fonction de tableau qui itère sur chaque élément du tableau mediaList
        et retourne un nouveau tableau de JSX */}
      {mediaList.map((Media) => (
        <Link
          key={Media.id}
          href={`/movies/${Media.id}`}
          className="group relative block aspect-[2/3] w-[172px] shrink-0 overflow-hidden rounded-md bg-zinc-900"
        >
          <Image
            src={
              Media.poster_path
                ? `https://image.tmdb.org/t/p/w500${Media.poster_path}`
                : "/path/to/default-poster.jpg"
            }
            alt={Media.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay : Utilise inset-0 pour couvrir tout l'espace */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badge */}
          <BadgeReco className="absolute right-2 top-2 z-10" reco={90} />

          {/* Indicateur Play (Visuel uniquement, pas d'interaction propre car déjà dans un lien) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-transform duration-300 group-hover:opacity-100 scale-90 group-hover:scale-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white">
              <Play size={20} fill="white" />
            </div>
          </div>

          {/* Infos en bas */}
          <div className="absolute bottom-0 left-0 w-full p-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              {Media.release_date?.split("-")[0] || "2026"}
            </p>
            <h3 className="line-clamp-1 text-[13px] font-semibold text-white">
              {Media.title}
            </h3>
          </div>
        </Link>
      ))}
    </>
  );
}
