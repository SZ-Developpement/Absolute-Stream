// ============================================================================
// /collections — liste paginée des sagas/franchises de films
// ----------------------------------------------------------------------------
// Page client avec une logique "Afficher plus" :
//   - On commence avec limit=20 (= 20 films populaires analysés côté serveur)
//   - Quand on clique sur "Afficher plus", on augmente la limite de 20
//   - Le useEffect refetch et on FUSIONNE avec les collections déjà chargées
//   - Une Map indexée par id sert à dédoublonner (deux franchises identiques
//     entre deux fetchs ne s'affichent pas deux fois).
//
// Pour chaque collection, la carte affiche le premier et dernier film de la
// saga (parts[0] et parts[parts.length-1]) avec leurs affiches.
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import CardCollection from "@/components/collections/CardCollection";
import type { TMDBCollection } from "@/lib/tmdb";
import MediaContainer from "@/components/medias/MediaContainer";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<TMDBCollection[]>([]);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      const res = await fetch(`/api/collections?limit=${limit}`);
      const data = await res.json();
      // Fusion + dédoublonnage : on combine les anciennes et nouvelles
      // collections, puis on passe par une Map<id, collection> pour ne
      // garder qu'une entrée par id.
      setCollections((prev) => {
        const combined = [...prev, ...data];
        const unique = Array.from(
          new Map(combined.map((c) => [c.id, c])).values(),
        );
        return unique;
      });
      setLoading(false);
    };

    fetchCollections();
  }, [limit]);

  // "Afficher plus" : on augmente la limite → ré-exécute le useEffect ci-dessus
  const handleLoadMore = () => {
    setLimit((prev) => prev + 20);
  };

  return (
    <MediaContainer>
      {/* En-tête de page */}
      <div className="flex flex-col items-center justify-center gap-1 mt-6">
        <h1 className="text-4xl font-bold">Collections</h1>
        <p className="text-base text-gray-400">
          Exploréz les collections de films les plus populaires sur TMDB.
        </p>
      </div>

      {/* Grille 3 colonnes — une carte = une franchise */}
      <div className="grid grid-cols-3 gap-4">
        {collections.map((collection) => (
          <CardCollection
            key={collection.id}
            id={collection.id}
            name={collection.name}
            // Nombre de films dans la saga = longueur de "parts"
            movies_count={collection.parts.length}
            // Première et dernière sortie = premiers/derniers films de la saga
            startDate={collection.parts[0]?.release_date}
            endDate={
              collection.parts[collection.parts.length - 1]?.release_date
            }
            // Affiches du premier et du dernier film, avec fallback no-image
            ImageStart={
              collection.parts[0]?.poster_path
                ? `https://image.tmdb.org/t/p/w500${collection.parts[0].poster_path}`
                : "/No-Image/no-image.png"
            }
            ImageEnd={
              collection.parts[collection.parts.length - 1]?.poster_path
                ? `https://image.tmdb.org/t/p/w500${collection.parts[collection.parts.length - 1].poster_path}`
                : "/No-Image/no-image.png"
            }
          />
        ))}
      </div>

      {/* Bouton de pagination "Afficher plus" */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="px-6 py-2 text-white rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Chargement..." : "Afficher plus"}
        </button>
      </div>
    </MediaContainer>
  );
}
