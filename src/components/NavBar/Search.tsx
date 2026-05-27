"use client";

import { MultiSearchResult } from "@/types/tmdb";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 300;
const MAX_RESULTS = 8;

export default function InputSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MultiSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ------- Fetch debouncé -------
  // À chaque frappe on déclenche un setTimeout. Si l'user retape avant 300ms,
  // on annule l'ancien timer → un seul appel réseau pour une rafale de touches.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // AbortController pour annuler une requête en vol si l'user retape :
    // évite un cas où une vieille réponse arrive APRÈS la nouvelle et écrase
    // l'état avec des résultats périmés.
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = await res.json();
        // On filtre les personnes pour ne garder que films/séries.
        const filtered: MultiSearchResult[] = (data.results ?? []).filter(
          (r: MultiSearchResult) =>
            r.media_type === "movie" || r.media_type === "tv",
        );
        setResults(filtered.slice(0, MAX_RESULTS));
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search error:", err);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  // ------- Fermeture du dropdown au clic extérieur -------
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleResultClick(result: MultiSearchResult) {
    setIsOpen(false);
    setQuery("");
    router.push(`/view-media/${result.media_type}/${result.id}`);
  }

  function getYear(result: MultiSearchResult) {
    const raw =
      result.media_type === "movie" ? result.release_date : result.first_air_date;
    return raw ? raw.split("-")[0] : null;
  }

  function getTitle(result: MultiSearchResult) {
    return result.title ?? result.name ?? "Sans titre";
  }

  const showDropdown =
    isOpen && query.trim().length > 0 && (loading || results.length > 0);

  return (
    <div ref={containerRef} className={`relative w-70 ${className ?? ""}`}>
      {/* Champ de recherche avec icône et styles adaptés pour les différentes tailles d'écran */}
      <div className="flex flex-row items-center bg-foreground/5 border border-foreground/10 rounded-lg py-1.5 px-3 w-full focus-within:border-foreground/30 transition-colors duration-300">
        <Search size={14} className="text-foreground/50" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un film, une série..."
          className="ml-2 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground/50 w-full"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#171717] border border-foreground/10 rounded-lg shadow-xl z-50 overflow-hidden max-h-[60vh] overflow-y-auto">
          {loading && results.length === 0 && (
            <div className="px-3 py-3 text-xs text-foreground/50">
              Recherche en cours…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-3 py-3 text-xs text-foreground/50">
              Aucun résultat
            </div>
          )}

          {results.map((result) => {
            const title = getTitle(result);
            const year = getYear(result);
            const posterUrl = result.poster_path
              ? `https://image.tmdb.org/t/p/w92${result.poster_path}`
              : "/No-Image/no-image.png";

            return (
              <Link
                key={`${result.media_type}-${result.id}`}
                href={`/view-media/${result.media_type}/${result.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleResultClick(result);
                }}
                className="flex flex-row items-center gap-3 px-3 py-2 hover:bg-foreground/5 transition-colors"
              >
                <div className="relative w-9 h-13 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={posterUrl}
                    alt={title}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm text-foreground line-clamp-1">
                    {title}
                  </span>
                  <span className="text-[11px] text-foreground/50">
                    {result.media_type === "movie" ? "Film" : "Série"}
                    {year ? ` · ${year}` : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
