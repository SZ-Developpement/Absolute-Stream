"use client";

import React from "react";
import useEmblaCarousel, { type EmblaOptionsType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmblaCarouselProps {
  opts?: EmblaOptionsType;
  children: React.ReactNode;
  className?: string;
}

export function EmblaCarousel({
  children,
  opts,
  className,
}: EmblaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(opts);

  const scrollPrev = React.useCallback(
    () => emblaApi?.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = React.useCallback(
    () => emblaApi?.scrollNext(),
    [emblaApi],
  );

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">{children}</div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/70 shadow-md hover:bg-background/90 transition-colors"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="h-6 w-6 text-foreground" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/70 shadow-md hover:bg-background/90 transition-colors"
        aria-label="Slide suivant"
      >
        <ChevronRight className="h-6 w-6 text-foreground" />
      </button>
    </div>
  );
}
