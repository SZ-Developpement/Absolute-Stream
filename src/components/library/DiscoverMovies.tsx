"use client"; // Indique que ce composant doit être rendu côté client, nécessaire pour utiliser les hooks d'état et d'effet de React.

import { useState, useEffect, useTransition, useRef } from "react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for tailwind-merge
import { Media, Genre } from "@/types/tmdb";
import MediaCards from "@/components/library/MediaCards";

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
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [isPending, startTransition] = useTransition(); // Hook pour gérer les transitions d'état sans bloquer l'interface utilisateur
  const isInitialRender = useRef(true); // Ref pour suivre si c'est le premier rendu du composant, ref = une valeur mutable qui persiste entre les rendus sans provoquer de re-render lorsqu'elle change

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
        {/* <div className="flex flex-col gap-1">
          <label
            htmlFor="genre-select"
            className="text-sm font-medium text-foreground/80"
          >
            Genre
          </label>
          <select
            id="genre-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="p-2 text-sm rounded-md bg-background/50 border border-foreground/20 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent w-48"
          >
            <option value="">Tous</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id.toString()}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="sort-select"
            className="text-sm font-medium text-foreground/80"
          >
            Trier par
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 text-sm rounded-md bg-background/50 border border-foreground/20 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent w-58"
          >
            <option value="popularity.desc">Popularité Décroissante</option>
            <option value="popularity.asc">Popularité Croissante</option>
            <option value="vote_average.desc">Note Décroissante</option>
            <option value="vote_average.asc">Note Croissante</option>
            <option value="primary_release_date.desc">Plus Récents</option>
            <option value="primary_release_date.asc">Plus Anciens</option>
          </select>
        </div> */}
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
