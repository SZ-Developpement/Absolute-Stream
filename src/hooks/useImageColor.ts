"use client";
import { useState, useEffect } from "react";

export function useImageColor(src: string | null) {
  const [colors, setColors] = useState({ main: "#0ea5e9", text: "#ffffff" });

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    // On utilise toujours le proxy pour éviter le blocage CORS de TMDB
    img.src = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=100`;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // On récupère les données de pixels
      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;

      let r = 0,
        g = 0,
        b = 0;
      const count = imageData.length / 4;

      // On fait la moyenne des couleurs (on saute de 4 en 4 : R, G, B, A)
      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

      // Calcul du contraste pour le texte
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
