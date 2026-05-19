"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Media } from "@/types/tmdb";
import MediaCards from "@/components/medias/MediaCards";
import { ArrowDownUp, ListFilter, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiscoverMediaProps } from "@/types/medias";
import { SORT_OPTIONS } from "@/constants/medias";

export function DiscoverMedia({
  title,
  emptyMessage,
  fetchEndpoint,
  initialData,
  genres,
}: DiscoverMediaProps) {
  const [medias, setMedias] = useState<Media[]>(initialData);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    startTransition(async () => {
      const params = new URLSearchParams({ sort_by: sortBy });
      if (selectedGenre) {
        params.append("with_genres", selectedGenre);
      }

      try {
        // L'endpoint est maintenant dynamique !
        const res = await fetch(`${fetchEndpoint}?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMedias(data.results || []);
        } else {
          setMedias([]);
        }
      } catch (error) {
        console.error(`Error fetching from ${fetchEndpoint}:`, error);
        setMedias([]);
      }
    });
  }, [selectedGenre, sortBy, fetchEndpoint]);

  const activeGenreName =
    genres.find((g) => g.id.toString() === selectedGenre)?.name || "Tous";
  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Triez";

  return (
    <div className="pb-6 lg:pb-14 flex flex-col gap-6 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        {/* title */}
        <h3 className="text-lg xl:text-xl font-semibold capitalize">{title}</h3>

        <div className="flex flex-row gap-2 items-center">
          {/* Drop Menu de Genre */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="whitespace-nowrap py-2 px-4 flex flex-row justify-center items-center gap-2 text-sm text-center rounded-lg text-white hover:text-gray-300 bg-background/70 hover:bg-background/60 cursor-pointer transition-colors">
                <ListFilter size={14} />
                {selectedGenre
                  ? `Genre : ${activeGenreName}`
                  : "Filtrez par Genre"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 max-h-64 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <DropdownMenuItem
                onClick={() => setSelectedGenre("")}
                className="flex items-center justify-between cursor-pointer"
              >
                Tous
                {selectedGenre === "" && (
                  <Check size={14} className="text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {genres.map((genre) => (
                <DropdownMenuItem
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id.toString())}
                  className="flex items-center justify-between cursor-pointer"
                >
                  {genre.name}
                  {selectedGenre === genre.id.toString() && (
                    <Check size={14} className="text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Drop Menu de Tri */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="whitespace-nowrap py-2 px-4 flex flex-row justify-center items-center gap-2 text-sm text-center rounded-lg text-white hover:text-gray-300 bg-background/70 hover:bg-background/60 cursor-pointer transition-colors">
                <ArrowDownUp size={14} />
                {activeSortLabel}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  {option.label}
                  {sortBy === option.value && (
                    <Check size={14} className="text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid Media Cards */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 transition-opacity duration-300 ${
          isPending ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {medias.length > 0
          ? medias.map((media) => <MediaCards key={media.id} media={media} />)
          : !isPending && (
              <p className="col-span-full py-8 text-center text-gray-500">
                {emptyMessage}
              </p>
            )}
      </div>
    </div>
  );
}
