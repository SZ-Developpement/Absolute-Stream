"use client"; // Indique que ce composant doit être rendu côté client, nécessaire pour utiliser les hooks d'état et d'effet de React.

import { useState, useEffect, useTransition, useRef } from "react"; // Hooks React pour gérer l'état, les effets de bord, les transitions d'état et les références
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for tailwind-merge
import { Media, Genre } from "@/types/tmdb";
import MediaCards from "@/components/library/MediaCards";

export function DiscoverAnimes({
  initialAnimes,
  genres,
}: {
  className?: string;
  initialAnimes: Media[];
  genres: Genre[];
}) {
  const [animes, setAnimes] = useState<Media[]>(initialAnimes); // On initialise l'état des animes avec les animes passés en props pour éviter un écran vide au chargement initial.
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
        // On construit les paramètres de la requête pour l'API de découverte d'animes, en incluant le tri et le genre sélectionné
        sort_by: sortBy,
      });
      if (selectedGenre) {
        params.append("with_genres", selectedGenre); // Si un genre est sélectionné, on l'ajoute aux paramètres de la requête
      }

      try {
        const res = await fetch(
          // On fait une requête à notre API interne qui va ensuite faire la requête à TMDB, params.toString() convertit les paramètres en une chaîne de requête
          `/api/animes/discoverAnimes?${params.toString()}`,
        );
        if (res.ok) {
          const data = await res.json();
          setAnimes(data.results || []);
        } else {
          console.error("Failed to fetch discover animes");
          setAnimes([]);
        }
      } catch (error) {
        console.error("Error fetching discover animes:", error);
        setAnimes([]);
      }
    });
  }, [selectedGenre, sortBy]);

  return (
    <div className={cn("flex flex-col gap-6 w-full my-20 max-w-7xl mx-auto")}>
      {/* Filter Header */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <h2 className="text-lg font-bold ml-8">Découvrir des animes</h2>
        <div className="flex flex-col gap-1">
          {/* <label
            htmlFor="genre-select"
            className="text-sm font-medium text-foreground/80"
          >
            Genre
          </label> */}
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
          {/* <label
            htmlFor="sort-select"
            className="text-sm font-medium text-foreground/80"
          >
            Trier par
          </label> */}
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
        </div>
      </div>

      <div
        className={`grid justify-items-center grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-opacity ${
          isPending ? "opacity-50" : "opacity-100"
        }`}
      >
        {animes.length > 0 ? <MediaCards mediaList={animes} /> : null}
      </div>
      {animes.length === 0 && !isPending && (
        <p className="text-center py-8">
          Aucun anime ne correspond à vos critères.
        </p>
      )}
    </div>
  );
}
