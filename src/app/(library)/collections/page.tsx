"use client";

import { useState, useEffect } from "react";
import CardCollection from "@/components/collections/CardCollection";
import type { TMDBCollection } from "@/lib/tmdb";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<TMDBCollection[]>([]);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      const res = await fetch(`/api/collections?limit=${limit}`);
      const data = await res.json();
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

  const handleLoadMore = () => {
    setLimit((prev) => prev + 20);
  };

  return (
    <div className="container-page grid">
      <div className="flex flex-col items-center justify-center gap-1 mt-6">
        <h1 className="text-4xl font-bold">Collections</h1>
        <p className="text-base text-gray-400">
          Exploréz les collections de films les plus populaires sur TMDB.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {collections.map((collection) => (
          <CardCollection
            key={collection.id}
            id={collection.id}
            name={collection.name}
            movies_count={collection.parts.length}
            startDate={collection.parts[0]?.release_date}
            endDate={
              collection.parts[collection.parts.length - 1]?.release_date
            }
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

      <div className="flex justify-center mt-8">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="px-6 py-2 text-white rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Chargement..." : "Afficher plus"}
        </button>
      </div>
    </div>
  );
}
