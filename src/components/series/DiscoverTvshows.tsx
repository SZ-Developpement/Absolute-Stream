"use client"; // Indique que ce composant doit être rendu côté client, nécessaire pour utiliser les hooks d'état et d'effet de React.

import { useState, useEffect, useTransition, useRef } from "react"; // Hooks React pour gérer l'état, les effets de bord, les transitions d'état et les références
import { Media, Genre } from "@/types/tmdb";
import MediaCards from "@/components/medias/MediaCards";
import { ArrowDownUp, ListFilter } from "lucide-react";

export function DiscoverTvshows({
  // Props attendus : initialSeries (séries initiales à afficher) et genres (liste des genres disponibles pour filtrer)
  initialSeries,
  genres,
}: {
  className?: string;
  initialSeries: Media[];
  genres: Genre[];
}) {
  const [series, setSeries] = useState<Media[]>(initialSeries); // On initialise l'état des séries avec les séries passées en props pour éviter un écran vide au chargement initial.
  const [selectedGenre, setSelectedGenre] = useState<string>(""); // État pour stocker le genre sélectionné
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
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
        // On construit les paramètres de la requête pour l'API de découverte de séries, en incluant le tri et le genre sélectionné
        sort_by: sortBy,
      });
      if (selectedGenre) {
        params.append("with_genres", selectedGenre); // Si un genre est sélectionné, on l'ajoute aux paramètres de la requête
      }

      try {
        const res = await fetch(
          // On fait une requête à notre API interne qui va ensuite faire la requête à TMDB, params.toString() convertit les paramètres en une chaîne de requête
          `/api/tvshows/discoverTvshows?${params.toString()}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSeries(data.results || []);
        } else {
          console.error("Failed to fetch discover series");
          setSeries([]);
        }
      } catch (error) {
        console.error("Error fetching discover series:", error);
        setSeries([]);
      }
    });
  }, [selectedGenre, sortBy]);

  return (
    <div className="pb-6 lg:pb-14 flex flex-col gap-6 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        {/* Titre */}
        <h3 className="text-lg xl:text-xl  font-semibold capitalize ">
          Découvrir des séries
        </h3>

        <div className="flex flex-row gap-2 items-center ">
          {/* Button de filtre */}
          <button
            onClick={() => {
              setIsGenreOpen((open) => !open);
            }}
            className="w-full relative whitespace-nowrap py-2 px-4 flex flex-row justify-center items-center gap-2 text-sm text-center rounded-lg text-white hover:text-gray-300 bg-background/70 hover:bg-background/60 cursor-pointer"
          >
            <ListFilter size={14} />
            Filtrez par Genre
          </button>

          {/* Menu de sélection de genre */}
          <button
            onClick={() => {
              setIsSortOpen((open) => !open);
            }}
            className="w-full whitespace-nowrap py-2 px-4 flex flex-row justify-center items-center gap-2 text-sm text-center rounded-lg text-white hover:text-gray-300 bg-background/70 hover:bg-background/60 cursor-pointer"
          >
            <ArrowDownUp size={14} />
            Triez
          </button>
        </div>
      </div>

      {/* Liste des séries */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
        {series.length > 0
          ? series.map((serie) => <MediaCards key={serie.id} media={serie} />)
          : !isPending && (
              <p className="col-span-full py-8 text-center text-gray-500">
                Aucune série ne correspond à vos critères.
              </p>
            )}
      </div>
    </div>
  );
}
