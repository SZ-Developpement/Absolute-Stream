// ============================================================================
// usePageBackground — détermine l'image de fond selon la route active
// ----------------------------------------------------------------------------
// Chaque page (home, movies, animes, ...) a une affiche d'ambiance définie
// dans constants/page-design. Ici on lit l'URL courante et on cherche dans
// ce tableau la config qui matche → on renvoie le chemin de l'image.
//
// `exact: true` → match strict (utile pour "/" qui sinon matcherait tout).
// `exact: false` → match par préfixe (ex: "/movies/123" match "movies").
// ============================================================================

import { usePathname } from "next/navigation";
import { pageDesign } from "@/constants/page-design";

export function usePageBackground() {
  const pathname = usePathname();
  // On cherche dans pageDesign la première entrée qui correspond à l'URL
  const page = pageDesign.find((p) => {
    const path = p.name === "home" ? "/" : `/${p.name}`;
    return p.exact ? pathname === path : pathname.startsWith(`/${p.name}`);
  });
  // Si aucune page ne match (ex: 404), on renvoie null = pas de background
  return page?.src ?? null;
}
