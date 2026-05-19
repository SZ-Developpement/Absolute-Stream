import { Media } from "@/types/tmdb";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MediasCard({ media }: { media: Media }) {
  return (
    <div className="relative group overflow-hidden rounded-md aspect-2/3">
      <Link
        href={`/movies/${media.id}`}
        className="aspect-2/3 relative transition overflow-hidden cursor-pointer before:absolute before:-inset-px before:bg-linear-to-t before:from-black/80 before:to-black/20 before:-m-px before:z-1 before:opacity-0 group-hover:before:opacity-100 block"
      >
        <Image
          src={
            media.poster_path
              ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
              : "/No-Image/no-image.png"
          }
          alt={media.title ?? media.name ?? "Poster"}
          fill
          className="absolute object-cover ls-is-cached lazyloaded"
        />

        <div className="hidden group-hover:flex absolute left-1/2 top-1/2 -translate-x-1/2 z-20 -translate-y-1/2 h-14 w-14 items-center justify-center cursor-pointer rounded-full bg-white/50 text-white transition">
          <Play size={18} fill="white" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-3 z-10 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {media.release_date && (
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              {media.release_date.split("-")[0] || "2026"}
            </p>
          )}
          <h3 className="line-clamp-1 text-[13px] font-semibold text-white">
            {media.title ?? media.name ?? "Titre non disponible"}
          </h3>
        </div>
      </Link>
    </div>
  );
}
