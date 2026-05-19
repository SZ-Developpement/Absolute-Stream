"use client"; // Indique que ce composant doit être rendu côté client, nécessaire pour utiliser les hooks d'état et d'effet de React.

import { useState, useEffect, useTransition, useRef } from "react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for tailwind-merge
import { Media, Genre } from "@/types/tmdb";
import MediaCards from "@/components/medias/MediaCards";
import { ArrowDownUp, ListFilter } from "lucide-react";

export function DiscoverMovies({
  initialMovies,
  genres,
}: {
  className?: string;
  initialMovies: Media[];
  genres: Genre[];
}) {
  const [movies, setMovies] = useState<Media[]>(initialMovies); // On initialise l'état des films avec les films passés en props pour éviter un écran vide au chargement initial.
  const [selectedGenre, setSelectedGenre] = useState<string>(""); // État pour stocker le genre sélectionné
  const [sortBy, setSortBy] = useState<string>(""); // État pour stocker le critère de tri sélectionné
  const [isPending, startTransition] = useTransition(); // Hook pour gérer les transitions d'état sans bloquer l'interface utilisateur
  const isInitialRender = useRef(true); // Ref pour suivre si c'est le premier rendu du composant, ref = une valeur mutable qui persiste entre les rendus sans provoquer de re-render lorsqu'elle change
  const [isGenreOpen, setIsGenreOpen] = useState(false); // État pour gérer l'ouverture du menu de sélection de genre
  const [isSortOpen, setIsSortOpen] = useState(false); // État pour gérer l'ouverture du menu de sélection de tri

  // useEffect pour déclencher une nouvelle requête à l'API TMDB chaque fois que le genre sélectionné ou le critère de tri change, mais pas au premier rendu grâce à isInitialRender
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    //
    startTransition(async () => {
      const params = new URLSearchParams({
        // On construit les paramètres de la requête pour l'API de découverte de films, en incluant le tri et le genre sélectionné
        sort_by: sortBy,
      });
      if (selectedGenre) {
        params.append("with_genres", selectedGenre); // Si un genre est sélectionné, on l'ajoute aux paramètres de la requête
      }

      try {
        const res = await fetch(
          // On fait une requête à notre API interne qui va ensuite faire la requête à TMDB, params.toString() convertit les paramètres en une chaîne de requête
          `/api/movies/discoverMovies?${params.toString()}`,
        );
        if (res.ok) {
          const data = await res.json();
          setMovies(data.results || []);
        } else {
          console.error("Failed to fetch discover movies");
          setMovies([]);
        }
      } catch (error) {
        console.error("Error fetching discover movies:", error);
        setMovies([]);
      }
    });
  }, [selectedGenre, sortBy]);

  return (
    <div className={cn("flex flex-col gap-4 w-full")}>
      {/* Filter Header */}
      <div className="flex flex-row items-center justify-between w-full">
        <h2 className="title-category">Découvrir des films</h2>
        <div className="flex flex-row gap-2 items-center ">
          <button
            onClick={() => {
              setIsGenreOpen((open) => !open);
            }}
            className="w-full relative whitespace-nowrap py-2 px-4 flex flex-row justify-center items-center gap-2 text-sm text-center rounded-lg text-white hover:text-gray-300 bg-background/70 hover:bg-background/60 cursor-pointer"
          >
            <ListFilter size={14} />
            Filtrez par Genre
          </button>

          {isGenreOpen && (
            <ul
              className="absolute mb-75 right-45 w-48 max-h-64 overflow-y-auto rounded-lg bg-background border border-foreground/20
  z-10"
            >
              <li>
                <button
                  onClick={() => {
                    setSelectedGenre("");
                    setIsGenreOpen(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-foreground/10"
                >
                  Tous
                </button>
              </li>
              {genres.map((genre) => (
                <li key={genre.id}>
                  <button
                    onClick={() => {
                      setSelectedGenre(genre.id.toString());
                      setIsGenreOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-foreground/10"
                  >
                    {genre.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-row gap-2 items-center ">
            <button
              onClick={() => {
                setIsSortOpen((open) => !open);
              }}
              className="w-full whitespace-nowrap py-2 px-4 flex flex-row justify-center items-center gap-2 text-sm text-center rounded-lg text-white hover:text-gray-300 bg-background/70 hover:bg-background/60 cursor-pointer"
            >
              <ArrowDownUp size={14} />
              Triez
            </button>

            {isSortOpen && (
              <ul
                className="absolute mb-75 right-45 w-48 max-h-64 overflow-y-auto rounded-lg bg-background border border-foreground/20
  z-10"
              >
                <li>
                  <button
                    onClick={() => {
                      setSortBy("popularity.desc");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-foreground/10"
                  >
                    Popularité Décroissante
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("popularity.asc");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-foreground/10"
                  >
                    Popularité Croissante
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("vote_average.desc");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-foreground/10"
                  >
                    Note Décroissante
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("vote_average.asc");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-foreground/10"
                  >
                    Note Croissante
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("primary_release_date.desc");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-foreground/10"
                  >
                    Plus Récents
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("primary_release_date.asc");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-foreground/10"
                  >
                    Plus Anciens
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
      <div
        className={`justify-items-center grid grid-cols-2 xl:grid-cols-6 2xl:grid-cols-8 gap-4 transition-opacity ${
          isPending ? "opacity-50" : "opacity-100"
        }`}
      >
        {movies.length > 0 ? <MediaCards mediaList={movies} /> : null}
      </div>
      {movies.length === 0 && !isPending && (
        <p className="text-center py-8">
          Aucun film ne correspond à vos critères.
        </p>
      )}
    </div>
  );
}
