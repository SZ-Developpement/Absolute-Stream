// ============================================================================
// CardCollection — vignette d'une saga sur la page /collections
// ----------------------------------------------------------------------------
// Carte horizontale (ratio 16:6) qui présente une franchise :
//   - À gauche : nom + nombre de films + plage de dates de sortie
//   - À droite : deux affiches superposées (premier et dernier film de la
//     saga), légèrement penchées en V pour suggérer une pile.
//
// Au hover : le fond s'éclaircit et les deux affiches s'écartent un peu plus
// (effet "léger éventail") pour souligner l'interaction.
// ============================================================================

import Image from "next/image";
import Link from "next/link";

interface CardCollectionProps {
  id: number;
  name: string;
  movies_count: number;
  startDate?: string;
  endDate?: string;
  ImageStart: string;
  ImageEnd: string;
}

export default function CardCollection({
  id,
  name,
  movies_count,
  startDate,
  endDate,
  ImageStart,
  ImageEnd,
}: CardCollectionProps) {
  return (
    <Link href={`/collections/${id}`} className="block w-full">
      <div className="group relative w-full min-h-[140px] sm:aspect-16/6 bg-white/5 rounded-xl p-4 sm:p-6 flex justify-between items-center overflow-hidden hover:bg-white/10 transition-colors duration-300">
        {/* === COLONNE GAUCHE : infos texte === */}
        <div className="flex flex-col justify-between h-full max-w-[55%] z-30 gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg sm:text-xl font-semibold text-white line-clamp-2 leading-tight">
              {name}
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              {movies_count} films
            </p>
          </div>

          {startDate && endDate && (
            <p className="text-xs sm:text-sm text-gray-400/80 mt-auto">
              {new Date(startDate).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "short", // 'short' prend moins de place sur petit écran (ex: "juil. 2001")
              })}{" "}
              -{" "}
              {new Date(endDate).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "short",
              })}
            </p>
          )}
        </div>

        {/* === COLONNE DROITE : deux affiches superposées en V === */}
        <div className="relative w-[120px] sm:w-[150px] h-full min-h-[110px] flex items-center justify-end my-auto">
          {/* Affiche du PREMIER film (à gauche, en-dessous) */}
          <div className="absolute right-12 sm:right-16 top-1/2 -translate-y-1/2 w-16 sm:w-20 md:w-22 aspect-2/3 rounded-lg overflow-hidden -rotate-12 group-hover:-rotate-14 transition-all duration-300 z-10 shadow-xl">
            <Image
              src={ImageStart}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 640px) 64px, 80px"
              className="object-cover object-top"
            />
          </div>

          {/* Affiche du DERNIER film (à droite, par-dessus) */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-16 sm:w-20 md:w-22 aspect-2/3 rounded-lg overflow-hidden rotate-6 group-hover:rotate-8 transition-all duration-300 z-20 shadow-2xl">
            <Image
              src={ImageEnd}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 640px) 64px, 80px"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
