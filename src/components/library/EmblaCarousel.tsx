"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmblaCarouselProps {
  opts?: EmblaOptionsType;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function EmblaCarousel({
  children,
  opts,
  className,
  title,
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
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row items-center justify-between">
          <h1 className="title-category">{title}</h1>

          <div className="flex flex-row items-center gap-2">
            <button
              onClick={scrollPrev}
              className="p-1.5 rounded-full bg-background/70 shadow-md hover:bg-background/90 transition-colors"
              aria-label="Slide précédent"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={scrollNext}
              className="p-1.5 rounded-full bg-background/70 shadow-md hover:bg-background/90 transition-colors"
              aria-label="Slide suivant"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
