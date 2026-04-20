"use client";
import { usePageBackground } from "@/hooks/usePageBackground";
import { useImageColor } from "@/hooks/useImageColor";
import { useEffect } from "react";

export function PageBackground() {
  const src = usePageBackground();
  const { main, text } = useImageColor(src);

  useEffect(() => {
    if (main) {
      document.documentElement.style.setProperty("--page-main", main);
      document.documentElement.style.setProperty("--page-text", text);
      console.log("Nouvelle couleur appliquée :", main);
    }
  }, [main, text]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `url(${src})` }}
    >
      <div className="absolute inset-0 bg-background/60" />
    </div>
  );
}
