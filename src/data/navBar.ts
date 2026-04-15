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

interface NavItem {
  icon: LucideIcon;
  name: string;
  href: string;
}

export const navItems: NavItem[] = [
  {
    icon: Clapperboard,
    name: "Films",
    href: "/movies",
  },
  {
    icon: Monitor,
    name: "Series",
    href: "/series",
  },
  {
    icon: Sparkles,
    name: "Animes",
    href: "/animes",
  },
  {
    icon: LibraryBig,
    name: "Collections",
    href: "/collections",
  },
  {
    icon: Trophy,
    name: "Top 10",
    href: "/top10",
  },
  {
    icon: UsersRound,
    name: "Match",
    href: "/match",
  },
  {
    icon: Gamepad2,
    name: "Games",
    href: "/games",
  },
];
