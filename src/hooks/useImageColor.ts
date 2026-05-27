// ============================================================================
// useImageColor — extrait la couleur dominante d'une affiche
// ----------------------------------------------------------------------------
// Donne un look "ambient" aux pages détail : on récupère la couleur moyenne
// du poster TMDB et on s'en sert pour teinter le fond / les boutons.
//
// Comment ça marche :
//   1. On charge l'image (via proxy weserv pour bypass le blocage CORS de TMDB)
//   2. On la dessine dans un <canvas> hors-écran
//   3. On lit les pixels avec getImageData → moyenne R/G/B
//   4. On convertit en hex pour CSS
//   5. On calcule la luminance pour choisir un texte noir ou blanc qui contraste
//
// Retourne { main, text } — main = couleur dominante, text = couleur lisible dessus.
// ============================================================================

"use client";
import { useState, useEffect } from "react";

export function useImageColor(src: string | null) {
  // Valeurs par défaut (bleu) avant que l'image ne soit traitée
  const [colors, setColors] = useState({ main: "#0ea5e9", text: "#ffffff" });

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    // On utilise toujours le proxy pour éviter le blocage CORS de TMDB
    // (sinon impossible de lire les pixels du canvas → "tainted canvas")
    img.src = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=100`;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      // Canvas hors-écran : on ne l'attache jamais au DOM, on s'en sert juste
      // comme buffer pour extraire les pixels.
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // getImageData renvoie un Uint8ClampedArray plat : [R,G,B,A, R,G,B,A, ...]
      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;

      let r = 0,
        g = 0,
        b = 0;
      const count = imageData.length / 4; // nb de pixels (4 valeurs/pixel)

      // Moyenne des couleurs — on saute de 4 en 4 (R, G, B, A)
      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      // Astuce bit-shifting : (1<<24) garantit 6 chiffres hex, .slice(1) retire le 1 initial
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

      // Formule de luminance perceptuelle (ITU-R BT.601) : l'œil capte plus
      // le vert que le rouge ou le bleu, d'où la pondération.
      // Seuil 125 → on bascule texte noir/blanc pour rester lisible.
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const textColor = brightness > 125 ? "#000000" : "#ffffff";

      setColors({ main: hex, text: textColor });
    };

    img.onerror = () => {
      console.error(
        "Impossible de charger l'image pour l'extraction de couleur.",
      );
    };
  }, [src]);

  return colors;
}
