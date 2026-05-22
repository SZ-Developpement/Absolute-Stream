// ============================================================================
// MediasCard — vignette d'un film/série/anime
// ----------------------------------------------------------------------------
// Composant de présentation (pas de state, pas de hook). Reçoit un objet
// `media` (type Media) et affiche son affiche + son titre.
//
// Détail UX : par défaut on voit juste le poster. Au survol (group-hover),
// un dégradé sombre apparaît + un bouton play au centre + le titre/année
// glissent vers le haut depuis le bas. L'effet de "révélation".
//
// Astuce Tailwind `group` : on met `group` sur le parent, et n'importe quel
// enfant peut réagir au hover du parent via `group-hover:...`. Très utile
// pour cet effet où plusieurs éléments doivent s'animer en même temps.
// ============================================================================

import { Media } from "@/types/tmdb";
import { Play } from "lucide-react";
// next/image = composant Image optimisé (lazy loading, formats modernes,
// redimensionnement automatique côté serveur). À toujours préférer à <img>.
import Image from "next/image";
// next/link = équivalent de <a> avec navigation côté client (= pas de reload).
import Link from "next/link";

// Signature : composant qui prend une seule prop `media` de type Media.
// La destructuration `{ media }` extrait directement la prop.
export default function MediasCard({
  media,
  mediaType,
}: {
  media: Media;
  mediaType: "movie" | "tv";
}) {
  return (
    // `group` ici → les enfants peuvent réagir au hover via group-hover:...
    // aspect-2/3 = ratio largeur:hauteur 2:3 (= ratio standard d'une affiche)
    <div className="relative group overflow-hidden rounded-md aspect-2/3">
      <Link
        // Template literal : `${media.id}` insère la valeur dynamique
        href={`/view-media/${mediaType}/${media.id}`}
        // `before:*` = pseudo-élément CSS. On crée un overlay sombre qui apparaît
        // au hover :
        //   before:absolute before:-inset-px → couvre toute la carte + 1px de marge
        //   before:bg-linear-to-t           → dégradé du bas vers le haut
        //   before:from-black/80 to-black/20 → opacités du dégradé
        //   before:opacity-0                → invisible par défaut
        //   group-hover:before:opacity-100  → 100% visible au hover du parent
        className="aspect-2/3 relative transition overflow-hidden cursor-pointer before:absolute before:-inset-px before:bg-linear-to-t before:from-black/80 before:to-black/20 before:-m-px before:z-1 before:opacity-0 group-hover:before:opacity-100 block"
      >
        <Image
          // Opérateur ternaire `cond ? a : b` — pareil que if/else mais en expression.
          // Si TMDB a une affiche → on construit l'URL TMDB. Sinon → fallback local.
          src={
            media.poster_path
              ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
              : "/No-Image/no-image.png"
          }
          // L'opérateur `??` (nullish coalescing) renvoie le 1er opérande qui n'est
          // NI null NI undefined. Pratique car media a `title` (films) OU `name` (séries).
          alt={media.title ?? media.name ?? "Poster"}
          // `fill` = l'image prend la taille du parent positionné (besoin de
          // position:relative ou absolute sur le parent → c'est le cas avec
          // `aspect-2/3 relative`).
          fill
          // `sizes` = hint donné au navigateur sur la largeur réelle de l'image
          // selon le breakpoint. Sans ça, Next télécharge la version full size
          // partout = gros gâchis sur mobile.
          // Format : "(condition) valeur, valeur_par_défaut"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, (max-width: 1536px) 16vw, 12.5vw"
          className="absolute object-cover ls-is-cached lazyloaded"
        />

        {/* Bouton "play" central — caché par défaut, visible au hover */}
        <div className="hidden group-hover:flex absolute left-1/2 top-1/2 -translate-x-1/2 z-20 -translate-y-1/2 h-14 w-14 items-center justify-center cursor-pointer rounded-full bg-white/50 text-white transition">
          <Play size={18} fill="white" />
        </div>

        {/* Bloc titre + année :
              - position absolue en bas de la carte
              - translate-y-2 + opacity-0    → invisible et 2px plus bas par défaut
              - group-hover:translate-y-0    → revient à sa position
              - group-hover:opacity-100      → devient visible
              - transition-all duration-300  → anime les deux en 300ms
            → effet "slide up + fade in" au hover. */}
        <div className="absolute bottom-0 left-0 w-full p-3 z-10 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {/* Affichage conditionnel : on n'affiche l'année que si on a une release_date */}
          {media.release_date && (
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              {/* .split("-") sur "2026-05-21" → ["2026", "05", "21"]
                  → [0] = l'année. Le `|| "2026"` est un fallback de secours. */}
              {media.release_date.split("-")[0] || "2026"}
            </p>
          )}
          {/* line-clamp-1 = coupe le texte à 1 ligne avec "..." (CSS pure) */}
          <h3 className="line-clamp-1 text-[13px] font-semibold text-white">
            {media.title ?? media.name ?? "Titre non disponible"}
          </h3>
        </div>
      </Link>
    </div>
  );
}
