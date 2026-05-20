// ============================================================================
// Items de la barre de navigation principale
// ----------------------------------------------------------------------------
// Source UNIQUE de vérité pour les liens du menu. Le composant NavBar boucle
// sur ce tableau pour générer ses items, et le Footer fait la même chose pour
// remplir ses colonnes.
//
// → Ajouter une route au menu = ajouter une entrée ICI. Pas besoin de toucher
// au JSX de NavBar ni de Footer. C'est le principe DRY (Don't Repeat Yourself).
//
// Le typage de chaque entrée est strict via l'interface NavItem :
//   - icon : un composant icône Lucide (PAS une string)
//   - name : le libellé affiché
//   - href : la route Next vers laquelle pointe le lien
// ============================================================================

import {
  Clapperboard,
  Gamepad2,
  LibraryBig,
  LucideIcon,
  Monitor,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";

// Interface = contrat de structure en TypeScript.
// Tout objet de type NavItem DOIT avoir ces 3 propriétés avec les bons types.
interface NavItem {
  icon: LucideIcon; // type d'un composant icône (importé depuis lucide-react)
  name: string;
  href: string;
}

// `export const navItems: NavItem[]` :
//   - `const` car la liste ne sera jamais réassignée
//   - `NavItem[]` = tableau de NavItem → TS vérifiera chaque entrée
//   - `export` pour pouvoir l'importer dans NavBar et Footer
export const navItems: NavItem[] = [
  { icon: Clapperboard, name: "Films", href: "/movies" },
  { icon: Monitor, name: "Series", href: "/series" },
  { icon: Sparkles, name: "Animes", href: "/animes" },
  { icon: LibraryBig, name: "Collections", href: "/collections" },
  { icon: Trophy, name: "Top 10", href: "/top10" },
  { icon: UsersRound, name: "Match", href: "/match" },
  { icon: Gamepad2, name: "Tournoi", href: "/tournoi" },
];
