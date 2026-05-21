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
        <div className="flex flex-col items-start justify-between h-full max-w-[50%]">
          {/* Informations sur la collection */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-semibold text-white">{name}</h3>
            <p className="text-base text-gray-400">{movies_count} films</p>
          </div>

          {startDate && endDate && (
            <p className="text-sm text-gray-400">
              {/* Convertion des dates uk en français */}
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

        <div className="relative flex items-center h-full pr-6">
          {/* Image de début de la collection */}
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
          {/* Image de fin de la collection */}
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
