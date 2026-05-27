// ============================================================================
// EmblaCarousel — wrapper autour de embla-carousel-react
// ----------------------------------------------------------------------------
// Pourquoi Embla et pas Swiper / une lib React native ?
//   - Très léger (~3 ko), aucune dépendance
//   - API React idiomatique : un hook qui renvoie une ref + une API
//   - Bonne perf : il manipule transform: translate3d() (GPU), pas le DOM
//
// Fonctionnement du hook useEmblaCarousel :
//   - Renvoie [emblaRef, emblaApi]
//   - emblaRef : à attacher sur le VIEWPORT (le div qui clip les slides)
//   - emblaApi : objet qui expose scrollPrev(), scrollNext(), selectedScrollSnap()...
//
// IMPORTANT : pour qu'Embla fonctionne, il faut deux conteneurs :
//   <div ref={emblaRef} overflow:hidden>   ← viewport
//     <div className="flex">                ← container (les slides en flex)
//       <div>slide 1</div>
//       <div>slide 2</div>
//       ...
//     </div>
//   </div>
// ============================================================================

"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
// EmblaOptionsType : type des options qu'on peut passer (loop, align, dragFree...)
// On importe juste le type → import type pour économiser au bundle
import { EmblaOptionsType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Props du composant. `?:` = optionnel. Si non passé → undefined.
interface EmblaCarouselProps {
  opts?: EmblaOptionsType;
  children: React.ReactNode; // tout ce qu'on met entre <EmblaCarousel>...</EmblaCarousel>
  className?: string;
  title?: string;
}

export function EmblaCarousel({
  children,
  opts,
  className,
  title,
}: EmblaCarouselProps) {
  // useEmblaCarousel = hook custom de la lib. Il instancie le carrousel
  // dès que la ref est attachée à un élément du DOM.
  // Retour : un tuple [ref, api]. L'API est null tant que le DOM n'est pas prêt.
  const [emblaRef, emblaApi] = useEmblaCarousel(opts);

  // useCallback mémoïse la fonction → elle garde la MÊME référence entre
  // les rendus tant que `emblaApi` ne change pas.
  // Avantage : si on passe scrollPrev à un composant memo, il ne re-renderera
  // pas inutilement. Sans useCallback, une nouvelle fn est créée à chaque render.
  //
  // Le `?.` (optional chaining) gère le cas où emblaApi serait encore null
  // au tout premier render (avant que la ref soit attachée).
  const scrollPrev = React.useCallback(
    () => emblaApi?.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = React.useCallback(
    () => emblaApi?.scrollNext(),
    [emblaApi],
  );

  return (
    // cn() = utilitaire maison qui combine classes Tailwind (cf. lib/utils).
    // Permet de surcharger ou compléter le style depuis le parent.
    <div className={cn("relative overflow-hidden", className)}>
      <div className="flex flex-col gap-4 w-full">
        {/* === HEADER === titre à gauche, boutons fléchés à droite */}
        <div className="flex flex-row items-center justify-between">
          <h1 className="title-category">{title}</h1>

          <div className="flex flex-row items-center gap-2">
            {/* aria-label = essentiel pour l'accessibilité (lecteurs d'écran) */}
            <button
              onClick={scrollPrev}
              className="p-1.5 rounded-full bg-background/70 shadow-md hover:bg-background/90 transition-colors cursor-pointer"
              aria-label="Slide précédent"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={scrollNext}
              className="p-1.5 rounded-full bg-background/70 shadow-md hover:bg-background/90 transition-colors cursor-pointer"
              aria-label="Slide suivant"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* === VIEWPORT EMBLA === c'est sur CE div qu'on attache emblaRef.
            Il doit avoir overflow-hidden, sinon les slides débordent.
            Le -mx-3 compense le px-3 des slides → on garde l'alignement
            avec le bord du parent. */}
        <div className="overflow-hidden -mx-3" ref={emblaRef}>
          {/* === CONTAINER === doit être en flex pour qu'Embla puisse
              calculer les positions horizontalement. select-none empêche
              de sélectionner du texte par mégarde quand on drag. */}
          <div className="flex select-none">
            {/* React.Children.map = méthode utilitaire pour mapper sur les
                enfants même quand il n'y en a qu'un seul (children est
                normalisé en tableau). C'est plus safe que `children.map`. */}
            {React.Children.map(children, (child) => (
              <div
                // Une slide = un enfant + des classes basis-X pour fixer
                // sa largeur. min-w-0 + shrink-0 sont OBLIGATOIRES sinon
                // les slides ne respectent pas leur basis.
                className={
                  "min-w-0 px-3 shrink-0 " +
                  // basis-1/N = largeur = 1/N du viewport.
                  // On reproduit EXACTEMENT les colonnes des grilles statiques
                  // pour avoir la même densité d'affichage entre carrousel et grille.
                  "basis-1/2 " + // mobile  : 2 colonnes (50%)
                  "sm:basis-1/3 " + // ≥640px : 3 colonnes
                  "md:basis-1/4 " + // ≥768px : 4 colonnes
                  "lg:basis-1/5 " + // ≥1024px : 5 colonnes
                  "xl:basis-1/6 " + // ≥1280px : 6 colonnes
                  "2xl:basis-1/8" // ≥1536px : 8 colonnes
                }
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
