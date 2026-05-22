// ============================================================================
// PageBackground — fond d'ambiance qui change selon la page visitée
// ----------------------------------------------------------------------------
// Combo des deux hooks maison :
//   - usePageBackground : récupère l'URL de l'affiche associée à la route
//   - useImageColor      : extrait la couleur dominante de cette affiche
//
// On expose ensuite la couleur en CSS custom properties (--page-main /
// --page-text) sur <html>. N'importe quel composant peut alors faire :
//   color: var(--page-text);
// pour rester en harmonie avec l'ambiance de la page courante.
// ============================================================================

"use client";
import { usePageBackground } from "@/hooks/usePageBackground";
import { useImageColor } from "@/hooks/useImageColor";
import { useEffect } from "react";

export function PageBackground() {
  const src = usePageBackground();
  const { main, text } = useImageColor(src);

  // Met à jour les variables CSS au niveau racine pour que tout le DOM en profite
  useEffect(() => {
    if (main) {
      document.documentElement.style.setProperty("--page-main", main);
      document.documentElement.style.setProperty("--page-text", text);
    }
  }, [main, text]);

  // Pas d'image définie pour cette route → on ne rend rien (pas de fond)
  if (!src) return null;

  return (
    // Image fixe, en -z-10 pour passer derrière tout le contenu
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `url(${src})` }}
    >
      {/* Voile sombre par-dessus pour garantir la lisibilité du texte */}
      <div className="absolute inset-0 bg-background/60" />
    </div>
  );
}
