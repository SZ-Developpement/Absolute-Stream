"use client"; // Indique que c'est un Client Component
import Image from "next/image";
import Link from "next/link";
import { Media } from "@/types/tmdb";

export default function MediaCards({ mediaList }: { mediaList: Media[] }) {
  return (
    // MediaCards se contente de rendre la liste des médias, la logique de défilement est dans le parent Carousel
    <>
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
