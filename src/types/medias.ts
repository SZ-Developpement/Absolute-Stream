import { LucideIcon } from "lucide-react";
import { Genre, Media } from "./tmdb";

interface LibraryContainerProps {
  Title: string;
  link: string;
  children: React.ReactNode;
}

interface DiscoverMediaProps {
  title: string; // Exemple: "Découvrir des Animés"
  emptyMessage: string; // Exemple: "Aucun film ne correspond..."
  fetchEndpoint: string; // L'url de ton API interne: "/api/animes/discoverAnimes"
  initialData: Media[];
  genres: Genre[];
}

interface ActionsButtonProps {
  onclick?: () => void;
  Icon: LucideIcon;
  className?: string;
  text?: string;
}

interface LikesButtonProps {
  isActive: boolean;
  activeBgColor: string;
  onClick: () => void;
  Icon: React.ComponentType<{ size: number; color: string }>;
  count?: number;
}

interface TableInfosProps {
  name: string;
  children: React.ReactNode;
}

interface ActorCardProps {
  imageUrl?: string;
  actorName: string;
  actorRole: string;
}

export type {
  LibraryContainerProps,
  DiscoverMediaProps,
  ActionsButtonProps,
  LikesButtonProps,
  TableInfosProps,
  ActorCardProps,
};
