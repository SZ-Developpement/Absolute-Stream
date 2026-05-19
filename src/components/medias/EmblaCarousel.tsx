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
    <div className={cn("relative overflow-hidden", className)}>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row items-center justify-between">
          <h1 className="title-category">{title}</h1>

          <div className="flex flex-row items-center gap-2">
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

        {/* Le Viewport */}
        <div className="overflow-hidden -mx-3" ref={emblaRef}>
          {/* Le Container */}
          <div className="flex select-none">
            {React.Children.map(children, (child) => (
              <div
                className={
                  "min-w-0 px-3 shrink-0 " +
                  "basis-1/2 " + // grid-cols-2 (50%)
                  "sm:basis-1/3 " + // sm:grid-cols-3 (33.33%)
                  "md:basis-1/4 " + // md:grid-cols-4 (25%)
                  "lg:basis-1/5 " + // lg:grid-cols-5 (20%)
                  "xl:basis-1/6 " + // xl:grid-cols-6 (16.66%)
                  "2xl:basis-1/8" // 2xl:grid-cols-8 (12.5%)
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
