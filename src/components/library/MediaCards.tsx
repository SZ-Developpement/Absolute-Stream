"use client"; // Indique que c'est un Client Component
import Image from "next/image";
import Link from "next/link";
import { Media } from "@/types/tmdb";

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
          title={Media.title}
          className="w-34 h-50 shrink-0 rounded-lg"
        >
          <Image
            src={
              Media.poster_path
                ? `https://image.tmdb.org/t/p/w500${Media.poster_path}`
                : "/path/to/default-poster.jpg"
            }
            alt={Media.title}
            width={500}
            height={750}
            className="w-full h-full object-cover rounded-lg"
          />
        </Link>
      ))}
    </>
  );
}
