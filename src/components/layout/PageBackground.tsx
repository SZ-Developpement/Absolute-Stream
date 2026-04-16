"use client";

import { usePageBackground } from "@/hooks/usePageBackground";

export function PageBackground() {
  const src = usePageBackground();

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url(${src})` }}
    >
      <div className="absolute inset-0 bg-background/60" />
    </div>
  );
}
