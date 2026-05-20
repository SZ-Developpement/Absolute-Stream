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
    <Link href={`/collections/${id}`}>
      <div className="group aspect-16/6 w-full bg-white/5 rounded-xl p-6 flex justify-between items-start overflow-hidden hover:bg-white/10 transition-colors duration-300">
        {/* === COLONNE GAUCHE : infos texte === */}
        <div className="flex flex-col items-start justify-between h-full max-w-[50%]">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-semibold text-white">{name}</h3>
            <p className="text-base text-gray-400">{movies_count} films</p>
          </div>

          {startDate && endDate && (
            <p className="text-sm text-gray-400">
              {/* Conversion ISO → format français lisible (ex: "juillet 2001") */}
              {new Date(startDate).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
              })}{" "}
              -{" "}
              {new Date(endDate).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
              })}
            </p>
          )}
        </div>

        {/* === COLONNE DROITE : deux affiches superposées en V === */}
        <div className="relative flex items-center h-full pr-6">
          {/* Affiche du PREMIER film (penchée vers la gauche, en-dessous) */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 w-20 sm:w-24 aspect-2/3 rounded-lg overflow-hidden -rotate-12 group-hover:-rotate-14 transition-all duration-300 z-10">
            <Image
              src={ImageStart}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 768px) 80px, 96px"
              className="object-cover object-top"
            />
          </div>
          {/* Affiche du DERNIER film (penchée vers la droite, par-dessus) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 sm:w-24 aspect-2/3 rounded-lg overflow-hidden rotate-6 group-hover:rotate-8 transition-all duration-300 z-20">
            <Image
              src={ImageEnd}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 768px) 80px, 96px"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
