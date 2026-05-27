// ============================================================================
// DiscoverMedia — composant de découverte avec filtres dynamiques
// ----------------------------------------------------------------------------
// Composant central des pages catalogue. À l'origine il y avait 3 fichiers
// distincts (DiscoverMovies / DiscoverTvshows / DiscoverAnimes) avec 95% de
// code dupliqué. On a refactorisé en UN SEUL composant générique qui prend
// son endpoint en prop → bien plus DRY (Don't Repeat Yourself).
//
// Hooks React utilisés (les 4 piliers de ce composant) :
//   1. useState        → mémoriser les filtres (genre, tri) entre les rendus
//   2. useEffect       → effet de bord (fetch) quand les filtres changent
//   3. useTransition   → marque un fetch comme "non urgent" → on garde l'UI
//                        réactive et on a un état isPending pour griser la grille
//   4. useRef          → garder une valeur entre rendus SANS déclencher de
//                        re-render (ici pour skip le 1er useEffect)
//
// Stratégie de rendu :
//   - SSR : la page parente passe initialData (résultats préchargés serveur)
//   - 1er render client : on affiche directement initialData, pas de spinner
//   - User change un filtre : le useEffect refetch et met à jour `medias`
// ============================================================================

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
  mediaType,
}: DiscoverMediaProps) {
  // useState<T>(initial) :
  //   - useState renvoie [valeur, setter]
  //   - <Media[]> précise le type stocké (un tableau de Media)
  //   - initialData devient la valeur INITIALE → la grille est déjà remplie au mount
  const [medias, setMedias] = useState<Media[]>(initialData);

  // Genre sélectionné. "" (string vide) = "tous les genres" (notre convention).
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // Tri par défaut : popularité décroissante (= valeur initiale de TMDB)
  const [sortBy, setSortBy] = useState<string>("popularity.desc");

  // useTransition : nouveauté React 18.
  //   - startTransition(callback) marque les updates comme "non urgents"
  //   - React peut interrompre cette transition si une mise à jour urgente
  //     arrive (ex: l'user tape dans un input)
  //   - isPending = true tant que la transition n'est pas terminée
  // → on l'utilise ici pour griser la grille pendant le refetch sans bloquer l'UI.
  const [isPending, startTransition] = useTransition();

  // useRef(initialValue) renvoie un objet { current: ... } qui PERSISTE entre
  // les rendus mais ne déclenche PAS de re-render quand on le modifie.
  // Cas d'usage classique : flag pour distinguer le 1er render des suivants.
  const isInitialRender = useRef(true);

  // useEffect(fn, deps) :
  //   - fn s'exécute APRÈS le rendu, et à chaque fois qu'une dep change
  //   - deps = tableau de valeurs à surveiller
  // Ici : on relance le fetch dès que selectedGenre, sortBy ou fetchEndpoint change.
  useEffect(() => {
    // 1er render : initialData est déjà bonne, pas la peine de refetch.
    // On bascule le flag à false et on sort tout de suite.
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return; // sortie anticipée
    }

    // startTransition reçoit une callback async → React la marque comme
    // "low priority". Pendant l'exécution, isPending = true.
    startTransition(async () => {
      // URLSearchParams = API standard pour construire des query strings
      // proprement (encode les caractères spéciaux, gère les multiples
      // valeurs d'une même clé, etc.).
      const params = new URLSearchParams({ sort_by: sortBy });

      // Ajout conditionnel : si pas de genre, on n'ajoute rien (= tous genres)
      if (selectedGenre) {
        params.append("with_genres", selectedGenre);
      }

      try {
        // fetchEndpoint est passé en prop → ce composant marche pour movies,
        // tvshows et animes sans modification de code interne.
        // params.toString() → "sort_by=popularity.desc&with_genres=28"
        const res = await fetch(`${fetchEndpoint}?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // `data.results || []` = filet de sécurité si l'API renvoie une
          // forme inattendue (évite un crash sur .map plus bas).
          setMedias(data.results || []);
        } else {
          setMedias([]); // erreur HTTP → grille vide + message emptyMessage
        }
      } catch (error) {
        console.error(`Error fetching from ${fetchEndpoint}:`, error);
        setMedias([]);
      }
    });
    // Tableau de deps : React re-exécute l'effect SI au moins une de ces
    // valeurs a changé entre le render précédent et celui-ci.
  }, [selectedGenre, sortBy, fetchEndpoint]);

  // ----- Calculs dérivés (pas besoin d'un useMemo, c'est instantané) -----
  // genres.find(...) cherche le 1er élément dont la condition est vraie.
  // .toString() car selectedGenre est un string mais g.id est un number.
  // `?.name` = optional chaining : si find renvoie undefined, pas de crash.
  // `|| "Tous"` = fallback si pas trouvé.
  const activeGenreName =
    genres.find((g) => g.id.toString() === selectedGenre)?.name || "Tous";
  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Triez";

  return (
    <div className="pb-6 lg:pb-14 flex flex-col gap-6 w-full">
      {/* === HEADER === titre à gauche, 2 dropdowns à droite (genre + tri) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <h3 className="text-lg xl:text-xl font-semibold capitalize">{title}</h3>

        <div className="flex flex-row gap-2 items-center">
          {/* === Dropdown GENRE ===
              `DropdownMenu` (Radix UI) gère toute l'accessibilité (focus trap,
              navigation clavier, ARIA). On compose : Trigger + Content + Items. */}
          <DropdownMenu>
            {/* `asChild` = au lieu de wrapper le bouton dans un div, Radix
                applique ses props directement sur l'enfant. Plus propre. */}
            <DropdownMenuTrigger asChild>
              <button className="whitespace-nowrap py-2 px-4 flex flex-row justify-center items-center gap-2 text-sm text-center rounded-lg text-white hover:text-gray-300 bg-background/70 hover:bg-background/60 cursor-pointer transition-colors">
                <ListFilter size={14} />
                {/* Affichage conditionnel : si filtre actif → "Genre : X", sinon
                    le label par défaut. */}
                {selectedGenre
                  ? `Genre : ${activeGenreName}`
                  : "Filtrez par Genre"}
              </button>
            </DropdownMenuTrigger>
            {/* max-h-64 + overflow-y-auto = liste scrollable si trop longue.
                Les classes `[scrollbar-width:none]` et `[&::-webkit-scrollbar]:hidden`
                masquent la scrollbar sur tous les navigateurs. */}
            <DropdownMenuContent
              align="end"
              className="w-48 max-h-64 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* Item "Tous" → on remet le filtre à "" (= notre convention "aucun") */}
              <DropdownMenuItem
                onClick={() => setSelectedGenre("")}
                className="flex items-center justify-between cursor-pointer"
              >
                Tous
                {/* Check affiché uniquement si "Tous" est l'option active */}
                {selectedGenre === "" && (
                  <Check size={14} className="text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* On boucle sur la liste des genres reçue en prop. key={genre.id}
                  est OBLIGATOIRE en React pour identifier chaque élément
                  d'une liste de manière stable. */}
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

          {/* === Dropdown TRI === même schéma que Genre mais avec SORT_OPTIONS */}
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

      {/* === GRILLE === pendant le refetch (isPending) on grise la grille et
          on bloque les clics → l'user ne peut pas relancer 10 fetchs en spam. */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 transition-opacity duration-300 ${
          isPending ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Ternaire complexe :
              - si on a des medias → on les map en cartes
              - sinon ET on n'est PAS en train de charger → message vide
              - sinon (= en chargement) → rien (la grille précédente reste grisée)  */}
        {medias.length > 0
          ? medias.map((media) => (
              <MediaCards key={media.id} media={media} mediaType={mediaType} />
            ))
          : !isPending && (
              // col-span-full = la phrase prend toute la largeur de la grille
              <p className="col-span-full py-8 text-center text-gray-500">
                {emptyMessage}
              </p>
            )}
      </div>
    </div>
  );
}
